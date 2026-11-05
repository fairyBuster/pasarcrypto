// Indonesian administrative regions — province → regency → district → village —
// read from the free, key-less wilayah.id dataset (Kepmendagri codes, 38
// provinces). The dev/preview proxy in vite.config.js keeps the browser on one
// origin, exactly like /cg and /fng.
const ENDPOINT = '/wilayah';

// one request per level, kept for the session: walking back up the pickers
// should not refetch a list that is already known
const cache = new Map();

const read = (body) => {
  const rows = Array.isArray(body?.data) ? body.data : [];
  return rows.map((row) => ({ id: row.code, name: row.name }));
};

const load = (path) => {
  if (!cache.has(path)) {
    const task = fetch(`${ENDPOINT}/${path}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`wilayah ${res.status}`))))
      .then(read)
      .catch((error) => {
        // a failed list must not be remembered as empty — the retry button
        // would then keep showing nothing
        cache.delete(path);
        throw error;
      });
    cache.set(path, task);
  }
  return cache.get(path);
};

export const provinces = () => load('provinces.json');
export const regencies = (provinceId) => load(`regencies/${provinceId}.json`);
export const districts = (regencyId) => load(`districts/${regencyId}.json`);
export const villages = (districtId) => load(`villages/${districtId}.json`);
