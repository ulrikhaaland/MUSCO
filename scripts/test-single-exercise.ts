import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

// Import the formatter functions from the main scraper
import { formatAsTypeScript, formatTsString } from './formatters';

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
    let description = $('.field-name-field-exercise-overview .field-item').text().trim();
    
    // If description is empty, try alternative selectors
    if (!description) {
      description = $('.field-name-field-exercise-description').text().trim();
    }
    
    // Clean up the description - remove excessive newlines and spaces
    if (description) {
      // Replace multiple newlines and spaces with single space
      description = description.replace(/\s+/g, ' ').trim();
    }
    
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
      
      // Try to find list items first
      if (tempDiv('li').length > 0) {
        tempDiv('li').each((_, element) => {
          const text = tempDiv(element).text().trim();
          if (text.length > 0) {
            // Process multiline list items
            if (text.includes('following tweaks:')) {
              // This is likely a list item with sub-points
              const mainPoint = text.split('following tweaks:')[0].trim() + ' following tweaks:';
              tips.push(mainPoint);
              
              // Find the sub-points in the following text
              const subPoints = tempDiv(element).nextAll().text().trim();
              if (subPoints) {
                subPoints.split(/\n|\.\s+|•/).map(line => line.trim())
                  .filter(line => line.length > 0)
                  .forEach(subPoint => {
                    tips.push(subPoint);
                  });
              }
            } else {
              tips.push(text);
            }
          }
        });
      } else {
        // No list items, just extract the text and split by lines
        const tipsText = tempDiv('div').text().trim();
        const tipsLines = tipsText.split(/\n|\.\s+|•/).map(line => line.trim())
          .filter(line => line.length > 0);
        console.log(`Extracted ${tipsLines.length} tips by splitting text`);
        tips.push(...tipsLines);
      }
    } else {
      console.log('Could not find tips section');
    }
    
    // Extract force type and mechanics
    let forceType: string | undefined = undefined;
    let mechanics: string | undefined = undefined;
    
    // Look for exercise metadata
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
      forceType,
      mechanics
    };
  } catch (error: any) {
    console.error(`Error fetching exercise: ${error.message || 'Unknown error'}`);
    throw error;
  }
}

// Function to format an object as TypeScript (without quotes on property names)
function formatAsTypeScript(obj: any, indent = 0): string {
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  
  const indentStr = ' '.repeat(indent);
  const indentStrInner = ' '.repeat(indent + 2);
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    
    const items = obj.map(item => {
      if (typeof item === 'string') {
        // Properly format and escape string content for TypeScript
        return `${indentStrInner}${formatTsString(item, indent + 2)}`;
      }
      if (typeof item === 'object' && item !== null) {
        return formatAsTypeScript(item, indent + 2);
      }
      return `${indentStrInner}${item}`;
    }).join(',\n');
    
    return `[\n${items}\n${indentStr}]`;
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const entries = Object.entries(obj).map(([key, value]) => {
      if (typeof value === 'string') {
        // Properly format and escape string content for TypeScript
        return `${indentStrInner}${key}: ${formatTsString(value, indent + 2)}`;
      }
      if (typeof value === 'object' && value !== null) {
        return `${indentStrInner}${key}: ${formatAsTypeScript(value, indent + 2)}`;
      }
      return `${indentStrInner}${key}: ${value}`;
    }).join(',\n');
    
    return `{\n${entries}\n${indentStr}}`;
  }
  
  if (typeof obj === 'string') {
    return formatTsString(obj, indent);
  }
  
  return String(obj);
}

// Helper function to properly format and escape string content for TypeScript
function formatTsString(str: string, indent = 0): string {
  // Check if the string contains newlines or quotes
  const hasNewlines = str.includes('\n');
  const hasQuotes = str.includes('"') || str.includes("'");
  
  // For strings with newlines or quotes, use template literals
  if (hasNewlines || hasQuotes) {
    // Replace any backticks with escaped backticks
    const escaped = str.replace(/`/g, '\\`');
    
    // Use template literals for multiline strings
    // For readability, add indentation to each line
    if (hasNewlines) {
      const indentStr = ' '.repeat(indent);
      const indentedLines = escaped.split('\n')
        .map(line => line.trim()) // Trim each line
        .filter(line => line.length > 0) // Remove empty lines
        .join('\n' + indentStr + '  '); // Add indentation
      
      return `\`${indentedLines}\``;
    }
    
    return `\`${escaped}\``;
  }
  
  // For simple strings, use double quotes
  return `"${str.replace(/"/g, '\\"')}"`;
}

// Main function
async function main() {
  // Check if URL is provided as command line argument
  const url = process.argv[2] || 'https://www.muscleandstrength.com/exercises/dumbbell-lateral-raise.html';
  
  try {
    // Scrape the exercise
    const exercise = await scrapeExercise(url);
    
    // Format as TypeScript
    const tsObject = `const exercise = ${formatAsTypeScript(exercise, 2)};`;
    
    // Save to file
    const fileName = `test-${exercise.name.toLowerCase().replace(/\s+/g, '-')}.ts`;
    fs.writeFileSync(fileName, tsObject);
    
    console.log(`\nExercise data saved to ${fileName}`);
    console.log('\nExercise Overview:');
    console.log(`- Name: ${exercise.name}`);
    console.log(`- Steps: ${exercise.steps.length}`);
    console.log(`- Tips: ${exercise.tips.length}`);
    console.log(`- Force Type: ${exercise.forceType || 'Not found'}`);
    console.log(`- Mechanics: ${exercise.mechanics || 'Not found'}`);
    
    // Print tips for verification
    if (exercise.tips.length > 0) {
      console.log('\nExtracted Tips:');
      exercise.tips.forEach((tip, index) => {
        // Truncate long tips for display
        const displayTip = tip.length > 80 ? tip.substring(0, 80) + '...' : tip;
        console.log(`${index + 1}. ${displayTip}`);
      });
    }
  } catch (error) {
    console.error('Failed to scrape exercise:', error);
  }
}

// Export the formatting functions
export { formatAsTypeScript, formatTsString };

// Run the script
main(); 