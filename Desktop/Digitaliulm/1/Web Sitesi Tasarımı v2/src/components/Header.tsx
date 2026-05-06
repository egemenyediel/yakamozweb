import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

interface HeaderProps {
  currentLang: 'tr' | 'de' | 'en';
  onLanguageChange: (lang: 'tr' | 'de' | 'en') => void;
}

export function Header({ currentLang, onLanguageChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const translations = {
    tr: {
      solutions: 'Çözümler',
      references: 'Referanslar',
      contact: 'İletişim',
      branding: 'Markalaşma'
    },
    de: {
      solutions: 'Lösungen',
      references: 'Referenzen',
      contact: 'Kontakt',
      branding: 'Branding'
    },
    en: {
      solutions: 'Solutions',
      references: 'References',
      contact: 'Contact',
      branding: 'Branding'
    }
  };

  const t = translations[currentLang];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 px-4 md:px-6 lg:px-8 transition-all duration-300 ${isScrolled ? 'pt-2' : 'pt-6'}`}>
      <div className="max-w-[1400px] mx-auto">
        <div className={`relative rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
          <div className="px-6 md:px-8">
            <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-12' : 'h-16'}`}>
              {/* Logo & Language Selector */}
              <div className="flex items-center gap-4 z-10">
                <a href="#" className="flex items-center -ml-1">
                  <div className={`tracking-tight select-none transition-all duration-300 ${isScrolled ? 'text-[1.2rem]' : 'text-[1.5rem]'}`}>
                    <span className="text-[#0EA5E9] font-[600]">digital</span>
                    <span className="text-white font-[600]">iulm</span>
                    <span className="text-[#0EA5E9] font-[600]">.de</span>
                  </div>
                </a>

                {/* Language Selector - Next to Logo */}
                <div className="flex items-center gap-1 bg-white/5 rounded-full p-0.5 border border-white/10">
                  <button
                    onClick={() => onLanguageChange('tr')}
                    className={`px-2 py-1 text-[10px] rounded-full transition-all duration-200 ${
                      currentLang === 'tr'
                        ? 'bg-[#0EA5E9] text-white font-medium'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    TR
                  </button>
                  <button
                    onClick={() => onLanguageChange('de')}
                    className={`px-2 py-1 text-[10px] rounded-full transition-all duration-200 ${
                      currentLang === 'de'
                        ? 'bg-[#0EA5E9] text-white font-medium'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    DE
                  </button>
                  <button
                    onClick={() => onLanguageChange('en')}
                    className={`px-2 py-1 text-[10px] rounded-full transition-all duration-200 ${
                      currentLang === 'en'
                        ? 'bg-[#0EA5E9] text-white font-medium'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>

              {/* Navigation - Desktop - Right Side */}
              <nav className="hidden md:flex items-center">
                <div className="flex items-center gap-1">
                  <a 
                    href="#solutions" 
                    className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5"
                  >
                    {t.solutions}
                  </a>
                  <a 
                    href="#references" 
                    className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5"
                  >
                    {t.references}
                  </a>
                  <a 
                    href="#contact" 
                    className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5"
                  >
                    {t.contact}
                  </a>
                  <a
                    href="/branding"
                    className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5"
                  >
                    {t.branding}
                  </a>
                </div>
              </nav>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 -mr-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-white/10 px-6 py-4">
              <nav className="flex flex-col gap-2">
                <a href="#solutions" className="px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  {t.solutions}
                </a>
                <a href="#references" className="px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  {t.references}
                </a>
                <a href="#contact" className="px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  {t.contact}
                </a>
                <a href="/branding" className="px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  {t.branding}
                </a>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
