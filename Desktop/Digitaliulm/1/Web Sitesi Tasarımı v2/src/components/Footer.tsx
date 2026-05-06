interface FooterProps {
  lang: 'tr' | 'de' | 'en';
}

export function Footer({ lang }: FooterProps) {
  const translations = {
    tr: {
      tagline: 'Yapay zeka ile daha dijital dünya',
      rights: 'Tüm hakları saklıdır.',
      services: 'Hizmetler',
      company: 'Şirket',
      about: 'Hakkımızda',
      blog: 'Blog',
      careers: 'Kariyer',
      privacy: 'Gizlilik Politikası',
      deployedAt: 'Deploy Tarihi'
    },
    de: {
      tagline: 'Eine digitalere Welt mit künstlicher Intelligenz',
      rights: 'Alle Rechte vorbehalten.',
      services: 'Dienstleistungen',
      company: 'Unternehmen',
      about: 'Über uns',
      blog: 'Blog',
      careers: 'Karriere',
      privacy: 'Datenschutz',
      deployedAt: 'Deploy-Datum'
    },
    en: {
      tagline: 'A more digital world with artificial intelligence',
      rights: 'All rights reserved.',
      services: 'Services',
      company: 'Company',
      about: 'About Us',
      blog: 'Blog',
      careers: 'Careers',
      privacy: 'Privacy Policy',
      deployedAt: 'Deploy Date'
    }
  };

  const t = translations[lang];
  
  // Get build timestamp from window or use current time
  const buildTime = (window as any).__BUILD_TIME__ || new Date().toISOString();
  const formattedTime = new Date(buildTime).toLocaleString(
    lang === 'tr' ? 'tr-TR' : lang === 'de' ? 'de-DE' : 'en-US'
  );

  return (
    <footer className="relative border-t border-white/10 mt-24">
      {/* Earth Surface View - Above Footer */}
      <div className="absolute -top-32 left-0 right-0 h-32 overflow-hidden">
        {/* Earth Curvature */}
        <div className="absolute bottom-0 left-0 right-0 h-full">
          {/* Earth Surface */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#1a3a1a] via-[#2d4a22] to-transparent">
            {/* Surface Details */}
            <div className="absolute bottom-2 left-0 w-full h-4 bg-gradient-to-r from-[#1a2a1a] via-[#2a4a2a] to-[#1a2a1a] opacity-60" />
          </div>
          
          {/* Atmosphere Glow */}
          <div className="absolute bottom-16 left-0 right-0 h-12 bg-gradient-to-r from-transparent via-[#4a7ad0]/30 to-transparent blur-md" />
          <div className="absolute bottom-20 left-0 right-0 h-8 bg-gradient-to-r from-transparent via-[#6a8af0]/20 to-transparent blur-lg" />
          
          {/* City Lights */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`city-light-${i}`}
              className="absolute bottom-1 bg-yellow-400 rounded-full animate-pulse"
              style={{
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                opacity: 0.6 + Math.random() * 0.4,
              }}
            />
          ))}
          
          {/* Cloud Layers */}
          <div className="absolute bottom-24 left-0 right-0 h-6 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-sm opacity-60" />
          <div className="absolute bottom-28 left-0 right-0 h-4 bg-gradient-to-r from-transparent via-white/3 to-transparent blur-md opacity-40" />
        </div>
      </div>
      
      {/* Semi-transparent overlay for readability */}
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" />
      
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="text-3xl md:text-4xl tracking-tight mb-4">
              <span className="text-[#0EA5E9] font-[600]">digital</span>
              <span className="text-white font-[600]">iulm</span>
              <span className="text-[#0EA5E9] font-[600]">.de</span>
            </div>
            <p className="text-white/60 mb-6 max-w-md leading-relaxed">{t.tagline}</p>
            {/* Design System Link */}
            <div className="mb-6">
              <a
                href="/branding"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#0EA5E9]/30 bg-white/5 hover:bg-[#0EA5E9]/10 text-[#0EA5E9] font-semibold transition-colors text-sm shadow-sm"
                title="Brand Design System"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><rect x="2" y="2" width="16" height="16" rx="4" fill="#0EA5E9" fillOpacity="0.15"/><path d="M6 14l8-8M6 6h8v8" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Brand Design System
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white mb-4">{t.services}</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><a href="#solutions" className="hover:text-[#0EA5E9] transition-colors">AI {lang === 'tr' ? 'Robotları' : lang === 'de' ? 'Roboter' : 'Robots'}</a></li>
              <li><a href="#solutions" className="hover:text-[#0EA5E9] transition-colors">{lang === 'tr' ? 'Mobil Uygulamalar' : lang === 'de' ? 'Mobile Apps' : 'Mobile Apps'}</a></li>
              <li><a href="#solutions" className="hover:text-[#0EA5E9] transition-colors">{lang === 'tr' ? 'Web Siteleri' : lang === 'de' ? 'Websites' : 'Websites'}</a></li>
              <li><a href="#solutions" className="hover:text-[#0EA5E9] transition-colors">{lang === 'tr' ? 'Danışmanlık' : lang === 'de' ? 'Beratung' : 'Consulting'}</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white mb-4">{t.company}</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><a href={`/about?lang=${lang}`} className="hover:text-[#0EA5E9] transition-colors">{t.about}</a></li>
              <li><a href="#" className="hover:text-[#0EA5E9] transition-colors">{t.blog}</a></li>
              <li><a href="#" className="hover:text-[#0EA5E9] transition-colors">{t.careers}</a></li>
              <li><a href={`/privacy?lang=${lang}`} className="hover:text-[#0EA5E9] transition-colors">{t.privacy}</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/60">
          <div className="flex items-center gap-4 flex-wrap">
            <p>&copy; {new Date().getFullYear()} digitaliulm.de. {t.rights}</p>
            <span className="text-white/30">•</span>
            <span className="text-xs text-white/40">
              {t.deployedAt}: <span className="text-[#0EA5E9]">{formattedTime}</span>
            </span>
          </div>
          <p>Made with <span className="text-[#0EA5E9]">♥</span> in Ulm</p>
        </div>
      </div>
    </footer>
  );
}
