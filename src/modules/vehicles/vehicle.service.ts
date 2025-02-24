import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindOptions, Op, Sequelize, Transaction } from 'sequelize';
import { VehicleMake } from '@database/models/vehicle-make.model';
import { Institution } from '@database/models/institution.model';
import { User } from '@database/models/user.model';
import { handleErrors } from 'utils/error.handler';
import { ResponseHelper } from '@/common/helpers/response.helper';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleQueryParamsDto,
  ValidateVehicleDto,
} from './dto/vehicle.dto';
import { RequestWithUser } from 'interfaces/user.interface';
import { VehicleStatus } from 'common/enums/vehicle.enum';
import {
  BulkOperationError,
  BulkOperationResponse,
  BulkOperationResult,
} from 'interfaces/vehicle.interface';
import { v4 as uuidv4 } from 'uuid';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SocketGateway } from '@modules/socket/socket.gateway';
import { SocketLogger } from '@modules/socket/socker.logger';
import { Account } from '@database/models/account.model';
import { AccountStatus } from '@/common/enums';
import { Vehicle } from '@database/models/vehicle.model';
import { VehicleType } from '@database/models/vehicle-types.model';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(Vehicle)
    private readonly vehicleModel: typeof Vehicle,
    @InjectModel(Account)
    private readonly accountModel: typeof Account,
    @InjectQueue('vehicle-upload') private readonly vehicleQueue: Queue,
    private readonly socketGateway: SocketGateway,
    private readonly socketLogger: SocketLogger,
    private readonly responseHelper: ResponseHelper,
  ) {}

  getSequelize(): Sequelize {
    const sequelize = this.vehicleModel.sequelize;
    if (!sequelize) {
      throw new Error('Database connection not established');
    }
    return sequelize;
  }

  async findAll(queryParams: VehicleQueryParamsDto) {
    const {
      page = 1,
      perPage = 20,
      search,
      makeId,
      vehicleTypeId,
      year,
      seats,
      sort = 'createdAt',
      order = 'desc',
      showInactive = false,
    } = queryParams;

    const whereClause: any = {};

    if (seats) whereClause.seats = seats;
    if (!showInactive) whereClause.status = VehicleStatus.INACTIVE;

    if (search) {
      whereClause[Op.or] = [
        { plateNumber: { [Op.iLike]: `%${search}%` } },
        { model: { [Op.iLike]: `%${search}%` } },
        { chassisNumber: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (makeId) whereClause.makeId = makeId;
    if (vehicleTypeId) whereClause.vehicleTypeId = vehicleTypeId;
    if (year) whereClause.year = year;

    try {
      const options: FindOptions = {
        where: whereClause,
        include: [
          {
            model: VehicleMake,
            attributes: ['id', 'name'],
          },
          {
            model: VehicleType,
            attributes: ['id', 'name', 'code'],
          },
          {
            model: Account,
            include: [
              {
                model: Institution,
                required: false,
                attributes: ['id', 'name', 'email', 'phone_number'],
              },
              {
                model: User,
                required: false,
                attributes: [
                  'user_id',
                  'first_name',
                  'last_name',
                  'phone_number',
                  'email',
                ],
              },
            ],
          },
        ],
        order: [[sort, order]],
        limit: perPage,
        offset: (page - 1) * perPage,
      };
      const { count, rows } = await this.vehicleModel.findAndCountAll(options);
      const totalPages = Math.ceil(count / perPage);

      return {
        status: 'success',
        message: 'Vehicles retrieved successfully',
        pagination: {
          pages: totalPages,
          page: page,
          next: page < totalPages ? page + 1 : null,
          prev: page > 1 ? page - 1 : null,
          count: count,
        },
        response: rows,
        errors: null,
      };
    } catch (err) {
      return {
        status: 'error',
        message: 'Failed to retrieve vehicles',
        pagination: null,
        response: null,
        errors: err,
      };
    }
  }

  async findOne(id: string) {
    try {
      const vehicle = await this.vehicleModel.findOne({
        where: { id },
        include: [
          {
            model: VehicleMake,
            attributes: ['id', 'name'],
          },
          {
            model: VehicleType,
            attributes: ['id', 'name', 'code'],
          },
        ],
      });

      if (!vehicle) {
        return this.responseHelper.error({
          message: 'Failed to retrieve vehicle',
          errors: null,
        });
      } else {
        return this.responseHelper.success({
          message: 'Vehicle retrieved successfully',
          response: vehicle,
        });
      }
    } catch (error) {
      return handleErrors(error, 'findOne');
    }
  }

  private async findUserAccount(userId: string): Promise<Account | null> {
    return this.accountModel.findOne({
      where: {
        userId,
        status: AccountStatus.ACTIVE,
      },
    });
  }

  async create(createVehicleDto: CreateVehicleDto, req: RequestWithUser) {
    await this.validateUniqueConstraints(createVehicleDto);

    let vehicleData = {
      ...createVehicleDto,
      userId: req.user.userId,
      accountId: req.user.is_client
        ? req.user.accountId
        : createVehicleDto.accountId,
      status: req.user.is_client ? VehicleStatus.PENDING : VehicleStatus.ACTIVE,
    };

    try {
      if (!vehicleData.accountId) {
        throw new BadRequestException(
          this.responseHelper.error({
            message: 'accountId must be provided',
            errors: null,
          }),
        );
      }

      const vehicle = await this.vehicleModel.create(vehicleData, {
        fields: [
          'makeId',
          'vehicleTypeId',
          'value',
          'plateNumber',
          'model',
          'year',
          'chassisNumber',
          'seats',
          'userId',
          'accountId',
          'status',
          'engineType',
          'vehicleIdentificationCardUrls',
          'engineNumber',
        ],
        returning: true,
        // raw: false,
      });

      const createdVehicle = await this.findOne(vehicle.id);

      return {
        status: 'success',
        message: 'Vehicle created successfully',
        response: createdVehicle.response,
      };
    } catch (error) {
      return handleErrors(error, 'createVehicle');
    }
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    const vehicle = await this.vehicleModel.findByPk(id);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    await this.validateUniqueConstraints(updateVehicleDto, id);

    await vehicle.update(updateVehicleDto);

    return {
      status: 'success',
      message: 'Vehicle updated successfully',
      response: vehicle,
    };
  }

  async deactivate(id: string) {
    const vehicle = await this.vehicleModel.findByPk(id);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    await vehicle.update({ status: VehicleStatus.INACTIVE });

    return {
      status: 'success',
      message: 'Vehicle deactivated successfully',
      response: vehicle,
    };
  }

  async validate(validateVehicleDto: ValidateVehicleDto) {
    const errors: Record<string, string[]> = {};
    const { plateNumber, chassisNumber, engineNumber } = validateVehicleDto;

    if (!/^[A-Za-z0-9]{3,10}$/i.test(plateNumber)) {
      errors.plateNumber = [
        'Plate number must be 3-10 alphanumeric characters',
      ];
    }

    if (!/^[A-HJ-NPR-Z0-9]+$/.test(chassisNumber)) {
      errors.chassisNumber = ['Invalid chassis number format'];
    }

    if (!/^[A-Z0-9]+$/.test(engineNumber)) {
      errors.engineNumber = ['Invalid engine number format'];
    }

    const isValid = Object.keys(errors).length === 0;

    return {
      status: 'success',
      response: {
        isValid,
        errors: isValid ? {} : errors,
      },
    };
  }

  private async validateUniqueConstraints(
    dto: CreateVehicleDto | UpdateVehicleDto,
    excludeId?: string,
  ) {
    const whereClause: any = {
      [Op.or]: [
        { plateNumber: dto.plateNumber },
        { chassisNumber: dto.chassisNumber },
      ],
    };

    if (dto.engineNumber) {
      whereClause[Op.or].push({ engineNumber: dto.engineNumber });
    }

    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const existing = await this.vehicleModel.findOne({
      where: whereClause,
      attributes: ['id', 'plateNumber', 'chassisNumber', 'engineNumber'],
    });

    if (existing) {
      throw new BadRequestException(
        'Vehicle with this plate number, chassis number, or engine number already exists',
      );
    }
  }

  async queueVehicleUpload(vehicles: CreateVehicleDto[], userId: string) {
    if (vehicles.length <= 100) {
      const sequelize = this.getSequelize();
      const transaction = await sequelize.transaction();

      try {
        const { processedVehicles, errors } = await this.processBatch(
          vehicles,
          userId,
          transaction,
        );

        this.socketLogger.logUploadComplete({
          // jobId: null,
          processedCount: processedVehicles.length,
          errorCount: errors.length,
          errors,
          jobId: '',
        });

        await transaction.commit();

        if (errors.length > 0) {
          return {
            status: 'failed',
            message: 'Duplicated data found in the DB',
            errors: errors.map((error) => ({
              plateNumber: error.plateNumber,
              message: error.error,
            })),
          };
        }

        return {
          status: 'success',
          message: 'Vehicles processed successfully',
          jobId: null,
          processedCount: processedVehicles.length,
          errorCount: errors.length,
          vehicles: processedVehicles,
          errors,
        };
      } catch (error: any) {
        this.socketLogger.logUploadError({
          jobId: '',
          error: error.message,
        });

        await transaction.rollback();
        throw error;
      }
    }

    const jobId = uuidv4();
    const job = await this.vehicleQueue.add(
      'process-vehicles',
      {
        jobId,
        vehicles,
        userId,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: false,
        removeOnFail: false,
      },
    );

    return {
      jobId,
      jobStatus: await job.getState(),
      totalVehicles: vehicles.length,
      estimatedTime: `${Math.ceil(vehicles.length / 50) * 2} minutes`,
    };
  }

  async processBatch(
    vehicles: CreateVehicleDto[],
    userId: string,
    transaction: Transaction,
  ) {
    const processedVehicles: Vehicle[] = [];
    const errors: Array<{
      index: number;
      plateNumber: string;
      error: string;
    }> = [];

    const userAccount = await this.findUserAccount(userId);
    if (!userAccount) {
      throw new BadRequestException('User account not found');
    }

    for (const [index, vehicleData] of vehicles.entries()) {
      try {
        await this.validateUniqueConstraints(vehicleData);
        const vehicle = await this.vehicleModel.create(
          {
            ...vehicleData,
            userId,
            accountId: userAccount.id,
          },
          { transaction },
        );
        processedVehicles.push(vehicle);
      } catch (error) {
        errors.push({
          index,
          plateNumber: vehicleData.plateNumber,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { processedVehicles, errors };
  }
}
