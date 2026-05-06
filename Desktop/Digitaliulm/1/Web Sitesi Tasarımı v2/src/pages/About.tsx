import React, { useMemo, useState } from "react";

const About: React.FC = () => {
  const getDefaultLanguage = (): 'tr' | 'de' | 'en' => {
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    if (urlLang === 'tr' || urlLang === 'de' || urlLang === 'en') return urlLang;

    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('de')) return 'de';
    if (browserLang.startsWith('en')) return 'en';
    return 'tr';
  };

  const [lang, setLang] = useState<'tr' | 'de' | 'en'>(() => getDefaultLanguage());

  const t = useMemo(() => ({
    tr: {
      back: 'Ana sayfaya dön',
      title: 'Hakkımızda',
      intro: 'digitaliulm.de olarak işletmelerin dijital dönüşümünü hızlandıran, yapay zeka destekli ve sonuç odaklı çözümler geliştiriyoruz.',
      mission: 'Misyonumuz',
      missionText: 'Teknolojiyi sadeleştirerek KOBİ’ler ve büyüyen markalar için ulaşılabilir, sürdürülebilir ve ölçülebilir dijital büyüme sağlamak.',
      vision: 'Vizyonumuz',
      visionText: 'Avrupa merkezli işletmelerin yapay zeka ve dijital çözümlerle rekabet avantajı kazanmasına liderlik eden güvenilir teknoloji partneri olmak.',
      expertise: 'Uzmanlık Alanlarımız',
      expertiseItems: [
        'Yapay zeka tabanlı otomasyon ve analiz sistemleri',
        'Web ve mobil ürün geliştirme',
        'Markalaşma, içerik üretimi ve dijital büyüme stratejileri',
        'E-ticaret, dönüşüm optimizasyonu ve performans odaklı danışmanlık',
      ],
      contact: 'İletişim',
      contactText: 'İş birliği talepleriniz için',
    },
    de: {
      back: 'Zurück zur Startseite',
      title: 'Über uns',
      intro: 'Bei digitaliulm.de entwickeln wir KI-gestützte, ergebnisorientierte Lösungen, die die digitale Transformation von Unternehmen beschleunigen.',
      mission: 'Unsere Mission',
      missionText: 'Technologie zu vereinfachen und für KMU sowie wachsende Marken zugängliches, nachhaltiges und messbares digitales Wachstum zu ermöglichen.',
      vision: 'Unsere Vision',
      visionText: 'Ein vertrauenswürdiger Technologiepartner zu sein, der Unternehmen in Europa dabei hilft, mit KI und digitalen Lösungen Wettbewerbsvorteile zu erzielen.',
      expertise: 'Unsere Expertise',
      expertiseItems: [
        'KI-basierte Automatisierungs- und Analysesysteme',
        'Web- und Mobile-Produktentwicklung',
        'Branding, Content-Produktion und digitale Wachstumsstrategien',
        'E-Commerce, Conversion-Optimierung und performanceorientierte Beratung',
      ],
      contact: 'Kontakt',
      contactText: 'Für Kooperationsanfragen erreichen Sie uns unter',
    },
    en: {
      back: 'Back to homepage',
      title: 'About Us',
      intro: 'At digitaliulm.de, we build AI-powered and results-driven solutions that accelerate the digital transformation of businesses.',
      mission: 'Our Mission',
      missionText: 'To simplify technology and enable accessible, sustainable, and measurable digital growth for SMEs and growing brands.',
      vision: 'Our Vision',
      visionText: 'To be a trusted technology partner helping Europe-based businesses gain a competitive edge with AI and digital solutions.',
      expertise: 'Our Expertise',
      expertiseItems: [
        'AI-based automation and analytics systems',
        'Web and mobile product development',
        'Branding, content production, and digital growth strategies',
        'E-commerce, conversion optimization, and performance-focused consulting',
      ],
      contact: 'Contact',
      contactText: 'For partnerships, reach us at',
    },
  })[lang], [lang]);

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-8 gap-4">
          <a
            href={`/?lang=${lang}`}
            className="inline-flex items-center gap-2 text-sm text-[#0EA5E9] hover:text-[#38bdf8] transition-colors"
          >
            ← {t.back}
          </a>
          <div className="flex items-center gap-1 bg-white/5 rounded-full p-0.5 border border-white/10">
            {(['tr', 'de', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-1 text-[10px] rounded-full transition-all duration-200 ${
                  lang === l ? 'bg-[#0EA5E9] text-white font-medium' : 'text-white/60 hover:text-white'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 md:p-10">
          <h1 className="text-4xl md:text-5xl tracking-tight mb-4">
            {t.title}
          </h1>
          <p className="text-white/70 text-lg mb-8 leading-relaxed">
            {t.intro}
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl mb-3 text-[#0EA5E9]">{t.mission}</h2>
              <p className="text-white/70 leading-relaxed">
                {t.missionText}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl mb-3 text-[#0EA5E9]">{t.vision}</h2>
              <p className="text-white/70 leading-relaxed">
                {t.visionText}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-8">
            <h2 className="text-xl mb-3 text-[#0EA5E9]">{t.expertise}</h2>
            <ul className="list-disc pl-5 space-y-2 text-white/75">
              {t.expertiseItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl mb-3 text-[#0EA5E9]">{t.contact}</h2>
            <p className="text-white/75">
              {t.contactText} <a className="text-[#38bdf8]" href="mailto:info@digitaliulm.de">info@digitaliulm.de</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
