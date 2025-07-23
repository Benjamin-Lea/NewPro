import express from 'express';
import { Request, Response, NextFunction } from 'express';

import {
  fetchAggregatedRecords,
  fetchCurrentDemand,
  getDateRange
} from '../utils/energyEndPointUtils';

const router = express.Router();

// @TODO - Fix CORS issues
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const dashboardLogger = function (req: Request, res: Response, next: NextFunction) {
  console.log(req.method, req.originalUrl, new Date().toISOString());
  next();
};

router.use(dashboardLogger);
// Main route handler
router.get('/pricedemand/period/:type', async (req, res) => {
  const { type } = req.params;

  try {
    const { end, start } = getDateRange(type);
    const records = await fetchAggregatedRecords(start, end)
    res.json(records);
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid period type') {
      return res.status(400).json({ error: 'Invalid period type' });
    }

    console.error(error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

router.get('/currentdemand/', async (_req, res) => {
  try {
    const currentDemand = await fetchCurrentDemand();
    res.json(currentDemand);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error fetching current demand:', message);
    res.status(500).json({ details: message, error: 'Failed to fetch current demand' });
  }
});

export default router;
