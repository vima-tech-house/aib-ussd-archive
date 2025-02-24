import { Injectable } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { ResponseHelper } from '@/common/helpers/response.helper';

@Injectable()
export class SocketLogger {
  constructor(
    private readonly socketGateway: SocketGateway,
    private readonly responseHelper: ResponseHelper,
  ) {}

  logUploadProgress(data: {
    jobId: string;
    totalVehicles: number;
    processedCount: number;
    errorCount: number;
    progress: number;
    currentBatch: number;
    totalBatches: number;
  }) {
    const response = this.responseHelper.success({
      message: 'Bulk vehicle upload in progress',
      response: data,
    });
    this.socketGateway.emitVehicleUploadProgress(data);
  }

  logUploadError(data: { jobId: string; error: string; batchIndex?: number }) {
    const response = this.responseHelper.error({
      message: 'Bulk vehicle upload failed',
      errors: data,
    });
    this.socketGateway.emitVehicleUploadError(data);
  }

  logUploadComplete(data: {
    jobId: string;
    processedCount: number;
    errorCount: number;
    errors?: any[];
  }) {
    const response = this.responseHelper.success({
      message: 'Bulk vehicle upload completed',
      response: data,
    });
    this.socketGateway.emitVehicleUploadComplete(data);
  }
}
