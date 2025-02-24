export interface JwtPayload {
  userId: string;
  sub: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  accountId?: string | null;
  role: string;
  iat?: number;
  exp?: number;
}
