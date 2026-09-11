import { spawnSync } from 'node:child_process';
const test = process.argv.includes('--test');
const env = {
  ...process.env,
  ...(test ? { GYM_TEST_MODE: '1', DB_NAME: 'quan_ly_phong_gym_test' } : {}),
};
for (const script of [
  'init-db',
  ...(process.argv.includes('--demo') ? ['seed'] : []),
]) {
  const r = spawnSync(process.execPath, ['backend/scripts/' + script + '.ts'], {
    stdio: 'inherit',
    env,
  });
  if (r.status !== 0) process.exit(r.status || 1);
}
