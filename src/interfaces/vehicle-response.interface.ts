export interface Pagination {
  pages: number;
  page: number;
  next: number | null;
  prev: number | null;
  count: number;
}
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  pagination: Pagination | null;
  response: T | null;
  errors: Record<string, any> | Array<any> | null;
}
export interface QueryResult<T> {
  data: T[];
  count: number;
  page: number;
  perPage: number;
}
