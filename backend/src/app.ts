import express from 'express';
import routes from './routes/index.ts';
import { errorHandler } from './middleware/error.middleware.ts';
import { pool } from './config/database.ts';
export const app = express();
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.set({
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'same-origin',
  });
  next();
});
app.use(express.json({ limit: '16kb' }));
app.get('/api/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok', database: 'mysql' });
});
app.use('/api', routes);
app.use((_req, res) =>
  res.status(404).json({ error: 'Không tìm thấy đường dẫn.' }),
);
app.use(errorHandler);
