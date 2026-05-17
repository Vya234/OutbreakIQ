import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import { Outbreak } from '../models/Outbreak.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '../../data/sample-outbreaks.json');

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/outbreakiq';
  await connectDB(uri);

  const raw = fs.readFileSync(dataPath, 'utf-8');
  const samples = JSON.parse(raw);

  await Outbreak.deleteMany({});
  await Outbreak.insertMany(samples);

  console.log(`Seeded ${samples.length} outbreak records`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
