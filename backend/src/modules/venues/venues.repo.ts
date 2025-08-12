/**
 * Repository layer for venues data access
 */

import prisma from '../../lib/prisma';
import { VenueListItem, VenueFilters } from './venues.types';

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
  const where: any = {};

  if (filters.chainName) {
    where.chain = {
      chainName: {
        contains: filters.chainName,
        mode: 'insensitive'
      }
    };
  }

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

  if (filters.open !== undefined) {
    where.store = {
      ...where.store,
      dateClosed: filters.open ? null : { not: null }
    };
  }

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
          dateClosed: true 
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
