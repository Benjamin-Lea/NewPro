"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// @TODO - Fix CORS issues
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
// GET all (optionally limited)
router.get('/', async (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const records = await prisma.energyMarketData.findMany({
        orderBy: { dateBeginGMT: 'desc' },
        take: limit,
    });
    res.json(records);
});
// GET by date range
router.get('/range', async (req, res) => {
    const { end, start } = req.query;
    if (!start || !end) {
        return res.status(400).json({ error: 'start and end dates are required' });
    }
    try {
        const records = await prisma.energyMarketData.findMany({
            orderBy: { dateBeginGMT: 'asc' },
            where: {
                dateBeginGMT: {
                    gte: new Date(start),
                    lte: new Date(end),
                },
            },
        });
        res.json(records);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch records' });
    }
});
// Date calculation utilities
const getDateRange = (type) => {
    const end = new Date();
    const start = new Date();
    switch (type) {
        case '6months':
            start.setMonth(end.getMonth() - 6);
            break;
        case 'all':
            return { end, start: new Date(0) };
        case 'day':
            start.setDate(end.getDate() - 1);
            break;
        case 'month':
            start.setMonth(end.getMonth() - 1);
            break;
        case 'week':
            start.setDate(end.getDate() - 7);
            break;
        case 'year':
            start.setFullYear(end.getFullYear() - 1);
            break;
        default:
            throw new Error('Invalid period type');
    }
    return { end, start };
};
// Data fetching utilities
const fetchAggregatedRecords = async (start, end) => {
    const startMs = start.getTime();
    const endMs = end.getTime();
    return await prisma.$queryRaw `
    SELECT
      DATE("dateBeginGMT" / 1000, 'unixepoch', 'weekday 0') AS "dateBeginGMT", 
      AVG("actualAIL") AS "actualAIL",
      AVG("actualPoolPrice") AS "actualPoolPrice"
    FROM
      "energyMarketData"
    WHERE
      "dateBeginGMT" BETWEEN ${startMs} AND ${endMs} AND "actualPoolPrice" != 0
    GROUP BY
      DATE("dateBeginGMT" / 1000, 'unixepoch', 'weekday 0')
    ORDER BY
      "dateBeginGMT" ASC;
  `;
};
const fetchDetailedRecords = async (start, end) => {
    const records = await prisma.energyMarketData.findMany({
        orderBy: { dateBeginGMT: 'asc' },
        select: {
            actualAIL: true,
            actualPoolPrice: true,
            dateBeginGMT: true,
        },
        where: {
            actualPoolPrice: { not: 0 },
            dateBeginGMT: { gte: start, lte: end },
        },
    });
    return records.map(record => ({
        ...record,
        dateBeginGMT: new Date(record.dateBeginGMT).toLocaleString("en-CA", {
            hour12: false,
            timeZone: "America/Edmonton"
        }).replace(',', '')
    }));
};
// Main route handler
router.get('/period/:type', async (req, res) => {
    const { type } = req.params;
    const shouldUseAggregation = type === 'all' || type === 'year';
    try {
        const { end, start } = getDateRange(type);
        const records = shouldUseAggregation
            ? await fetchAggregatedRecords(start, end)
            : await fetchDetailedRecords(start, end);
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
exports.default = router;
