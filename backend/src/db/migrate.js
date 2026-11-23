import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('--- Đang chạy Migration Database trên Neon PostgreSQL ---');
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(sql);
    console.log('✅ Migration thành công! Các bảng accounts, categories, transactions, budgets đã sẵn sàng.');
  } catch (error) {
    console.error('❌ Migration thất bại:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();

