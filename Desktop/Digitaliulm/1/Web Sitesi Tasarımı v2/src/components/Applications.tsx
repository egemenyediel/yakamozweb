import { Monitor, Trophy, Calendar, Share2 } from "lucide-react";

interface ApplicationsProps {
  lang: 'tr' | 'de' | 'en';
}

export function Applications({ lang }: ApplicationsProps) {
  const translations = {
    tr: {
      subtitle: 'Uygulamalar',
      title: 'Örnek Yazılım Çözümlerimiz',
      description: 'Geliştirdiğimiz özel uygulamalar ve platformlar',
      applications: [
        {
          icon: Monitor,
          title: 'Akıllı Menü Ekranları',
          description: 'Restoranlar için dijital menü ekranları ve sipariş yönetim sistemi.',
          features: ['Dinamik Fiyatlandırma', 'Stok Takibi', 'Otomatik Güncellemeler']
        },
        {
          icon: Trophy,
          title: 'Basketbol Web Sitesi',
          description: 'Veri toplama, aktarım ve yayınlama sistemi.',
          features: ['Canlı Skorlar', 'İstatistikler', 'Performans Analizi']
        },
        {
          icon: Calendar,
          title: 'Organizasyon Yönetimi',
          description: 'Etkinlik planlama ve katılımcı yönetim sistemi.',
          features: ['Rezervasyon', 'Katılımcı Takibi', 'Otomatik Bildirimler']
        },
        {
          icon: Share2,
          title: 'Sosyal Medya Yazılımı',
          description: 'AI destekli kurumsal içerik üretim platformu.',
          features: ['Otomatik Planlama', 'AI İçerik', 'Performans Analizi']
        }
      ]
    },
    de: {
      subtitle: 'Anwendungen',
      title: 'Beispiel-Softwarelösungen',
      description: 'Von uns entwickelte maßgeschneiderte Anwendungen und Plattformen',
      applications: [
        {
          icon: Monitor,
          title: 'Intelligente Menübildschirme',
          description: 'Digitale Menübildschirme und Bestellverwaltungssystem für Restaurants.',
          features: ['Dynamische Preisgestaltung', 'Bestandsverfolgung', 'Automatische Updates']
        },
        {
          icon: Trophy,
          title: 'Basketball-Website',
          description: 'Datenerfassungs-, Übertragungs- und Veröffentlichungssystem.',
          features: ['Live-Scores', 'Statistiken', 'Leistungsanalyse']
        },
        {
          icon: Calendar,
          title: 'Organisationsmanagement',
          description: 'Veranstaltungsplanung und Teilnehmerverwaltungssystem.',
          features: ['Reservierung', 'Teilnehmerverfolgung', 'Automatische Benachrichtigungen']
        },
        {
          icon: Share2,
          title: 'Social-Media-Software',
          description: 'KI-gestützte Plattform für die Erstellung von Unternehmensinhalten.',
          features: ['Automatische Planung', 'KI-Inhalte', 'Leistungsanalyse']
        }
      ]
    },
    en: {
      subtitle: 'Applications',
      title: 'Example Software Solutions',
      description: 'Custom applications and platforms we have developed',
      applications: [
        {
          icon: Monitor,
          title: 'Smart Menu Displays',
          description: 'Digital menu displays and order management system for restaurants.',
          features: ['Dynamic Pricing', 'Inventory Tracking', 'Automatic Updates']
        },
        {
          icon: Trophy,
          title: 'Basketball Website',
          description: 'Data collection, transfer, and broadcasting system.',
          features: ['Live Scores', 'Statistics', 'Performance Analytics']
        },
        {
          icon: Calendar,
          title: 'Organization Management',
          description: 'Event planning and participant management system.',
          features: ['Reservations', 'Participant Tracking', 'Automatic Notifications']
        },
        {
          icon: Share2,
          title: 'Social Media Software',
          description: 'AI-powered corporate content creation platform.',
          features: ['Automatic Scheduling', 'AI Content', 'Performance Analytics']
        }
      ]
    }
  };

  const t = translations[lang];

  return (
    <section id="applications" className="py-24 md:py-32 relative">
      {/* Semi-transparent overlay for readability */}
      <div className="absolute inset-0 bg-black/15 backdrop-blur-sm" />
      
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block mb-4">
            <span className="text-sm px-4 py-2 rounded-full bg-[#BFFF0A]/10 text-[#BFFF0A] border border-[#BFFF0A]/20">
              {t.subtitle}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-white mb-6 tracking-tight">
            {t.title}
          </h2>
          <p className="text-lg md:text-xl text-white/60">
            {t.description}
          </p>
        </div>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {t.applications.map((app, index) => {
            const Icon = app.icon;
            
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 hover:border-[#BFFF0A]/30 transition-all duration-500"
              >
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-[#BFFF0A]/10 border border-[#BFFF0A]/20 flex items-center justify-center mb-6 group-hover:bg-[#BFFF0A]/20 group-hover:scale-110 transition-all duration-500">
                  <Icon className="w-8 h-8 text-[#BFFF0A]" />
                </div>

                <h3 className="text-2xl text-white mb-3 group-hover:text-[#BFFF0A] transition-colors">
                  {app.title}
                </h3>
                <p className="text-white/60 leading-relaxed mb-6">
                  {app.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {app.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-full text-xs bg-white/5 text-white/70 border border-white/10"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Hover Glow */}
                <div className="absolute inset-0 bg-[#BFFF0A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
