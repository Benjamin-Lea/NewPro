#!/bin/bash

while true; do
  npm run scrape_aeso
  npm run import
  sleep 60
done
