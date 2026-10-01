// Explicitly resets only the disposable Java integration-test database.
import {readFileSync} from 'node:fs';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
if(!process.argv.includes('--reset'))throw Error('Cần --reset để tạo lại database kiểm thử.');
const config=dotenv.parse(readFileSync('.env'));
const target='quan_ly_phong_gym_java_test';
if(config.DB_NAME===target)throw Error('Database cấu hình chính trùng database kiểm thử; từ chối reset.');
const c=await mysql.createConnection({host:config.DB_HOST||'127.0.0.1',port:Number(config.DB_PORT||3306),user:config.DB_USER||'root',password:config.DB_PASSWORD||''});
try{await c.query('DROP DATABASE IF EXISTS `quan_ly_phong_gym_java_test`');console.log('Reset only '+target);}finally{await c.end();}
