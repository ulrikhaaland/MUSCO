import * as fs from 'fs';
import * as path from 'path';

// Check if the necessary directories exist
function checkDirectories() {
  const requiredDirs = [
    'types'
  ];

  for (const dir of requiredDirs) {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(fullPath, { recursive: true });
    } else {
      console.log(`Directory exists: ${dir}`);
    }
  }

  console.log('All required directories are in place.');
}

// Check if the required packages are installed
function checkPackageJson() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packagePath)) {
      console.error('package.json not found in the scripts directory.');
      console.error('Please run: npm init -y');
      return false;
    }

    const requiredDeps = ['axios', 'cheerio'];
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const installedDeps = Object.keys(packageJson.dependencies || {});
    
    const missingDeps = requiredDeps.filter(dep => !installedDeps.includes(dep));
    
    if (missingDeps.length > 0) {
      console.error('Missing dependencies:', missingDeps.join(', '));
      console.error(`Please run: npm install ${missingDeps.join(' ')}`);
      return false;
    }

    console.log('All required dependencies are installed.');
    return true;
  } catch (error) {
    console.error('Error checking package.json:', error);
    return false;
  }
}

// Run checks
console.log('Checking setup for exercise scraper...');
checkDirectories();
const depsOk = checkPackageJson();

console.log('\nSetup check complete.');
if (depsOk) {
  console.log('You are ready to run the scraper!');
  console.log('Run one of these commands:');
  console.log('  npm run scrape-shoulders');
  console.log('  npm run scrape-back');
  console.log('  npm run scrape-chest');
  console.log('  npm run scrape-legs');
  console.log('  npm run scrape-arms');
  console.log('  npm run scrape-abs');
  console.log('\nFiles will be created in the current directory.');
} else {
  console.log('Please fix the issues above before running the scraper.');
} 