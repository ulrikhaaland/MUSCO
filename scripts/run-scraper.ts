import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

// Define available categories
const categories = [
  'shoulders',
  'back',
  'chest',
  'legs',
  'arms',
  'abs'
];

// Function to run a command and return a promise
function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    
    const childProcess = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });
    
    childProcess.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    childProcess.on('error', error => {
      reject(error);
    });
  });
}

// Main function
async function main() {
  // Get categories from command line arguments
  const categoryArgs = process.argv.slice(2);
  const categoriesToProcess = categoryArgs.length > 0 
    ? categoryArgs.filter(cat => categories.includes(cat))
    : categories;
    
  if (categoriesToProcess.length === 0) {
    console.log('No valid categories specified. Available categories:');
    categories.forEach(cat => console.log(`- ${cat}`));
    return;
  }
  
  console.log('=== Exercise Scraper Workflow ===');
  console.log(`Processing categories: ${categoriesToProcess.join(', ')}`);
  
  // 1. Run the setup check first
  console.log('\n=== Running Setup Check ===');
  try {
    await runCommand('npm', ['run', 'setup-check']);
  } catch (error) {
    console.error('Setup check failed. Please fix the issues before continuing.');
    process.exit(1);
  }
  
  // 2. Process each category
  for (const category of categoriesToProcess) {
    console.log(`\n=== Processing ${category} exercises ===`);
    
    // 2.1 Run the scraper for this category
    console.log(`\n=== Scraping ${category} exercises ===`);
    try {
      await runCommand('npm', ['run', `scrape-${category}`]);
    } catch (error) {
      console.error(`Error scraping ${category} exercises. Continuing with next category.`);
      continue;
    }
    
    // 2.2 Generate alternatives for this category
    console.log(`\n=== Generating alternatives for ${category} exercises ===`);
    try {
      await runCommand('npm', ['run', `generate-alternatives-${category}`]);
    } catch (error) {
      console.error(`Error generating alternatives for ${category} exercises.`);
    }
    
    console.log(`\n=== Completed processing ${category} exercises ===`);
  }
  
  console.log('\n=== Exercise Scraper Workflow Complete ===');
  console.log('The following categories were processed:');
  categoriesToProcess.forEach(cat => {
    const filePath = path.join(process.cwd(), `${cat}.ts`);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const fileSizeKB = Math.round(stats.size / 1024);
      console.log(`- ${cat} (file size: ${fileSizeKB} KB)`);
    } else {
      console.log(`- ${cat} (file not found)`);
    }
  });
  
  console.log('\nAll files have been saved to the current directory.');
  console.log(`Current directory: ${process.cwd()}`);
}

// Run the main function
main().catch(error => {
  console.error('An error occurred:', error);
  process.exit(1);
}); 