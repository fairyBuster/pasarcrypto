// The bundle renders in the browser, so the document head has to follow the
// route: otherwise every address answers with one title ("PasarCrypto") and a
// crawler files the whole site under "/". Public screens get their own title,
// description, canonical and link-preview tags; the signed-in screens are
// marked noindex instead of being advertised.
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ORIGIN = 'https://pasarcryptoid.com';

const DEFAULT_TITLE = 'PasarCrypto — Pasar Kripto & Produk Digital';
const DEFAULT_DESCRIPTION =
  'Pasar aset kripto dan produk digital: pantau harga, kelola aset, ikuti program referral, dan belajar kripto dari dasar.';

// One entry per crawlable screen. `canonical` is only declared where the same
// screen is reachable from two addresses (the root and /landing), so the crawler
// keeps a single URL for it.
const PAGES = {
  '/landing': { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, canonical: '/' },
  '/landing/tentang': {
    title: 'Tentang PasarCrypto — Kripto yang Bisa Dipahami',
    description:
      'Kenapa PasarCrypto dibangun: misi membuat aset kripto bisa dipahami semua orang, dari materi dasar sampai produk digital.',
  },
  '/landing/holding': {
    title: 'Holding Aset Kripto — PasarCrypto',
    description:
      'Apa itu holding, kenapa aset disimpan jangka panjang, dan bagaimana PasarCrypto membantumu memantau portofolio.',
  },
  '/landing/hadiah': {
    title: 'Program Hadiah & Reward — PasarCrypto',
    description:
      'Kumpulkan reward harian, selesaikan misi, dan ikuti roda keberuntungan; hadiah masuk langsung ke akunmu.',
  },
  '/landing/referral': {
    title: 'Program Referral — PasarCrypto',
    description:
      'Ajak teman lewat tautan undangan dan dapatkan komisi dari aktivitas mereka di PasarCrypto.',
  },
  '/landing/materi': {
    title: 'Belajar Kripto dari Dasar — PasarCrypto',
    description:
      'Materi dan artikel kripto berbahasa Indonesia: bitcoin, blockchain, stablecoin, sampai manajemen risiko.',
  },
  // the static teaching frame the article cards fall back to
  '/landing/materi/detail': {
    title: 'Apa Itu Aset Kripto dan Cara Kerjanya — PasarCrypto',
    description:
      'Penjelasan dasar aset kripto: cara kerja, jenisnya, dan hal yang perlu dicek sebelum membeli.',
  },
  '/landing/bantuan': {
    title: 'Pusat Bantuan — PasarCrypto',
    description:
      'Panduan dan pertanyaan umum seputar akun, deposit, penarikan, dan keamanan di PasarCrypto.',
  },
  // the signed-in copy of the about screen; the crawlable one is /landing/tentang
  '/tentang-kami': {
    title: 'Tentang Kami — PasarCrypto',
    description: 'Profil, alamat, dan kanal resmi PasarCrypto.',
    noindex: true,
  },
  '/faq': {
    title: 'FAQ PasarCrypto — Pertanyaan yang Sering Diajukan',
    description:
      'Jawaban singkat untuk pertanyaan seputar akun, transaksi, dan keamanan di PasarCrypto.',
  },
  '/legal/syarat-ketentuan': {
    title: 'Syarat & Ketentuan — PasarCrypto',
    description: 'Ketentuan penggunaan layanan PasarCrypto.',
  },
  '/legal/syarat-layanan': {
    title: 'Syarat Layanan — PasarCrypto',
    description: 'Ketentuan layanan yang berlaku saat kamu memakai PasarCrypto.',
  },
  '/legal/kebijakan-privasi': {
    title: 'Kebijakan Privasi — PasarCrypto',
    description: 'Data apa yang dikumpulkan PasarCrypto, untuk apa, dan bagaimana disimpan.',
  },
  '/legal/perjanjian-klien': {
    title: 'Perjanjian Klien — PasarCrypto',
    description: 'Perjanjian antara PasarCrypto dan klien yang memakai layanannya.',
  },
  // an alternate landing design; it must not compete with the real one
  '/landing/v2': { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, noindex: true },
};

// Article addresses carry an id, so they stay out of the table above: each one
// is indexable on its own URL and takes its title from the story once it loads
const ARTICLE_PATH = /^\/landing\/berita\/[^/]+$/;

const setMeta = (key, value, attr = 'name') => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  if (el.getAttribute('content') !== value) el.setAttribute('content', value);
};

// screens that load their copy after mount refine the tags the route already
// set; the canonical and the robots rule are never touched here
export const setPageMeta = ({ title, description }) => {
  if (title) {
    document.title = title;
    setMeta('og:title', title, 'property');
    setMeta('twitter:title', title);
  }
  if (description) {
    setMeta('description', description);
    setMeta('og:description', description, 'property');
    setMeta('twitter:description', description);
  }
};

const setCanonical = (href) => {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  if (el.getAttribute('href') !== href) el.setAttribute('href', href);
};

// a WebView/emulator origin is not a public address; the canonical always names
// the domain search engines actually crawl
const canonicalOrigin = () => {
  const { origin, hostname } = window.location;
  if (/^https?:\/\//i.test(origin) && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(hostname)) return origin;
  return ORIGIN;
};

export function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    // /faq/ and /faq are the same screen, so the canonical always names one form
    const path = pathname.replace(/\/+$/, '') || '/';
    const page = PAGES[path];
    const article = !page && ARTICLE_PATH.test(path);
    const indexable = article || (Boolean(page) && !page.noindex);
    const title = page?.title || DEFAULT_TITLE;
    const description = page?.description || DEFAULT_DESCRIPTION;
    const canonical = page?.canonical || (indexable ? path : '/');
    const url = `${canonicalOrigin()}${canonical === '/' ? '/' : canonical}`;

    document.title = title;
    setMeta('description', description);
    setMeta('robots', indexable ? 'index, follow, max-image-preview:large' : 'noindex, follow');
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:url', url, 'property');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setCanonical(url);
  }, [pathname]);

  return null;
}
