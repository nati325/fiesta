/**
 * Canonical CRM data paths — single source of truth.
 * Prefers: scarping_for_fiesta - עותק (no RTL / duplicate folder names)
 */
const fs = require('fs');
const path = require('path');

const CANONICAL_DIR = 'scarping_for_fiesta - עותק';

function projectRoot() {
  return path.join(__dirname, '..', '..', '..');
}

function isStaleScrapingPath(p) {
  return /[\u200f\u202a-\u202e]/.test(p) || /ג€|׳/.test(p) || p.includes(`${path.sep}data${path.sep}data${path.sep}`);
}

function findScrapingRoot() {
  if (process.env.CRM_SCRAPING_ROOT && fs.existsSync(process.env.CRM_SCRAPING_ROOT)) {
    return process.env.CRM_SCRAPING_ROOT;
  }

  const preferred = path.join(projectRoot(), CANONICAL_DIR);
  if (fs.existsSync(path.join(preferred, 'data', 'suppliers_complete.json'))) return preferred;

  const found = [];
  for (const entry of fs.readdirSync(projectRoot(), { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.includes('scarping')) continue;
    const root = path.join(projectRoot(), entry.name);
    const jsonPath = path.join(root, 'data', 'suppliers_complete.json');
    if (fs.existsSync(jsonPath)) found.push(root);
  }

  found.sort((a, b) => {
    if (a.endsWith(CANONICAL_DIR)) return -1;
    if (b.endsWith(CANONICAL_DIR)) return 1;
    if (isStaleScrapingPath(a)) return 1;
    if (isStaleScrapingPath(b)) return -1;
    try {
      const ac = JSON.parse(fs.readFileSync(path.join(a, 'data', 'suppliers_complete.json'), 'utf8')).filter(
        (s) => s.contentCleanedAt
      ).length;
      const bc = JSON.parse(fs.readFileSync(path.join(b, 'data', 'suppliers_complete.json'), 'utf8')).filter(
        (s) => s.contentCleanedAt
      ).length;
      return bc - ac;
    } catch {
      return 0;
    }
  });

  return found[0] || preferred;
}

function findSuppliersJson() {
  if (process.env.CRM_SUPPLIERS_JSON && fs.existsSync(process.env.CRM_SUPPLIERS_JSON)) {
    return process.env.CRM_SUPPLIERS_JSON;
  }
  return path.join(findScrapingRoot(), 'data', 'suppliers_complete.json');
}

function findScrapingEnv() {
  const envPath = path.join(findScrapingRoot(), '.env.local');
  return fs.existsSync(envPath) ? envPath : null;
}

module.exports = { CANONICAL_DIR, findScrapingRoot, findSuppliersJson, findScrapingEnv, isStaleScrapingPath };
