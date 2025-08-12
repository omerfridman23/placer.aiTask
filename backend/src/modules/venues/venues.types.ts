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
  open: boolean;               // store.dateClosed == null
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
  open?: boolean;             // Filter by open/closed status
}

export interface VenueQueryParams extends VenueFilters {
  page?: number;
  limit?: number;
  sortBy?: 'footTraffic' | 'sales' | 'chainName' | 'city';
  sortOrder?: 'asc' | 'desc';
}
