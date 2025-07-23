import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Date calculation utilities
export const getDateRange = (type: string): { end: Date; start: Date; } => {
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
export const fetchAggregatedRecords = async (start: Date, end: Date) => {
  const startMs = start.getTime();
  const endMs = end.getTime();
  const oneYearMs = 365 * 24 * 60 * 60 * 1000;

  // If range is less than 1 year, aggregate by 30 minutes
  if (endMs - startMs < oneYearMs) {
    return await prisma.$queryRaw<
      { avgAIL: number; avgPoolPrice: number; date: string; }[]
    >`
      SELECT
        DATETIME((("dateBeginGMT" / 1000) / (15 * 60)) * (15 * 60), 'unixepoch') AS "dateBeginGMT",
        AVG("actualAIL") AS "actualAIL",
        AVG("actualPoolPrice") AS "actualPoolPrice"
      FROM
        "energyMarketData"
      WHERE
        "dateBeginGMT" BETWEEN ${startMs} AND ${endMs} AND "actualPoolPrice" != 0
      GROUP BY
        (("dateBeginGMT" / 1000) / (15 * 60))
      ORDER BY
        "dateBeginGMT" ASC;    `;
  }

  // Default: aggregate by week
  return await prisma.$queryRaw<
    { avgAIL: number; avgPoolPrice: number; date: string; }[]
  >`
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

export const fetchDetailedRecords = async (start: Date, end: Date) => {
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

export const fetchCurrentDemand = async () => {
  const record = await prisma.energyMarketData.findFirst({
    orderBy: { dateBeginGMT: 'desc' },
    select: { actualAIL: true, actualPoolPrice: true, dateBeginGMT: true, hourAheadPoolPriceForecast: true },
    // Since this is just a demo, lets ignore some data blips that might occur by filtering out zero values
    where: { actualAIL: { not: 0 }, actualPoolPrice: { not: 0 }, hourAheadPoolPriceForecast: { not: 0 } }
  });
  return record;
};

