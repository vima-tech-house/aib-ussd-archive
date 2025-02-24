export interface JwtPayload {
  userId: string;
  email: string;
  sub: string;
  iat?: number;
  exp?: number;
}
