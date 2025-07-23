const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
console.log('Starting CSV import...');
const { PrismaClient } = require('../node_modules/@prisma/client');
const prisma = new PrismaClient();
const csvDir = path.join(__dirname, '../csv_data/scraper');
const csvFiles = fs.readdirSync(csvDir).filter(f => f.endsWith('.csv'));
const csvFilePath = csvFiles.length > 0 ? path.join(csvDir, csvFiles[0]) : null;


function importCSV() {
  const records = [];
  let count = 0;
  console.log('Reading CSV file:', csvFilePath);
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      try {
        const parsedRow = {
          dateBeginGMT: new Date(row['Date_Begin_GMT']),
          dateBeginLocal: new Date(row['Date_Begin_Local']),
          actualPoolPrice: parseFloat(row['ACTUAL_POOL_PRICE']),
          actualAIL: parseInt(row['ACTUAL_AIL']),
          hourAheadPoolPriceForecast: parseFloat(row['HOUR_AHEAD_POOL_PRICE_FORECAST']),
          exportBC: parseInt(row['EXPORT_BC']),
          exportMT: parseInt(row['EXPORT_MT']),
          exportSK: parseInt(row['EXPORT_SK']),
          importBC: parseInt(row['IMPORT_BC']),
          importMT: parseInt(row['IMPORT_MT']),
          importSK: parseInt(row['IMPORT_SK']),
        };
        records.push(parsedRow);
      } catch (err) {
        console.error('Error parsing row:', row, err);
      }
      count++;
    })
    .on('end', async () => {
      console.log(`Parsed ${records.length} records. Inserting into DB...`);
      try {
        await prisma.energyMarketData.createMany({
          data: records,
        });
      } catch (err) {
        console.error('Error inserting records:', err);
      }

      console.log('Import complete.');
      await prisma.$disconnect();
    });
}

importCSV()
