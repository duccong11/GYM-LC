import dotenv from 'dotenv';
import {spawnSync} from 'node:child_process';
dotenv.config({path:'backend/.env',quiet:true});
process.env.DB_NAME='quan_ly_phong_gym_test';
process.env.GYM_TEST_MODE='1';
for(const args of [['backend/scripts/init-db.ts'],['--test','tools/tests/holiday-mysql.test.mjs']]) {
 const r=spawnSync(process.execPath,args,{stdio:'inherit',env:process.env});
 if(r.status!==0) process.exit(r.status||1);
}
