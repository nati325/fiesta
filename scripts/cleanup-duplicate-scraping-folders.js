/**
 * Remove stale duplicate scarping_for_fiesta folders and nested data/data copy.
 * Keeps only: scarping_for_fiesta - עותק
 *
 * Usage: node scripts/cleanup-duplicate-scraping-folders.js [--dry-run]
 */
const fs = require('fs');
const path = require('path');
const { CANONICAL_DIR, findScrapingRoot, isStaleScrapingPath } = require('./crm-data-paths');

function rmDir(dir, dryRun) {
  if (dryRun) {
    console.log(`[dry-run] delete folder: ${dir}`);
    return;
  }
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`deleted: ${dir}`);
}

function main() {
  const dryRun = process.argv.includes('--dry-run');
  const root = path.join(__dirname, '..', '..', '..');
  const canonical = findScrapingRoot();

  console.log(`Canonical: ${canonical}\n`);

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.includes('scarping')) continue;
    const dir = path.join(root, entry.name);
    if (path.resolve(dir) === path.resolve(canonical)) continue;
    rmDir(dir, dryRun);
  }

  const nested = path.join(canonical, 'data', 'data');
  if (fs.existsSync(nested)) {
    rmDir(nested, dryRun);
  }

  console.log('\nDone.');
}

main();
