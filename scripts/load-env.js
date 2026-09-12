const fs = require('fs');
const path = require('path');

function loadLocalEnv(projectRoot) {
  const envFile = path.join(projectRoot, '.env.local');
  if (!fs.existsSync(envFile)) return;

  for (const rawLine of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separator = line.indexOf('=');
    if (separator < 1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required. Copy .env.example to .env.local and configure it.`);
  return value;
}

module.exports = { loadLocalEnv, requireEnv };
