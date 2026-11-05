// The API has no language preference field (/api/auth/settings/ only carries
// public flags), so the choice is kept in the browser and read back by the
// screens that print it.
const KEY = 'pscryp.lang';

export const LANGUAGES = [
  { value: 'id', short: 'ID', label: 'Bahasa Indonesia', sub: 'Indonesian', name: 'Indonesia' },
  { value: 'en', short: 'EN', label: 'English', sub: 'Bahasa Inggris', name: 'English' },
  { value: 'zh', short: '中', label: '简体中文', sub: 'Bahasa Mandarin', name: 'Mandarin' },
];

export const readLanguage = () => {
  try {
    const stored = localStorage.getItem(KEY);
    return LANGUAGES.some((language) => language.value === stored) ? stored : 'id';
  } catch {
    return 'id';
  }
};

export const saveLanguage = (value) => {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    // private mode: the choice lasts for this visit only
  }
  document.documentElement.lang = value === 'zh' ? 'zh-CN' : value;
};

export const languageName = (value) =>
  LANGUAGES.find((language) => language.value === value)?.name || 'Indonesia';
