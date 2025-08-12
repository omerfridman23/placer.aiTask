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

  // Chain filter
  if (filters.chainName) {
    where.chain = {
      chainName: {
        contains: filters.chainName,
        mode: 'insensitive'
      }
    };
  }

  // Store filters - only filter by store data for now
  // (entities without stores won't be filtered by these fields)
  if (filters.category) {
    where.store = {
      ...where.store,
      subCategory: {
        contains: filters.category,
        mode: 'insensitive'
      }
    };
  }

  if (filters.dma) {
    where.store = {
      ...where.store,
      dma: {
        contains: filters.dma,
        mode: 'insensitive'
      }
    };
  }

  if (filters.city) {
    where.store = {
      ...where.store,
      city: {
        contains: filters.city,
        mode: 'insensitive'
      }
    };
  }

  if (filters.stateCode) {
    where.store = {
      ...where.store,
      stateCode: {
        equals: filters.stateCode.toUpperCase()
      }
    };
  }

  if (filters.stateName) {
    where.store = {
      ...where.store,
      stateName: {
        contains: filters.stateName,
        mode: 'insensitive'
      }
    };
  }

  // Date filters
  if (filters.openedAfter) {
    where.store = {
      ...where.store,
      dateOpened: {
        gte: new Date(filters.openedAfter)
      }
    };
  }

  if (filters.openedBefore) {
    where.store = {
      ...where.store,
      dateOpened: {
        ...where.store?.dateOpened,
        lte: new Date(filters.openedBefore)
      }
    };
  }

  if (filters.closedAfter) {
    where.store = {
      ...where.store,
      dateClosed: {
        gte: new Date(filters.closedAfter)
      }
    };
  }

  if (filters.closedBefore) {
    where.store = {
      ...where.store,
      dateClosed: {
        ...where.store?.dateClosed,
        lte: new Date(filters.closedBefore)
      }
    };
  }

  // Handle special open/closed filter
  if (filters.open !== undefined) {
    where.store = {
      ...where.store,
      dateClosed: filters.open ? null : { not: null }
    };
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

  // Map to flat DTO structure, handling entities with/without stores
  const items: VenueListItem[] = entities.map((entity: any) => ({
    entityId: entity.entityId,
    name: entity.store?.name || entity.name || `Entity ${entity.entityId}`, // Use store name, fallback to entity name, or generated name
    chainId: entity.chain?.chainId || null,
    chainName: entity.chain?.chainName || '',
    storeId: entity.store?.storeId || null,
    subCategory: entity.store?.subCategory || entity.subCategory || null,
    dma: entity.store?.dma || entity.dma || null,
    city: entity.store?.city || entity.city || null,
    stateCode: entity.store?.stateCode || entity.stateCode || null,
    stateName: entity.store?.stateName || entity.stateName || null,
    open: entity.store?.dateClosed === null || !entity.store, // Entities without stores are considered "open"
    dateOpened: entity.store?.dateOpened?.toISOString() || null,
    dateClosed: entity.store?.dateClosed?.toISOString() || null,
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

  // Get unique categories from stores (entities without stores will need manual handling)
  const categories = await prisma.store.findMany({
    select: { subCategory: true },
    where: { subCategory: { not: null } },
    distinct: ['subCategory'],
    orderBy: { subCategory: 'asc' }
  });
  const categoryNames = categories
    .map(store => store.subCategory)
    .filter(Boolean) as string[];

  // Get unique DMAs from stores
  const dmas = await prisma.store.findMany({
    select: { dma: true },
    where: { dma: { not: null } },
    distinct: ['dma'],
    orderBy: { dma: 'asc' }
  });
  const dmaNames = dmas
    .map(store => store.dma)
    .filter(Boolean) as string[];

  // Get unique cities from stores
  const cities = await prisma.store.findMany({
    select: { city: true },
    distinct: ['city'],
    orderBy: { city: 'asc' },
    take: 100 // Limit to prevent too many results
  });
  const cityNames = cities.map(store => store.city);

  // Get unique states from stores
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
    uniqueChainsCount
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
    
    // Open venues count (entities with stores that aren't closed, plus entities without stores)
    prisma.entity.count({
      where: {
        ...where,
        OR: [
          {
            AND: [
              { storeId: { not: null } },
              { store: { dateClosed: null } }
            ]
          },
          {
            storeId: null // Entities without stores are considered "open"
          }
        ]
      }
    }),
    
    // Closed venues count (only entities with stores that are closed)
    prisma.entity.count({
      where: {
        ...where,
        AND: [
          { storeId: { not: null } },
          { store: { dateClosed: { not: null } } }
        ]
      }
    }),
    
    // Unique chains count
    prisma.entity.findMany({
      where,
      select: { chainId: true },
      distinct: ['chainId']
    }).then(result => result.length)
  ]);

  // For cities and states, get them from stores only (simpler approach)
  const [uniqueCitiesCount, uniqueStatesCount] = await Promise.all([
    // Unique cities count
    prisma.entity.findMany({
      where: {
        ...where,
        storeId: { not: null } // Only entities with stores
      },
      select: { 
        store: { 
          select: { city: true } 
        } 
      },
      distinct: ['storeId']
    }).then(stores => {
      const cities = new Set(stores.map(s => s.store?.city).filter(Boolean));
      return cities.size;
    }),
    
    // Unique states count
    prisma.entity.findMany({
      where: {
        ...where,
        storeId: { not: null } // Only entities with stores
      },
      select: { 
        store: { 
          select: { stateCode: true } 
        } 
      },
      distinct: ['storeId']
    }).then(stores => {
      const states = new Set(stores.map(s => s.store?.stateCode).filter(Boolean));
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
