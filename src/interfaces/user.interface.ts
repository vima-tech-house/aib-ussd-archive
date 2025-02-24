import { Request as ExpressRequest } from 'express';

export interface UserAttributes {
  user_id?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  email?: string;
  phone_number?: string;
  password?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface RequestWithUser extends ExpressRequest {
  user: {
    id: string;
    email: string;
    userId: string;
    role: string;
    is_client: boolean;
    first_name: string;
    last_name: string;
    accountId?: string;
  };
}

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}
