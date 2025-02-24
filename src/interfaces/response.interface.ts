export interface Pagination {
  pages: number;
  page: number;
  next: number | null;
  prev: number | null;
  count: number;
}

export interface Response<T> {
  status: 'success' | 'error';
  message: string;
  pagination: Pagination | null;
  response: T | null;
  errors: object | Array<any> | null;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  pagination?: {
    pages: number;
    page: number;
    next: number | null;
    prev: number | null;
    count: number;
  } | null;
  response: T | null;
  errors: any | null;
}
