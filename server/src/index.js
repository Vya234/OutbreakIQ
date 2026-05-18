import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import outbreakRoutes from './routes/outbreakRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import authRoutes from './routes/authRoutes.js';

import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { Outbreak } from './models/Outbreak.js';
import { initMemoryStore } from './services/memoryStore.js';

dotenv.config();

/**
 * Warn if admin authentication variables are missing.
 */
function warnIfAuthNotConfigured() {
  const missing = ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'JWT_SECRET'].filter(
    (key) => !process.env[key]
  );

  if (missing.length) {
    console.warn(
      `Admin auth disabled — missing environment variables: ${missing.join(', ')}`
    );
  }
}

warnIfAuthNotConfigured();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * CORS configuration
 * Allows:
 * - Production frontend on Vercel
 * - Local development
 */
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));

/**
 * Health check route
 */
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'OutbreakIQ API is running',
  });
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/outbreaks', outbreakRoutes);
app.use('/api/ai', aiRoutes);

/**
 * 404 + Error handlers
 */
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Automatically seed sample outbreak data
 * when the database is empty.
 */
async function autoSeedIfEmpty() {
  const count = await Outbreak.countDocuments();

  if (count > 0) return;

  const dataPath = path.join(__dirname, '../data/sample-outbreaks.json');

  if (!fs.existsSync(dataPath)) return;

  const samples = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  await Outbreak.insertMany(samples);

  console.log(`Auto-seeded ${samples.length} outbreak records`);
}

/**
 * Start server
 */
async function start() {
  const mongoUri =
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/outbreakiq';

  try {
    await connectDB(mongoUri);
    await autoSeedIfEmpty();
  } catch (error) {
    console.warn(
      'MongoDB unavailable — switching to in-memory store with sample data.'
    );
    console.warn(error.message);
    initMemoryStore();
  }

  app.listen(PORT, () => {
    console.log(`OutbreakIQ server listening on port ${PORT}`);
  });
}

start();