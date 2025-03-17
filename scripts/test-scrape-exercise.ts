import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

// Import formatter functions
import { formatAsTypeScript, formatTsString, cleanMultilineText } from './formatters';

// Define exercise interface
interface Exercise {
  id?: string;
  name: string;
  description: string;
  targetBodyParts?: string[];
  exerciseType?: string[];
  difficulty?: string;
  equipment?: string[];
  steps: string[];
  tips: string[];
  contraindications?: string[];
  muscles?: string[];
  alternatives?: string[];
  repetitions?: number;
  sets?: number;
  restBetweenSets?: number;
}

// Function to scrape a single exercise
async function scrapeExercise(url: string): Promise<Exercise> {
  console.log(`Fetching exercise data from: ${url}`);
  
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Extract exercise name
    const name = $('h1').first().text().trim().replace(' Video Exercise Guide', '');
    console.log(`Found exercise: ${name}`);
    
    // Extract description
    let description = $('.field-name-field-exercise-overview .field-item').text().trim();
    
    // If description is empty, try alternative selector
    if (!description) {
      description = $('.field-name-field-exercise-description').text().trim();
    }
    
    // Clean up description
    description = cleanMultilineText(description);
    console.log(`Description length: ${description.length} characters`);
    
    // Extract steps
    const steps: string[] = [];
    $('.field-name-body .field-item ol li').each((_, element) => {
      steps.push($(element).text().trim());
    });
    console.log(`Found ${steps.length} steps`);
    
    // Extract tips using regex approach
    const tips: string[] = [];
    
    // Try to find tips within the main content area only, not in navigation
    const mainContentSelector = '.field-name-body, .node-content, .content-area';
    const mainContent = $(mainContentSelector).html() || '';
    
    // More specific regex for finding tips - look for specific tips or exercise tips sections
    const tipsRegexPatterns = [
      // First try to find a section with the exercise name and Tips
      new RegExp(`<h[1-6][^>]*>${name}\\s+Tips</h[1-6]>([\\s\\S]*?)(?:<h[1-6]|<div class="node-footer|$)`, 'i'),
      // Then try to find just a tips section
      /<h[1-6][^>]*>Tips<\/h[1-6]>([\s\S]*?)(?:<h[1-6]|<div class="node-footer|$)/i,
      // Finally look for any paragraph that mentions tips
      /<p[^>]*>.*?tips.*?<\/p>([\s\S]*?)(?:<\/div>|<h[1-6]|$)/i
    ];
    
    let tipsContent = '';
    
    // Try each regex pattern until we find content
    for (const pattern of tipsRegexPatterns) {
      const match = mainContent.match(pattern);
      if (match && match[1]) {
        tipsContent = match[1];
        console.log(`Found tips content using pattern: ${pattern}`);
        break;
      }
    }
    
    // If we found content, parse it
    if (tipsContent) {
      // Create temp container to extract text content
      const tempDiv = cheerio.load(`<div>${tipsContent}</div>`);
      
      // Try to find list items first (preferred format for tips)
      if (tempDiv('li').length > 0) {
        tempDiv('li').each((_, element) => {
          const text = tempDiv(element).text().trim();
          if (text.length > 0 && !text.includes('Shop') && !text.includes('Account') && !text.includes('View All')) {
            // Add basic filtering to exclude obvious navigation items
            tips.push(text);
          }
        });
      } else {
        // No list items, just get paragraph text
        tempDiv('p').each((_, element) => {
          const text = tempDiv(element).text().trim();
          if (text.length > 0 && !text.includes('Shop') && !text.includes('Account') && !text.includes('View All')) {
            tips.push(text);
          }
        });
      }
    }
    
    // If we still found nothing, try a direct approach with the tips section
    if (tips.length === 0) {
      $('.field-name-field-exercise-tips .field-item').find('li, p').each((_, element) => {
        const text = $(element).text().trim();
        if (text.length > 0 && !text.includes('Shop') && !text.includes('Account') && !text.includes('View All')) {
          tips.push(text);
        }
      });
    }
    
    // Add some default tips if we couldn't find any
    if (tips.length === 0) {
      console.log('Could not find specific tips, adding generic tips');
      tips.push('Maintain proper form throughout the exercise.');
      tips.push('Start with a lighter weight to practice the movement pattern.');
      tips.push('Breathe out during the exertion phase of the exercise.');
    }
    
    console.log(`Found ${tips.length} tips`);
    
    // Extract exercise type, target muscles, etc.
    const targetBodyParts: string[] = [];
    const exerciseType: string[] = ['Strength']; // Default
    const equipment: string[] = [];
    let difficulty: string = 'Intermediate'; // Default
    const muscles: string[] = [];
    const contraindications: string[] = [];
    
    // Look for metadata in the stats block
    $('.node-stats-block li').each((_, element) => {
      const label = $(element).find('.row-label').text().trim();
      const fullText = $(element).text();
      const value = fullText.replace(label, '').trim();
      
      console.log(`Found metadata: ${label} = ${value}`);
      
      if (label === 'Target Muscle Group') {
        muscles.push(value);
      } else if (label === 'Secondary Muscles') {
        value.split(',').map(m => m.trim()).filter(m => m.length > 0).forEach(m => {
          muscles.push(m);
        });
      } else if (label === 'Equipment') {
        equipment.push(value);
      } else if (label === 'Mechanics') {
        // If it's compound, add that to exerciseType
        if (value.toLowerCase() === 'compound') {
          exerciseType.push('Compound');
        } else if (value.toLowerCase() === 'isolation') {
          exerciseType.push('Isolation');
        }
      }
    });
    
    // If shoulders are in muscles, add to targetBodyParts
    if (muscles.some(m => m.toLowerCase().includes('shoulder') || m.toLowerCase().includes('deltoid'))) {
      targetBodyParts.push('Shoulders');
    }
    
    // Return the structured exercise
    return {
      name,
      description,
      targetBodyParts,
      exerciseType,
      difficulty,
      equipment,
      steps,
      tips,
      contraindications,
      muscles,
      alternatives: []
    };
  } catch (error: any) {
    console.error(`Error fetching exercise: ${error.message || 'Unknown error'}`);
    throw error;
  }
}

// Function to save the exercise to a file
function saveExerciseToFile(exercise: Exercise, fileName: string): void {
  // Format as TypeScript
  const formattedExercise = {
    ...exercise,
    id: 'exercise-1'  // Add a placeholder ID
  };
  
  const fileContent = `import { Exercise } from '../types/exercises';

const exercise: Exercise = ${formatAsTypeScript(formattedExercise, 0)};

export default exercise;
`;

  fs.writeFileSync(fileName, fileContent);
  console.log(`Exercise saved to ${fileName}`);
}

// Main function
async function main(): Promise<void> {
  const url = process.argv[2] || 'https://www.muscleandstrength.com/exercises/dumbbell-lateral-raise.html';
  console.log(`Testing scraper with URL: ${url}`);
  
  try {
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    // Scrape the exercise
    const exercise = await scrapeExercise(url);
    
    // Generate filename from exercise name
    const fileName = path.join(
      outputDir, 
      `${exercise.name.toLowerCase().replace(/\s+/g, '-')}.ts`
    );
    
    // Save to file
    saveExerciseToFile(exercise, fileName);
    
    // Display summary
    console.log('\nExercise Summary:');
    console.log(`Name: ${exercise.name}`);
    console.log(`Target Body Parts: ${exercise.targetBodyParts?.join(', ') || 'Not specified'}`);
    console.log(`Exercise Type: ${exercise.exerciseType?.join(', ') || 'Not specified'}`);
    console.log(`Equipment: ${exercise.equipment?.join(', ') || 'Not specified'}`);
    console.log(`Steps: ${exercise.steps.length}`);
    console.log(`Tips: ${exercise.tips.length}`);
    console.log(`Muscles: ${exercise.muscles?.join(', ') || 'Not specified'}`);
    
    console.log('\nTips Preview:');
    exercise.tips.forEach((tip, index) => {
      const displayTip = tip.length > 80 ? tip.substring(0, 77) + '...' : tip;
      console.log(`  ${index + 1}. ${displayTip}`);
    });
    
  } catch (error) {
    console.error('Error running the test:', error);
  }
}

// Run the script
main(); 