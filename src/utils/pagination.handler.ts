interface PaginationResult {
  pages: number;
  page: number;
  next: number | null;
  prev: number | null;
  count: number;
}

export function createPagination(
  count: number,
  limit: number,
  offset: number,
): PaginationResult {
  const pages = Math.ceil(count / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return {
    pages,
    page: currentPage,
    next: currentPage < pages ? currentPage + 1 : null,
    prev: currentPage > 1 ? currentPage - 1 : null,
    count,
  };
}
