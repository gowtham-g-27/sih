const { spawn } = require('child_process');
const path = require('path');

console.log('--------------------------------------------------');
console.log('🚀 Starting SahakarSeva Platform (Backend + Frontend)');
console.log('--------------------------------------------------');

// 1. Start Backend Express Server
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

backend.on('error', (err) => {
  console.error('[Backend Error]', err);
});

// 2. Start Frontend Vite Server
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true
});

frontend.on('error', (err) => {
  console.error('[Frontend Error]', err);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down SahakarSeva servers...');
  backend.kill();
  frontend.kill();
  process.exit();
});
