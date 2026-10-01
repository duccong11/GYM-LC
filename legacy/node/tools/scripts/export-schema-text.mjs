import { mkdir, writeFile } from 'node:fs/promises';
import { pool } from '../../backend/src/config/database.ts';
import { config } from '../../backend/src/config/env.ts';

const quote = value => '`' + String(value).replaceAll('`', '``') + '`';
try {
  const [tables] = await pool.query("SELECT TABLE_NAME AS name FROM information_schema.tables WHERE TABLE_SCHEMA=DATABASE() AND TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME");
  if (!tables.length) throw new Error('Database không có bảng để xuất.');
  const lines = [
    '-- WEBSITE QUAN LY PHONG GYM - CAU TRUC MYSQL HIEN TAI',
    '-- Exported: ' + new Date().toISOString(),
    '-- Schema only, with required roles and system configuration.',
    '-- Khong bao gom du lieu hoi vien, tai khoan, mat khau, phien dang nhap.',
    '-- Dung de khoi tao database moi. Khong thay the migration database cu.',
    'SET NAMES utf8mb4;',
    'CREATE DATABASE IF NOT EXISTS ' + quote(config.database.database) + ' CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;',
    'USE ' + quote(config.database.database) + ';',
    'SET @GYM_OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS;',
    'SET FOREIGN_KEY_CHECKS=0;',
  ];
  for (const table of tables) {
    const [ddl] = await pool.query('SHOW CREATE TABLE ' + quote(table.name));
    lines.push('\n-- Table: ' + table.name, ddl[0]['Create Table'].replace(/^CREATE TABLE /, 'CREATE TABLE IF NOT EXISTS ') + ';');
  }
  for (const name of ['roles', 'mutation_lock', 'system_settings']) {
    const [rows] = await pool.query('SELECT * FROM ' + quote(name));
    for (const row of rows) {
      const columns = Object.keys(row);
      lines.push('INSERT IGNORE INTO ' + quote(name) + ' (' + columns.map(quote).join(', ') + ') VALUES (' + columns.map(key => pool.escape(row[key])).join(', ') + ');');
    }
  }
  lines.push('SET FOREIGN_KEY_CHECKS=@GYM_OLD_FOREIGN_KEY_CHECKS;', '');
  const text = lines.join('\r\n');
  await mkdir('sql', { recursive: true });
  for (const ext of ['sql', 'txt']) await writeFile('sql/QuanLyPhongGYM_CauTruc_20260923.' + ext, text, 'utf8');
  console.log(JSON.stringify({tables:tables.length,bytes:Buffer.byteLength(text),files:['sql/QuanLyPhongGYM_CauTruc_20260923.sql','sql/QuanLyPhongGYM_CauTruc_20260923.txt']}));
} finally {
  await pool.end();
}
