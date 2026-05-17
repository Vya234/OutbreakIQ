import { Outbreak } from '../models/Outbreak.js';
import { isMemoryMode, memoryOutbreak } from './memoryStore.js';

/** Unified data access — MongoDB or in-memory fallback */
export const outbreakRepo = {
  find(filter, sort, limit) {
    if (isMemoryMode()) {
      return memoryOutbreak.find(filter).then((rows) => {
        let result = rows;
        if (limit) result = result.slice(0, limit);
        return result;
      });
    }
    let q = Outbreak.find(filter);
    if (sort) q = q.sort(sort);
    if (limit) q = q.limit(limit);
    return q.lean();
  },
  findById(id) {
    if (isMemoryMode()) return memoryOutbreak.findById(id);
    return Outbreak.findById(id).lean();
  },
  create(data) {
    if (isMemoryMode()) return memoryOutbreak.create(data);
    return Outbreak.create(data);
  },
  findByIdAndUpdate(id, updates) {
    if (isMemoryMode()) return memoryOutbreak.findByIdAndUpdate(id, updates);
    return Outbreak.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  },
  findByIdAndDelete(id) {
    if (isMemoryMode()) return memoryOutbreak.findByIdAndDelete(id);
    return Outbreak.findByIdAndDelete(id);
  },
  countDocuments() {
    if (isMemoryMode()) return memoryOutbreak.countDocuments();
    return Outbreak.countDocuments();
  },
};
