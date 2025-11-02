#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { execSync } = require('child_process');
const cliProgress = require('cli-progress');
const inquirer = require('inquirer');
const args = require('minimist')(process.argv.slice(2), {
  alias: { ldb: 'local', rdb: 'remote', b: 'batchSize', h: 'help' },
  string: ['ldb', 'rdb', 'b'],
});

/**
 * Check Cloudflare Wrangler login status before proceeding.
 */
function checkLogin() {
  try {
    execSync('wrangler whoami', { stdio: 'ignore' });
  } catch {
    console.error('\n❌ Cloudflare login not detected.\nPlease run: wrangler login\n');
    process.exit(1);
  }
}

/**
 * Show help message and usage instructions.
 */
function showHelp() {
  console.log(`
Usage:
  node d1sync.js -ldb ./data.db -rdb my-d1-db -b 100

Options:
  -ldb       Path to local SQLite database file
  -rdb       Cloudflare D1 database name
  -b         Batch size for data import (default: 100)
  -h, --help Show this help message
`);
}

/**
 * Prompt user for missing parameters interactively.
 */
async function promptParams() {
  const questions = [];

  if (!args.ldb) {
    questions.push({
      type: 'input',
      name: 'ldb',
      message: 'Local SQLite database path (e.g. ./data.db):',
      validate: input => fs.existsSync(input) || 'File not found. Please enter a valid path.',
    });
  }

  if (!args.rdb) {
    questions.push({
      type: 'input',
      name: 'rdb',
      message: answers => {
        const defaultName = path.basename(args.ldb || answers.ldb, path.extname(args.ldb || answers.ldb));
        return `Cloudflare D1 database name (press Enter to use default: ${defaultName}):`;
      },
      default: answers => path.basename(args.ldb || answers.ldb, path.extname(args.ldb || answers.ldb)),
    });
  }

  if (!args.b) {
    questions.push({
      type: 'input',
      name: 'b',
      message: 'Batch size for data import [100]:',
      default: '100',
      validate: input => /^\d+$/.test(input) || 'Please enter a valid number.',
    });
  }

  const answers = await inquirer.prompt(questions);
  return {
    localPath: args.ldb || answers.ldb,
    remoteName: args.rdb || answers.rdb,
    batchSize: parseInt(args.b || answers.b || '100'),
  };
}

/**
 * Create D1 database if it doesn't exist.
 */
function createD1IfNeeded(remoteName) {
  const list = JSON.parse(execSync('wrangler d1 list').toString());
  const exists = list.some(db => db.name === remoteName);
  if (!exists) {
    console.log(`📦 Creating D1 database: ${remoteName}`);
    execSync(`wrangler d1 create ${remoteName}`);
  }
}

/**
 * Sync all tables and data from local SQLite to Cloudflare D1.
 */
function syncTables(localPath, remoteName, batchSize) {
  const db = new Database(localPath);
  const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`).all();

  for (const { name: tableName } of tables) {
    console.log(`🧱 Syncing table: ${tableName}`);

    const columns = db.prepare(`PRAGMA table_info(${tableName});`).all();
    const columnDefs = columns.map(col => `${col.name} ${col.type}`).join(', ');
    const createSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefs});`;

    fs.writeFileSync('create.sql', createSQL);
    execSync(`npx wrangler d1 execute ${remoteName} --remote --file="create.sql"`);
    fs.unlinkSync('create.sql');

    const rows = db.prepare(`SELECT * FROM ${tableName};`).all();
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar.start(rows.length, 0);

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const values = batch.map(row => {
        const vals = columns.map(col => {
          const val = row[col.name];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number') return val;
          return `'${String(val).replace(/'/g, "''")}'`;
        });
        return `(${vals.join(', ')})`;
      }).join(',\n');

      const insertSQL = `INSERT INTO ${tableName} (${columns.map(c => c.name).join(', ')}) VALUES\n${values};`;
      fs.writeFileSync('batch.sql', insertSQL);
      execSync(`npx wrangler d1 execute ${remoteName} --remote --file="batch.sql"`);
      fs.unlinkSync('batch.sql');
      bar.update(Math.min(i + batchSize, rows.length));
    }

    bar.stop();
  }
}

/**
 * Main entry point.
 */
async function main() {
  if (args.help || args._.includes('?')) {
    showHelp();
    return;
  }

  checkLogin();
  const { localPath, remoteName, batchSize } = await promptParams();
  createD1IfNeeded(remoteName);
  syncTables(localPath, remoteName, batchSize);
  console.log('✅ Sync complete.');
}

main();
