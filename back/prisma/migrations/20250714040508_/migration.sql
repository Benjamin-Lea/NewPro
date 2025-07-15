-- CreateTable
CREATE TABLE "EnergyMarketData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dateBeginGMT" DATETIME NOT NULL,
    "dateBeginLocal" DATETIME NOT NULL,
    "actualPoolPrice" REAL NOT NULL,
    "actualAIL" INTEGER NOT NULL,
    "hourAheadPoolPriceForecast" REAL NOT NULL,
    "exportBC" INTEGER NOT NULL,
    "exportMT" INTEGER NOT NULL,
    "exportSK" INTEGER NOT NULL,
    "importBC" INTEGER NOT NULL,
    "importMT" INTEGER NOT NULL,
    "importSK" INTEGER NOT NULL
);
