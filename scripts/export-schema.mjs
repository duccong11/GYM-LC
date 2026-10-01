// Read-only export of the existing MySQL schema, without application data.
import { pool } from '../legacy/node/backend/src/config/database.ts';
import { mkdirSync, writeFileSync } from 'node:fs';
try {
  const [tables]=await pool.query('SHOW TABLES');
  let sql='-- GYM LC Java MVC: schema only, exported from the current MySQL database.\n-- Import only into an empty database. Does not include user passwords or records.\nSET FOREIGN_KEY_CHECKS=0;\n';
  for(const row of tables){const name=Object.values(row)[0];if(!/^[a-zA-Z0-9_]+$/.test(name))throw Error('Unexpected table name');const [ddl]=await pool.query('SHOW CREATE TABLE `'+name+'`');sql+=ddl[0]['Create Table'].replace(/^CREATE TABLE /,'CREATE TABLE IF NOT EXISTS ')+';\n\n';}
  sql+='SET FOREIGN_KEY_CHECKS=1;\n';
  mkdirSync('db/migrations',{recursive:true});mkdirSync('src/main/resources/db',{recursive:true});
  writeFileSync('db/migrations/V001__baseline.sql',sql);writeFileSync('src/main/resources/db/schema.sql',sql);
  console.log('Exported schema for '+tables.length+' tables; no records exported.');
}finally{await pool.end();}
