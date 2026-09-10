import { spawnSync } from 'node:child_process';
for (const args of [
  [
    'node_modules/typescript/bin/tsc',
    '--noEmit',
    '-p',
    'backend/tsconfig.json',
  ],
  [
    'node_modules/typescript/bin/tsc',
    '--noEmit',
    '-p',
    'frontend/tsconfig.json',
  ],
  [
    'node_modules/vite/bin/vite.js',
    'build',
    'frontend',
    '--config',
    'frontend/vite.config.ts',
  ],
]) {
  const r = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status || 1);
}
