import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import outbreakRoutes from './routes/outbreakRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { Outbreak } from './models/Outbreak.js';
import { initMemoryStore } from './services/memoryStore.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

function warnIfAuthNotConfigured() {
  const missing = ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'JWT_SECRET'].filter((key) => !process.env[key]);
  if (missing.length) {
    console.warn(
      `Admin auth disabled — missing in server/.env: ${missing.join(', ')}. ` +
        'Copy server/.env.example to server/.env and restart the server.'
    );
  }
}
warnIfAuthNotConfigured();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(
  cors({
    origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'OutbreakIQ API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/outbreaks', outbreakRoutes);
app.use('/api/ai', aiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Seed from JSON when DB is empty (dev convenience).
 */
async function autoSeedIfEmpty() {
  const count = await Outbreak.countDocuments();
  if (count > 0) return;

  const dataPath = path.join(__dirname, '../data/sample-outbreaks.json');
  if (!fs.existsSync(dataPath)) return;

  const samples = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  await Outbreak.insertMany(samples);
  console.log(`Auto-seeded ${samples.length} outbreaks`);
}

async function start() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/outbreakiq';

  try {
    await connectDB(uri);
    await autoSeedIfEmpty();
  } catch (err) {
    console.warn('MongoDB unavailable — using in-memory store with sample data');
    console.warn(err.message);
    initMemoryStore();
  }

  app.listen(PORT, () => {
    console.log(`OutbreakIQ server listening on http://localhost:${PORT}`);
  });
}

start();
