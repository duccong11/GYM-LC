import {readFileSync} from 'node:fs';
import {spawn} from 'node:child_process';
import dotenv from 'dotenv';
const config=dotenv.parse(readFileSync('.env'));
const env={...process.env,...config,GYM_TEST_MODE:'1',DB_NAME:'quan_ly_phong_gym_java_test',PORT:'4100',FRONTEND_ORIGIN:'http://127.0.0.1:4100,http://127.0.0.1:3100,http://localhost:3100'};
const child=spawn('java',['-jar','target/gym-lc-1.0.0.jar',...process.argv.slice(2)],{env,stdio:'inherit'});
child.on('exit',code=>process.exit(code||0));child.on('error',e=>{console.error(e.message);process.exit(1);});
process.on('SIGINT',()=>child.kill());process.on('SIGTERM',()=>child.kill());
