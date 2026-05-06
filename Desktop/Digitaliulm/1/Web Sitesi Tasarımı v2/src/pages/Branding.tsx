import React from "react";


const Branding: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
          <span className="inline-block">
            <span className="text-[#0EA5E9] font-[600]">digital</span>
            <span className="text-black font-[600]">iulm</span>
            <span className="text-[#0EA5E9] font-[600]">.de</span>
          </span>
          <span className="text-lg font-normal text-gray-500">Brand Design System</span>
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Bu sayfa, digitaliulm markasının paylaşıma açık logo, renk paleti, yazı tipi ve temel tasarım sistemini içerir. Tüm görselleri ve kodları özgürce kullanabilirsiniz.
        </p>

        {/* Branding assets are intentionally minimal here — available from footer */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Marka Varlıkları</h2>
          <p className="text-gray-700 mb-4">Tüm logo ve tasarım dosyaları footer'daki "Brand Design System" bağlantısı altında bulunmaktadır. İndirmek için footer'daki bağlantıyı kullanın.</p>
          <div className="flex gap-3">
            <a href="/assets/branding/digitaliulm-logo.svg" download className="px-4 py-2 rounded bg-[#0EA5E9] text-white">SVG indir</a>
            <a href="/assets/branding/digitaliulm-logo.svg" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded border">SVG önizle</a>
          </div>
        </div>

        {/* Color Palette */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Renk Paleti</h2>
          <div className="flex gap-6 items-end">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-lg bg-[#0EA5E9] border-2 border-[#0EA5E9]" />
              <span className="mt-2 text-xs font-medium text-[#0EA5E9]">#0EA5E9</span>
              <span className="text-xs text-gray-500">Primary</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-lg bg-black border-2 border-gray-300" />
              <span className="mt-2 text-xs font-medium text-black">#111111</span>
              <span className="text-xs text-gray-500">Text</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-lg bg-white border-2 border-gray-200" />
              <span className="mt-2 text-xs font-medium text-gray-700">#FFFFFF</span>
              <span className="text-xs text-gray-500">Background</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-lg bg-[#FACC15] border-2 border-[#FACC15]" />
              <span className="mt-2 text-xs font-medium text-[#FACC15]">#FACC15</span>
              <span className="text-xs text-gray-500">Accent</span>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Yazı Tipi & Stili</h2>
          <div className="flex flex-col gap-2">
            <span className="font-sans text-lg font-bold">Inter, sans-serif</span>
            <span className="text-gray-700">Başlıklar: <span className="font-bold">font-extrabold</span>, <span className="font-semibold">font-semibold</span></span>
            <span className="text-gray-700">Paragraflar: <span className="font-normal">font-normal</span></span>
            <span className="text-xs text-gray-500">Google Fonts: <a href="https://fonts.google.com/specimen/Inter" className="text-[#0EA5E9] underline" target="_blank" rel="noopener noreferrer">Inter</a></span>
          </div>
        </div>

        {/* UI Bileşenleri */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">UI Bileşenleri (Örnekler)</h2>
          <div className="flex gap-4 flex-wrap">
            <button className="px-5 py-2 rounded-lg bg-[#0EA5E9] text-white font-semibold shadow hover:bg-[#0284c7] transition">Primary Button</button>
            <button className="px-5 py-2 rounded-lg border border-[#0EA5E9] text-[#0EA5E9] font-semibold bg-white hover:bg-[#e0f2fe] transition">Outline Button</button>
            <span className="inline-block px-3 py-1 rounded-full bg-[#FACC15] text-black font-medium text-xs">Badge</span>
            <input className="px-3 py-2 border border-gray-300 rounded-lg focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 outline-none text-sm" placeholder="Input örneği" />
          </div>
        </div>

        {/* Paylaşım ve Lisans */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Paylaşım & Lisans</h2>
          <p className="text-gray-700 text-sm">Tüm logo, renk ve tasarım sistemini dilediğiniz gibi kullanabilir, paylaşabilirsiniz. Attribution (referans) vermeniz yeterlidir.</p>
        </div>
      </div>
    </div>
  );
};

export default Branding;
