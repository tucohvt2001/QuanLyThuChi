import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import accountRoutes from './routes/accountRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import debtRoutes from './routes/debtRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import { pool } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/friends', friendRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbRes = await pool.query('SELECT NOW() as current_time');
    res.json({
      status: 'ok',
      service: 'QuanLyThuChi API',
      time: dbRes.rows[0].current_time
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Phục vụ Frontend Build nếu deploy Fullstack chung 1 server
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
      if (err) next();
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Lỗi hệ thống:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi trên hệ thống',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend Server đang chạy tại http://localhost:${PORT}`);
});

