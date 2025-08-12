/**
 * Controller for venues endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { parsePagination, summarize } from '../../lib/pagination';
import { listVenues, getFilterOptions, getVenueSummaryStats } from './venues.repo';
import { VenueFilters } from './venues.types';

/**
 * GET /api/venues - Paginated list of venues with filtering and sorting
 */
export async function getVenues(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Parse pagination parameters from query string
    const { page, pageSize, skip, take } = parsePagination({
      page: req.query.page as string,
      pageSize: req.query.pageSize as string,
    });

    // Parse filter parameters
    const filters: VenueFilters = {};
    
    // Define filter mappings with their types
    const filterMappings: Array<{
      queryKey: string;
      filterKey: keyof VenueFilters;
      transform?: (value: string) => any;
    }> = [
      { queryKey: 'chainName', filterKey: 'chainName' },
      { queryKey: 'category', filterKey: 'category' },
      { queryKey: 'dma', filterKey: 'dma' },
      { queryKey: 'city', filterKey: 'city' },
      { queryKey: 'stateCode', filterKey: 'stateCode' },
      { queryKey: 'stateName', filterKey: 'stateName' },
      { queryKey: 'open', filterKey: 'open', transform: (value: string) => value === 'true' },
      { queryKey: 'openedAfter', filterKey: 'openedAfter' },
      { queryKey: 'openedBefore', filterKey: 'openedBefore' },
      { queryKey: 'closedAfter', filterKey: 'closedAfter' },
      { queryKey: 'closedBefore', filterKey: 'closedBefore' }
    ];

    // Apply filters dynamically
    filterMappings.forEach(({ queryKey, filterKey, transform }) => {
      const queryValue = req.query[queryKey];
      if (queryValue !== undefined) {
        filters[filterKey] = transform 
          ? transform(queryValue as string)
          : queryValue as string;
      }
    });

    // Parse sorting parameters
    const sortBy = (req.query.sortBy as string) || 'footTraffic';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

    // Validate sortBy parameter
    const validSortFields = ['footTraffic', 'sales', 'chainName', 'city'];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'footTraffic';

    // Fetch venues from repository
    const { items, totalItems } = await listVenues(skip, take, filters, finalSortBy, sortOrder);

    // Return paginated response
    res.json({
      items,
      ...summarize(totalItems, page, pageSize),
      filters: filters, // Include applied filters in response
      sort: { field: finalSortBy, order: sortOrder }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/venues/filter-options - Get available filter options
 */
export async function getVenueFilterOptions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filterOptions = await getFilterOptions();
    
    res.json({
      success: true,
      data: filterOptions,
      message: 'Filter options retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/venues/summary - Get venue summary statistics with filtering
 */
export async function getVenueSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Parse filter parameters (same logic as getVenues)
    const filters: VenueFilters = {};
    
    const filterMappings: Array<{
      queryKey: string;
      filterKey: keyof VenueFilters;
      transform?: (value: string) => any;
    }> = [
      { queryKey: 'chainName', filterKey: 'chainName' },
      { queryKey: 'category', filterKey: 'category' },
      { queryKey: 'dma', filterKey: 'dma' },
      { queryKey: 'city', filterKey: 'city' },
      { queryKey: 'stateCode', filterKey: 'stateCode' },
      { queryKey: 'stateName', filterKey: 'stateName' },
      { queryKey: 'open', filterKey: 'open', transform: (value: string) => value === 'true' },
      { queryKey: 'openedAfter', filterKey: 'openedAfter' },
      { queryKey: 'openedBefore', filterKey: 'openedBefore' },
      { queryKey: 'closedAfter', filterKey: 'closedAfter' },
      { queryKey: 'closedBefore', filterKey: 'closedBefore' }
    ];

    filterMappings.forEach(({ queryKey, filterKey, transform }) => {
      const queryValue = req.query[queryKey];
      if (queryValue !== undefined) {
        filters[filterKey] = transform 
          ? transform(queryValue as string)
          : queryValue as string;
      }
    });

    // Get summary statistics
    const summaryStats = await getVenueSummaryStats(filters);
    
    res.json({
      success: true,
      data: summaryStats,
      filters: filters,
      message: 'Venue summary statistics retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
}
