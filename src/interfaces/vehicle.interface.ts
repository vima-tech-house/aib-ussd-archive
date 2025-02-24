import { Vehicle } from '@database/models/vehicle.model';
import { CreateVehicleDto } from '@modules/vehicles/dto/vehicle.dto';
import { Optional } from 'sequelize';

export interface PaginationMeta {
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalRecords: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface IVehicleCreationAttributes {
  id?: string;
  userId: string;
  makeId: string;
  vehicleTypeId: string;
  plateNumber: string;
  model: string;
  year: number;
  chassisNumber: string;
  engineNumber: string;
  // seats: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VehicleCreationAttributes
  extends Optional<IVehicleCreationAttributes, 'id'> {}

export interface BulkOperationError {
  index: number;
  plateNumber: string;
  errors: string[];
}

export interface BulkOperationResult {
  successful: {
    count: number;
    vehicles: Vehicle[];
  };
  failed: {
    count: number;
    errors: BulkOperationError[];
  };
}

export interface BulkOperationResponse {
  status: 'success' | 'error' | 'partial';
  message: string;
  response: BulkOperationResult;
}

export interface VehicleUploadJob {
  jobId: string;
  vehicles: CreateVehicleDto[];
  userId: string;
}
