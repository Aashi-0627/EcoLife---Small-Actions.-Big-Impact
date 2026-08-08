// Lightweight file-based persistence layer.
// Mimics a minimal Mongo-collection API (find / findOne / insertOne / updateOne / deleteOne)
// so it can be swapped for a real MongoDB driver later with minimal call-site changes.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const cache = new Map();

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function load(name) {
  if (cache.has(name)) return cache.get(name);
  const fp = filePath(name);
  let data = [];
  if (fs.existsSync(fp)) {
    try {
      data = JSON.parse(fs.readFileSync(fp, "utf-8"));
    } catch {
      data = [];
    }
  } else {
    fs.writeFileSync(fp, "[]");
  }
  cache.set(name, data);
  return data;
}

function persist(name) {
  fs.writeFileSync(filePath(name), JSON.stringify(cache.get(name), null, 2));
}

function match(doc, filter = {}) {
  return Object.entries(filter).every(([key, val]) => {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      if ("$in" in val) return val.$in.includes(doc[key]);
      if ("$gte" in val || "$lte" in val || "$gt" in val || "$lt" in val) {
        const d = doc[key];
        if ("$gte" in val && !(d >= val.$gte)) return false;
        if ("$lte" in val && !(d <= val.$lte)) return false;
        if ("$gt" in val && !(d > val.$gt)) return false;
        if ("$lt" in val && !(d < val.$lt)) return false;
        return true;
      }
    }
    return doc[key] === val;
  });
}

export function collection(name) {
  return {
    all() {
      return load(name).slice();
    },
    find(filter = {}) {
      return load(name).filter((d) => match(d, filter));
    },
    findOne(filter = {}) {
      return load(name).find((d) => match(d, filter)) || null;
    },
    findById(id) {
      return load(name).find((d) => d._id === id) || null;
    },
    insertOne(doc) {
      const arr = load(name);
      const record = {
        _id: doc._id || nanoid(12),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...doc,
      };
      arr.push(record);
      persist(name);
      return record;
    },
    updateOne(filter, update) {
      const arr = load(name);
      const idx = arr.findIndex((d) => match(d, filter));
      if (idx === -1) return null;
      arr[idx] = { ...arr[idx], ...update, updatedAt: new Date().toISOString() };
      persist(name);
      return arr[idx];
    },
    updateById(id, update) {
      return this.updateOne({ _id: id }, update);
    },
    deleteOne(filter) {
      const arr = load(name);
      const idx = arr.findIndex((d) => match(d, filter));
      if (idx === -1) return false;
      arr.splice(idx, 1);
      persist(name);
      return true;
    },
    deleteMany(filter) {
      const arr = load(name);
      const remaining = arr.filter((d) => !match(d, filter));
      const removed = arr.length - remaining.length;
      cache.set(name, remaining);
      persist(name);
      return removed;
    },
    count(filter = {}) {
      return load(name).filter((d) => match(d, filter)).length;
    },
    clear() {
      cache.set(name, []);
      persist(name);
    },
  };
}

export const db = {
  users: collection("users"),
  campuses: collection("campuses"),
  challenges: collection("challenges"),
  completions: collection("completions"),
  carbonActivities: collection("carbonActivities"),
  badges: collection("badges"),
  userBadges: collection("userBadges"),
  ecoTips: collection("ecoTips"),
  recyclingItems: collection("recyclingItems"),
};
