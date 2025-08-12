/**
 * Repository layer for venues data access
 */

import prisma from '../../lib/prisma';
import { VenueListItem, VenueFilters, VenueSummaryStats } from './venues.types';

/**
 * Build Prisma where clause from filters
 */
function buildWhereClause(filters: VenueFilters): any {
  const where: any = {};

  // Define all filter mappings
  const filterMappings = [
    // Chain filters
    { 
      filter: 'chainName', 
      target: 'chain', 
      field: 'chainName', 
      type: 'contains' 
    },
    // Store filters
    { 
      filter: 'category', 
      target: 'store', 
      field: 'subCategory', 
      type: 'contains' 
    },
    { 
      filter: 'dma', 
      target: 'store', 
      field: 'dma', 
      type: 'contains' 
    },
    { 
      filter: 'city', 
      target: 'store', 
      field: 'city', 
      type: 'contains' 
    },
    { 
      filter: 'stateCode', 
      target: 'store', 
      field: 'stateCode', 
      type: 'equals' 
    },
    { 
      filter: 'stateName', 
      target: 'store', 
      field: 'stateName', 
      type: 'contains' 
    },
    // Date filters
    { 
      filter: 'openedAfter', 
      target: 'store', 
      field: 'dateOpened', 
      type: 'gte' 
    },
    { 
      filter: 'openedBefore', 
      target: 'store', 
      field: 'dateOpened', 
      type: 'lte' 
    },
    { 
      filter: 'closedAfter', 
      target: 'store', 
      field: 'dateClosed', 
      type: 'gte' 
    },
    { 
      filter: 'closedBefore', 
      target: 'store', 
      field: 'dateClosed', 
      type: 'lte' 
    }
  ];

  // Apply all filters
  filterMappings.forEach(({ filter, target, field, type }) => {
    const filterValue = filters[filter as keyof VenueFilters];
    if (filterValue) {
      if (!where[target]) {
        where[target] = {};
      }
      
      if (type === 'contains') {
        where[target][field] = {
          contains: filterValue,
          mode: 'insensitive'
        };
      } else if (type === 'equals') {
        where[target][field] = {
          equals: (filterValue as string).toUpperCase()
        };
      } else if (type === 'gte') {
        where[target][field] = {
          gte: new Date(filterValue as string)
        };
      } else if (type === 'lte') {
        where[target][field] = {
          lte: new Date(filterValue as string)
        };
      }
    }
  });

  // Handle special open/closed filter
  if (filters.open !== undefined) {
    if (!where.store) {
      where.store = {};
    }
    where.store.dateClosed = filters.open ? null : { not: null };
  }

  return where;
}

/**
 * Fetch paginated list of venues with related chain and store data
 */
export async function listVenues(
  skip: number, 
  take: number, 
  filters: VenueFilters = {},
  sortBy: string = 'footTraffic',
  sortOrder: 'asc' | 'desc' = 'asc'
): Promise<{ items: VenueListItem[]; totalItems: number }> {
   
  // Build where clause based on filters
  const where = buildWhereClause(filters);

  // Build order by clause
  let orderBy: any = {};
  
  switch (sortBy) {
    case 'chainName':
      orderBy = { chain: { chainName: sortOrder } };
      break;
    case 'city':
      orderBy = { store: { city: sortOrder } };
      break;
    case 'sales':
      orderBy = { sales: sortOrder };
      break;
    case 'footTraffic':
    default:
      orderBy = { footTraffic: sortOrder };
      break;
  }

  const entities = await prisma.entity.findMany({
    skip,
    take,
    where,
    orderBy,
    include: {
      chain: { select: { chainId: true, chainName: true } },
      store: { 
        select: { 
          storeId: true, 
          name: true, 
          city: true, 
          stateCode: true, 
          stateName: true, 
          subCategory: true, 
          dma: true, 
          dateClosed: true,
          dateOpened: true 
        } 
      }
    }
  });

  const totalItems = await prisma.entity.count({ where });

  // Map to flat DTO structure
  const items: VenueListItem[] = entities.map((entity: any) => ({
    entityId: entity.entityId,
    name: entity.store.name, // prefer store.name
    chainId: entity.chain?.chainId || null,
    chainName: entity.chain?.chainName || '',
    storeId: entity.store.storeId,
    subCategory: entity.store.subCategory,
    dma: entity.store.dma,
    city: entity.store.city,
    stateCode: entity.store.stateCode,
    stateName: entity.store.stateName,
    open: entity.store.dateClosed === null,
    dateOpened: entity.store.dateOpened?.toISOString() || null,
    dateClosed: entity.store.dateClosed?.toISOString() || null,
    footTraffic: entity.footTraffic,
    sales: entity.sales?.toString() || null,
    ftPerSqft: entity.ftPerSqft?.toString() || null,
  }));

  return { items, totalItems };
}

/**
 * Get available filter options for the UI
 */
export async function getFilterOptions(): Promise<{
  chainNames: string[];
  categories: string[];
  dmas: string[];
  cities: string[];
  states: { code: string; name: string }[];
}> {
  // Get unique chain names
  const chains = await prisma.chain.findMany({
    select: { chainName: true },
    orderBy: { chainName: 'asc' }
  });
  const chainNames = chains.map(chain => chain.chainName);

  // Get unique categories (sub categories)
  const categories = await prisma.store.findMany({
    select: { subCategory: true },
    where: { subCategory: { not: null } },
    distinct: ['subCategory'],
    orderBy: { subCategory: 'asc' }
  });
  const categoryNames = categories
    .map(store => store.subCategory)
    .filter(Boolean) as string[];

  // Get unique DMAs
  const dmas = await prisma.store.findMany({
    select: { dma: true },
    where: { dma: { not: null } },
    distinct: ['dma'],
    orderBy: { dma: 'asc' }
  });
  const dmaNames = dmas
    .map(store => store.dma)
    .filter(Boolean) as string[];

  // Get unique cities
  const cities = await prisma.store.findMany({
    select: { city: true },
    distinct: ['city'],
    orderBy: { city: 'asc' },
    take: 100 // Limit to prevent too many results
  });
  const cityNames = cities.map(store => store.city);

  // Get unique states
  const states = await prisma.store.findMany({
    select: { stateCode: true, stateName: true },
    distinct: ['stateCode'],
    orderBy: { stateName: 'asc' }
  });
  const stateOptions = states.map(store => ({
    code: store.stateCode,
    name: store.stateName
  }));

  return {
    chainNames,
    categories: categoryNames,
    dmas: dmaNames,
    cities: cityNames,
    states: stateOptions
  };
}

/**
 * Get summary statistics for venues (respects filters)
 */
export async function getVenueSummaryStats(filters: VenueFilters = {}): Promise<VenueSummaryStats> {
  const where = buildWhereClause(filters);

  // Get aggregated stats
  const [
    totalVenues,
    aggregateStats,
    openVenuesCount,
    closedVenuesCount,
    uniqueChainsCount,
    uniqueCitiesCount,
    uniqueStatesCount
  ] = await Promise.all([
    // Total venues count
    prisma.entity.count({ where }),
    
    // Aggregate foot traffic and sales
    prisma.entity.aggregate({
      where,
      _sum: {
        footTraffic: true,
        sales: true
      },
      _avg: {
        footTraffic: true,
        sales: true
      }
    }),
    
    // Open venues count
    prisma.entity.count({
      where: {
        ...where,
        store: {
          ...where.store,
          dateClosed: null
        }
      }
    }),
    
    // Closed venues count
    prisma.entity.count({
      where: {
        ...where,
        store: {
          ...where.store,
          dateClosed: { not: null }
        }
      }
    }),
    
    // Unique chains count
    prisma.entity.findMany({
      where,
      select: { chainId: true },
      distinct: ['chainId']
    }).then(result => result.length),
    
    // Unique cities count
    prisma.entity.findMany({
      where,
      select: { store: { select: { city: true } } },
      distinct: ['storeId'] // Use storeId for distinct as city is in nested relation
    }).then(async (stores) => {
      const cities = new Set(stores.map(s => s.store.city));
      return cities.size;
    }),
    
    // Unique states count
    prisma.entity.findMany({
      where,
      select: { store: { select: { stateCode: true } } },
      distinct: ['storeId'] // Use storeId for distinct as stateCode is in nested relation
    }).then(async (stores) => {
      const states = new Set(stores.map(s => s.store.stateCode));
      return states.size;
    })
  ]);

  return {
    totalVenues,
    totalFootTraffic: Number(aggregateStats._sum.footTraffic) || 0,
    totalSales: Number(aggregateStats._sum.sales) || 0,
    averageFootTraffic: Number(aggregateStats._avg.footTraffic) || 0,
    averageSales: Number(aggregateStats._avg.sales) || 0,
    openVenues: openVenuesCount,
    closedVenues: closedVenuesCount,
    uniqueChains: uniqueChainsCount,
    uniqueCities: uniqueCitiesCount,
    uniqueStates: uniqueStatesCount
  };
}
