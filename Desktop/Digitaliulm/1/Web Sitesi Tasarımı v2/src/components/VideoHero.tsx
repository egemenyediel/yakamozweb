import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { loadContent, type HeroContent } from '../utils/contentManager';

interface VideoHeroProps {
  lang: 'tr' | 'de' | 'en';
}

export function VideoHero({ lang }: VideoHeroProps) {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);

  useEffect(() => {
    loadContent().then(content => {
      if (content) {
        setHeroContent(content.hero);
      }
    });
  }, []);

  const scrollToContent = () => {
    const solutionsSection = document.getElementById('solutions');
    if (solutionsSection) {
      solutionsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!heroContent) {
    return null;
  }

  const currentContent = heroContent[lang];

  return (
    <section className="relative h-screen w-full overflow-hidden">

  {/* Overlay removed to show full video brightness */}

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
        <div className="text-center max-w-4xl px-6">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-[#0EA5E9] to-white bg-clip-text text-transparent transition-all duration-1000">
            {currentContent.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed opacity-90 transition-all duration-1000">
            {currentContent.subtitle}
          </p>
          <button className="bg-[#0EA5E9] text-white px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_50px_rgba(14,165,233,0.5)]">
            {currentContent.buttonText}
          </button>
        </div>
      </div>

      {/* Scroll Down Indicator - Right Side */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 right-8 w-12 h-12 rounded-full border-2 border-white/30 hover:border-[#0EA5E9] flex items-center justify-center text-white hover:text-[#0EA5E9] transition-all duration-300 group z-10 hover:scale-110"
      >
        <ChevronDown className="w-6 h-6 animate-bounce group-hover:animate-pulse" />
      </button>
    </section>
  );
}
