import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
    setIsLoggedIn(!!session);
  });

  // // Google Translate setup
  // const script = document.createElement("script");
  // script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  // script.async = true;
  // document.body.appendChild(script);

  // window.googleTranslateElementInit = () => {
  //   new window.google.translate.TranslateElement(
  //     { pageLanguage: "en" },
  //     "google_translate_element"
  //   );
  // };
//  function abbreviateLanguages() {
//     const select = document.querySelector('.goog-te-combo');
//     if (select && select.options.length > 1) {
//         for (let i = 0; i < select.options.length; i++) {
//             const option = select.options[i];
            
//             // The 'value' of the option is already the short code (e.g., 'es')
//             if (option.value && option.value !== "") {
//                 option.textContent = option.value.toUpperCase();
//             } else if (option.text.includes("Select")) {
//                 // Shorten the initial "Select Language" text
//                 option.textContent = "EN";
//             }
//         }
//     }
// }
 
// //Run the function every 500ms to catch the widget when it finishes loading
// const translateInterval = setInterval(() => {
//     const select = document.querySelector('.goog-te-combo');
//     if (select) {
//         abbreviateLanguages();
//         // We don't clear the interval because Google sometimes re-renders the element
//     }
// }, 500); 
// function updateSelectedAbbreviation() {
//     const select = document.querySelector('.goog-te-combo');
//     if (!select) return;

//     const selectedOption = select.options[select.selectedIndex];

//     if (selectedOption) {
//         if (selectedOption.value) {
//             selectedOption.textContent = selectedOption.value.toUpperCase();
//         } else if (selectedOption.text.includes("Select")) {
//             selectedOption.textContent = "EN";
//         }
//     }
// }

// function initTranslateWatcher() {
//     const select = document.querySelector('.goog-te-combo');
//     if (!select) return;

//     // Update when user changes language
//     select.addEventListener('change', () => {
//         // Small delay because Google updates after change
//         setTimeout(updateSelectedAbbreviation, 100);
//     });

//     // Also run once on load
//     updateSelectedAbbreviation();
// }

// // Poll until Google widget exists
// const interval = setInterval(() => {
//     const select = document.querySelector('.goog-te-combo');
//     if (select) {
//         initTranslateWatcher();
//         clearInterval(interval);
//     }
// }, 500);
    
//   const translateInterval = setInterval(() => {
//     const select = document.querySelector('.goog-te-combo');
//     if (select) {
//         abbreviateLanguages();

//         // clear the interval
//         clearInterval(translateInterval);
//     }
// }, 500);

    //  const select = document.querySelector('.goog-te-combo');
    // if (select) {
    //     abbreviateLanguages();
    //     // We don't clear the interval because Google sometimes re-renders the element
    // }
//   window.googleTranslateElementInit = () => {
//   new window.google.translate.TranslateElement(
//     { pageLanguage: "en" },
//     "google_translate_element"
//   );

//   new window.google.translate.TranslateElement(
//     { pageLanguage: "en" },
//     "google_translate_element_mobile"
//   );
// };


  return () => subscription.unsubscribe();
  }, []);
// Google Translate full language list (example subset)
const LANGUAGES = [
  { code: "af", label: "AF" },
  { code: "sq", label: "SQ" },
  { code: "am", label: "AM" },
  { code: "ar", label: "AR" },
  { code: "hy", label: "HY" },
  { code: "az", label: "AZ" },
  { code: "eu", label: "EU" },
  { code: "be", label: "BE" },
  { code: "bn", label: "BN" },
  { code: "bs", label: "BS" },
  { code: "bg", label: "BG" },
  { code: "ca", label: "CA" },
  { code: "zh-CN", label: "ZH" },
  { code: "hr", label: "HR" },
  { code: "cs", label: "CS" },
  { code: "da", label: "DA" },
  { code: "nl", label: "NL" },
  { code: "en", label: "EN" },
  { code: "eo", label: "EO" },
  { code: "et", label: "ET" },
  { code: "fi", label: "FI" },
  { code: "fr", label: "FR" },
  { code: "gl", label: "GL" },
  { code: "ka", label: "KA" },
  { code: "de", label: "DE" },
  { code: "el", label: "EL" },
  { code: "gu", label: "GU" },
  { code: "ht", label: "HT" },
  { code: "he", label: "HE" },
  { code: "hi", label: "HI" },
  { code: "hu", label: "HU" },
  { code: "is", label: "IS" },
  { code: "id", label: "ID" },
  { code: "ga", label: "GA" },
  { code: "it", label: "IT" },
  { code: "ja", label: "JA" },
  { code: "kn", label: "KN" },
  { code: "kk", label: "KK" },
  { code: "ko", label: "KO" },
  { code: "ky", label: "KY" },
  { code: "lo", label: "LO" },
  { code: "la", label: "LA" },
  { code: "lv", label: "LV" },
  { code: "lt", label: "LT" },
  { code: "mk", label: "MK" },
  { code: "ms", label: "MS" },
  { code: "mt", label: "MT" },
  { code: "mn", label: "MN" },
  { code: "no", label: "NO" },
  { code: "fa", label: "FA" },
  { code: "pl", label: "PL" },
  { code: "pt", label: "PT" },
  { code: "pa", label: "PA" },
  { code: "ro", label: "RO" },
  { code: "ru", label: "RU" },
  { code: "sr", label: "SR" },
  { code: "si", label: "SI" },
  { code: "sk", label: "SK" },
  { code: "sl", label: "SL" },
  { code: "es", label: "ES" },
  { code: "sw", label: "SW" },
  { code: "sv", label: "SV" },
  { code: "ta", label: "TA" },
  { code: "te", label: "TE" },
  { code: "th", label: "TH" },
  { code: "tr", label: "TR" },
  { code: "uk", label: "UK" },
  { code: "ur", label: "UR" },
  { code: "uz", label: "UZ" },
  { code: "vi", label: "VI" },
  { code: "cy", label: "CY" },
  { code: "xh", label: "XH" },
  { code: "yi", label: "YI" },
  { code: "zu", label: "ZU" },
];

export default function GoogleTranslateFullSwitcher() {
  useEffect(() => {
    // Load Google Translate script
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

  const switchLanguage = (langCode) => {
    const select = document.querySelector(".goog-te-combo");
    if (!select) return;
    select.value = langCode;
    select.dispatchEvent(new Event("change"));

    const selectedOption = select.options[select.selectedIndex];
    if (selectedOption) {
      selectedOption.textContent = langCode.toUpperCase();
    }
  };
  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Supported Chains", href: "#chains" },
  ];

  return (
    
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass-card-dark mt-4 px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary-foreground" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="font-display text-xl font-bold text-white">
              XRP<span className="text-primary">Vault</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-white/70 hover:text-white transition-colors font-medium"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
        <div>
      <div style={{ maxHeight: "300px", overflowY: "scroll", border: "1px solid #ccc", padding: "5px" }}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => switchLanguage(lang.code)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "5px",
              marginBottom: "2px",
            }}
          >
            {lang.label} - {lang.code}
          </button>
        ))}
      </div>
      <div id="google_translate_element" style={{ display: "none" }}></div>
    </div>


          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <Link to="/dashboard">
                <Button className="btn-xrp-primary">
                  Dashboard
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-white hover:text-primary hover:bg-white/5">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="btn-xrp-primary">
                    Get Started
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
        

          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card-dark mt-2 p-6 md:hidden"
            >
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                              

                <div className="border-t border-white/10 pt-4 mt-2 flex flex-col gap-3">
                  {isLoggedIn ? (
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full btn-xrp-primary">
                        Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <>
                    
                      
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full text-white hover:text-primary hover:bg-white/5">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full btn-xrp-primary">
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
