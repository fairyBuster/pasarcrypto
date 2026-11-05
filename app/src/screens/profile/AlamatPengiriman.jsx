// alamat-pengiriman — ported from the Figma export, typography re-synced to Figma
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { friendlyError } from '../../lib/auth.jsx';
import { normalizePhone } from '../../lib/phone.js';
import { districts, provinces, regencies, villages } from '../../lib/wilayah.js';
import { t } from '../../lib/i18n.js';
const css = `
/* alamat-pengiriman — ported from Figma export, typography re-synced */
.scr-alamat-pengiriman { background: radial-gradient(circle at 70% 0%, rgba(78, 108, 142, 0.4) 0%, rgba(78, 108, 142, 0) 60%),
    linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-alamat-pengiriman *{
  box-sizing: border-box;
}
.scr-alamat-pengiriman input,
.scr-alamat-pengiriman select,
.scr-alamat-pengiriman textarea,
.scr-alamat-pengiriman button{
  font-family: inherit;
}
.scr-alamat-pengiriman #section-header .header{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px 0;
  gap: 12px;
}
.scr-alamat-pengiriman #section-header .back-btn{
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #1f3048;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}
.scr-alamat-pengiriman #section-header .back-btn img{
  width: 20px;
  height: 20px;
}
.scr-alamat-pengiriman #section-header .title{
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  text-align: center;
  flex: 1;
}
.scr-alamat-pengiriman #section-header .spacer{
  width: 40px;
  height: 40px;
}
.scr-alamat-pengiriman #section-notice .notice-banner{
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 20px 16px 0;
}
.scr-alamat-pengiriman #section-notice .notice-icon{
  padding-top: 2px;
  display: flex;
}
.scr-alamat-pengiriman #section-notice .notice-icon img{
  width: 16px;
  height: 16px;
}
.scr-alamat-pengiriman #section-notice .notice-text{
  color: #a9b7c8;
  font-size: 13px;
  line-height: 1.4;
  margin: 0;
}
.scr-alamat-pengiriman #section-form-fields .form-container{
  padding: 16px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.scr-alamat-pengiriman #section-form-fields .form-group{
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.scr-alamat-pengiriman #section-form-fields .form-label{
  display: flex;
  align-items: center;
  gap: 2px;
  color: #d3dce7;
  font-size: 13px;
  font-weight: 500;
}
.scr-alamat-pengiriman #section-form-fields .required{
  color: #f2667a;
}
.scr-alamat-pengiriman #section-form-fields .optional{
  color: #75879c;
  margin-left: 4px;
  font-weight: 400;
}
.scr-alamat-pengiriman #section-form-fields .input-wrapper{
  background-color: #1f3048;
  border: 1px solid #2f4560;
  border-radius: 14px;
  height: 46px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  position: relative;
  transition: border-color 0.2s;
}
.scr-alamat-pengiriman #section-form-fields .input-wrapper:focus-within{
  border-color: #5a82bf;
}
.scr-alamat-pengiriman #section-form-fields .textarea-wrapper{
  height: 88px;
  align-items: flex-start;
  padding-top: 13px;
  padding-bottom: 13px;
}
.scr-alamat-pengiriman #section-form-fields .form-input,
.scr-alamat-pengiriman #section-form-fields .form-select,
.scr-alamat-pengiriman #section-form-fields .form-textarea{
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 14px;
  width: 100%;
  outline: none;
}
.scr-alamat-pengiriman #section-form-fields .form-input::placeholder,
.scr-alamat-pengiriman #section-form-fields .form-textarea::placeholder{
  color: #75879c;
}
.scr-alamat-pengiriman #section-form-fields .form-select{
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}
.scr-alamat-pengiriman #section-form-fields .form-select:invalid{
  color: #75879c;
}
.scr-alamat-pengiriman #section-form-fields .form-select option{
  color: #0c1a2d;
}
.scr-alamat-pengiriman #section-form-fields .select-wrapper{
  justify-content: space-between;
}
.scr-alamat-pengiriman #section-form-fields .select-icon{
  pointer-events: none;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-left: 8px;
}
.scr-alamat-pengiriman #section-form-fields .form-textarea{
  resize: none;
  height: 100%;
  line-height: 1.4;
}
.scr-alamat-pengiriman #section-form-fields .form-error{
  margin: 0;
  color: #f2667a;
  font-size: 12px;
  line-height: 18px;
}
/* a picker waiting for its parent, or for the list, reads as inactive */
.scr-alamat-pengiriman #section-form-fields .form-select:disabled{
  color: #75879c;
  cursor: default;
}
.scr-alamat-pengiriman #section-form-fields .retry-btn{
  margin-left: 4px;
  padding: 0;
  border: none;
  background: transparent;
  color: #8fb2e8;
  font-size: 12px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}
.scr-alamat-pengiriman #section-preferences .preferences-container{
  padding: 20px 16px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.scr-alamat-pengiriman #section-preferences .toggle-info{
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.scr-alamat-pengiriman #section-preferences .toggle-title{
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}
.scr-alamat-pengiriman #section-preferences .toggle-desc{
  color: #8597ab;
  font-size: 12px;
}
.scr-alamat-pengiriman #section-preferences .toggle-switch{
  position: relative;
  display: inline-block;
  width: 40px;
  height: 24px;
  flex-shrink: 0;
}
.scr-alamat-pengiriman #section-preferences .toggle-input{
  opacity: 0;
  width: 0;
  height: 0;
}
.scr-alamat-pengiriman #section-preferences .toggle-track{
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #1f3048;
  transition: .3s;
  border-radius: 12px;
}
.scr-alamat-pengiriman #section-preferences .toggle-thumb{
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: #8597ab;
  transition: .3s;
  border-radius: 50%;
}
.scr-alamat-pengiriman #section-preferences .toggle-input:checked + .toggle-track{
  background: linear-gradient(90deg, #2c4c80 0%, #5a82bf 100%);
}
.scr-alamat-pengiriman #section-preferences .toggle-input:checked ~ .toggle-thumb{
  background-color: #ffffff;
  transform: translateX(16px);
}
.scr-alamat-pengiriman #section-footer .footer-container{
  padding: 24px 16px 0;
}
.scr-alamat-pengiriman #section-footer .btn-primary{
  width: 100%;
  height: 44px;
  border-radius: 22px;
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
  color: #0c1a2d;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}
.scr-alamat-pengiriman #section-footer .btn-primary:active{
  opacity: 0.8;
}
/* figma re-sync */
.scr-alamat-pengiriman .title.title { font-size: 17px; }
.scr-alamat-pengiriman .title.title { font-weight: 700; }
.scr-alamat-pengiriman .notice-text.notice-text { font-size: 12px; }
.scr-alamat-pengiriman .toggle-title.toggle-title { font-size: 13px; }
.scr-alamat-pengiriman .toggle-title.toggle-title { font-weight: 600; }
.scr-alamat-pengiriman .toggle-desc.toggle-desc { font-size: 11px; }
`;

// the province list is the root of the chain; everything below it waits for a parent
const ROOT = 'root';
const loadProvinces = () => provinces();

// one list per level, refetched only when the level above it changes (or when
// the retry button bumps `attempt`)
function useRegionOptions(load, parentId, attempt) {
  const [options, setOptions] = useState([]);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!parentId) {
      setOptions([]);
      setStatus('idle');
      return undefined;
    }
    let alive = true;
    setStatus('loading');
    load(parentId)
      .then((rows) => {
        if (!alive) return;
        setOptions(rows);
        setStatus('ready');
      })
      .catch(() => {
        if (!alive) return;
        setOptions([]);
        setStatus('error');
      });
    return () => {
      alive = false;
    };
  }, [load, parentId, attempt]);

  return { options, status };
}

// the four pickers share one shape — the placeholder doubles as the progress
// and failure message, and a locked picker says which level to pick first
function RegionField({ label, placeholder, list, value, onChange, waiting }) {
  const status = waiting ? 'waiting' : list.status;
  // a level the dataset has no rows for is reported instead of left blank
  const empty = status === 'ready' && list.options.length === 0;
  const hint = empty
    ? 'Data belum tersedia'
    : {
        loading: 'Memuat…',
        error: 'Gagal memuat data',
        waiting: placeholder,
        ready: placeholder,
      }[status] || placeholder;

  return (
    <div className="form-group">
      <label className="form-label">{label} <span className="required">*</span></label>
      <div className="input-wrapper select-wrapper">
        <select
          className="form-select"
          value={value}
          onChange={onChange}
          disabled={status !== 'ready' || empty}
          aria-busy={status === 'loading'}
        >
          <option value="" disabled hidden>{hint}</option>
          {list.options.map((row) => (
            <option key={row.id} value={row.id}>{row.name}</option>
          ))}
        </select>
        <img src="/assets/img/ec2e9bee09.svg" alt="" className="select-icon" />
      </div>
    </div>
  );
}

export default function AlamatPengiriman() {
  const navigate = useNavigate();
  // a card on the profile names its own record: /profil/alamat?id=7
  const [searchParams] = useSearchParams();
  const requestedId = Number(searchParams.get('id')) || null;
  const [form, setForm] = useState({
    label: '',
    recipient: '',
    phone: '',
    postal: '',
    details: '',
    note: '',
  });
  // the pickers hold the API code plus the name that gets written into the address
  const [region, setRegion] = useState({ province: null, regency: null, district: null, village: null });
  // bumped by "Coba lagi" to re-run a list that failed to load
  const [attempt, setAttempt] = useState(0);
  const [isPrimary, setIsPrimary] = useState(true);
  // an existing primary address turns the screen into an edit form
  const [addressId, setAddressId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const change = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  // each picker feeds the next one: province → regency → district → village
  const provinceList = useRegionOptions(loadProvinces, ROOT, attempt);
  const regencyList = useRegionOptions(regencies, region.province?.id || '', attempt);
  const districtList = useRegionOptions(districts, region.regency?.id || '', attempt);
  const villageList = useRegionOptions(villages, region.district?.id || '', attempt);
  const regionFailed = [provinceList, regencyList, districtList, villageList].some(
    (list) => list.status === 'error',
  );

  // picking a parent clears everything under it — a stale regency would point
  // at a province that is no longer selected
  const choose = (key, options) => (event) => {
    const picked = options.find((row) => row.id === event.target.value) || null;
    setRegion((prev) => {
      const next = { ...prev, [key]: picked };
      if (key === 'province') next.regency = next.district = next.village = null;
      if (key === 'regency') next.district = next.village = null;
      if (key === 'district') next.village = null;
      return next;
    });
    setError('');
  };

  useEffect(() => {
    let alive = true;

    // the API stores one free-text block, so a saved address is read back the
    // way this form writes it: [label], street, village, district, regency,
    // province, postal, Catatan: …
    const restore = async (text) => {
      const parts = text.split(',').map((part) => part.trim()).filter(Boolean);
      const pick = (rows) => rows.find((row) => parts.includes(row.name)) || null;

      const province = pick(await provinces());
      if (!province) return null;
      const regency = pick(await regencies(province.id));
      if (!regency) return null;
      const district = pick(await districts(regency.id));
      if (!district) return null;
      const village = pick(await villages(district.id));

      const known = new Set([village?.name, district.name, regency.name, province.name]);
      const street = [];
      let label = '';
      let postal = '';
      let note = '';
      parts.forEach((part) => {
        if (/^\[.*\]$/.test(part)) label = part.slice(1, -1);
        else if (part.startsWith('Catatan:')) note = part.replace(/^Catatan:\s*/, '');
        else if (/^\d{5}$/.test(part)) postal = part;
        else if (!known.has(part)) street.push(part);
      });

      return {
        region: { province, regency, district, village },
        patch: { label, postal, note, details: street.join(', ') },
      };
    };

    api.addresses()
      .then(async (res) => {
        if (!alive || !res.ok) return;
        const rows = Array.isArray(res.data?.results) ? res.data.results : [];
        const current =
          rows.find((row) => row.id === requestedId) ||
          rows.find((row) => row.is_primary) ||
          rows[0];
        if (!current) return;
        setAddressId(current.id);
        setIsPrimary(Boolean(current.is_primary));

        const text = current.address_details || '';
        let restored = null;
        try {
          restored = await restore(text);
        } catch {
          // an address from before the pickers simply keeps its plain text
        }
        if (!alive) return;

        setForm((prev) => ({
          ...prev,
          ...(restored ? restored.patch : { details: text }),
          recipient: current.recipient_name || '',
          phone: current.phone_number || '',
        }));
        if (restored) setRegion(restored.region);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [requestedId]);

  const submit = async (event) => {
    event.stopPropagation();
    if (busy) return;
    const recipient = form.recipient.trim();
    const phone = normalizePhone(form.phone);
    const details = form.details.trim();
    if (!recipient) {
      setError('Nama penerima wajib diisi.');
      return;
    }
    if (!phone) {
      setError('Nomor HP penerima wajib diisi.');
      return;
    }
    if (!details) {
      setError('Alamat lengkap wajib diisi.');
      return;
    }
    const regionNames = [
      region.village?.name,
      region.district?.name,
      region.regency?.name,
      region.province?.name,
    ];
    // the village level is optional only when the dataset has no rows for it
    const villageRequired = villageList.options.length > 0;
    const missingRegion = regionNames
      .slice(villageRequired ? 0 : 1)
      .some((name) => !name);
    if (missingRegion) {
      setError(
        villageRequired
          ? 'Lengkapi provinsi, kota, kecamatan, dan kelurahan.'
          : 'Lengkapi provinsi, kota, dan kecamatan.',
      );
      return;
    }

    // the API keeps a single free-text block, so the parts the design splits
    // out are folded into it in the order they are read on screen
    const addressDetails = [
      form.label.trim() ? `[${form.label.trim()}]` : '',
      details,
      ...regionNames,
      form.postal.trim(),
      form.note.trim() ? `Catatan: ${form.note.trim()}` : '',
    ]
      .filter(Boolean)
      .join(', ');

    const payload = {
      recipient_name: recipient,
      phone_number: phone,
      address_details: addressDetails,
      is_primary: isPrimary,
    };

    setBusy(true);
    setError('');
    try {
      const res = addressId
        ? await api.updateAddress(addressId, payload)
        : await api.createAddress(payload);
      if (!res.ok) {
        setError(friendlyError(res.data, 'Gagal menyimpan alamat.'));
        return;
      }
      navigate(-1);
    } catch {
      setError('Gagal menyimpan alamat, coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="scr-alamat-pengiriman">
      <style>{css}</style>
      <section id="section-header">
        <header className="header">
          <button className="back-btn" aria-label={t('Back')} data-back="1">
            <img src="/assets/img/7861050aa5.svg" alt="" />
          </button>
          <h1 className="title">{t('Alamat Pengiriman')}</h1>
          <div className="spacer"></div>
        </header>
      </section>
      <section id="section-notice">
        <div className="notice-banner">
          <div className="notice-icon">
            <img src="/assets/img/0d349fa22f.svg" alt="Info" />
          </div>
          <p className="notice-text">{t('Pastikan alamat sudah benar agar hadiah barang kamu terkirim tanpa kendala.')}</p>
        </div>
      </section>
      <section id="section-form-fields">
        <div className="form-container">
          <div className="form-group">
            <label className="form-label">{t('Label alamat')} <span className="required">*</span></label>
            <div className="input-wrapper">
              <input
                type="text"
                className="form-input"
                placeholder={t('Contoh: Rumah, Kantor')}
                value={form.label}
                onChange={change('label')}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">{t('Nama penerima')} <span className="required">*</span></label>
            <div className="input-wrapper">
              <input
                type="text"
                className="form-input"
                placeholder={t('Masukkan nama lengkap penerima')}
                value={form.recipient}
                onChange={change('recipient')}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">{t('Nomor HP penerima')} <span className="required">*</span></label>
            <div className="input-wrapper">
              <input
                type="tel"
                className="form-input"
                placeholder={t('Contoh: 0812 3456 7890')}
                value={form.phone}
                onChange={change('phone')}
              />
            </div>
          </div>
          
          <RegionField
            label="Provinsi"
            placeholder={t('Pilih provinsi')}
            list={provinceList}
            value={region.province?.id || ''}
            onChange={choose('province', provinceList.options)}
          />
          
          <RegionField
            label="Kota / Kabupaten"
            placeholder={region.province ? 'Pilih kota atau kabupaten' : 'Pilih provinsi dulu'}
            list={regencyList}
            value={region.regency?.id || ''}
            onChange={choose('regency', regencyList.options)}
            waiting={!region.province}
          />
          
          <RegionField
            label="Kecamatan"
            placeholder={region.regency ? 'Pilih kecamatan' : 'Pilih kota atau kabupaten dulu'}
            list={districtList}
            value={region.district?.id || ''}
            onChange={choose('district', districtList.options)}
            waiting={!region.regency}
          />
          
          <RegionField
            label="Kelurahan / Desa"
            placeholder={region.district ? 'Pilih kelurahan atau desa' : 'Pilih kecamatan dulu'}
            list={villageList}
            value={region.village?.id || ''}
            onChange={choose('village', villageList.options)}
            waiting={!region.district}
          />
          
          <div className="form-group">
            <label className="form-label">{t('Kode pos')} <span className="required">*</span></label>
            <div className="input-wrapper">
              <input
                type="text"
                className="form-input"
                placeholder={t('Masukkan kode pos')}
                value={form.postal}
                onChange={change('postal')}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">{t('Alamat lengkap')} <span className="required">*</span></label>
            <div className="input-wrapper textarea-wrapper">
              <textarea
                className="form-textarea"
                placeholder={t('Nama jalan, nomor rumah, RT/RW, gedung, lantai')}
                value={form.details}
                onChange={change('details')}
              ></textarea>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">{t('Catatan untuk kurir')} <span className="optional">(opsional)</span></label>
            <div className="input-wrapper">
              <input
                type="text"
                className="form-input"
                placeholder={t('Contoh: warna pagar, patokan rumah')}
                value={form.note}
                onChange={change('note')}
              />
            </div>
          </div>
          {regionFailed && (
            <p className="form-error">
              {t('Gagal memuat data wilayah.')}
              <button type="button" className="retry-btn" onClick={() => setAttempt((n) => n + 1)}>
                {t('Coba lagi')}
              </button>
            </p>
          )}
          {error && <p className="form-error">{error}</p>}
        </div>
      </section>
      <section id="section-preferences">
        <div className="preferences-container">
          <div className="toggle-info">
            <div className="toggle-title">{t('Jadikan alamat utama')}</div>
            <div className="toggle-desc">{t('Hadiah akan dikirim ke alamat ini')}</div>
          </div>
          <label className="toggle-switch" onClick={(event) => event.stopPropagation()}>
            <input
              type="checkbox"
              className="toggle-input"
              checked={isPrimary}
              onChange={(event) => setIsPrimary(event.target.checked)}
            />
            <span className="toggle-track"></span>
            <span className="toggle-thumb"></span>
          </label>
        </div>
      </section>
      <section id="section-footer">
        <div className="footer-container">
          <button className="btn-primary" onClick={submit} disabled={busy}>
            {busy ? 'Menyimpan…' : 'Simpan Alamat'}
          </button>
        </div>
      </section>
    </div>
  );
}
