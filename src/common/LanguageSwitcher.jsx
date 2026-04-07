import React, { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
// 🇬🇧 English
const FlagGB = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 60 30"
    width="24"
    height="16"
    style={{ borderRadius: 2, flexShrink: 0 }}
  >
    <rect width="60" height="30" fill="#012169" />
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" />
    <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
    <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
  </svg>
);

// 🇨🇳 Mandarin Chinese
const FlagCN = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 30 20"
    width="24"
    height="16"
    style={{ borderRadius: 2, flexShrink: 0 }}
  >
    <rect width="30" height="20" fill="#DE2910" />
    <polygon points="5,2 6.18,5.09 9.51,5.09 6.94,7.09 7.94,10.18 5,8.37 2.06,10.18 3.06,7.09 0.49,5.09 3.82,5.09" fill="#FFDE00" />
    <polygon points="10,1 10.6,2.8 12.5,2.8 11,3.9 11.5,5.7 10,4.7 8.5,5.7 9,3.9 7.5,2.8 9.4,2.8" fill="#FFDE00" transform="scale(0.5) translate(13,1)" />
    <polygon points="10,1 10.6,2.8 12.5,2.8 11,3.9 11.5,5.7 10,4.7 8.5,5.7 9,3.9 7.5,2.8 9.4,2.8" fill="#FFDE00" transform="scale(0.5) translate(17,4)" />
    <polygon points="10,1 10.6,2.8 12.5,2.8 11,3.9 11.5,5.7 10,4.7 8.5,5.7 9,3.9 7.5,2.8 9.4,2.8" fill="#FFDE00" transform="scale(0.5) translate(17,9)" />
    <polygon points="10,1 10.6,2.8 12.5,2.8 11,3.9 11.5,5.7 10,4.7 8.5,5.7 9,3.9 7.5,2.8 9.4,2.8" fill="#FFDE00" transform="scale(0.5) translate(13,13)" />
  </svg>
);

// 🇪🇸 Spanish
const FlagES = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 3 2"
    width="24"
    height="16"
    style={{ borderRadius: 2, flexShrink: 0 }}
  >
    <rect width="3" height="2" fill="#c60b1e" />
    <rect width="3" height="1" y="0.5" fill="#ffc400" />
  </svg>
);

// 🇩🇪 German
const FlagDE = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 5 3"
    width="24"
    height="16"
    style={{ borderRadius: 2, flexShrink: 0 }}
  >
    <rect width="5" height="1" y="0" fill="#000" />
    <rect width="5" height="1" y="1" fill="#D00" />
    <rect width="5" height="1" y="2" fill="#FFCE00" />
  </svg>
);

// 🇫🇷 French
const FlagFR = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 3 2"
    width="24"
    height="16"
    style={{ borderRadius: 2, flexShrink: 0 }}
  >
    <rect width="1" height="2" x="0" fill="#002395" />
    <rect width="1" height="2" x="1" fill="#fff" />
    <rect width="1" height="2" x="2" fill="#ED2939" />
  </svg>
);

// 🇸🇦 Arabic (Saudi Arabia flag)
const FlagAR = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 3 2"
    width="24"
    height="16"
    style={{ borderRadius: 2, flexShrink: 0 }}
  >
    <rect width="3" height="2" fill="#006C35" />
    <rect width="0.4" height="2" x="2.6" fill="#fff" />
    <text
      x="1.2"
      y="1.3"
      fontSize="0.55"
      fill="#fff"
      textAnchor="middle"
      fontFamily="serif"
    >
      ﷽
    </text>
  </svg>
);

// ─── Language List ───────────────────────────────────────────────
const langs = [
  { label: "Arabic",           native: "العربية",    value: "ar", Flag: FlagAR },
  { label: "English",          native: "English",    value: "en", Flag: FlagGB },
  { label: "Mandarin Chinese", native: "中文",        value: "zh", Flag: FlagCN },
  { label: "Spanish",          native: "Español",    value: "es", Flag: FlagES },
  { label: "German",           native: "Deutsch",    value: "de", Flag: FlagDE },
  { label: "French",           native: "Français",   value: "fr", Flag: FlagFR },
];
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const dropdownRef = useRef(null);

  const changeLanguage = (lng) => {
    console.log("Language: ", lng);
    localStorage.setItem("lang", lng);
    i18n.changeLanguage(lng);
    dropdownRef.current?.removeAttribute("open");
  };

  const current = langs.find((l) => l.value === i18n.language) ?? langs[1];

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        dropdownRef.current.removeAttribute("open");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className='language-switcher'>
      <details className='dropdown' ref={dropdownRef}>
        {/* Trigger button */}
        <summary className='btn btn-sm gap-2 normal-case min-w-[9rem] flex items-center'>
          <current.Flag />
          <span className='flex-1 text-left'>{current.native}</span>
          <svg
            className='w-3 h-3 opacity-40 shrink-0'
            fill='none'
            stroke='currentColor'
            strokeWidth='2.5'
            viewBox='0 0 24 24'
          >
            <polyline points='6 9 12 15 18 9' />
          </svg>
        </summary>

        {/* Dropdown menu */}
        <ul className='dropdown-content menu bg-base-100 rounded-box z-50 w-44 p-1 mt-1 shadow-xl border border-base'>
          {langs.map((l) => (
            <li key={l.value}>
              <button
                onClick={() => changeLanguage(l.value)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 w-full text-left
                  ${
                    current.value === l.value
                      ? "bg-primary text-primary-content"
                      : "hover:bg-base-200"
                  }`}
              >
                <l.Flag />
                <div className='flex-1'>
                  <p className='text-sm font-medium leading-tight'>
                    {l.native}
                  </p>
                  <p className='text-xs opacity-50'>{l.label}</p>
                </div>
                {current.value === l.value && (
                  <svg
                    className='w-3.5 h-3.5 shrink-0'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='3'
                    viewBox='0 0 24 24'
                  >
                    <polyline points='20 6 9 17 4 12' />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
};

export default LanguageSwitcher;
