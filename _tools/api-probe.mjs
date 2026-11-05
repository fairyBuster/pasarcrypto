// Temporary probe: fetches an API path and decodes the SaltedBase64Reverse envelope.
import fs from 'node:fs';

const BASE = 'http://localhost:8000';
const SALT = 'KXXADFDFDF';

const decode = (s) => {
  const rev = [...s].reverse().join('');
  const b64 = SALT && rev.endsWith(SALT) ? rev.slice(0, -SALT.length) : rev;
  return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
};

const path = process.argv[2];
const method = process.argv[3] || 'GET';
const bodyFile = process.argv[4];

const init = { method, headers: {} };
if (bodyFile) {
  init.headers['Content-Type'] = 'application/json';
  init.body = fs.readFileSync(bodyFile, 'utf8');
}

const res = await fetch(BASE + path, init);
const text = await res.text();
let body;
try {
  const parsed = JSON.parse(text);
  body = parsed && typeof parsed.data === 'string' ? decode(parsed.data) : parsed;
} catch {
  body = text;
}
console.log('HTTP', res.status);
console.log(JSON.stringify(body, null, 1).slice(0, 1200));
