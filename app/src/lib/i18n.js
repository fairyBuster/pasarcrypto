// Copy translation. The dictionaries are keyed by the Indonesian source text,
// so a screen that has not been routed through t() yet (or a string that has no
// entry yet) keeps rendering its original wording instead of breaking.
//
// t() reads module state rather than a hook: the generator screens call it in
// plain helper functions too, and App remounts the route tree on a language
// change, which repaints every screen at once.
import { useEffect, useState } from 'react';
import { readLanguage, saveLanguage } from './language.js';
import { EN } from './i18n/en.js';
import { ZH } from './i18n/zh.js';

const DICTS = { en: EN, zh: ZH };
const listeners = new Set();
let active = readLanguage();

const documentLang = (value) => (value === 'zh' ? 'zh-CN' : value);
if (typeof document !== 'undefined') document.documentElement.lang = documentLang(active);

export const getLanguage = () => active;

export const setLanguage = (value) => {
  if (value !== 'id' && !DICTS[value]) return;
  active = value;
  if (typeof document !== 'undefined') document.documentElement.lang = documentLang(value);
  saveLanguage(value);
  listeners.forEach((listener) => listener(value));
};

export const t = (source, vars) => {
  const dict = DICTS[active];
  let text = (dict && dict[source]) ?? source;
  if (vars) {
    text = text.replace(/\{(\w+)\}/g, (match, key) =>
      vars[key] === undefined ? match : String(vars[key])
    );
  }
  return text;
};

// App uses this to repaint the route tree when the language changes
export const useLanguage = () => {
  const [lang, setLangState] = useState(active);
  useEffect(() => {
    listeners.add(setLangState);
    return () => listeners.delete(setLangState);
  }, []);
  return { lang, setLang: setLanguage };
};
