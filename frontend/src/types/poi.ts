// Types for POI (Point of Interest) data
export interface POI {
  entityId: string;
  name: string;
  chainId: string | null;
  chainName: string;
  storeId: string;
  subCategory: string | null;
  dma: string | null;
  city: string;
  stateCode: string;
  stateName: string;
  open: boolean;
  dateOpened: string | null;
  dateClosed: string | null;
  footTraffic: number;
  sales: string | null;
  ftPerSqft: string | null;
}

export interface POIFilters {
  chainName?: string;
  category?: string;
  dma?: string;
  city?: string;
  stateCode?: string;
  stateName?: string;
  open?: boolean;
  openedAfter?: string;
  openedBefore?: string;
  closedAfter?: string;
  closedBefore?: string;
}

export interface POIResponse {
  items: POI[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  filters: POIFilters;
  sort: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export interface FilterOptions {
  chainNames: string[];
  categories: string[];
  dmas: string[];
  cities: string[];
  states: { code: string; name: string }[];
}

export interface SummaryMetrics {
  totalVenues: number;
  totalFootTraffic: number;
  totalSales: number;
  averageFootTraffic: number;
  averageSales: number;
  openVenues: number;
  closedVenues: number;
  uniqueChains: number;
  uniqueCities: number;
  uniqueStates: number;
}
