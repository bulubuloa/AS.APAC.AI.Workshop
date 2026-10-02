// Runs a demo SQL script against the RSA UAT database with sqlcmd. Credentials: demo-data/.db.env (git-ignored).
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '.db.env'), 'utf8').split(/\r?\n/).filter((l) => l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
);
const sqlcmd = process.env.SQLCMD || 'C:/Program Files/Microsoft SQL Server/Client SDK/ODBC/170/Tools/Binn/sqlcmd.exe';
const file = path.join(__dirname, process.argv[2]);
const out = execFileSync(sqlcmd, ['-S', env.RSA_DB_SERVER, '-d', env.RSA_DB_NAME, '-U', env.RSA_DB_USER, '-P', env.RSA_DB_PASS,
  '-b', '-W', '-s', ' | ', '-i', file], { encoding: 'utf8' });
console.log(out);
