import mysql from 'mysql2/promise';
import { config } from './env.ts';
export const pool = mysql.createPool({
  ...config.database,
  waitForConnections: true,
  connectionLimit: 10,
  timezone: 'Z',
  dateStrings: true,
  decimalNumbers: true,
  charset: 'utf8mb4',
  flags: ['FOUND_ROWS'],
});
