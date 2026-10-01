import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
for(const args of [['node_modules/typescript/bin/tsc','--noEmit','-p','src/main/webapp/tsconfig.json'],['node_modules/vite/bin/vite.js','build','src/main/webapp','--config','src/main/webapp/vite.config.ts']]){
  const r=spawnSync(process.execPath,args,{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);
}
const repo=process.env.MAVEN_REPO_LOCAL||resolve(process.env.USERPROFILE||process.env.HOME,'.m2/repository');
const r=process.platform==='win32'?spawnSync('cmd.exe',['/d','/s','/c',`mvn "-Dmaven.repo.local=${repo}" package`],{stdio:'inherit'}):spawnSync('mvn',[`-Dmaven.repo.local=${repo}`,'package'],{stdio:'inherit'});
process.exit(r.status||0);
