import type { POIFilters, POIResponse, FilterOptions, SummaryMetrics } from '../types/poi';

const API_BASE_URL = 'http://localhost:4000/api';

export class POIService {
  /**
   * Fetch POIs with pagination and filtering
   */
  static async fetchPOIs(
    page: number = 1,
    pageSize: number = 20,
    filters: POIFilters = {},
    sortBy: string = 'footTraffic',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<POIResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sortBy,
      sortOrder,
    });

    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/venues?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  /**
   * Fetch filter options for dropdowns
   */
  static async fetchFilterOptions(): Promise<FilterOptions> {
    const response = await fetch(`${API_BASE_URL}/venues/filter-options`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data;
  }

  /**
   * Fetch summary metrics
   */
  static async fetchSummaryMetrics(filters: POIFilters = {}): Promise<SummaryMetrics> {
    const params = new URLSearchParams();

    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const url = `${API_BASE_URL}/venues/summary${params.toString() ? '?' + params : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data;
  }
}
