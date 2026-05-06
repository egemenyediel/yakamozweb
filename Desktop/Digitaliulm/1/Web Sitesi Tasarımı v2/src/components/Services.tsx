import { Bot, Smartphone, Globe, LineChart, Briefcase, Sparkles, Camera, Video, Package, Film, MessageSquare, TrendingUp, Target, ExternalLink } from "lucide-react";

interface ServicesProps {
  lang: 'tr' | 'de' | 'en';
}

export function Services({ lang }: ServicesProps) {
  const translations = {
    tr: {
      subtitle: 'Çözümlerimiz',
      title: 'Dijital Dönüşüm Hizmetleri',
      description: 'İşinizi geleceğe taşıyacak yapay zeka ve dijital çözümler',
      services: [
        {
          icon: Bot,
          title: 'Yapay Zeka Robotları',
          description: 'İşinize özel tasarlanmış akıllı AI çözümleri ile verimliliğinizi artırın'
        },
        {
          icon: Briefcase,
          title: 'İşinize Özel Uygulamalar',
          description: 'İhtiyaçlarınıza tam uygun özel yazılım çözümleri geliştiriyoruz'
        },
        {
          icon: Smartphone,
          title: 'Mobil Uygulamalar',
          description: 'iOS ve Android için kullanıcı dostu mobil uygulamalar'
        },
        {
          icon: Globe,
          title: 'Web Siteleri',
          description: 'Modern, hızlı ve SEO uyumlu web siteleri'
        },
        {
          icon: Camera,
          title: 'Fotoğraf Çekimi',
          description: 'Profesyonel ürün, kurumsal ve reklam fotoğraf çekimleri'
        },
        {
          icon: Video,
          title: 'Video Prodüksiyon',
          description: 'Reklam filmi, tanıtım videosu ve kurumsal video üretimi'
        },
        {
          icon: Package,
          title: 'Ürün Çekim & Hazırlık',
          description: 'E-ticaret için profesyonel ürün fotoğrafları ve video çekimleri'
        },
        {
          icon: Film,
          title: 'İçerik Üretimi',
          description: 'Sosyal medya, reklam ve pazarlama için yaratıcı içerik üretimi'
        },
        {
          icon: MessageSquare,
          title: 'Sosyal Medya Yönetimi',
          description: 'Profesyonel sosyal medya stratejisi ve içerik yönetimi'
        },
        {
          icon: Target,
          title: 'Marka Oluşturma',
          description: 'Sıfırdan marka kimliği tasarımı ve kurumsal kimlik çalışmaları'
        },
        {
          icon: TrendingUp,
          title: 'Marka Gelişim Danışmanlığı',
          description: 'Mevcut markanızı güçlendirme ve büyütme stratejileri'
        },
        {
          icon: LineChart,
          title: 'Dijital Dönüşüm',
          description: 'İş süreçlerinizi dijitalleştirin, verimliliği artırın'
        },
        {
          icon: Sparkles,
          title: 'Danışmanlık',
          description: 'Uzman ekibimizle teknoloji stratejinizi belirleyin'
        }
      ]
    },
    de: {
      subtitle: 'Unsere Lösungen',
      title: 'Digitale Transformationsdienste',
      description: 'KI und digitale Lösungen, die Ihr Unternehmen in die Zukunft führen',
      services: [
        {
          icon: Bot,
          title: 'KI-Roboter',
          description: 'Steigern Sie Ihre Produktivität mit intelligenten KI-Lösungen'
        },
        {
          icon: Briefcase,
          title: 'Maßgeschneiderte Anwendungen',
          description: 'Individuelle Softwarelösungen genau nach Ihren Bedürfnissen'
        },
        {
          icon: Smartphone,
          title: 'Mobile Apps',
          description: 'Benutzerfreundliche mobile Anwendungen für iOS und Android'
        },
        {
          icon: Globe,
          title: 'Websites',
          description: 'Moderne, schnelle und SEO-optimierte Websites'
        },
        {
          icon: Camera,
          title: 'Fotografie',
          description: 'Professionelle Produkt-, Unternehmens- und Werbefotografie'
        },
        {
          icon: Video,
          title: 'Videoproduktion',
          description: 'Werbefilme, Imagevideos und Unternehmensvideos'
        },
        {
          icon: Package,
          title: 'Produktaufnahmen & Vorbereitung',
          description: 'Professionelle Produktfotos und Videos für E-Commerce'
        },
        {
          icon: Film,
          title: 'Content-Produktion',
          description: 'Kreative Inhalte für Social Media, Werbung und Marketing'
        },
        {
          icon: MessageSquare,
          title: 'Social-Media-Management',
          description: 'Professionelle Social-Media-Strategie und Content-Management'
        },
        {
          icon: Target,
          title: 'Markenbildung',
          description: 'Markenidentitätsdesign und Corporate Identity von Grund auf'
        },
        {
          icon: TrendingUp,
          title: 'Markenentwicklungsberatung',
          description: 'Strategien zur Stärkung und zum Wachstum Ihrer bestehenden Marke'
        },
        {
          icon: LineChart,
          title: 'Digitale Transformation',
          description: 'Digitalisieren Sie Ihre Geschäftsprozesse'
        },
        {
          icon: Sparkles,
          title: 'Beratung',
          description: 'Definieren Sie Ihre Technologiestrategie mit unserem Team'
        }
      ]
    },
    en: {
      subtitle: 'Our Solutions',
      title: 'Digital Transformation Services',
      description: 'AI and digital solutions that take your business to the future',
      services: [
        {
          icon: Bot,
          title: 'AI Robots',
          description: 'Increase your productivity with intelligent AI solutions'
        },
        {
          icon: Briefcase,
          title: 'Custom Applications',
          description: 'Custom software solutions tailored to your needs'
        },
        {
          icon: Smartphone,
          title: 'Mobile Apps',
          description: 'User-friendly mobile applications for iOS and Android'
        },
        {
          icon: Globe,
          title: 'Websites',
          description: 'Modern, fast, and SEO-friendly websites'
        },
        {
          icon: Camera,
          title: 'Photography',
          description: 'Professional product, corporate, and advertising photography'
        },
        {
          icon: Video,
          title: 'Video Production',
          description: 'Commercial films, promotional videos, and corporate videos'
        },
        {
          icon: Package,
          title: 'Product Shoots & Prep',
          description: 'Professional product photography and videos for e-commerce'
        },
        {
          icon: Film,
          title: 'Content Production',
          description: 'Creative content for social media, advertising, and marketing'
        },
        {
          icon: MessageSquare,
          title: 'Social Media Management',
          description: 'Professional social media strategy and content management'
        },
        {
          icon: Target,
          title: 'Brand Creation',
          description: 'Brand identity design and corporate identity from scratch'
        },
        {
          icon: TrendingUp,
          title: 'Brand Development Consulting',
          description: 'Strategies to strengthen and grow your existing brand'
        },
        {
          icon: LineChart,
          title: 'Digital Transformation',
          description: 'Digitize your business processes'
        },
        {
          icon: Sparkles,
          title: 'Consulting',
          description: 'Define your technology strategy with our expert team'
        }
      ]
    }
  };

  const subBrands = {
    tr: {
      subtitle: 'Alt Markalarımız',
      title: 'Kendi Ürünlerimiz',
      description: 'Dijitaliulm çatısı altında geliştirdiğimiz bağımsız dijital ürünler',
      brands: [
        {
          name: 'Mapstrology',
          url: 'https://www.mapstrology.com',
          description: 'Astroloji ve coğrafyayı birleştiren yenilikçi dijital platform. Harita tabanlı astroloji deneyimi ile kişisel rehberlik.',
          tag: 'Astroloji & Harita'
        },
        {
          name: 'Pfoteshop',
          url: 'https://www.pfoteshop.com',
          description: 'Sevimli dostlarınız için özenle seçilmiş ürünler. Evcil hayvan sahiplerine yönelik premium e-ticaret platformu.',
          tag: 'Evcil Hayvan & E-Ticaret'
        }
      ]
    },
    de: {
      subtitle: 'Unsere Submarken',
      title: 'Eigene Produkte',
      description: 'Eigenständige digitale Produkte, die wir unter dem Dach von Digitaliulm entwickelt haben',
      brands: [
        {
          name: 'Mapstrology',
          url: 'https://www.mapstrology.com',
          description: 'Innovative digitale Plattform, die Astrologie und Geographie verbindet. Persönliche Führung durch kartenbasierte Astrologie-Erlebnisse.',
          tag: 'Astrologie & Karte'
        },
        {
          name: 'Pfoteshop',
          url: 'https://www.pfoteshop.com',
          description: 'Sorgfältig ausgewählte Produkte für Ihre pelzigen Freunde. Premium-E-Commerce-Plattform für Tierbesitzer.',
          tag: 'Haustier & E-Commerce'
        }
      ]
    },
    en: {
      subtitle: 'Our Sub-brands',
      title: 'Our Own Products',
      description: 'Independent digital products we have developed under the Digitaliulm umbrella',
      brands: [
        {
          name: 'Mapstrology',
          url: 'https://www.mapstrology.com',
          description: 'Innovative digital platform combining astrology and geography. Personal guidance through a map-based astrology experience.',
          tag: 'Astrology & Maps'
        },
        {
          name: 'Pfoteshop',
          url: 'https://www.pfoteshop.com',
          description: 'Carefully curated products for your furry friends. A premium e-commerce platform designed for pet owners.',
          tag: 'Pet & E-Commerce'
        }
      ]
    }
  };

  const t = translations[lang];
  const sb = subBrands[lang];

  return (
    <section id="services" className="py-24 md:py-32 relative">
      {/* Semi-transparent overlay for readability */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
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

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {t.services.map((service, index) => {
            const Icon = service.icon;
            
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 hover:border-[#BFFF0A]/30 transition-all duration-500"
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-[#BFFF0A]/10 border border-[#BFFF0A]/20 flex items-center justify-center mb-6 group-hover:bg-[#BFFF0A]/20 group-hover:scale-110 transition-all duration-500">
                  <Icon className="w-7 h-7 text-[#BFFF0A]" />
                </div>

                <h3 className="text-xl text-white mb-3 group-hover:text-[#BFFF0A] transition-colors">
                  {service.title}
                </h3>
                <p className="text-white/60 leading-relaxed text-sm">
                  {service.description}
                </p>

                {/* Hover Glow */}
                <div className="absolute inset-0 bg-[#BFFF0A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              </div>
            );
          })}
        </div>

        {/* Sub-brands Section */}
        <div className="mt-24">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-block mb-4">
              <span className="text-sm px-4 py-2 rounded-full bg-white/5 text-white/70 border border-white/10">
                {sb.subtitle}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl text-white mb-4 tracking-tight">
              {sb.title}
            </h2>
            <p className="text-white/60">
              {sb.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {sb.brands.map((brand, index) => (
              <a
                key={index}
                href={brand.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8 hover:border-[#BFFF0A]/40 transition-all duration-500 flex flex-col"
              >
                {/* Tag */}
                <span className="self-start text-xs px-3 py-1 rounded-full bg-[#BFFF0A]/10 text-[#BFFF0A] border border-[#BFFF0A]/20 mb-6">
                  {brand.tag}
                </span>

                {/* Brand name & link icon */}
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-2xl font-semibold text-white group-hover:text-[#BFFF0A] transition-colors">
                    {brand.name}
                  </h3>
                  <ExternalLink className="w-5 h-5 text-white/30 group-hover:text-[#BFFF0A] transition-colors" />
                </div>

                <p className="text-white/60 leading-relaxed text-sm mb-6">
                  {brand.description}
                </p>

                {/* URL */}
                <span className="mt-auto text-xs text-white/30 group-hover:text-[#BFFF0A]/60 transition-colors">
                  {brand.url.replace('https://', '')}
                </span>

                {/* Hover Glow */}
                <div className="absolute inset-0 bg-[#BFFF0A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
