// probe the live API for the product golongan values
const SALT = 'KXXADFDFDF';
const decode = (d) => {
  const reversed = [...d].reverse().join('');
  const b64 = reversed.endsWith(SALT) ? reversed.slice(0, -SALT.length) : reversed;
  const bin = Buffer.from(b64, 'base64').toString('utf8');
  return JSON.parse(bin);
};

(async () => {
  const r = await fetch('http://localhost:8000/api/products/');
  const text = await r.text();
  console.log('status', r.status, 'raw head:', text.slice(0, 120));
  const j = JSON.parse(text);
  const payload = typeof j.data === 'string' ? decode(j.data) : j;
  const rows = payload.results || payload;
  console.log('count:', Array.isArray(rows) ? rows.length : 'n/a');
  if (Array.isArray(rows) && rows.length) {
    console.log('golongan:', [...new Set(rows.map((p) => p.golongan))]);
    console.log('sample:', JSON.stringify(rows[0]).slice(0, 300));
  }
})().catch((e) => console.log('fail', e.message));
