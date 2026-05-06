import React, { useMemo, useState } from "react";

const Privacy: React.FC = () => {
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
      title: 'Gizlilik Politikası',
      intro: 'Bu sayfa, digitaliulm.de tarafından sunulan hizmetlerde kişisel verilerin işlenmesine ilişkin temel bilgilendirmeyi içerir.',
      h1: '1. Toplanan Veriler',
      p1: 'İletişim formu aracılığıyla ad, e-posta adresi ve mesaj içeriği gibi bilgileri yalnızca talebinize yanıt verebilmek amacıyla toplarız.',
      h2: '2. Veri İşleme Amacı',
      p2: 'Toplanan veriler; iletişim taleplerinin yönetilmesi, hizmet kalitesinin iyileştirilmesi ve gerekli durumlarda yasal yükümlülüklerin yerine getirilmesi için işlenir.',
      h3: '3. Veri Saklama Süresi',
      p3: 'Veriler, işleme amacının gerektirdiği süre boyunca saklanır ve ilgili mevzuat çerçevesinde silinir veya anonim hale getirilir.',
      h4: '4. Üçüncü Taraf Hizmetler',
      p4: 'Form iletiminde üçüncü taraf e-posta/form servisleri kullanılabilir. Bu servisler kendi gizlilik politikalarına tabidir.',
      h5: '5. Haklarınız',
      p5: 'Verilerinize erişim, düzeltme, silme ve işleme itiraz etme haklarına sahipsiniz. Talepleriniz için bizimle e-posta üzerinden iletişime geçebilirsiniz.',
      h6: '6. İletişim',
      p6: 'Gizlilik politikasıyla ilgili sorularınız için',
    },
    de: {
      back: 'Zurück zur Startseite',
      title: 'Datenschutzerklärung',
      intro: 'Diese Seite enthält grundlegende Informationen zur Verarbeitung personenbezogener Daten im Rahmen der von digitaliulm.de angebotenen Dienstleistungen.',
      h1: '1. Erhobene Daten',
      p1: 'Über das Kontaktformular erfassen wir Daten wie Name, E-Mail-Adresse und Nachricht ausschließlich, um auf Ihre Anfrage zu antworten.',
      h2: '2. Zweck der Datenverarbeitung',
      p2: 'Die erhobenen Daten werden zur Bearbeitung von Kontaktanfragen, zur Verbesserung der Servicequalität und gegebenenfalls zur Erfüllung gesetzlicher Pflichten verarbeitet.',
      h3: '3. Speicherdauer',
      p3: 'Daten werden nur so lange gespeichert, wie es für den Zweck erforderlich ist, und anschließend gemäß geltenden Vorschriften gelöscht oder anonymisiert.',
      h4: '4. Dienste von Drittanbietern',
      p4: 'Für die Formularübermittlung können externe E-Mail-/Formulardienste verwendet werden. Diese unterliegen ihren eigenen Datenschutzrichtlinien.',
      h5: '5. Ihre Rechte',
      p5: 'Sie haben das Recht auf Auskunft, Berichtigung, Löschung sowie Widerspruch gegen die Verarbeitung Ihrer Daten. Kontaktieren Sie uns dazu per E-Mail.',
      h6: '6. Kontakt',
      p6: 'Bei Fragen zum Datenschutz erreichen Sie uns unter',
    },
    en: {
      back: 'Back to homepage',
      title: 'Privacy Policy',
      intro: 'This page provides basic information about how personal data is processed within services offered by digitaliulm.de.',
      h1: '1. Data We Collect',
      p1: 'Through the contact form, we collect information such as name, email address, and message content solely to respond to your request.',
      h2: '2. Purpose of Processing',
      p2: 'Collected data is processed to manage contact requests, improve service quality, and fulfill legal obligations when required.',
      h3: '3. Data Retention',
      p3: 'Data is stored only for as long as required by the processing purpose and is then deleted or anonymized in accordance with applicable regulations.',
      h4: '4. Third-Party Services',
      p4: 'Third-party email/form services may be used for form delivery. These services are subject to their own privacy policies.',
      h5: '5. Your Rights',
      p5: 'You have the right to access, correct, delete, and object to processing of your data. You may contact us via email for such requests.',
      h6: '6. Contact',
      p6: 'For privacy-related questions, contact us at',
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
          <h1 className="text-4xl md:text-5xl tracking-tight mb-4">{t.title}</h1>
          <p className="text-white/70 mb-8 leading-relaxed">
            {t.intro}
          </p>

          <section className="space-y-6 text-white/75 leading-relaxed">
            <div>
              <h2 className="text-xl text-[#0EA5E9] mb-2">{t.h1}</h2>
              <p>{t.p1}</p>
            </div>

            <div>
              <h2 className="text-xl text-[#0EA5E9] mb-2">{t.h2}</h2>
              <p>{t.p2}</p>
            </div>

            <div>
              <h2 className="text-xl text-[#0EA5E9] mb-2">{t.h3}</h2>
              <p>{t.p3}</p>
            </div>

            <div>
              <h2 className="text-xl text-[#0EA5E9] mb-2">{t.h4}</h2>
              <p>{t.p4}</p>
            </div>

            <div>
              <h2 className="text-xl text-[#0EA5E9] mb-2">{t.h5}</h2>
              <p>{t.p5}</p>
            </div>

            <div>
              <h2 className="text-xl text-[#0EA5E9] mb-2">{t.h6}</h2>
              <p>
                {t.p6} <a className="text-[#38bdf8]" href="mailto:info@digitaliulm.de">info@digitaliulm.de</a>.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
