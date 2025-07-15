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
router.get('/period/:type', async (req, res) => {
    const { type } = req.params;
    let start;
    const end = new Date();
    start = new Date();
    if (type === 'day') {
        start.setDate(end.getDate() - 1);
    }
    else if (type === 'week') {
        start.setDate(end.getDate() - 7);
    }
    else if (type === 'month') {
        start.setMonth(end.getMonth() - 1);
    }
    else if (type === '6months') {
        start.setMonth(end.getMonth() - 6);
    }
    else if (type === 'year') {
        start.setFullYear(end.getFullYear() - 1);
    }
    else if (type === 'all') {
        start = new Date(0);
    }
    else {
        return res.status(400).json({ error: 'Invalid period type' });
    }
    try {
        let records;
        if (type === 'all' || type === 'year') {
            const startMs = start.getTime();
            const endMs = end.getTime();
            console.log('Fetching all records');
            records = await prisma.$queryRaw `
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
        }
        else {
            records = await prisma.energyMarketData.findMany({
                orderBy: { dateBeginGMT: 'asc' },
                select: {
                    actualAIL: true,
                    actualPoolPrice: true,
                    dateBeginGMT: true,
                },
                where: {
                    dateBeginGMT: {
                        gte: start,
                        lte: end,
                    },
                    actualPoolPrice: {
                        not: 0,
                    },
                },
            });
        }
        res.json(records);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch records' });
    }
});
exports.default = router;
