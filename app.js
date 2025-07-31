const { spawn } = require('child_process');

console.log('Starting Next.js application...');

// Execute npm start
const child = spawn('npm', ['start'], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Application exited with code ${code}`);
  process.exit(code);
}); 