import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { chunk } from 'lodash';
import { BATCH_SIZE } from '@/constants/vehicle';
import { Transaction } from 'sequelize';
import { VehiclesService } from '../vehicle.service';
import { CreateVehicleDto } from '../dto/vehicle.dto';
import { SocketGateway } from '@modules/socket/socket.gateway';
import { VehicleUploadJob } from '@/interfaces/vehicle.interface';
import { SocketLogger } from '@modules/socket/socker.logger';

@Processor('vehicle-upload')
export class VehicleUploadProcessor {
  constructor(
    private readonly vehiclesService: VehiclesService,
    private readonly socketGateway: SocketGateway,
    private readonly socketLogger: SocketLogger,
  ) {}

  @Process('process-vehicles')
  async processVehicles(job: Job<VehicleUploadJob>) {
    try {
      const { vehicles, userId, jobId } = job.data;
      const batches = chunk(vehicles, BATCH_SIZE);
      let processedCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const [batchIndex, batch] of batches.entries()) {
        let currentTransaction: Transaction | null = null;
        try {
          const sequelize = this.vehiclesService.getSequelize();
          currentTransaction = await sequelize.transaction();

          const batchResult = await this.vehiclesService.processBatch(
            batch,
            userId,
            currentTransaction,
          );

          await currentTransaction.commit();
          processedCount += batchResult.processedVehicles.length;
          errorCount += batchResult.errors.length;
          errors.push(...batchResult.errors);

          this.socketGateway.emitVehicleUploadProgress({
            jobId,
            totalVehicles: vehicles.length,
            processedCount,
            errorCount,
            progress: Math.round((processedCount / vehicles.length) * 100),
            currentBatch: batchIndex + 1,
            totalBatches: batches.length,
          });

          this.socketLogger.logUploadProgress({
            jobId,
            totalVehicles: vehicles.length,
            processedCount,
            errorCount,
            progress: Math.round((processedCount / vehicles.length) * 100),
            currentBatch: 0,
            totalBatches: 0,
          });
        } catch (error: any) {
          if (currentTransaction) {
            await currentTransaction.rollback();
          }
          errorCount += batch.length;
          errors.push(
            ...batch.map((vehicle, idx) => ({
              index: batchIndex * BATCH_SIZE + idx,
              plateNumber: vehicle.plateNumber,
              error: error.message || 'Batch processing failed',
            })),
          );

          this.socketGateway.emitVehicleUploadError({
            jobId,
            error: error.message,
            batchIndex,
          });

          this.socketLogger.logUploadError({
            jobId,
            error: error.message,
            batchIndex,
          });
        }
      }

      // Emit completion event
      this.socketGateway.emitVehicleUploadComplete({
        jobId,
        processedCount,
        errorCount,
        errors,
        completedAt: new Date().toISOString(),
      });

      this.socketLogger.logUploadComplete({
        jobId,
        processedCount,
        errorCount,
        errors,
      });

      return {
        status: errorCount > 0 ? 'completed_with_errors' : 'completed',
        processedCount,
        errorCount,
        errors,
      };
    } catch (error: any) {
      this.socketGateway.emitVehicleUploadError({
        jobId: job.data.jobId,
        error: error.message,
        fatal: true,
      });
      throw error;
    }
  }
}
