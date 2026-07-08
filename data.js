const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'medicines.json');

function readAll() {
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(raw);
}

function writeAll(list) {
  fs.writeFileSync(DB_PATH, JSON.stringify(list, null, 2), 'utf8');
}

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function getBySlug(slug) {
  return readAll().find(m => m.slug === slug);
}

function search(query) {
  const q = (query || '').trim().toLowerCase();
  const all = readAll();
  if (!q) return all;
  return all.filter(m =>
    m.name.toLowerCase().includes(q) ||
    (m.aliases || []).some(a => a.toLowerCase().includes(q))
  );
}

function splitLines(text) {
  return (text || '')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);
}

function addMedicine(fields) {
  const all = readAll();
  let baseSlug = slugify(fields.name);
  let slug = baseSlug;
  let n = 2;
  while (all.some(m => m.slug === slug)) {
    slug = `${baseSlug}-${n}`;
    n += 1;
  }
  const entry = {
    slug,
    name: fields.name.trim(),
    aliases: splitLines(fields.aliases),
    treats: (fields.treats || '').trim(),
    deficiency: (fields.deficiency || '').trim(),
    foods: splitLines(fields.foods),
    ayurveda: splitLines(fields.ayurveda),
    caution: (fields.caution || '').trim()
  };
  all.push(entry);
  writeAll(all);
  return entry;
}

module.exports = { readAll, writeAll, getBySlug, search, addMedicine, slugify };
