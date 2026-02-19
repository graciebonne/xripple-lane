import { useEffect, useState, useRef, ChangeEvent } from "react";

// Type for each language
interface Language {
  code: string;
  label: string;
}

// Full Google Translate language list with abbreviations
const LANGUAGES: Language[] = [
  { code: "af", label: "AF" }, { code: "sq", label: "SQ" }, { code: "am", label: "AM" },
  { code: "ar", label: "AR" }, { code: "hy", label: "HY" }, { code: "az", label: "AZ" },
  { code: "eu", label: "EU" }, { code: "be", label: "BE" }, { code: "bn", label: "BN" },
  { code: "bs", label: "BS" }, { code: "bg", label: "BG" }, { code: "ca", label: "CA" },
  { code: "zh-CN", label: "ZH" }, { code: "hr", label: "HR" }, { code: "cs", label: "CS" },
  { code: "da", label: "DA" }, { code: "nl", label: "NL" }, { code: "en", label: "EN" },
  { code: "eo", label: "EO" }, { code: "et", label: "ET" }, { code: "fi", label: "FI" },
  { code: "fr", label: "FR" }, { code: "gl", label: "GL" }, { code: "ka", label: "KA" },
  { code: "de", label: "DE" }, { code: "el", label: "EL" }, { code: "gu", label: "GU" },
  { code: "ht", label: "HT" }, { code: "he", label: "HE" }, { code: "hi", label: "HI" },
  { code: "hu", label: "HU" }, { code: "is", label: "IS" }, { code: "id", label: "ID" },
  { code: "ga", label: "GA" }, { code: "it", label: "IT" }, { code: "ja", label: "JA" },
  { code: "kn", label: "KN" }, { code: "kk", label: "KK" }, { code: "ko", label: "KO" },
  { code: "ky", label: "KY" }, { code: "lo", label: "LO" }, { code: "la", label: "LA" },
  { code: "lv", label: "LV" }, { code: "lt", label: "LT" }, { code: "mk", label: "MK" },
  { code: "ms", label: "MS" }, { code: "mt", label: "MT" }, { code: "mn", label: "MN" },
  { code: "no", label: "NO" }, { code: "fa", label: "FA" }, { code: "pl", label: "PL" },
  { code: "pt", label: "PT" }, { code: "pa", label: "PA" }, { code: "ro", label: "RO" },
  { code: "ru", label: "RU" }, { code: "sr", label: "SR" }, { code: "si", label: "SI" },
  { code: "sk", label: "SK" }, { code: "sl", label: "SL" }, { code: "es", label: "ES" },
  { code: "sw", label: "SW" }, { code: "sv", label: "SV" }, { code: "ta", label: "TA" },
  { code: "te", label: "TE" }, { code: "th", label: "TH" }, { code: "tr", label: "TR" },
  { code: "uk", label: "UK" }, { code: "ur", label: "UR" }, { code: "uz", label: "UZ" },
  { code: "vi", label: "VI" }, { code: "cy", label: "CY" }, { code: "xh", label: "XH" },
  { code: "yi", label: "YI" }, { code: "zu", label: "ZU" },
];

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

const GoogleTranslateDropdown: React.FC = () => {
  const [selected, setSelected] = useState<string>("en");
  const selectRef = useRef<HTMLSelectElement | null>(null);

  // Load Google Translate script once
  useEffect(() => {
    if (!document.querySelector("#google-translate")) {
      const script = document.createElement("script");
      script.id = "google-translate";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { pageLanguage: "en" },
          "google_translate_element"
        );
      };
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const langCode = e.target.value;
    setSelected(langCode);

    const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (!select) return;

    select.value = langCode;
    select.dispatchEvent(new Event("change"));

    // Optional: update selected option text
    const selectedOption = select.options[select.selectedIndex];
    if (selectedOption) selectedOption.textContent = langCode.toUpperCase();
  };

  return (
    <div style={{ width: "50px" }}>
      {/* Dropdown showing all languages */}
      <select
        ref={selectRef}
        value={selected}
        onChange={handleChange}
        style={{ width: "100%", padding: "5px", fontSize: "14px" }}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label} - {lang.code}
          </option>
        ))}
      </select>

      {/* Hidden Google Translate element */}
      <div id="google_translate_element" style={{ display: "none" }}></div>
    </div>
  );
};

export default GoogleTranslateDropdown;
