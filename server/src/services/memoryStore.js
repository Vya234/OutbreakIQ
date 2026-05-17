import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '../../data/sample-outbreaks.json');

let records = [];
let useMemory = false;

function withId(doc) {
  const id = doc._id || doc.id || randomUUID();
  return { ...doc, _id: id };
}

export function isMemoryMode() {
  return useMemory;
}

export function initMemoryStore() {
  useMemory = true;
  if (!records.length && fs.existsSync(dataPath)) {
    const samples = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    records = samples.map((s) =>
      withId({
        ...s,
        reportedAt: new Date(s.reportedAt),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );
  }
  console.log(`Memory store active (${records.length} outbreaks)`);
  return records;
}

function matchFilter(doc, filter) {
  if (filter.disease) {
    const re = filter.disease instanceof RegExp ? filter.disease : new RegExp(filter.disease, 'i');
    if (!re.test(doc.disease)) return false;
  }
  if (filter.severity && doc.severity !== filter.severity) return false;
  if (filter.location) {
    const re = filter.location instanceof RegExp ? filter.location : new RegExp(filter.location, 'i');
    if (!re.test(doc.location)) return false;
  }
  if (filter.$or) {
    const ok = filter.$or.some((clause) => {
      const re = Object.values(clause)[0];
      if (!(re instanceof RegExp)) return false;
      return re.test(doc.disease) || re.test(doc.location) || re.test(doc.description || '');
    });
    if (!ok) return false;
  }
  if (filter.reportedAt) {
    const d = new Date(doc.reportedAt);
    if (filter.reportedAt.$gte && d < filter.reportedAt.$gte) return false;
    if (filter.reportedAt.$lte && d > filter.reportedAt.$lte) return false;
  }
  return true;
}

export const memoryOutbreak = {
  async find(filter = {}) {
    return records
      .filter((r) => matchFilter(r, filter))
      .sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt))
      .map((r) => ({ ...r }));
  },
  async findById(id) {
    return records.find((r) => r._id === id) || null;
  },
  async create(data) {
    const doc = withId({ ...data, createdAt: new Date(), updatedAt: new Date() });
    records.push(doc);
    return { ...doc };
  },
  async findByIdAndUpdate(id, updates) {
    const idx = records.findIndex((r) => r._id === id);
    if (idx < 0) return null;
    records[idx] = { ...records[idx], ...updates, updatedAt: new Date() };
    return { ...records[idx] };
  },
  async findByIdAndDelete(id) {
    const idx = records.findIndex((r) => r._id === id);
    if (idx < 0) return null;
    const [removed] = records.splice(idx, 1);
    return removed;
  },
  async countDocuments() {
    return records.length;
  },
};
