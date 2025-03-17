import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

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
  repetitions: number;
  sets: number;
  restBetweenSets: number;
}

interface ExerciseGroup {
  bodyPart: string;
  exercises: Exercise[];
}

// Base URL for the website
const BASE_URL = 'https://www.muscleandstrength.com';

// Function to get all exercise URLs from the category pages
async function getExerciseUrls(categoryUrl: string): Promise<string[]> {
  console.log(`Fetching exercise URLs from ${categoryUrl}`);
  const urls: string[] = [];
  let currentPage = 0;
  let hasNextPage = true;

  while (hasNextPage) {
    const pageUrl = currentPage === 0 
      ? categoryUrl 
      : `${categoryUrl}?page=${currentPage}`;
    
    try {
      const response = await axios.get(pageUrl);
      const $ = cheerio.load(response.data);
      
      // Extract exercise URLs from the current page
      $('.node-title a').each((_, element) => {
        const href = $(element).attr('href');
        if (href) {
          // If href doesn't start with http, prepend BASE_URL
          const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;
          urls.push(fullUrl);
        }
      });

      // Check if there's a next page
      hasNextPage = $('.pager-next a').length > 0;
      currentPage++;
      
      console.log(`Found ${urls.length} exercises so far (Page ${currentPage})`);
      
      // Add a delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error fetching page ${pageUrl}:`, error);
      hasNextPage = false;
    }
  }

  return urls;
}

// Function to extract exercise details from a single exercise page
async function getExerciseDetails(url: string, index: number): Promise<Exercise> {
  console.log(`Fetching details for exercise at ${url}`);
  
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Extract exercise name
    const name = $('.page-title').text().trim();
    
    // Generate ID based on the category and index
    const id = `shoulders-${index + 1}`;
    
    // Extract all the profile information
    const profileData: Record<string, string> = {};
    $('.exercise-profile-data').each((_, element) => {
      const label = $(element).find('.label').text().trim();
      const value = $(element).find('.field').text().trim();
      profileData[label] = value;
    });
    
    // Extract exercise description/overview
    const description = $('.field-name-field-exercise-description').text().trim();
    
    // Extract instructions
    const steps: string[] = [];
    $('.field-name-field-exercise-instructions .field-item').each((_, element) => {
      steps.push($(element).text().trim());
    });
    
    // Extract tips
    const tips: string[] = [];
    $('.field-name-field-exercise-tips .field-item').each((_, element) => {
      tips.push($(element).text().trim());
    });
    
    // Map experience level to difficulty
    let difficulty = 'beginner';
    if (profileData['Experience Level']) {
      difficulty = profileData['Experience Level'].toLowerCase();
    }
    
    // Default values for exercise
    const exercise: Exercise = {
      id,
      name,
      description: description || 'No description available',
      targetBodyParts: ['Shoulders'],
      exerciseType: profileData['Type'] ? [profileData['Type'].toLowerCase()] : ['strength'],
      difficulty,
      equipment: profileData['Equipment'] ? [profileData['Equipment']] : ['None'],
      steps: steps.length > 0 ? steps : ['No instructions available'],
      tips: tips.length > 0 ? tips : [],
      contraindications: [
        'Shoulder injury',
        'Rotator cuff issues',
        'Acute pain during movement'
      ],
      muscles: [
        profileData['Target Muscle Group'] || 'Shoulders',
        ...(profileData['Secondary Muscles'] && profileData['Secondary Muscles'] !== 'None' 
          ? profileData['Secondary Muscles'].split(',').map(m => m.trim()) 
          : [])
      ],
      alternatives: [],
      repetitions: 12,
      sets: 3,
      restBetweenSets: 60
    };
    
    // Add a delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return exercise;
  } catch (error) {
    console.error(`Error fetching exercise details from ${url}:`, error);
    
    // Return a placeholder exercise if there's an error
    return {
      id: `shoulders-${index + 1}`,
      name: `Exercise ${index + 1}`,
      description: 'Failed to fetch details',
      targetBodyParts: ['Shoulders'],
      exerciseType: ['strength'],
      difficulty: 'beginner',
      equipment: ['None'],
      steps: ['No instructions available'],
      tips: [],
      contraindications: [],
      muscles: ['Shoulders'],
      alternatives: [],
      repetitions: 12,
      sets: 3,
      restBetweenSets: 60
    };
  }
}

// Main function to run the scraper
async function scrapeShoulderExercises() {
  try {
    // Get all exercise URLs from the shoulders category
    const exerciseUrls = await getExerciseUrls(`${BASE_URL}/exercises/shoulders`);
    console.log(`Found ${exerciseUrls.length} shoulder exercises in total`);
    
    // Get details for each exercise
    const exercises: Exercise[] = [];
    for (let i = 0; i < exerciseUrls.length; i++) {
      const exercise = await getExerciseDetails(exerciseUrls[i], i);
      exercises.push(exercise);
      console.log(`Processed ${i + 1}/${exerciseUrls.length} exercises`);
    }
    
    // Create exercise group
    const shoulderExercises: ExerciseGroup = {
      bodyPart: 'Shoulders',
      exercises
    };
    
    // Generate TypeScript code for the exercises
    const typeScriptCode = `import { ExerciseGroup, ExerciseType } from '@/app/types/exercises';

export const shouldersExercises: ExerciseGroup = ${JSON.stringify(shoulderExercises, null, 2)};`;
    
    // Write to file
    const outputPath = path.join(process.cwd(), 'src/app/data/exercises/shoulders.ts');
    fs.writeFileSync(outputPath, typeScriptCode);
    
    console.log(`Successfully scraped ${exercises.length} shoulder exercises and saved to ${outputPath}`);
  } catch (error) {
    console.error('Error scraping shoulder exercises:', error);
  }
}

// Run the scraper
scrapeShoulderExercises(); 