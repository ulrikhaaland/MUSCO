import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

// Import formatter function
import { formatAsTypeScript } from './formatters';

async function scrapeExercise() {
  const url = 'https://www.muscleandstrength.com/exercises/dumbbell-lateral-raise.html';
  console.log(`Fetching: ${url}`);
  
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Extract name
    const name = $('h1').first().text().trim().replace(' Video Exercise Guide', '');
    console.log(`Found exercise: ${name}`);
    
    // Try to find tips within the main content area only, not in navigation
    const mainContentSelector = '.field-name-body, .node-content, .content-area';
    const mainContent = $(mainContentSelector).html() || '';
    
    // Extract tips
    const tips: string[] = [];
    
    console.log('Looking for tips in the content...');
    
    // Look for tips in field-name-field-exercise-tips
    $('.field-name-field-exercise-tips .field-item').find('li, p').each((_, element) => {
      const text = $(element).text().trim();
      if (text && !text.includes('Shop') && !text.includes('Account') && !text.includes('View All')) {
        tips.push(text);
      }
    });
    
    // If no tips found, look for a Tips heading
    if (tips.length === 0) {
      // Find a heading containing "Tips"
      $('h2, h3, h4').each((_, element) => {
        const headingText = $(element).text().trim();
        if (headingText.includes('Tips')) {
          console.log(`Found heading with Tips: ${headingText}`);
          
          // Get the next elements after this heading
          const nextElements = $(element).nextUntil('h2, h3, h4');
          nextElements.find('li').each((_, li) => {
            const text = $(li).text().trim();
            if (text && !text.includes('Shop') && !text.includes('Account') && !text.includes('View All')) {
              tips.push(text);
            }
          });
          
          // If no list items, look for paragraphs
          if (tips.length === 0) {
            nextElements.filter('p').each((_, p) => {
              const text = $(p).text().trim();
              if (text && !text.includes('Shop') && !text.includes('Account') && !text.includes('View All')) {
                tips.push(text);
              }
            });
          }
        }
      });
    }
    
    console.log(`Found ${tips.length} tips:`);
    tips.forEach((tip, i) => {
      const shortenedTip = tip.length > 80 ? tip.substring(0, 77) + '...' : tip;
      console.log(`${i + 1}. ${shortenedTip}`);
    });
    
    // Format as TypeScript
    const exerciseObj = {
      name,
      tips
    };
    
    const formatted = formatAsTypeScript(exerciseObj, 2);
    console.log('\nFormatted exercise object:');
    console.log(formatted);
    
    // Also save to file
    fs.writeFileSync('lateral-raise-tips.ts', `export const exercise = ${formatted};\n`);
    console.log('Saved to lateral-raise-tips.ts');
    
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

// Run the scraper
scrapeExercise(); 