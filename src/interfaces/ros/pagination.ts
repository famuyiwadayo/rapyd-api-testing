export interface IPaginationFilter {
  limit?: string;
  page?: string;
}

export interface PaginatedDocument<T> {
  totalCount: number;
  data: T;
}
