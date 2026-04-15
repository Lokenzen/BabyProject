const fs = require('fs');
const path = require('path');

// Copy everything from docs/browser to docs root
const sourceDir = path.join(__dirname, 'docs', 'browser');
const targetDir = path.join(__dirname, 'docs');

if (fs.existsSync(sourceDir)) {
  const files = fs.readdirSync(sourceDir);
  
  files.forEach(file => {
    const sourceFile = path.join(sourceDir, file);
    const targetFile = path.join(targetDir, file);
    
    if (fs.lstatSync(sourceFile).isFile()) {
      fs.copyFileSync(sourceFile, targetFile);
      console.log(`Copied: ${file}`);
    }
  });
  
  // Remove browser directory
  fs.rmSync(sourceDir, { recursive: true, force: true });
  console.log('Build optimization complete: files copied from browser/ to docs/ and browser/ removed');
} else {
  console.warn('Source directory not found:', sourceDir);
}

// Create .nojekyll file to prevent Jekyll processing
fs.writeFileSync(path.join(targetDir, '.nojekyll'), '');
console.log('Created .nojekyll file');
