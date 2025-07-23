const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const cheerio = require('cheerio');

const now = new Date();
const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
const CSV_PATH = `../csv_data/scraper/aeso_${dateStr}.csv`;

async function scrapeAESOToCSV() {
    let URL = 'http://ets.aeso.ca/ets_web/ip/Market/Reports/CSDReportServlet';
    const response = await fetch(URL);
    if (!response.ok) throw new Error('Network response was not ok');
    const html = await response.text();
    let $ = cheerio.load(html);


    URL = 'http://ets.aeso.ca/ets_web/ip/Market/Reports/ActualForecastWMRQHReportServlet';
    const response2 = await fetch(URL);
    if (!response2.ok) throw new Error('Network response was not ok');
    const html2 = await response2.text();

    // Example: Find table rows and extract columns
    const summaryTable = $('th:contains("SUMMARY")').closest('table');
    const summary = {};
    summaryTable.find('tr').each((_, el) => {
      const tds = $(el).find('td');
      if (tds.length === 2) {
        const key = $(tds[0]).text().trim();
        const value = $(tds[1]).text().trim();
        summary[key] = value;
      }
    });
    // Parse GENERATION table
    const generationTable = $('th:contains("GENERATION")').closest('table');
    const generation = [];
    generationTable.find('tr').each((_, el) => {
      const tds = $(el).find('td');
      if (tds.length === 4) {
        generation.push({
          group: $(tds[0]).text().trim(),
          mc: $(tds[1]).text().trim(),
          tng: $(tds[2]).text().trim(),
          dcr: $(tds[3]).text().trim()
        });
      }
    });
    // Parse INTERCHANGE table
    const interchangeTable = $('th:contains("INTERCHANGE")').closest('table');
    const interchange = [];
    interchangeTable.find('tr').each((_, el) => {
      const tds = $(el).find('td');
      if (tds.length === 2) {
        interchange.push({
          path: $(tds[0]).text().trim(),
          actual_flow: $(tds[1]).text().trim()
        });
      }

    // Parse Actual / Forecast table for pool price and forecast
    const now = new Date();
    let previousHourRow = null;
    $ = cheerio.load(html2);

    $('th:contains("Date (HE)")').closest('table').find('tr').each((_, el) => {
      const tds = $(el).find('td');
      if (tds.length >= 6) {
        const actual = $(tds[2]).text().trim();
        if (actual && actual != '-') {
              previousHourRow = tds;
        }
      }
    });

    let actualPoolPrice = 0;
    let hourAheadPoolPriceForecast = 0;
    if (previousHourRow) {
      const forecastText = $(previousHourRow[1]).text().trim();
      const actualText = $(previousHourRow[2]).text().trim();
      if (!isNaN(parseFloat(forecastText))) {
        hourAheadPoolPriceForecast = parseFloat(forecastText);
      }
      if (!isNaN(parseFloat(actualText))) {
        actualPoolPrice = parseFloat(actualText);
      }
    }

    // Compose CSV row from parsed data
    const csvRows = [
      "Date_Begin_GMT,Date_Begin_Local,ACTUAL_POOL_PRICE,ACTUAL_AIL,HOUR_AHEAD_POOL_PRICE_FORECAST,EXPORT_BC,EXPORT_MT,EXPORT_SK,IMPORT_BC,IMPORT_MT,IMPORT_SK"
    ];

    // Example: extract date and AIL from summary
    const lastUpdateCell = summaryTable.find('td').filter((_, td) => {
      return $(td).text().includes('Last Update');
    });
    const dateBeginLocal = now;
    const dateBeginGMT = new Date(now.toISOString());

    const actualAIL = summary["Alberta Internal Load (AIL)"] || "";
    // You may need to fetch pool price and forecast from another source or set to 0

    // Interchange values
    let exportBC = 0, exportMT = 0, exportSK = 0, importBC = 0, importMT = 0, importSK = 0;
    interchange.forEach(row => {
      if (row.path === "British Columbia") exportBC = parseInt(row.actual_flow);
      if (row.path === "Montana") exportMT = parseInt(row.actual_flow);
      if (row.path === "Saskatchewan") exportSK = parseInt(row.actual_flow);
    });

    csvRows.push(
      `"${dateBeginGMT.toISOString()}","${dateBeginLocal.toISOString()}",${actualPoolPrice},${actualAIL},${hourAheadPoolPriceForecast},${exportBC},${exportMT},${exportSK},${importBC},${importMT},${importSK}`
    );
    const dir = path.dirname(path.join(__dirname, CSV_PATH));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(path.join(__dirname, CSV_PATH), csvRows.join('\n'));
    console.log('Scraped to', CSV_PATH);
    });
}

console.log(Date().toString(), "Scraping AESO data to CSV...");
scrapeAESOToCSV();

