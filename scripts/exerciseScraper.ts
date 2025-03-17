import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

// Import the formatting utilities
import {
  formatAsTypeScript,
  formatTsString,
  cleanMultilineText,
} from './formatters';

// Type definitions based on your existing exercise structure
interface Exercise {
  id: string;
  name: string;
  description: string;
  targetBodyParts: string[];
  exerciseType: string[];
  difficulty: string;
  equipment: string[];
  steps: string[];
  tips: string[];
  contraindications: string[];
  muscles: string[];
  alternatives: string[];
  repetitions?: number;
  sets?: number;
  restBetweenSets?: number;
  videoUrl?: string; // Optional video URL
  imageUrl?: string; // Optional image URL
  viewCount?: number; // Optional view count
  popularity?: string; // Popularity level (high, medium, low)
  forceType?: string; // Force type (Push, Pull, etc.)
  mechanics?: string; // Mechanics (Compound, Isolation, etc.)
}

interface ExerciseGroup {
  bodyPart: string;
  exercises: Exercise[];
}

// Configuration for each category
interface CategoryConfig {
  url: string;
  bodyPart: string;
  idPrefix: string;
  outputPath: string;
  variableName: string;
  debug?: boolean;
}

// Base URL for the website
const BASE_URL = 'https://www.muscleandstrength.com';

// Function to get all exercise URLs from the category pages
async function getExerciseUrls(categoryUrl: string): Promise<string[]> {
  console.log(`Fetching exercise URLs from ${categoryUrl}`);
  const urls: string[] = [];
  let currentPage = 0;
  let hasNextPage = true;
  let retryCount = 0;
  const maxRetries = 3;

  while (hasNextPage) {
    const pageUrl =
      currentPage === 0 ? categoryUrl : `${categoryUrl}?page=${currentPage}`;

    try {
      console.log(`Fetching page ${currentPage + 1}...`);
      const response = await axios.get(pageUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0',
        },
        timeout: 10000, // 10 second timeout
      });

      const $ = cheerio.load(response.data);
      let pageExerciseCount = 0;

      // Extract exercise URLs from the current page
      $('.node-title a, .view-content-button a').each((_, element) => {
        const href = $(element).attr('href');
        if (href) {
          // If href doesn't start with http, prepend BASE_URL
          const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;

          // Only add if it's not already in the list
          if (!urls.includes(fullUrl)) {
            urls.push(fullUrl);
            pageExerciseCount++;
          }
        }
      });

      console.log(
        `Found ${pageExerciseCount} new exercises on page ${currentPage + 1}`
      );

      // Check if there's a next page - look for pagination links
      const nextPageLink = $('.pager-next a').attr('href');
      hasNextPage = !!nextPageLink;

      // Also check if we found any exercises on this page
      if (pageExerciseCount === 0 && currentPage > 0) {
        console.log(
          `No new exercises found on page ${
            currentPage + 1
          }, assuming end of pagination`
        );
        hasNextPage = false;
      }

      currentPage++;
      retryCount = 0; // Reset retry counter on success

      console.log(`Total exercises collected so far: ${urls.length}`);

      // Add a delay to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error: any) {
      retryCount++;
      console.error(
        `Error fetching page ${pageUrl} (Attempt ${retryCount}/${maxRetries}):`,
        error.message || 'Unknown error'
      );

      if (retryCount >= maxRetries) {
        console.log(
          `Maximum retries reached for page ${currentPage + 1}, moving on...`
        );
        currentPage++;
        retryCount = 0;
      } else {
        // Wait longer between retries
        console.log(`Retrying in 5 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      // If we've had too many errors, just exit pagination
      if (currentPage > 10 && urls.length === 0) {
        console.error(
          'Too many pages with errors and no results, stopping pagination'
        );
        hasNextPage = false;
      }
    }
  }

  // Remove duplicates
  const uniqueUrls = [...new Set(urls)];
  console.log(
    `Found ${uniqueUrls.length} unique exercise URLs in total (${
      urls.length - uniqueUrls.length
    } duplicates removed)`
  );
  return uniqueUrls;
}

// Function to extract exercise details from a single exercise page
async function getExerciseDetails(
  url: string,
  index: number,
  idPrefix: string,
  bodyPart: string,
  debug = false
): Promise<Exercise> {
  console.log(`Fetching details for exercise at ${url}`);

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Extract exercise name from the h1 tag
    const name = $('h1')
      .first()
      .text()
      .trim()
      .replace(' Video Exercise Guide', '');

    // Generate ID based on the category and index
    const id = `${idPrefix}-${index + 1}`;

    // Extract all profile information from the stats block
    const profileData: Record<string, string> = {};
    $('.node-stats-block li').each((_, element) => {
      const label = $(element).find('.row-label').text().trim();
      let value = '';

      // Handle special case for target muscle group and secondary muscles
      if (label === 'Target Muscle Group') {
        value = $(element).find('.field-item a').text().trim();
      } else if (label === 'Secondary Muscles') {
        value = $(element).find('.field-type-list-text').text().trim();
      } else {
        // For other fields, get the text content after the label
        const fullText = $(element).text();
        value = fullText.replace(label, '').trim();
      }

      profileData[label] = value;
    });

    // Extract exercise description/overview
    let description = $('.field-name-field-exercise-overview .field-item')
      .text()
      .trim();

    // If description is empty, try alternative selectors
    if (!description) {
      description = $('.field-name-field-exercise-description').text().trim();
    }

    // Clean up the description - remove excessive newlines and spaces
    if (description) {
      // Replace multiple newlines and spaces with single space
      description = description.replace(/\s+/g, ' ').trim();
    }

    // Extract instructions - look for ol li elements in the proper section
    const steps: string[] = [];
    $('.field-name-body .field-item ol li').each((_, element) => {
      steps.push($(element).text().trim());
    });

    // If no steps were found, try alternative selector
    if (steps.length === 0) {
      $('.field-name-body .field-item p').each((_, element) => {
        const text = $(element).text().trim();
        if (text.length > 0) {
          steps.push(text);
        }
      });
    }

    // Extract tips
    const tips: string[] = [];

    // Look for tips in field-name-field-exercise-tips
    $('.field-name-field-exercise-tips .field-item')
      .find('li, p')
      .each((_, element) => {
        const text = $(element).text().trim();
        if (
          text &&
          !text.includes('Shop') &&
          !text.includes('Account') &&
          !text.includes('View All')
        ) {
          tips.push(text);
        }
      });

    // If no tips found, look for a Tips heading
    if (tips.length === 0) {
      // Find a heading containing "Tips"
      $('h2, h3, h4').each((_, element) => {
        const headingText = $(element).text().trim();
        if (headingText.includes('Tips')) {
          if (debug)
            console.log(`${name}: Found heading with Tips: ${headingText}`);

          // Get the next elements after this heading
          const nextElements = $(element).nextUntil('h2, h3, h4');
          nextElements.find('li').each((_, li) => {
            const text = $(li).text().trim();
            if (
              text &&
              !text.includes('Shop') &&
              !text.includes('Account') &&
              !text.includes('View All')
            ) {
              tips.push(text);
            }
          });

          // If no list items, look for paragraphs
          if (tips.length === 0) {
            nextElements.filter('p').each((_, p) => {
              const text = $(p).text().trim();
              if (
                text &&
                !text.includes('Shop') &&
                !text.includes('Account') &&
                !text.includes('View All')
              ) {
                tips.push(text);
              }
            });
          }
        }
      });
    }

    // Add some default tips if we couldn't find any
    if (tips.length === 0) {
      if (debug)
        console.log(
          `${name}: Could not find specific tips, adding generic tips`
        );
      tips.push('Maintain proper form throughout the exercise.');
      tips.push(
        'Start with a lighter weight to practice the movement pattern.'
      );
      tips.push('Breathe out during the exertion phase of the exercise.');
    }

    // Log if we couldn't find tips
    if (tips.length === 0) {
      console.log(`Warning: Could not find tips for ${name}`);
    } else if (debug) {
      console.log(`${name}: Successfully extracted ${tips.length} tips`);
      tips.forEach((tip, index) => {
        console.log(
          `  Tip ${index + 1}: ${tip.substring(0, 50)}${
            tip.length > 50 ? '...' : ''
          }`
        );
      });
    }

    // Extract video URL if available
    let videoUrl = '';
    const iframeSrc = $('.video iframe').attr('src');
    if (iframeSrc) {
      videoUrl = iframeSrc;
    }

    // Extract image URL if available
    let imageUrl = '';
    const mainImage = $('.node-image img, .target-muscles img')
      .first()
      .attr('src');
    if (mainImage) {
      imageUrl = mainImage;
    }

    // Extract view count if available
    let viewCount: number | undefined = undefined;
    let viewCountText = '';

    // Try different selectors for view count
    $('.node-meta span').each((_, element) => {
      const text = $(element).text().trim();
      if (text.includes('Views')) {
        viewCountText = text.replace('Views', '').trim();
      }
    });

    // If not found, try alternative selector
    if (!viewCountText) {
      $('.count').each((_, element) => {
        const text = $(element).text().trim();
        if (text.includes('Views')) {
          viewCountText = text.replace('Views', '').trim();
        }
      });
    }

    // Parse view count to number
    if (viewCountText) {
      // Convert K, M to actual numbers (e.g., "31.2K" to 31200)
      viewCountText = viewCountText.replace(/,/g, '');

      if (viewCountText.includes('K')) {
        const base = parseFloat(viewCountText.replace('K', ''));
        viewCount = Math.round(base * 1000);
      } else if (viewCountText.includes('M')) {
        const base = parseFloat(viewCountText.replace('M', ''));
        viewCount = Math.round(base * 1000000);
      } else {
        viewCount = parseInt(viewCountText, 10);
      }

      // Handle NaN
      if (isNaN(viewCount)) {
        viewCount = undefined;
      }
    }

    // Determine popularity based on view count
    let popularity: string | undefined = undefined;
    if (viewCount !== undefined) {
      if (viewCount > 1000000) {
        popularity = 'high';
      } else if (viewCount > 100000) {
        popularity = 'medium';
      } else {
        popularity = 'low';
      }
    }

    // Map experience level to difficulty
    let difficulty = 'beginner';
    if (profileData['Experience Level']) {
      difficulty = profileData['Experience Level'].toLowerCase();
    }

    // Extract exercise type
    const exerciseType = profileData['Exercise Type']
      ? [profileData['Exercise Type'].toLowerCase()]
      : ['strength'];

    // Extract equipment
    const equipment = profileData['Equipment Required']
      ? [profileData['Equipment Required']]
      : ['None'];

    // Extract force type for contraindications
    const forceType = profileData['Force Type'] || '';

    // Extract mechanics
    const mechanics = profileData['Mechanics'] || '';

    // Extract secondary muscles
    let secondaryMuscles: string[] = [];
    if (
      profileData['Secondary Muscles'] &&
      profileData['Secondary Muscles'] !== 'None'
    ) {
      secondaryMuscles = profileData['Secondary Muscles']
        .split(',')
        .map((muscle) => muscle.trim())
        .filter((muscle) => muscle.length > 0);
    }

    // Create contraindications based on exercise characteristics
    const contraindications: string[] = [
      `${bodyPart} injury`,
      'Joint pain',
      'Acute pain during movement',
    ];

    // Add specific contraindications based on force type or mechanics
    if (forceType.includes('Push')) {
      contraindications.push('Shoulder impingement');
    }

    if (profileData['Mechanics'] === 'Compound') {
      contraindications.push('Recent surgery');
      contraindications.push(
        'Severe cardiovascular issues (for heavy compound movements)'
      );
    }

    // Set recommended repetitions based on exercise type
    let repetitions = 12;
    if (
      exerciseType.includes('strength') &&
      equipment.some((e) => ['barbell', 'dumbbell'].includes(e.toLowerCase()))
    ) {
      if (profileData['Mechanics'] === 'Compound') {
        repetitions = 8; // Lower reps for compound barbell/dumbbell exercises
      }
    }

    // Default values for exercise
    const exercise: Exercise = {
      id,
      name,
      description: description || 'No description available',
      targetBodyParts: [bodyPart],
      exerciseType,
      difficulty,
      equipment,
      steps: steps.length > 0 ? steps : ['No instructions available'],
      tips: tips.length > 0 ? tips : [],
      contraindications,
      muscles: [
        profileData['Target Muscle Group'] || bodyPart,
        ...secondaryMuscles,
      ],
      alternatives: [],
      repetitions,
      sets: 3,
      restBetweenSets: 60,
      forceType,
      mechanics,
    };

    if (profileData['Force Type']) {
      exercise.forceType = profileData['Force Type'];
    }

    if (profileData['Mechanics']) {
      exercise.mechanics = profileData['Mechanics'];
    }

    // Add optional fields if available
    if (videoUrl) {
      exercise.videoUrl = videoUrl;
    }

    if (imageUrl) {
      exercise.imageUrl = imageUrl;
    }

    // Add view count and popularity if available
    if (viewCount !== undefined) {
      exercise.viewCount = viewCount;
      exercise.popularity = popularity;
    }

    // Add a delay to avoid overwhelming the server
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return exercise;
  } catch (error) {
    console.error(`Error fetching exercise details from ${url}:`, error);

    // Return a placeholder exercise if there's an error
    return {
      id: `${idPrefix}-${index + 1}`,
      name: `Exercise ${index + 1}`,
      description: 'Failed to fetch details',
      targetBodyParts: [bodyPart],
      exerciseType: ['strength'],
      difficulty: 'beginner',
      equipment: ['None'],
      steps: ['No instructions available'],
      tips: [],
      contraindications: [],
      muscles: [bodyPart],
      alternatives: [],
    };
  }
}

// Main function to run the scraper for a specific category
async function scrapeExercises(config: CategoryConfig) {
  try {
    console.log(`Starting scraper for ${config.bodyPart} exercises...`);
    console.log(`Target URL: ${config.url}`);
    console.log(`Output file: ${config.outputPath}`);

    // Create output directory if it doesn't exist
    const outputDir = path.dirname(path.join(process.cwd(), config.outputPath));
    if (!fs.existsSync(outputDir)) {
      console.log(`Creating output directory: ${outputDir}`);
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Get all exercise URLs from the category
    const exerciseUrls = await getExerciseUrls(config.url);

    if (exerciseUrls.length === 0) {
      console.error(
        `No exercises found for ${config.bodyPart}. Please check the URL or website structure.`
      );
      return;
    }

    console.log(
      `Found ${
        exerciseUrls.length
      } ${config.bodyPart.toLowerCase()} exercises in total`
    );
    console.log('Beginning to fetch details for each exercise...');

    // Get details for each exercise
    const exercises: Exercise[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < exerciseUrls.length; i++) {
      try {
        console.log(
          `Processing exercise ${i + 1}/${exerciseUrls.length}: ${
            exerciseUrls[i]
          }`
        );
        const exercise = await getExerciseDetails(
          exerciseUrls[i],
          i,
          config.idPrefix,
          config.bodyPart,
          config.debug
        );
        exercises.push(exercise);
        console.log(`Successfully processed: ${exercise.name}`);
        successCount++;

        // Save progress every 5 exercises in case of a crash
        if (i > 0 && i % 5 === 0) {
          const tempExerciseGroup: ExerciseGroup = {
            bodyPart: config.bodyPart,
            exercises: exercises,
          };

          const tempOutputPath = path.join(
            process.cwd(),
            config.outputPath.replace('.ts', '.temp.ts')
          );
          const tempCode = `import { ExerciseGroup } from '../types/exercises';

// TEMPORARY FILE - IN PROGRESS (${successCount}/${
            exerciseUrls.length
          } exercises)
export const ${config.variableName}: ExerciseGroup = ${formatAsTypeScript(
            tempExerciseGroup
          )};`;

          fs.writeFileSync(tempOutputPath, tempCode);
          console.log(
            `Saved progress to temporary file (${successCount}/${exerciseUrls.length} exercises)`
          );
        }
      } catch (error: any) {
        console.error(
          `Failed to process exercise ${i + 1}:`,
          error.message || 'Unknown error'
        );
        errorCount++;

        // Don't let a few errors stop the whole process
        if (errorCount > 10 && errorCount > exerciseUrls.length / 2) {
          console.error('Too many errors, stopping the scraping process');
          break;
        }
      }
    }

    // Create exercise group
    const exerciseGroup: ExerciseGroup = {
      bodyPart: config.bodyPart,
      exercises,
    };

    // Generate TypeScript code for the exercises
    let typeScriptCode = `import { ExerciseGroup } from '../types/exercises';

// This file was generated automatically by the exercise scraper
// Source: ${config.url}
// Total exercises: ${exercises.length}
// Generated on: ${new Date().toISOString()}

export const ${config.variableName}: ExerciseGroup = `;

    // Convert the exerciseGroup to a string with proper TypeScript formatting (no quotes on property names)
    // We'll use a custom JSON stringifier that doesn't quote object keys
    const exerciseGroupString = formatAsTypeScript(exerciseGroup);

    // Combine everything into the final TypeScript code
    typeScriptCode += exerciseGroupString + ';';

    // Write to file
    const outputPath = path.join(process.cwd(), config.outputPath);
    fs.writeFileSync(outputPath, typeScriptCode);

    // Remove temporary file if it exists
    const tempPath = outputPath.replace('.ts', '.temp.ts');
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }

    console.log(
      `Successfully scraped ${
        exercises.length
      } ${config.bodyPart.toLowerCase()} exercises and saved to ${outputPath}`
    );
    console.log(
      `Success rate: ${successCount}/${exerciseUrls.length} (${Math.round(
        (successCount / exerciseUrls.length) * 100
      )}%)`
    );
  } catch (error) {
    console.error(
      `Error scraping ${config.bodyPart.toLowerCase()} exercises:`,
      error
    );
  }
}

// Get category from command line arguments
const categoryArg = process.argv[2];

// Define available categories
const categories: Record<string, CategoryConfig> = {
  abs: {
    url: `${BASE_URL}/exercises/abs`,
    bodyPart: 'Abs',
    idPrefix: 'abs',
    outputPath: 'abs.ts', // Save to current directory
    variableName: 'absExercises',
  },
  biceps: {
    url: `${BASE_URL}/exercises/biceps`,
    bodyPart: 'Biceps',
    idPrefix: 'biceps',
    outputPath: 'biceps.ts', // Save to current directory
    variableName: 'bicepsExercises',
  },
  chest: {
    url: `${BASE_URL}/exercises/chest`,
    bodyPart: 'Chest',
    idPrefix: 'chest',
    outputPath: 'chest.ts', // Save to current directory
    variableName: 'chestExercises',
  },
  shoulders: {
    url: `${BASE_URL}/exercises/shoulders`,
    bodyPart: 'Shoulders',
    idPrefix: 'shoulders',
    outputPath: 'shoulders.ts', // Save to current directory
    variableName: 'shouldersExercises',
    debug: true, // Enable debug for shoulders initially
  },
  middleBack: {
    url: `${BASE_URL}/exercises/middle-back`,
    bodyPart: 'Middle Back',
    idPrefix: 'middle-back',
    outputPath: 'middle-back.ts', // Save to current directory
    variableName: 'middleBackExercises',
  },
  adductors: {
    url: `${BASE_URL}/exercises/adductors.html`,
    bodyPart: 'Adductors',
    idPrefix: 'adductors',
    outputPath: 'adductors.ts', // Save to current directory
    variableName: 'adductorsExercises',
  },
  abductors: {
    url: `${BASE_URL}/exercises/abductors.html`,
    bodyPart: 'Abductors',
    idPrefix: 'abductors',
    outputPath: 'abductors.ts', // Save to current directory
    variableName: 'abductorsExercises',
  },
  calves: {
    url: `${BASE_URL}/exercises/calves`,
    bodyPart: 'Calves',
    idPrefix: 'calves',
    outputPath: 'calves.ts', // Save to current directory
    variableName: 'calvesExercises',
  },
  forearms: {
    url: `${BASE_URL}/exercises/forearms`,
    bodyPart: 'Forearms',
    idPrefix: 'forearms',
    outputPath: 'forearms.ts', // Save to current directory
    variableName: 'forearmsExercises',
  },
  glutes: {
    url: `${BASE_URL}/exercises/glutes`,
    bodyPart: 'Glutes',
    idPrefix: 'glutes',
    outputPath: 'glutes.ts', // Save to current directory
    variableName: 'glutesExercises',
  },

  hamstrings: {
    url: `${BASE_URL}/exercises/hamstrings`,
    bodyPart: 'Hamstrings',
    idPrefix: 'hamstrings',
    outputPath: 'hamstrings.ts', // Save to current directory
    variableName: 'hamstringsExercises',
  },

  lats: {
    url: `${BASE_URL}/exercises/lats`,
    bodyPart: 'Lats',
    idPrefix: 'lats',
    outputPath: 'lats.ts', // Save to current directory
    variableName: 'latsExercises',
  },

  obliques: {
    url: `${BASE_URL}/exercises/obliques`,
    bodyPart: 'Obliques',
    idPrefix: 'obliques',
    outputPath: 'obliques.ts', // Save to current directory
    variableName: 'obliquesExercises',
  },

  legs: {
    url: `${BASE_URL}/exercises/legs`,
    bodyPart: 'Legs',
    idPrefix: 'legs',
    outputPath: 'legs.ts', // Save to current directory
    variableName: 'legsExercises',
  },

  quads: {
    url: `${BASE_URL}/exercises/quads`,
    bodyPart: 'Quads',
    idPrefix: 'quads',
    outputPath: 'quads.ts', // Save to current directory
    variableName: 'quadsExercises',
  },

  traps: {
    url: `${BASE_URL}/exercises/traps`,
    bodyPart: 'Traps',
    idPrefix: 'traps',
    outputPath: 'traps.ts', // Save to current directory
    variableName: 'trapsExercises',
  },

  triceps: {
    url: `${BASE_URL}/exercises/triceps`,
    bodyPart: 'Triceps',
    idPrefix: 'triceps',
    outputPath: 'triceps.ts', // Save to current directory
    variableName: 'tricepsExercises',
  },

  hipFlexors: {
    url: `${BASE_URL}/exercises/hip-flexors`,
    bodyPart: 'Hip Flexors',
    idPrefix: 'hip-flexors',
    outputPath: 'hip-flexors.ts', // Save to current directory
    variableName: 'hipFlexorsExercises',
  },
  lowerBack: {
    url: `${BASE_URL}/exercises/lower-back`,
    bodyPart: 'Lower Back',
    idPrefix: 'lower-back',
    outputPath: 'lower-back.ts', // Save to current directory
    variableName: 'lowerBackExercises',
  },
  upperBack: {
    url: `${BASE_URL}/exercises/upper-back`,
    bodyPart: 'Upper Back',
    idPrefix: 'upper-back',
    outputPath: 'upper-back.ts', // Save to current directory
    variableName: 'upperBackExercises',
  },
};

// Run the scraper for the specified category or show usage
if (categoryArg && categories[categoryArg]) {
  scrapeExercises(categories[categoryArg]);
} else {
  console.log('Please specify a valid category:');
  Object.keys(categories).forEach((category) => {
    console.log(`- ${category}`);
  });
}

// UPDATE the writeExercisesToFile function to use the imported formatter
function writeExercisesToFile(
  exercises: Exercise[],
  bodyPart: string,
  fileName: string
): void {
  const bodyPartCapitalized =
    bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1);

  // Format each exercise with an ID
  const formattedExercises = exercises.map((exercise, index) => {
    // Create a new object without repRange
    const formattedExercise: any = {
      id: `${bodyPart.toLowerCase()}-${index + 1}`,
      name: exercise.name,
      description: exercise.description,
      targetBodyParts: exercise.targetBodyParts,
      exerciseType: exercise.exerciseType,
      difficulty: exercise.difficulty,
      equipment: exercise.equipment,
      steps: exercise.steps,
      tips: exercise.tips,
      contraindications: exercise.contraindications,
      muscles: exercise.muscles,
      alternatives: [],
    };

    // Copy repetitions, sets, and restBetweenSets if they exist
    if (exercise.repetitions !== undefined)
      formattedExercise.repetitions = exercise.repetitions;
    if (exercise.sets !== undefined) formattedExercise.sets = exercise.sets;
    if (exercise.restBetweenSets !== undefined)
      formattedExercise.restBetweenSets = exercise.restBetweenSets;

    return formattedExercise;
  });

  // Generate the TypeScript file content
  const fileContent = `import { ExerciseGroup } from '../types/exercises';

export const ${bodyPart.toLowerCase()}Exercises: ExerciseGroup = {
  bodyPart: '${bodyPartCapitalized}',
  exercises: ${formatAsTypeScript(formattedExercises, 2)}
};
`;

  fs.writeFileSync(fileName, fileContent);
  console.log(`Exercises saved to ${fileName}`);
}
