// buat-postingan — ported from the Figma export, typography re-synced to Figma
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAuth, friendlyError } from '../../lib/auth.jsx';
import { t } from '../../lib/i18n.js';

const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const css = `
/* buat-postingan — ported from Figma export, typography re-synced */
.scr-buat-postingan *{
  box-sizing: border-box;
}
.scr-buat-postingan .create-post-container{
    max-width: 412px;
    margin: 0 auto;
    background: linear-gradient(180deg, #0C1A2D 0%, #13263D 30%, #0F2036 70%, #0A1626 100%);
    background-color: #0C1A2D; 
    min-height: 100cqh;
    color: #FFFFFF;
    display: flex;
    flex-direction: column;
  }
.scr-buat-postingan .post-header{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 16px 0;
    gap: 12px;
  }
.scr-buat-postingan .back-button{
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #1f3048;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    cursor: pointer;
  }
.scr-buat-postingan .back-button img{
    width: 20px;
    height: 20px;
  }
.scr-buat-postingan .header-title{
    font-size: 20px;
    font-weight: 700;
    margin: 0;
    line-height: 24px;
    text-align: center;
  }
.scr-buat-postingan .header-placeholder{
    width: 40px;
    height: 40px;
  }
.scr-buat-postingan .post-main-content{
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }
.scr-buat-postingan .post-form{
    padding: 0 16px;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
.scr-buat-postingan .user-info{
    display: flex;
    align-items: center;
    gap: 10px;
    padding-top: 22px;
  }
.scr-buat-postingan .user-avatar{
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
  }
.scr-buat-postingan .user-details{
    display: flex;
    flex-direction: column;
  }
.scr-buat-postingan .user-details p{
    margin: 0;
  }
.scr-buat-postingan .username{
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
  }
.scr-buat-postingan .user-subtext{
    font-size: 11px;
    color: #75879c;
  }
.scr-buat-postingan .form-group{
    padding-top: 20px;
  }
.scr-buat-postingan .title-input{
    width: 100%;
    background-color: transparent;
    border: none;
    border-bottom: 1px solid #22344b;
    padding-bottom: 12px;
    font-size: 21px;
    color: #ffffff;
    font-family: 'Inter', sans-serif;
  }
.scr-buat-postingan .title-input::placeholder{
    color: #51657e;
  }
.scr-buat-postingan .title-input:focus{
    outline: none;
  }
.scr-buat-postingan .content-editor-wrapper{
    padding-top: 14px;
  }
.scr-buat-postingan .content-editor{
    display: flex;
    gap: 8px;
  }
.scr-buat-postingan .editor-line{
    width: 2px;
    height: 20px;
    background-color: #c9d4e1;
    flex-shrink: 0;
  }
.scr-buat-postingan .content-textarea{
    flex-grow: 1;
    background-color: transparent;
    border: none;
    resize: none;
    color: #ffffff;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    height: 128px;
  }
.scr-buat-postingan .content-textarea::placeholder{
    color: #75879c;
  }
.scr-buat-postingan .content-textarea:focus{
    outline: none;
  }
.scr-buat-postingan .editor-info{
    display: flex;
    justify-content: space-between;
    padding-top: 4px;
    font-size: 11px;
    color: #75879c;
  }
.scr-buat-postingan .image-upload-section{
    padding-top: 24px;
  }
.scr-buat-postingan .image-upload-header{
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
.scr-buat-postingan .image-label{
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
  }
.scr-buat-postingan .image-limit{
    font-size: 11px;
    color: #75879c;
  }
.scr-buat-postingan .upload-box{
    width: 76px;
    height: 76px;
    border: 1px solid #51657e;
    border-radius: 12px;
    background-color: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    margin-top: 10px;
    cursor: pointer;
    padding: 0;
  }
.scr-buat-postingan .upload-box img{
    width: 20px;
    height: 20px;
  }
.scr-buat-postingan .upload-text{
    font-size: 10px;
    color: #8597ab;
  }
.scr-buat-postingan .reward-info{
    padding-top: 15px;
    margin-top: 26px;
    border-top: 1px solid rgba(201, 212, 225, 0.18);
  }
.scr-buat-postingan .reward-info p{
    margin: 0;
    font-size: 12px;
    color: #ffffff;
  }
.scr-buat-postingan .form-group-submit{
    padding-top: 20px;
  }
.scr-buat-postingan .submit-btn{
    width: 100%;
    height: 44px;
    border-radius: 22px;
    border: none;
    background: linear-gradient(180deg, #F5F8FA 0%, #C9D4E1 100%);
    color: #0c1a2d;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  }
.scr-buat-postingan .notes-section{
    padding: 22px 16px 28px;
  }
.scr-buat-postingan .notes-title{
    font-size: 15px;
    font-weight: 400;
    color: #a9b7c8;
    margin: 0 0 6px 0;
  }
.scr-buat-postingan .notes-list{
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
.scr-buat-postingan .notes-list li{
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }
.scr-buat-postingan .notes-list p{
    margin: 0;
    font-size: 12px;
    line-height: 1.5;
    color: #75879c;
  }
.scr-buat-postingan .note-bullet{
    width: 6px;
    height: 6px;
    background-color: #51657e;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 6px;
  }
/* figma re-sync */
.scr-buat-postingan .header-title.header-title { font-size: 17px; }
.scr-buat-postingan .username.username { font-size: 14px; }
.scr-buat-postingan .username.username { font-weight: 600; }
.scr-buat-postingan .image-label.image-label { font-size: 14px; }
.scr-buat-postingan .image-label.image-label { font-weight: 600; }
.scr-buat-postingan .submit-btn.submit-btn { font-weight: 600; }
.scr-buat-postingan .notes-title.notes-title { font-size: 12px; }
.scr-buat-postingan .notes-title.notes-title { font-weight: 600; }
/* the Figma frame has no image previews or states */
.scr-buat-postingan .upload-row{ display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.scr-buat-postingan .upload-row .upload-box{ margin-top: 0; }
.scr-buat-postingan .upload-preview{ position: relative; width: 76px; height: 76px; border: 1px solid #22344b; border-radius: 12px; overflow: hidden; }
.scr-buat-postingan .upload-preview img{ width: 100%; height: 100%; object-fit: cover; display: block; }
.scr-buat-postingan .upload-remove{ position: absolute; top: 3px; right: 3px; width: 20px; height: 20px; border-radius: 50%; border: none; background: rgba(12, 26, 45, 0.8); color: #ffffff; font-size: 13px; line-height: 20px; text-align: center; padding: 0; cursor: pointer; }
.scr-buat-postingan .form-error{ margin-top: 10px; font-size: 12px; line-height: 18px; color: #ff9b9b; }
.scr-buat-postingan .form-notice{ margin-top: 10px; font-size: 12px; line-height: 18px; color: #8fd4a8; }
.scr-buat-postingan .submit-btn:disabled{ opacity: 0.6; cursor: default; }
`;

export default function BuatPostingan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // the API takes 1-5 screenshots, so the previews are mandatory here too
  const pickImages = (event) => {
    const picked = Array.from(event.target.files || []);
    event.target.value = '';
    if (!picked.length) return;
    const accepted = [];
    let problem = '';
    for (const file of picked) {
      if (images.length + accepted.length >= MAX_IMAGES) {
        problem = `Maksimal ${MAX_IMAGES} gambar.`;
        break;
      }
      if (!IMAGE_TYPES.includes(file.type)) {
        problem = `Format ${file.name} tidak didukung. Pakai JPG, PNG, atau WEBP.`;
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        problem = `${file.name} melebihi 1MB.`;
        continue;
      }
      accepted.push({ file, url: URL.createObjectURL(file) });
    }
    if (accepted.length) setImages((prev) => [...prev, ...accepted]);
    setError(problem);
    setNotice('');
  };

  const removeImage = (url) => {
    URL.revokeObjectURL(url);
    setImages((prev) => prev.filter((image) => image.url !== url));
    setError('');
  };

  // title and body collapse into the single text field the API expects
  const submit = (event) => {
    event.preventDefault();
    if (busy) return;
    // every field is mandatory: an empty title, caption, or missing screenshot
    // blocks the upload with a message naming what is missing
    setNotice('');
    if (!title.trim()) {
      setError('Judul wajib diisi.');
      return;
    }
    if (!body.trim()) {
      setError('Isi postingan wajib diisi.');
      return;
    }
    if (images.length === 0) {
      setError('Unggah minimal 1 gambar.');
      return;
    }
    const text = `${title.trim()}\n\n${body.trim()}`;
    setError('');
    setBusy(true);
    const form = new FormData();
    form.append('text', text);
    // the API still requires 1-5 stars, but the frame has no rating control,
    // so a fixed value is sent
    form.append('rating', '5');
    images.forEach((image) => form.append('images', image.file));
    api.createReview(form)
      .then((res) => {
        if (!res.ok) {
          setError(friendlyError(res.data, 'Gagal mengirim postingan.'));
          return;
        }
        images.forEach((image) => URL.revokeObjectURL(image.url));
        // the upload is done: land back on the feed list
        navigate('/feed');
      })
      .catch(() => setError('Gagal mengirim postingan.'))
      .finally(() => setBusy(false));
  };

  return (
    <div className="scr-buat-postingan">
      <style>{css}</style>
      <section id="create-post">
        <div className="create-post-container">
          <header className="post-header">
            <button className="back-button" data-back="1">
              <img src="/assets/img/f77e40de90.svg" alt="Back" />
            </button>
            <h1 className="header-title">{t('Buat Postingan')}</h1>
            <div className="header-placeholder"></div>
          </header>
      
          <main className="post-main-content">
            <form className="post-form" onSubmit={submit}>
              <div className="user-info">
                <img src="/assets/img/baa3015660.png" alt="Username avatar" className="user-avatar" />
                <div className="user-details">
                  <p className="username">{user?.username || 'Username'}</p>
                  <p className="user-subtext">{t('Postingan tampil di Feed setelah disetujui')}</p>
                </div>
              </div>
      
              <div className="form-group">
                <input
                  type="text"
                  className="title-input"
                  placeholder={t('Judul')}
                  maxLength={100}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>
      
              <div className="form-group content-editor-wrapper">
                <div className="content-editor">
                  <div className="editor-line"></div>
                  <textarea
                    className="content-textarea"
                    placeholder={t('Tulis berita atau pendapatmu…')}
                    maxLength={1000}
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                  ></textarea>
                </div>
                <div className="editor-info">
                  <span>{t('Ketik $ untuk menyebut koin, contoh $BTCUSDT')}</span>
                  <span>{body.length}/1000</span>
                </div>
              </div>

              <div className="form-group image-upload-section">
                <div className="image-upload-header">
                  <label className="image-label">{t('Gambar')}</label>
                  <span className="image-limit">{t('Maks. 4 gambar')}</span>
                </div>
                <div className="upload-row">
                  {images.map((image) => (
                    <div className="upload-preview" key={image.url}>
                      <img src={image.url} alt="Pratinjau gambar" />
                      <button
                        type="button"
                        className="upload-remove"
                        aria-label={t('Hapus gambar')}
                        onClick={(event) => {
                          event.stopPropagation();
                          removeImage(image.url);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {images.length < MAX_IMAGES && (
                    <button
                      type="button"
                      className="upload-box"
                      onClick={(event) => {
                        event.stopPropagation();
                        fileRef.current?.click();
                      }}
                    >
                      <img src="/assets/img/fa705916b9.svg" alt="Add image icon" />
                      <span className="upload-text">{t('Tambah')}</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  hidden
                  onChange={pickImages}
                />
              </div>
      
              <div className="reward-info">
                <p>{t('Dapat +1000 IDR setelah postingan tayang')}</p>
              </div>
      
              {error && <p className="form-error">{error}</p>}
              {notice && <p className="form-notice">{notice}</p>}

              <div className="form-group-submit">
                  <button
                      type="submit"
                      className="submit-btn"
                      disabled={busy}
                      // the shell cancels unhandled button clicks, which would swallow the submit
                      onClick={(event) => event.stopPropagation()}
                  >
                      {busy ? 'Mengirim…' : 'Posting'}
                  </button>
              </div>
            </form>
      
            <footer className="notes-section">
              <h3 className="notes-title">{t('Catatan')}</h3>
              <ul className="notes-list">
                <li>
                  <div className="note-bullet"></div>
                  <p>{t('Postingan akan ditinjau oleh tim sebelum ditampilkan di Feed.')}</p>
                </li>
                <li>
                  <div className="note-bullet"></div>
                  <p>{t('Bonus 1.000 IDR diberikan setelah postingan disetujui dan berhasil ditayangkan.')}</p>
                </li>
              </ul>
            </footer>
          </main>
        </div>
      </section>
    </div>
  );
}
