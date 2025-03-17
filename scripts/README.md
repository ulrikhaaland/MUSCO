# Exercise Scraper

This script scrapes exercise data from muscleandstrength.com and formats it for use in the app.

## Quick Start

For the easiest experience, run the all-in-one script:

```bash
cd scripts
npm install
npm run run-scraper
```

This will automatically:
1. Run the setup check
2. Scrape all exercise categories
3. Generate alternatives for all exercises
4. Save the formatted exercise data to the current directory

You can also scrape specific categories:

```bash
npm run run-scraper shoulders  # Scrape only shoulder exercises
npm run run-scraper shoulders back  # Scrape shoulders and back
```

## Output Location

All exercise files are saved to the **current directory** where the script is run. The output files will be named:
- `shoulders.ts`
- `back.ts`
- `chest.ts`
- `legs.ts`
- `arms.ts`
- `abs.ts`

## Manual Setup

If you prefer to run each step manually:

1. Navigate to the scripts directory:
   ```
   cd scripts
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the setup check to ensure everything is configured correctly:
   ```
   npm run setup-check
   ```

4. Run the scraper for a specific category:
   ```
   npm run scrape-[category]
   ```
   
   For example:
   ```
   npm run scrape-shoulders
   ```

## Available Categories

The scraper supports the following categories:

- `shoulders` - Shoulder exercises
- `back` - Back exercises
- `chest` - Chest exercises
- `legs` - Leg exercises
- `arms` - Arm exercises
- `abs` - Abdominal exercises

You can run all categories one by one using the specific npm scripts.

## Generating Alternatives

After scraping exercises, you can automatically generate alternative exercises for each exercise in a category:

```
npm run generate-alternatives-[category]
```

For example:
```
npm run generate-alternatives-shoulders
```

To generate alternatives for all categories:
```
npm run generate-alternatives
```

The alternatives generation works by:
1. Analyzing each exercise's attributes (muscles targeted, equipment, difficulty, etc.)
2. Finding similar exercises within the same category
3. Ranking them by similarity score
4. Adding the top 3-5 alternatives to each exercise

## How It Works

The script performs the following steps:

1. Fetches all exercise links from the specified category on muscleandstrength.com
2. Navigates through all pages of results
3. For each exercise link:
   - Fetches the detailed exercise page
   - Extracts relevant information (name, description, instructions, tips, etc.)
   - Maps the data to our exercise schema
4. Saves all exercises to the corresponding file in `src/app/data/exercises/`

## Enhanced Features

The latest version includes:
- Scraping of YouTube video URLs when available
- Extraction of exercise images
- Intelligent recommendations for repetition counts based on exercise type
- Better error handling and recovery
- Progress saves during long scraping sessions
- Auto-backup of files before modifications

## Customizing

To add a new category:

1. Edit the `exerciseScraper.ts` file and add a new entry to the `categories` object
2. Update the package.json to include a new npm script for the category

## Notes

- The script includes delays between requests to avoid overwhelming the server
- Error handling is in place to ensure the script completes even if some pages fail
- Default values are provided for missing data
- The scraper will automatically follow pagination to get all exercises in a category 