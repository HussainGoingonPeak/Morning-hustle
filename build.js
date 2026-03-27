const fs = require('fs');
const path = require('path');

// Configure dotenv to read from the .env file
require('dotenv').config();

// Define the source and destination paths
const sourcePath = path.join(__dirname, 'ai-features.js');
const distDir = path.join(__dirname, 'dist');
const destPath = path.join(distDir, 'ai-features.js');

console.log('Starting build process...');

// Step 1: Read the original ai-features.js file
let fileContent;
try {
  fileContent = fs.readFileSync(sourcePath, 'utf8');
  console.log('Successfully read ai-features.js');
} catch (error) {
  console.error('Error reading ai-features.js:', error);
  process.exit(1);
}

// Step 2: Get the API keys from environment variables
const openRouterApiKey = process.env.VITE_OPENROUTER_API_KEY;
const bytezProdiaApiKey = process.env.VITE_BYTEZ_PRODIA_API_KEY;

if (!openRouterApiKey || !bytezProdiaApiKey) {
  console.error('Error: API keys not found in .env file.');
  console.error('Please make sure you have created a .env file and added VITE_OPENROUTER_API_KEY and VITE_BYTEZ_PRODIA_API_KEY.');
  process.exit(1);
}

// Step 3: Replace the placeholder values in the file content
fileContent = fileContent.replace(
  /const OPENROUTER_API_KEY = 'YOUR_OPENROUTER_API_KEY';/,
  `const OPENROUTER_API_KEY = '${openRouterApiKey}';`
);

fileContent = fileContent.replace(
  /const BYTEZ_PRODIA_API_KEY = 'YOUR_BYTEZ_PRODIA_API_KEY';/,
  `const BYTEZ_PRODIA_API_KEY = '${bytezProdiaApiKey}';`
);

console.log('Successfully replaced API key placeholders.');

// Step 4: Create the 'dist' directory if it doesn't exist
try {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
    console.log('Created dist/ directory.');
  }
} catch (error) {
  console.error('Error creating dist/ directory:', error);
  process.exit(1);
}

// Step 5: Write the modified content to the new file in the 'dist' directory
try {
  fs.writeFileSync(destPath, fileContent, 'utf8');
  console.log('Successfully wrote updated file to dist/ai-features.js');
} catch (error) {
  console.error('Error writing to dist/ai-features.js:', error);
  process.exit(1);
}

console.log('Build process completed successfully!');
