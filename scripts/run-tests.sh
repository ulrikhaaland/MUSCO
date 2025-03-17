#!/bin/bash

# Make sure we're in the right directory
cd "$(dirname "$0")/.."

# Run the test scraper
echo "Testing single exercise scraping..."
npx ts-node scripts/test-scrape-exercise.ts

# Display the generated output file
echo -e "\nGenerated output file:"
cat scripts/output/dumbbell-lateral-raise.ts | head -20 