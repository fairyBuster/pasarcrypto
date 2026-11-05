// profil-saya-2 — ported from the Figma export, typography re-synced to Figma
// import { useEffect, useState } from 'react';
// import ProfilEditForm from '../../components/ProfilEditForm.jsx';
// import { api } from '../../lib/api.js';
// import { useAuth } from '../../lib/auth.jsx';
// import { dateID, maskEmail, maskName, maskPhone } from '../../lib/format.js';
// const css = `
// /* profil-saya-2 — ported from Figma export, typography re-synced */
// .scr-profil-saya-2 { background: radial-gradient(100% 100% at 50% 0%, rgba(78, 108, 142, 0.3) 0%, rgba(78, 108, 142, 0) 100%), linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
// .scr-profil-saya-2 *{
//   box-sizing: border-box;
// }
// .scr-profil-saya-2 p,
// .scr-profil-saya-2 h1,
// .scr-profil-saya-2 h2,
// .scr-profil-saya-2 h3,
// .scr-profil-saya-2 h4,
// .scr-profil-saya-2 h5,
// .scr-profil-saya-2 h6{
//   margin: 0;
// }
// .scr-profil-saya-2 a{
//   text-decoration: none;
// }
// .scr-profil-saya-2 button{
//   background: none;
//   border: none;
//   padding: 0;
//   cursor: pointer;
//   font-family: inherit;
// }
// .scr-profil-saya-2 .section-container{
//   max-width: 412px;
//   margin: 0 auto;
//   width: 100%;
// }
// .scr-profil-saya-2 .top-header{
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//     padding: 20px 16px 12px 16px;
//   }
// .scr-profil-saya-2 .btn-back{
//     width: 40px;
//     height: 40px;
//     border-radius: 20px;
//     background-color: #1f3048;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     transition: opacity 0.2s;
//   }
// .scr-profil-saya-2 .btn-back:active{
//     opacity: 0.7;
//   }
// .scr-profil-saya-2 .header-title{
//     font-size: 16px;
//     font-weight: 600;
//     color: #ffffff;
//   }
// .scr-profil-saya-2 .header-spacer{
//     width: 40px;
//   }
// .scr-profil-saya-2 .profile-wrapper{
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     padding: 24px 16px 32px 16px;
//   }
// .scr-profil-saya-2 .avatar-container{
//     position: relative;
//     width: 92px;
//     height: 92px;
//     margin-bottom: 16px;
//   }
// .scr-profil-saya-2 .avatar-img{
//     width: 100%;
//     height: 100%;
//     border-radius: 50%;
//     object-fit: cover;
//   }
// .scr-profil-saya-2 .edit-badge{
//     position: absolute;
//     bottom: 0;
//     right: -4px;
//     width: 32px;
//     height: 32px;
//     border-radius: 16px;
//     background: linear-gradient(135deg, #f5f8fb 0%, #c9d4e1 100%);
//     border: 3px solid #13263d;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     box-sizing: border-box;
//     box-shadow: 0 2px 4px rgba(0,0,0,0.2);
//   }
// .scr-profil-saya-2 .btn-change-photo{
//     color: #c9d4e1;
//     font-size: 14px;
//     font-weight: 500;
//   }
// .scr-profil-saya-2 .account-data-wrapper{
//     padding: 8px 16px 24px 16px;
//   }
// .scr-profil-saya-2 .section-title{
//     font-size: 16px;
//     font-weight: 600;
//     color: #ffffff;
//     margin-bottom: 12px;
//   }
// .scr-profil-saya-2 .section-head{
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//     gap: 12px;
//     margin-bottom: 12px;
//   }
// .scr-profil-saya-2 .section-head .section-title{
//     margin-bottom: 0;
//   }
// .scr-profil-saya-2 .data-list{
//     display: flex;
//     flex-direction: column;
//   }
// .scr-profil-saya-2 .data-row{
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     padding: 16px 0;
//     border-bottom: 1px solid #1c2d44;
//   }
// .scr-profil-saya-2 .data-row.no-border{
//     border-bottom: none;
//   }
// .scr-profil-saya-2 .data-row.link{
//     cursor: pointer;
//   }
// .scr-profil-saya-2 .data-label{
//     font-size: 14px;
//     color: #8597ab;
//   }
// .scr-profil-saya-2 .data-value-group{
//     display: flex;
//     align-items: center;
//     gap: 8px;
//   }
// .scr-profil-saya-2 .data-value{
//     font-size: 14px;
//     color: #ffffff;
//     font-weight: 500;
//   }
// .scr-profil-saya-2 .icon-small{
//     width: 16px;
//     height: 16px;
//   }
// .scr-profil-saya-2 .rank-badge{
//     display: flex;
//     align-items: center;
//     gap: 4px;
//     background: linear-gradient(90deg, #ffe7a3 0%, #d9a93f 100%);
//     padding: 2px 8px;
//     border-radius: 12px;
//     height: 24px;
//   }
// .scr-profil-saya-2 .icon-crown{
//     width: 12px;
//     height: 12px;
//   }
// .scr-profil-saya-2 .rank-text{
//     font-size: 12px;
//     font-weight: 700;
//     color: #0c1a2d;
//   }
// .scr-profil-saya-2 .shipping-wrapper{
//     padding: 0 16px 40px 16px;
//   }
// .scr-profil-saya-2 .section-desc{
//     font-size: 13px;
//     color: #8597ab;
//     line-height: 1.4;
//     margin-bottom: 16px;
//   }
// .scr-profil-saya-2 .address-card{
//     background-color: rgba(31, 48, 72, 0.55);
//     border: 1px solid #2a3d56;
//     border-radius: 16px;
//     padding: 16px;
//     margin-bottom: 16px;
//     display: flex;
//     flex-direction: column;
//     gap: 8px;
//   }
// .scr-profil-saya-2 .card-header{
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     margin-bottom: 4px;
//   }
// .scr-profil-saya-2 .card-title-group{
//     display: flex;
//     align-items: center;
//     gap: 8px;
//   }
// .scr-profil-saya-2 .card-title{
//     font-size: 15px;
//     font-weight: 600;
//     color: #ffffff;
//   }
// .scr-profil-saya-2 .badge-utama{
//     background-color: rgba(62, 207, 142, 0.15);
//     color: #3ecf8e;
//     font-size: 11px;
//     font-weight: 600;
//     padding: 2px 8px;
//     border-radius: 10px;
//   }
// .scr-profil-saya-2 .btn-ubah{
//     color: #c9d4e1;
//     font-size: 13px;
//     font-weight: 500;
//   }
// .scr-profil-saya-2 .card-contact{
//     font-size: 13px;
//     color: #a9b7c8;
//   }
// .scr-profil-saya-2 .card-address{
//     font-size: 13px;
//     color: #d3dce7;
//     line-height: 1.5;
//   }
// .scr-profil-saya-2 .card-note{
//     display: flex;
//     align-items: flex-start;
//     gap: 6px;
//     margin-top: 4px;
//   }
// .scr-profil-saya-2 .icon-note{
//     width: 14px;
//     height: 14px;
//     margin-top: 2px;
//   }
// .scr-profil-saya-2 .note-text{
//     font-size: 13px;
//     color: #8597ab;
//   }
// .scr-profil-saya-2 .btn-add-address{
//     width: 100%;
//     height: 48px;
//     border: 1px dashed #51657e;
//     border-radius: 14px;
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     gap: 8px;
//     color: #c9d4e1;
//     font-size: 14px;
//     font-weight: 500;
//     background-color: transparent;
//     transition: background-color 0.2s;
//   }
// .scr-profil-saya-2 .btn-add-address:hover{
//     background-color: rgba(81, 101, 126, 0.1);
//   }
// /* figma re-sync */
// .scr-profil-saya-2 .header-title.header-title { font-size: 17px; }
// .scr-profil-saya-2 .header-title.header-title { font-weight: 700; }
// .scr-profil-saya-2 .btn-change-photo.btn-change-photo { font-size: 12px; }
// .scr-profil-saya-2 .btn-change-photo.btn-change-photo { font-weight: 600; }
// .scr-profil-saya-2 .section-title.section-title { font-size: 15px; }
// .scr-profil-saya-2 .section-title.section-title { font-weight: 700; }
// .scr-profil-saya-2 .data-label.data-label { font-size: 13px; }
// .scr-profil-saya-2 .data-value.data-value { font-size: 13px; }
// .scr-profil-saya-2 .data-value.data-value { font-weight: 600; }
// .scr-profil-saya-2 .data-value.data-value { color: #8597AB; }
// .scr-profil-saya-2 .rank-text.rank-text { font-size: 11px; }
// .scr-profil-saya-2 .section-desc.section-desc { font-size: 12px; }
// .scr-profil-saya-2 .card-title.card-title { font-size: 14px; }
// .scr-profil-saya-2 .badge-utama.badge-utama { font-size: 10px; }
// .scr-profil-saya-2 .btn-ubah.btn-ubah { font-size: 12px; }
// .scr-profil-saya-2 .btn-ubah.btn-ubah { font-weight: 600; }
// .scr-profil-saya-2 .card-contact.card-contact { font-size: 12px; }
// .scr-profil-saya-2 .card-address.card-address { font-size: 12px; }
// .scr-profil-saya-2 .card-address.card-address { line-height: 18px; }
// .scr-profil-saya-2 .note-text.note-text { font-size: 11px; }
// `;

// export default function ProfilSaya2() {
//   // the whole object comes from /api/auth/account-info/, hydrated by AuthProvider
//   const { user } = useAuth();
//   // the edit state swaps the read-only rows for the PUT form
//   const [editing, setEditing] = useState(false);
//   // the rank row names the current rank, which only rank-status carries
//   const [rankTitle, setRankTitle] = useState('');
//   useEffect(() => {
//     let alive = true;
//     api.rankStatus()
//       .then((res) => {
//         if (alive && res.ok) setRankTitle(res.data?.current_title || '');
//       })
//       .catch(() => {});
//     return () => {
//       alive = false;
//     };
//   }, []);
//   return (
//     <div className="scr-profil-saya-2">
//       <style>{css}</style>
//       <section id="section-header">
//         <div className="section-container">
//           <header className="top-header">
//             <button className="btn-back" aria-label={t('Go back')} data-back="1">
//               <img src="/assets/img/e4afe024ef.svg" alt="" />
//             </button>
//             <h1 className="header-title">{t('Profil Saya')}</h1>
//             <div className="header-spacer"></div>
//           </header>
//         </div>
//       </section>
//       <section id="section-profile">
//         <div className="section-container">
//           <div className="profile-wrapper">
//             <div className="avatar-container">
//               <img src="/assets/img/d27c34de05.png" alt="Profile Picture" className="avatar-img" />
//               <div className="edit-badge">
//                 <img src="/assets/img/46c0acace0.svg" alt="Edit Icon" />
//               </div>
//             </div>
//             <button className="btn-change-photo">{t('Ubah foto profil')}</button>
//           </div>
//         </div>
//       </section>
//       <section id="section-account-data">
//         <div className="section-container">
//           <div className="account-data-wrapper">
//             <div className="section-head">
//               <h2 className="section-title">{t('Data Akun')}</h2>
//               {!editing && (
//                 <button
//                   type="button"
//                   className="btn-ubah"
//                   onClick={(event) => {
//                     event.stopPropagation();
//                     setEditing(true);
//                   }}
//                 >
//                   Ubah
//                 </button>
//               )}
//             </div>

//             {editing ? (
//               <ProfilEditForm onCancel={() => setEditing(false)} onSaved={() => setEditing(false)} />
//             ) : (
//             <div className="data-list">
//               <div className="data-row">
//                 <span className="data-label">{t('Username')}</span>
//                 <div className="data-value-group">
//                   <span className="data-value">{user?.username || user?.full_name || '—'}</span>
//                   <img src="/assets/img/441db9d196.svg" alt="Lock" className="icon-small" />
//                 </div>
//               </div>
              
//               <div className="data-row">
//                 <span className="data-label">{t('ID Pengguna')}</span>
//                 <div className="data-value-group">
//                   <span className="data-value">{user?.referral_code || '—'}</span>
//                   <img src="/assets/img/e24efab7ad.svg" alt="Copy" className="icon-small" />
//                 </div>
//               </div>
              
//               <div className="data-row">
//                 <span className="data-label">{t('Nomor HP')}</span>
//                 <div className="data-value-group">
//                   <span className="data-value">{maskPhone(user?.phone)}</span>
//                   <img src="/assets/img/8602b31a6d.svg" alt="Arrow Right" className="icon-small" />
//                 </div>
//               </div>
              
//               <div className="data-row">
//                 <span className="data-label">{t('Email')}</span>
//                 <div className="data-value-group">
//                   <span className="data-value">{maskEmail(user?.email)}</span>
//                   <img src="/assets/img/8602b31a6d.svg" alt="Arrow Right" className="icon-small" />
//                 </div>
//               </div>
              
//               <div className="data-row link" role="button" aria-label={t('Buka menu rank')} data-route="/rank">
//                 <span className="data-label">{t('Rank')}</span>
//                 <div className="data-value-group">
//                   <div className="rank-badge">
//                     <img src="/assets/img/6465a054f3.svg" alt="Crown" className="icon-crown" />
//                     <span className="rank-text">{rankTitle || '—'}</span>
//                   </div>
//                   <img src="/assets/img/8602b31a6d.svg" alt="Arrow Right" className="icon-small" />
//                 </div>
//               </div>
              
//               <div className="data-row no-border">
//                 <span className="data-label">{t('Bergabung sejak')}</span>
//                 <div className="data-value-group">
//                   <span className="data-value">{user?.created_at ? dateID(user.created_at) : '—'}</span>
//                 </div>
//               </div>
//             </div>
//             )}
//           </div>
//         </div>
//       </section>
//       <section id="section-shipping-address">
//         <div className="section-container">
//           <div className="shipping-wrapper">
//             <h2 className="section-title">{t('Alamat Pengiriman')}</h2>
//             <p className="section-desc">{t('Dipakai untuk mengirim hadiah barang dari Roda Keberuntungan dan program lainnya.')}</p>
            
//             <div className="address-card">
//               <div className="card-header">
//                 <div className="card-title-group">
//                   <span className="card-title">{t('Rumah')}</span>
//                   <span className="badge-utama">{t('Utama')}</span>
//                 </div>
//                 <button className="btn-ubah" data-route="/profil/edit">{t('Ubah')}</button>
//               </div>
              
//               <div className="card-contact">{maskName(user?.full_name || user?.username)} · {maskPhone(user?.phone)}</div>
//               <div className="card-address">{t('Jl. Lorem Ipsum No. 12, RT 03/RW 05, Kel. Sukamaju, Kec. Sukajadi, Kota Bandung, Jawa Barat 40162')}</div>
              
//               <div className="card-note">
//                 <img src="/assets/img/709ca833f3.svg" alt="Note Icon" className="icon-note" />
//                 <span className="note-text">{t('Catatan: pagar hitam, sebelah warung')}</span>
//               </div>
//             </div>
            
//             <button className="btn-add-address" data-route="/profil/alamat">
//               <img src="/assets/img/bfdb73e4a1.svg" alt="Plus Icon" />
//               <span>{t('Tambah Alamat Baru')}</span>
//             </button>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }
