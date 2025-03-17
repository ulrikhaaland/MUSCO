import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

// Simplified Exercise interface
interface Exercise {
  name: string;
  description: string;
  steps: string[];
  tips: string[];
  viewCount?: number;
  forceType?: string;
  mechanics?: string;
}

// Function to scrape a single exercise
async function scrapeExercise(url: string): Promise<Exercise> {
  console.log(`Fetching exercise from: ${url}`);
  
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Extract exercise name
    const name = $('h1').first().text().trim().replace(' Video Exercise Guide', '');
    console.log(`Found exercise: ${name}`);
    
    // Extract description
    const description = $('.field-name-field-exercise-overview .field-item').text().trim();
    console.log(`Description length: ${description.length} characters`);
    
    // Extract steps
    const steps: string[] = [];
    $('.field-name-body .field-item ol li').each((_, element) => {
      steps.push($(element).text().trim());
    });
    console.log(`Found ${steps.length} steps`);
    
    // Extract tips
    const tips: string[] = [];
    
    // Look for various tip formats
    console.log(`Looking for tips section with "${name} Tips" heading or similar...`);
    
    // Try regex to find content after "Tips" heading
    const fullHtml = $.html();
    const exerciseNameTipsRegex = new RegExp(`${name}\\s+Tips([\\s\\S]*?)(?:<h\\d|<div class="node-footer|$)`, 'i');
    const match = fullHtml.match(exerciseNameTipsRegex);
    
    if (match && match[1]) {
      console.log(`Found content after "${name} Tips" pattern`);
      
      // Create temp container to extract text content
      const tempDiv = cheerio.load(`<div>${match[1]}</div>`);
      const tipsText = tempDiv('div').text().trim();
      
      // Split by lines or bullet points and filter empty lines
      const tipsLines = tipsText.split(/\n|\./).map(line => line.trim()).filter(line => line.length > 0);
      console.log(`Extracted ${tipsLines.length} tips by splitting text`);
      
      tips.push(...tipsLines);
    } else {
      console.log('Could not find tips section');
    }
    
    // Extract view count
    let viewCount: number | undefined = undefined;
    let viewCountText = '';
    
    $('.count').each((_, element) => {
      const text = $(element).text().trim();
      if (text.includes('Views')) {
        viewCountText = text.replace('Views', '').trim();
      }
    });
    
    if (viewCountText) {
      console.log(`Found view count text: ${viewCountText}`);
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
      
      console.log(`Parsed view count: ${viewCount}`);
    }
    
    // Extract force type and mechanics
    let forceType: string | undefined = undefined;
    let mechanics: string | undefined = undefined;
    
    // Look for exercise metadata
    $('.exercise-meta').each((_, element) => {
      $(element).find('.meta-box').each((_, metaBox) => {
        const label = $(metaBox).find('label').text().trim();
        const value = $(metaBox).text().replace(label, '').trim();
        
        if (label === 'Force Type') {
          forceType = value;
          console.log(`Found force type: ${forceType}`);
        } else if (label === 'Mechanics') {
          mechanics = value;
          console.log(`Found mechanics: ${mechanics}`);
        }
      });
    });
    
    // Also try the node-stats-block
    $('.node-stats-block li').each((_, element) => {
      const label = $(element).find('.row-label').text().trim();
      const fullText = $(element).text();
      const value = fullText.replace(label, '').trim();
      
      if (label === 'Force Type') {
        forceType = value;
        console.log(`Found force type: ${forceType}`);
      } else if (label === 'Mechanics') {
        mechanics = value;
        console.log(`Found mechanics: ${mechanics}`);
      }
    });
    
    // Return the exercise data
    return {
      name,
      description,
      steps,
      tips,
      viewCount,
      forceType,
      mechanics
    };
  } catch (error: any) {
    console.error(`Error fetching exercise: ${error.message || 'Unknown error'}`);
    throw error;
  }
}

// Main function
async function main() {
  // Check if URL is provided as command line argument
  const url = process.argv[2] || 'https://www.muscleandstrength.com/exercises/dumbbell-lateral-raise.html';
  
  try {
    // Scrape the exercise
    const exercise = await scrapeExercise(url);
    
    // Save to file
    const fileName = `test-${exercise.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    fs.writeFileSync(fileName, JSON.stringify(exercise, null, 2));
    
    console.log(`\nExercise data saved to ${fileName}`);
    console.log('\nExercise Overview:');
    console.log(`- Name: ${exercise.name}`);
    console.log(`- Steps: ${exercise.steps.length}`);
    console.log(`- Tips: ${exercise.tips.length}`);
    console.log(`- View Count: ${exercise.viewCount || 'Not found'}`);
    console.log(`- Force Type: ${exercise.forceType || 'Not found'}`);
    console.log(`- Mechanics: ${exercise.mechanics || 'Not found'}`);
    
    // Print tips for verification
    if (exercise.tips.length > 0) {
      console.log('\nExtracted Tips:');
      exercise.tips.forEach((tip, index) => {
        console.log(`${index + 1}. ${tip}`);
      });
    }
  } catch (error) {
    console.error('Failed to scrape exercise:', error);
  }
}

// Run the script
main(); 