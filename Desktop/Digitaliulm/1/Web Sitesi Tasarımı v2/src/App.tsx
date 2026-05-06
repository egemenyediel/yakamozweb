import { useState } from "react";
import { Toaster } from "sonner";
import { Header } from "./components/Header";
import { TopProgressBar } from "./components/TopProgressBar";
import { VideoHero } from "./components/VideoHero";
import { Solutions } from "./components/Solutions";
import { References } from "./components/References";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { Routes, Route } from "react-router-dom";
import Branding from "./pages/Branding";
import About from "./pages/About";
import Privacy from "./pages/Privacy";

export default function App() {
  // Browser diline göre varsayılan dil belirleme (Almanca öncelikli)
  const getDefaultLanguage = (): 'tr' | 'de' | 'en' => {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('de')) return 'de';
    if (browserLang.startsWith('tr')) return 'tr';
    if (browserLang.startsWith('en')) return 'en';
    return 'de'; // Varsayılan Almanca
  };

  const [currentLang, setCurrentLang] = useState<'tr' | 'de' | 'en'>(() => getDefaultLanguage());

  // Ana sayfa ve routing
  return (
    <div className="min-h-screen relative overflow-hidden">
      <Toaster 
        position="top-right" 
        theme="light"
        richColors
        expand
      />
      <TopProgressBar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              {/* Video Background */}
              <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <video
                  key="background-video"
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                >
                  <source src="/assets/jkj.mp4" type="video/mp4" />
                </video>
              </div>
              <Header currentLang={currentLang} onLanguageChange={setCurrentLang} />
              <VideoHero lang={currentLang} />
              <Solutions lang={currentLang} />
              <References lang={currentLang} />
              <Contact lang={currentLang} />
              <Footer lang={currentLang} />
            </>
          }
        />
        <Route path="/branding" element={<Branding />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </div>
  );
}
