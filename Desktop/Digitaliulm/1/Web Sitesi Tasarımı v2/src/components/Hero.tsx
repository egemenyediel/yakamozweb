import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { ArrowRight, Bot, Sparkles } from "lucide-react";

interface HeroProps {
  lang: 'tr' | 'de' | 'en';
}

export function Hero({ lang }: HeroProps) {
  const translations = {
    tr: {
      title: 'Yapay Zeka ile Daha Dijital Dünya',
      subtitle: 'İşinize özel yapay zeka robotları, mobil uygulamalar ve web siteleri ile şirketinizi daha hızlı ve karlı hale getirin',
      cta: 'Hemen Başlayın',
      learn: 'Daha Fazla Bilgi'
    },
    de: {
      title: 'Eine Digitalere Welt mit Künstlicher Intelligenz',
      subtitle: 'Machen Sie Ihr Unternehmen schneller und profitabler mit maßgeschneiderten KI-Robotern, mobilen Apps und Websites',
      cta: 'Jetzt Starten',
      learn: 'Mehr Erfahren'
    },
    en: {
      title: 'A More Digital World with Artificial Intelligence',
      subtitle: 'Make your company faster and more profitable with custom AI robots, mobile apps, and websites',
      cta: 'Get Started',
      learn: 'Learn More'
    }
  };

  const t = translations[lang];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />
      
      <div className="absolute inset-0 opacity-10">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1630505331189-4ca903b81824?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwcm9ib3QlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc2MDE3ODE1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="AI Technology"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10 mt-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 dark:text-blue-300">Digital Transformation & AI Solutions</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t.title}
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            {t.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="group">
              {t.cta}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline">
              {t.learn}
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-6 border border-border">
              <Bot className="w-12 h-12 text-blue-600 mb-4 mx-auto" />
              <h3 className="mb-2">AI {lang === 'tr' ? 'Robotları' : lang === 'de' ? 'Roboter' : 'Robots'}</h3>
              <p className="text-muted-foreground text-sm">
                {lang === 'tr' ? 'İşinize özel akıllı çözümler' : lang === 'de' ? 'Intelligente Lösungen für Ihr Unternehmen' : 'Smart solutions for your business'}
              </p>
            </div>
            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-6 border border-border">
              <svg className="w-12 h-12 text-purple-600 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h3 className="mb-2">{lang === 'tr' ? 'Mobil Uygulamalar' : lang === 'de' ? 'Mobile Apps' : 'Mobile Apps'}</h3>
              <p className="text-muted-foreground text-sm">
                {lang === 'tr' ? 'iOS ve Android uygulamaları' : lang === 'de' ? 'iOS und Android Anwendungen' : 'iOS and Android applications'}
              </p>
            </div>
            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-6 border border-border">
              <svg className="w-12 h-12 text-pink-600 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <h3 className="mb-2">{lang === 'tr' ? 'Web Siteleri' : lang === 'de' ? 'Websites' : 'Websites'}</h3>
              <p className="text-muted-foreground text-sm">
                {lang === 'tr' ? 'Modern ve hızlı web çözümleri' : lang === 'de' ? 'Moderne und schnelle Web-Lösungen' : 'Modern and fast web solutions'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
