import { useState, useEffect } from 'react';
import { Bot, Smartphone, Globe, Camera, Video, Package, Film, MessageSquare, TrendingUp, Megaphone, ShoppingCart, Users, Headphones, Zap, Paintbrush } from "lucide-react";
import { loadContent, type Solution } from '../utils/contentManager';

interface SolutionsProps {
  lang: 'tr' | 'de' | 'en';
}

// Icon mapping
const iconMap: Record<string, any> = {
  Bot, Smartphone, Globe, Camera, Video, Package, Film, 
  MessageSquare, TrendingUp, Megaphone, ShoppingCart, 
  Users, Headphones, Zap, Paintbrush
};

export function Solutions({ lang }: SolutionsProps) {
  const [solutions, setSolutions] = useState<Solution[]>([]);

  useEffect(() => {
    loadContent().then(content => {
      setSolutions(content.solutions);
    });
  }, []);

  const translations = {
    tr: {
      subtitle: 'Çözümlerimiz',
      title: 'Dijital Çözümler',
      description: 'İşinizi geleceğe taşıyacak kapsamlı dijital hizmetler',
      solutions: [
        {
          icon: Bot,
          title: 'Yapay Zeka Robotları',
          description: 'İşinize özel tasarlanmış akıllı AI çözümleri'
        },
        {
          icon: Smartphone,
          title: 'Mobil Uygulamalar',
          description: 'iOS ve Android için modern mobil uygulamalar'
        },
        {
          icon: Globe,
          title: 'Web Siteleri',
          description: 'Modern, hızlı ve SEO uyumlu web siteleri'
        },
        {
          icon: Camera,
          title: 'Fotoğraf Çekimi',
          description: 'Profesyonel ürün ve kurumsal fotoğraf çekimleri'
        },
        {
          icon: Video,
          title: 'Video Prodüksiyon',
          description: 'Reklam filmleri ve kurumsal videolar'
        },
        {
          icon: Package,
          title: 'Ürün Çekimi',
          description: 'E-ticaret için profesyonel ürün fotoğrafları'
        },
        {
          icon: Film,
          title: 'Video Editörlüğü',
          description: 'Profesyonel video düzenleme ve post-prodüksiyon'
        },
        {
          icon: MessageSquare,
          title: 'Sosyal Medya',
          description: 'Sosyal medya yönetimi ve içerik üretimi'
        },
        {
          icon: TrendingUp,
          title: 'Dijital Pazarlama',
          description: 'SEO, SEM ve dijital reklam yönetimi'
        },
        {
          icon: Megaphone,
          title: 'Marka Yönetimi',
          description: 'Kurumsal kimlik ve marka stratejileri'
        },
        {
          icon: ShoppingCart,
          title: 'E-Ticaret',
          description: 'Online satış platformları ve entegrasyonlar'
        },
        {
          icon: Users,
          title: 'Danışmanlık',
          description: 'Dijital dönüşüm danışmanlık hizmetleri'
        },
        {
          icon: Headphones,
          title: 'Müşteri Desteği',
          description: '7/24 teknik destek ve müşteri hizmetleri'
        },
        {
          icon: Zap,
          title: 'Otomasyon',
          description: 'İş süreçleri otomasyonu ve entegrasyonlar'
        }
      ]
    },
    de: {
      subtitle: 'Unsere Lösungen',
      title: 'Digitale Lösungen',
      description: 'Umfassende digitale Dienstleistungen für Ihr Unternehmen',
      solutions: [
        {
          icon: Bot,
          title: 'KI-Roboter',
          description: 'Maßgeschneiderte intelligente KI-Lösungen'
        },
        {
          icon: Smartphone,
          title: 'Mobile Apps',
          description: 'Moderne Apps für iOS und Android'
        },
        {
          icon: Globe,
          title: 'Websites',
          description: 'Moderne, schnelle und SEO-optimierte Websites'
        },
        {
          icon: Camera,
          title: 'Fotografie',
          description: 'Professionelle Produkt- und Unternehmensfotografie'
        },
        {
          icon: Video,
          title: 'Videoproduktion',
          description: 'Werbefilme und Unternehmensvideos'
        },
        {
          icon: Package,
          title: 'Produktaufnahmen',
          description: 'Professionelle Produktfotos für E-Commerce'
        },
        {
          icon: Film,
          title: 'Videobearbeitung',
          description: 'Professionelle Videobearbeitung und Post-Produktion'
        },
        {
          icon: MessageSquare,
          title: 'Social Media',
          description: 'Social-Media-Management und Content-Erstellung'
        },
        {
          icon: TrendingUp,
          title: 'Digital Marketing',
          description: 'SEO, SEM und digitale Werbeverwaltung'
        },
        {
          icon: Megaphone,
          title: 'Markenmanagement',
          description: 'Corporate Identity und Markenstrategien'
        },
        {
          icon: ShoppingCart,
          title: 'E-Commerce',
          description: 'Online-Verkaufsplattformen und Integrationen'
        },
        {
          icon: Users,
          title: 'Beratung',
          description: 'Beratung zur digitalen Transformation'
        },
        {
          icon: Headphones,
          title: 'Kundensupport',
          description: '24/7 technischer Support und Kundenservice'
        },
        {
          icon: Zap,
          title: 'Automatisierung',
          description: 'Geschäftsprozessautomatisierung und Integrationen'
        }
      ]
    },
    en: {
      subtitle: 'Our Solutions',
      title: 'Digital Solutions',
      description: 'Comprehensive digital services for your business',
      solutions: [
        {
          icon: Bot,
          title: 'AI Robots',
          description: 'Custom-designed intelligent AI solutions'
        },
        {
          icon: Smartphone,
          title: 'Mobile Apps',
          description: 'Modern apps for iOS and Android'
        },
        {
          icon: Globe,
          title: 'Websites',
          description: 'Modern, fast and SEO-optimized websites'
        },
        {
          icon: Camera,
          title: 'Photography',
          description: 'Professional product and corporate photography'
        },
        {
          icon: Video,
          title: 'Video Production',
          description: 'Commercial films and corporate videos'
        },
        {
          icon: Package,
          title: 'Product Photography',
          description: 'Professional product photos for e-commerce'
        },
        {
          icon: Film,
          title: 'Video Editing',
          description: 'Professional video editing and post-production'
        },
        {
          icon: MessageSquare,
          title: 'Social Media',
          description: 'Social media management and content creation'
        },
        {
          icon: TrendingUp,
          title: 'Digital Marketing',
          description: 'SEO, SEM and digital advertising management'
        },
        {
          icon: Megaphone,
          title: 'Brand Management',
          description: 'Corporate identity and brand strategies'
        },
        {
          icon: ShoppingCart,
          title: 'E-Commerce',
          description: 'Online sales platforms and integrations'
        },
        {
          icon: Users,
          title: 'Consulting',
          description: 'Digital transformation consulting services'
        },
        {
          icon: Headphones,
          title: 'Customer Support',
          description: '24/7 technical support and customer service'
        },
        {
          icon: Zap,
          title: 'Automation',
          description: 'Business process automation and integrations'
        }
      ]
    }
  };

  const t = translations[lang];

  return (
    <section id="solutions" className="py-24 md:py-32 relative">
      {/* Semi-transparent overlay for readability */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block mb-4">
            <span className="text-sm px-4 py-2 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/20">
              {t.subtitle}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-white mb-6 tracking-tight">
            {t.title}
          </h2>
          <p className="text-lg md:text-xl text-gray-400">
            {t.description}
          </p>
        </div>

        {/* Solutions Grid - From Content Manager */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {solutions.map((solution) => {
            const Icon = iconMap[solution.icon] || Bot;
            return (
              <div
                key={solution.id}
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#0EA5E9]/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(14,165,233,0.2)] overflow-hidden cursor-pointer"
              >
                {/* Front (Default) */}
                <div className="flex flex-col h-full group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
                  <div className="mb-4 p-3 bg-[#0EA5E9]/10 rounded-xl w-fit group-hover:bg-[#0EA5E9]/20 transition-colors">
                    <Icon className="w-6 h-6 text-[#0EA5E9]" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#0EA5E9] transition-colors">
                    {solution.title[lang]}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {solution.description[lang]}
                  </p>
                </div>

                {/* Back (Details) */}
                {solution.details && (
                  <div className="absolute inset-0 p-6 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#0EA5E9]/10 to-transparent rounded-2xl">
                    <p className="text-white text-sm leading-relaxed">
                      {solution.details[lang]}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}