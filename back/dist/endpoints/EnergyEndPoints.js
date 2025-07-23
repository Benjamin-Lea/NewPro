"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const energyEndPointUtils_1 = require("../utils/energyEndPointUtils");
const router = express_1.default.Router();
// @TODO - Fix CORS issues
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
const dashboardLogger = function (req, res, next) {
    console.log(req.method, req.originalUrl, new Date().toISOString());
    next();
};
router.use(dashboardLogger);
// Main route handler
router.get('/pricedemand/period/:type', async (req, res) => {
    const { type } = req.params;
    try {
        const { end, start } = (0, energyEndPointUtils_1.getDateRange)(type);
        const records = await (0, energyEndPointUtils_1.fetchAggregatedRecords)(start, end);
        res.json(records);
    }
    catch (error) {
        if (error instanceof Error && error.message === 'Invalid period type') {
            return res.status(400).json({ error: 'Invalid period type' });
        }
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch records' });
    }
});
router.get('/currentdemand/', async (_req, res) => {
    try {
        const currentDemand = await (0, energyEndPointUtils_1.fetchCurrentDemand)();
        res.json(currentDemand);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Error fetching current demand:', message);
        res.status(500).json({ details: message, error: 'Failed to fetch current demand' });
    }
});
exports.default = router;
