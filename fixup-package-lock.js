const fs = require('fs');
const path = require('path');

try {
  console.log('Attempting to fix package-lock.json...');
  const lockfilePath = path.resolve(__dirname, 'package-lock.json');
  
  if (!fs.existsSync(lockfilePath)) {
    console.log('No package-lock.json found. Nothing to fix.');
    process.exit(0);
  }
  
  // Read the package-lock.json file
  const data = fs.readFileSync(lockfilePath, 'utf8');
  
  try {
    // Try to parse it to validate JSON
    JSON.parse(data);
    console.log('package-lock.json is valid JSON. No fixes needed.');
    process.exit(0);
  } catch (err) {
    console.log('Invalid JSON detected in package-lock.json. Creating new file...');
    
    // Create a new minimal valid package-lock.json
    const minimalLockfile = {
      name: 'trial',
      version: '0.1.0',
      lockfileVersion: 3,
      requires: true,
      packages: {}
    };
    
    // Write the fixed package-lock.json
    fs.writeFileSync(lockfilePath, JSON.stringify(minimalLockfile, null, 2), 'utf8');
    console.log('Created minimal valid package-lock.json. Run npm install to regenerate the full file.');
    
    process.exit(0);
  }
} catch (err) {
  console.error('Error fixing package-lock.json:', err);
  process.exit(1);
}
