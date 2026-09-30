const { spawn } = require('child_process');
const path = require('path');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════════════');
console.log('\x1b[36m%s\x1b[0m', '  🚀 Menjalankan Platform adakamar.id (Frontend & Backend)');
console.log('\x1b[36m%s\x1b[0m', '  Frontend : http://localhost:3000');
console.log('\x1b[36m%s\x1b[0m', '  Backend  : http://localhost:4000/api');
console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════════════\n');

// 1. Jalankan Backend (NestJS)
const backendDir = path.join(__dirname, 'adakamar-backend');
const backend = spawn(npmCmd, ['run', 'start:dev'], {
  cwd: backendDir,
  stdio: 'pipe',
  shell: true,
});

backend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[33m[BACKEND 4000]\x1b[0m ${data}`);
});

backend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[BACKEND ERR]\x1b[0m ${data}`);
});

// 2. Jalankan Frontend (Next.js)
const frontendDir = path.join(__dirname, 'adakamar-id');
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: frontendDir,
  stdio: 'pipe',
  shell: true,
});

frontend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[32m[FRONTEND 3000]\x1b[0m ${data}`);
});

frontend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[FRONTEND ERR]\x1b[0m ${data}`);
});

function cleanup() {
  console.log('\n\x1b[33m%s\x1b[0m', '🛑 Mematikan server Frontend dan Backend...');
  try {
    if (backend && backend.pid) {
      if (isWindows) {
        spawn('taskkill', ['/pid', backend.pid, '/f', '/t']);
      } else {
        backend.kill();
      }
    }
    if (frontend && frontend.pid) {
      if (isWindows) {
        spawn('taskkill', ['/pid', frontend.pid, '/f', '/t']);
      } else {
        frontend.kill();
      }
    }
  } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
