import { spawn, spawnSync } from 'node:child_process';
import { dirname, delimiter } from 'node:path';
const test = process.argv.includes('--test');
const env = {
  ...process.env,
  PATH: dirname(process.execPath) + delimiter + process.env.PATH,
  ...(test
    ? {
        GYM_TEST_MODE: '1',
        DB_NAME: 'quan_ly_phong_gym_test',
        PORT: '4100',
        FRONTEND_PORT: '3100',
        BACKEND_URL: 'http://127.0.0.1:4100',
        FRONTEND_ORIGIN: 'http://127.0.0.1:3100,http://localhost:3100',
      }
    : {}),
};
const children = [
  spawn(process.execPath, ['--watch', 'backend/src/server.ts'], {
    stdio: 'inherit',
    env,
  }),
  spawn(process.execPath, ['../node_modules/vite/bin/vite.js'], {
    cwd: 'frontend',
    stdio: 'inherit',
    env,
  }),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.pid) continue;
    if (process.platform === 'win32')
      spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
        stdio: 'ignore',
      });
    else child.kill();
  }
  process.exit(code);
}
for (const child of children) child.on('exit', (code) => stop(code || 0));
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
