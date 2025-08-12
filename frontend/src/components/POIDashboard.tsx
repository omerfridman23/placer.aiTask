import React, { useState, useEffect, useCallback } from 'react';
import type { POI, POIFilters, POIResponse, FilterOptions, SummaryMetrics } from '../types/poi';
import { POIService } from '../services/poiService';

const POIDashboard: React.FC = () => {
  // State for POI data
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(20);
  
  // Filter state
  const [filters, setFilters] = useState<POIFilters>({});
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    chainNames: [],
    categories: [],
    dmas: [],
    cities: [],
    states: []
  });
  
  // Sorting state
  const [sortBy, setSortBy] = useState('footTraffic');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Summary metrics state
  const [summaryMetrics, setSummaryMetrics] = useState<SummaryMetrics | null>(null);

  // Fetch filter options on component mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const options = await POIService.fetchFilterOptions();
        setFilterOptions(options);
      } catch (err) {
        console.error('Error loading filter options:', err);
      }
    };
    
    loadFilterOptions();
  }, []);

  // Fetch POIs function
  const fetchPOIs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response: POIResponse = await POIService.fetchPOIs(
        currentPage,
        pageSize,
        filters,
        sortBy,
        sortOrder
      );
      
      setPois(response.items);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
      
      // Also fetch summary metrics with same filters
      const metrics = await POIService.fetchSummaryMetrics(filters);
      setSummaryMetrics(metrics);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch POIs');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters, sortBy, sortOrder]);

  // Fetch POIs when dependencies change
  useEffect(() => {
    fetchPOIs();
  }, [fetchPOIs]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [filters, sortBy, sortOrder]);

  // Handle filter changes
  const handleFilterChange = (key: keyof POIFilters, value: string | boolean | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  // Handle sorting changes
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
  };

  // Format numbers for display
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="container-fluid py-4 bg-white">
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="dashboard-header">
            <h1 className="display-5 fw-semibold text-dark mb-2">POI Analytics Dashboard</h1>
            <p className="lead text-muted mb-0">Monitor and analyze Points of Interest performance metrics</p>
          </div>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      {summaryMetrics && (
        <div className="row g-4 mb-4">
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm metric-card h-100">
              <div className="card-body text-center p-4">
                <div className="d-flex align-items-center justify-content-center mb-3">
                  <div className="bg-dark rounded-circle p-3">
                    <i className="bi bi-building text-white fs-4" style={{width: '24px', height: '24px', display: 'inline-block'}}></i>
                  </div>
                </div>
                <h3 className="fw-bold text-dark mb-1">{formatNumber(summaryMetrics.totalVenues)}</h3>
                <p className="text-muted mb-0 fw-medium">Total Venues</p>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm metric-card h-100">
              <div className="card-body text-center p-4">
                <div className="d-flex align-items-center justify-content-center mb-3">
                  <div className="bg-secondary rounded-circle p-3">
                    <span className="text-white fs-4 fw-bold">👥</span>
                  </div>
                </div>
                <h3 className="fw-bold text-dark mb-1">{formatNumber(summaryMetrics.totalFootTraffic)}</h3>
                <p className="text-muted mb-0 fw-medium">Total Foot Traffic</p>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm metric-card h-100">
              <div className="card-body text-center p-4">
                <div className="d-flex align-items-center justify-content-center mb-3">
                  <div className="bg-dark rounded-circle p-3">
                    <span className="text-white fs-4 fw-bold">✓</span>
                  </div>
                </div>
                <h3 className="fw-bold text-dark mb-1">{formatNumber(summaryMetrics.openVenues)}</h3>
                <p className="text-muted mb-0 fw-medium">Open Venues</p>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm metric-card h-100">
              <div className="card-body text-center p-4">
                <div className="d-flex align-items-center justify-content-center mb-3">
                  <div className="bg-secondary rounded-circle p-3">
                    <span className="text-white fs-4 fw-bold">🏪</span>
                  </div>
                </div>
                <h3 className="fw-bold text-dark mb-1">{formatNumber(summaryMetrics.uniqueChains)}</h3>
                <p className="text-muted mb-0 fw-medium">Unique Chains</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-accent border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-semibold text-dark">Filters & Search</h5>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={clearFilters}
                  type="button"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-lg-3 col-md-6">
                  <label className="form-label fw-medium text-dark">Chain Name</label>
                  <select
                    className="form-select border-2"
                    value={filters.chainName || ''}
                    onChange={(e) => handleFilterChange('chainName', e.target.value)}
                  >
                    <option value="">All Chains</option>
                    {filterOptions.chainNames.map(chain => (
                      <option key={chain} value={chain}>{chain}</option>
                    ))}
                  </select>
                </div>
                
                <div className="col-lg-3 col-md-6">
                  <label className="form-label fw-medium text-dark">Category</label>
                  <select
                    className="form-select border-2"
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {filterOptions.categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div className="col-lg-3 col-md-6">
                  <label className="form-label fw-medium text-dark">DMA</label>
                  <select
                    className="form-select border-2"
                    value={filters.dma || ''}
                    onChange={(e) => handleFilterChange('dma', e.target.value)}
                  >
                    <option value="">All DMAs</option>
                    {filterOptions.dmas.map(dma => (
                      <option key={dma} value={dma}>{dma}</option>
                    ))}
                  </select>
                </div>
                
                <div className="col-lg-3 col-md-6">
                  <label className="form-label fw-medium text-dark">Status</label>
                  <select
                    className="form-select border-2"
                    value={filters.open === undefined ? '' : filters.open.toString()}
                    onChange={(e) => handleFilterChange('open', e.target.value === '' ? undefined : e.target.value === 'true')}
                  >
                    <option value="">All Statuses</option>
                    <option value="true">Open Only</option>
                    <option value="false">Closed Only</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger border-0 shadow-sm" role="alert">
              <div className="d-flex align-items-center">
                <span className="fw-bold me-2">Error:</span>
                <span>{error}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="row">
          <div className="col-12">
            <div className="text-center py-5">
              <div className="spinner-border spinner-border-lg mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mb-0">Loading POI data...</p>
            </div>
          </div>
        </div>
      )}

      {/* POI Data Table */}
      {!loading && (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm table-container">
              <div className="card-header bg-white border-bottom">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <h5 className="mb-0 fw-semibold text-dark">
                      Points of Interest
                    </h5>
                    <small className="text-muted">
                      {formatNumber(totalItems)} total results
                    </small>
                  </div>
                  <div className="col-md-6 text-md-end mt-2 mt-md-0">
                    <small className="text-muted fw-medium">
                      Page {currentPage} of {totalPages}
                    </small>
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0 align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th 
                          scope="col" 
                          className="border-0 px-4 py-3 fw-semibold cursor-pointer"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSort('name')}
                        >
                          <div className="d-flex align-items-center">
                            Name 
                            {sortBy === 'name' && (
                              <span className="ms-2">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th 
                          scope="col"
                          className="border-0 px-4 py-3 fw-semibold cursor-pointer"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSort('chainName')}
                        >
                          <div className="d-flex align-items-center">
                            Chain Name 
                            {sortBy === 'chainName' && (
                              <span className="ms-2">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="border-0 px-4 py-3 fw-semibold">Category</th>
                        <th scope="col" className="border-0 px-4 py-3 fw-semibold">DMA</th>
                        <th 
                          scope="col"
                          className="border-0 px-4 py-3 fw-semibold cursor-pointer"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSort('city')}
                        >
                          <div className="d-flex align-items-center">
                            City 
                            {sortBy === 'city' && (
                              <span className="ms-2">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="border-0 px-4 py-3 fw-semibold">State</th>
                        <th 
                          scope="col"
                          className="border-0 px-4 py-3 fw-semibold cursor-pointer text-end"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSort('footTraffic')}
                        >
                          <div className="d-flex align-items-center justify-content-end">
                            Visits 
                            {sortBy === 'footTraffic' && (
                              <span className="ms-2">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="border-0 px-4 py-3 fw-semibold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pois.map((poi) => (
                        <tr key={poi.entityId} className="border-bottom">
                          <td className="px-4 py-3">
                            <div className="fw-medium text-dark">{poi.name}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-muted">{poi.chainName}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-muted">{poi.subCategory || '—'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-muted">{poi.dma || '—'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-muted">{poi.city}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="badge bg-light text-dark border">{poi.stateCode}</span>
                          </td>
                          <td className="px-4 py-3 text-end">
                            <span className="fw-semibold text-dark">{formatNumber(poi.footTraffic)}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`badge ${poi.open ? 'bg-success' : 'bg-danger'} text-white`}>
                              {poi.open ? 'Open' : 'Closed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="row mt-4">
          <div className="col-12">
            <nav aria-label="POI pagination">
              <ul className="pagination justify-content-center mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link border-0 text-dark"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    type="button"
                  >
                    First
                  </button>
                </li>
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link border-0 text-dark"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    type="button"
                  >
                    Previous
                  </button>
                </li>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum <= totalPages) {
                    return (
                      <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                        <button
                          className="page-link border-0"
                          onClick={() => setCurrentPage(pageNum)}
                          type="button"
                        >
                          {pageNum}
                        </button>
                      </li>
                    );
                  }
                  return null;
                })}
                
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link border-0 text-dark"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    type="button"
                  >
                    Next
                  </button>
                </li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link border-0 text-dark"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    type="button"
                  >
                    Last
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && pois.length === 0 && !error && (
        <div className="row">
          <div className="col-12">
            <div className="text-center py-5">
              <div className="mb-4">
                <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                  <span className="fs-1 text-muted">📍</span>
                </div>
              </div>
              <h5 className="text-dark fw-semibold mb-2">No POIs found</h5>
              <p className="text-muted mb-4">Try adjusting your filters or check back later for new data.</p>
              <button
                className="btn btn-outline-dark"
                onClick={clearFilters}
                type="button"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POIDashboard;
