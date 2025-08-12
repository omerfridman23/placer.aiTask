/**
 * Router for venues endpoints
 */

import { Router } from 'express';
import { getVenues, getVenueFilterOptions, getVenueSummary } from './venues.controller';

const venuesRouter = Router();

// GET /api/venues - List venues with pagination and filtering
venuesRouter.get('/', getVenues);

// GET /api/venues/filter-options - Get available filter options
venuesRouter.get('/filter-options', getVenueFilterOptions);

// GET /api/venues/summary - Get venue summary statistics
venuesRouter.get('/summary', getVenueSummary);

export default venuesRouter;
