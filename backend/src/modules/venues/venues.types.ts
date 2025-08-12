/**
 * Type definitions for venues module
 */

export interface VenueListItem {
  entityId: string;
  name: string;                // prefer store.name || entity.name
  chainId: string | null;
  chainName: string;
  storeId: string;
  subCategory: string | null;
  dma: string | null;
  city: string;
  stateCode: string;
  stateName: string;
  open: boolean;               // true if dateClosed is null (store is open)
  dateOpened: string | null;   // store.dateOpened as ISO string, null if unknown
  dateClosed: string | null;   // store.dateClosed as ISO string, null if still open
  footTraffic: number;
  sales: string | null;        // Decimal -> string
  ftPerSqft: string | null;    // Decimal -> string
}

export interface VenueFilters {
  chainName?: string;          // Filter by chain name (partial match)
  category?: string;           // Filter by sub category
  dma?: string;               // Filter by DMA
  city?: string;              // Filter by city
  stateCode?: string;         // Filter by state code (e.g., "CA", "NY")
  stateName?: string;         // Filter by state name
  open?: boolean;             // Filter by open/closed status (true = open, false = closed)
  openedAfter?: string;       // Filter by stores opened after date (ISO string)
  openedBefore?: string;      // Filter by stores opened before date (ISO string)
  closedAfter?: string;       // Filter by stores closed after date (ISO string)
  closedBefore?: string;      // Filter by stores closed before date (ISO string)
}

export interface VenueQueryParams extends VenueFilters {
  page?: number;
  limit?: number;
  sortBy?: 'footTraffic' | 'sales' | 'chainName' | 'city';
  sortOrder?: 'asc' | 'desc';
}

export interface VenueSummaryStats {
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
