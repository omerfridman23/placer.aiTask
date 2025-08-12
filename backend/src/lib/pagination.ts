/**
 * Pagination utilities for parsing query params and generating metadata
 */

export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export interface PaginationSummary {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Parse and validate pagination parameters from query string
 */
export function parsePagination({ page, pageSize }: { page?: string; pageSize?: string }): PaginationParams {
  // Coerce and validate page
  const parsedPage = Math.max(1, parseInt(page || '1', 10) || 1);
  
  // Coerce and validate pageSize (min 1, max 200, default 20)
  const parsedPageSize = Math.min(200, Math.max(1, parseInt(pageSize || '20', 10) || 20));
  
  // Calculate skip and take for Prisma
  const skip = (parsedPage - 1) * parsedPageSize;
  const take = parsedPageSize;
  
  return {
    page: parsedPage,
    pageSize: parsedPageSize,
    skip,
    take,
  };
}

/**
 * Generate pagination summary for API response
 */
export function summarize(totalItems: number, page: number, pageSize: number): PaginationSummary {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  return {
    page,
    pageSize,
    totalItems,
    totalPages,
  };
}
