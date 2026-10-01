import { spawn, spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import dotenv from 'dotenv';
const test=process.argv.includes('--test');
if(!existsSync('node_modules/vite/bin/vite.js'))throw Error('Chạy npm install trước.');
const local=existsSync('.env')?dotenv.parse(readFileSync('.env')):{};
const env={...local,...process.env,...(test?{GYM_TEST_MODE:'1',DB_NAME:'quan_ly_phong_gym_java_test',PORT:'4100',FRONTEND_PORT:'3100',BACKEND_URL:'http://127.0.0.1:4100',FRONTEND_ORIGIN:'http://127.0.0.1:3100,http://localhost:3100'}:{})};
const repository=process.env.MAVEN_REPO_LOCAL || resolve(process.env.USERPROFILE || process.env.HOME,'.m2/repository');
const mvnArgs=[`-Dmaven.repo.local=${repository}`,'spring-boot:run'];
const windows=process.platform==='win32';
const backend=spawn('mvn',windows?[`"${mvnArgs[0]}"`,'spring-boot:run']:mvnArgs,{stdio:'inherit',env,shell:windows});
const frontend=spawn(process.execPath,['node_modules/vite/bin/vite.js','src/main/webapp','--config','src/main/webapp/vite.config.ts'],{stdio:'inherit',env});
const children=[backend,frontend];let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;for(const child of children){if(!child.pid)continue;if(windows)spawnSync('taskkill',['/PID',String(child.pid),'/T','/F'],{stdio:'ignore'});else child.kill();}process.exit(code);}
for(const child of children){child.on('error',e=>{console.error(e.message);stop(1);});child.on('exit',c=>stop(c||0));}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
