#!/bin/bash

while true; do
  npm run scrape_aeso
  npm run import
  sleep 10
  echo "Scraping and importing completed. Waiting for the next cycle..."
  rm -f csv_data/scraper/*.csv
  echo "Old CSV files removed."
  sleep 60
done
