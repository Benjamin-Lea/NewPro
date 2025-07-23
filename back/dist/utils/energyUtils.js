"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchDetailedRecords = exports.fetchAggregatedRecords = exports.getDateRange = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
exports.getDateRange = getDateRange;
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
exports.fetchAggregatedRecords = fetchAggregatedRecords;
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
exports.fetchDetailedRecords = fetchDetailedRecords;
