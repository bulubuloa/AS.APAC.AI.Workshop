require('dotenv').config();
const { mkdirSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const { resolve } = require('node:path');
mkdirSync('auth', { recursive: true });
const cli = resolve(require.resolve('playwright/package.json'), '..', 'cli.js');
const url = new URL('/login', process.env.BENEFIT_BASE_URL || 'https://benefit-uat.aspire.net');
const result = spawnSync(process.execPath, [cli, 'codegen', '--save-storage=auth/state.json', url.href], { stdio: 'inherit' });
process.exit(result.status ?? 1);
