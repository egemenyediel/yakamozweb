import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex flex-col">
      <nav className="px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">DesignFlow Studio</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
          <a href="#tokens" className="text-sm text-slate-400 hover:text-white transition-colors">Tokens</a>
          <a href="#export" className="text-sm text-slate-400 hover:text-white transition-colors">Export</a>
          <Link
            href="/studio"
            className="px-5 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-400 transition-colors"
          >
            Open Studio
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs text-indigo-300">Design System Manager & Code Export</span>
          </div>

          <h1 className="text-6xl font-bold text-white leading-tight mb-6">
            Design, Manage
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              & Export Components
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Canvas-based component designer with a built-in design system manager.
            Create design tokens, build components visually, and export production-ready code.
          </p>

          <div className="flex items-center justify-center gap-4 mb-16">
            <Link
              href="/studio"
              className="px-8 py-3.5 bg-indigo-500 text-white font-semibold rounded-xl hover:bg-indigo-400 transition-all hover:shadow-lg hover:shadow-indigo-500/25"
            >
              Launch Studio →
            </Link>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-indigo-500/10">
            <div className="bg-slate-900 p-1">
              <div className="flex items-center gap-1.5 px-3 py-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                <span className="ml-3 text-xs text-slate-500">DesignFlow Studio</span>
              </div>
            </div>
            <div className="bg-slate-800/50 p-8 h-72 flex items-center justify-center">
              <div className="grid grid-cols-4 gap-4 w-full max-w-2xl">
                <div className="col-span-1 bg-slate-700/30 rounded-lg p-3 h-52">
                  <div className="h-2 w-10 bg-slate-600 rounded mb-3" />
                  <div className="grid grid-cols-2 gap-1.5">
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} className="h-8 bg-slate-600/50 rounded" />
                    ))}
                  </div>
                </div>
                <div className="col-span-1 bg-slate-700/30 rounded-lg p-3 h-52">
                  <div className="h-2 w-8 bg-slate-600 rounded mb-3" />
                  <div className="space-y-1.5">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="h-5 bg-slate-600/50 rounded" />
                    ))}
                  </div>
                </div>
                <div className="col-span-1 bg-white rounded-lg p-4 h-52 shadow-lg relative">
                  <div className="absolute top-2 left-3 text-[8px] text-slate-300">Canvas</div>
                  <div className="mt-3 h-8 bg-indigo-100 rounded" />
                  <div className="mt-2 h-12 bg-slate-100 rounded" />
                  <div className="mt-2 h-6 bg-indigo-500 rounded" />
                </div>
                <div className="col-span-1 bg-slate-700/30 rounded-lg p-3 h-52">
                  <div className="h-2 w-10 bg-slate-600 rounded mb-3" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-full bg-slate-600/50 rounded" />
                    <div className="h-8 bg-slate-600/50 rounded" />
                    <div className="h-4 w-full bg-slate-600/50 rounded" />
                    <div className="h-8 bg-slate-600/50 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section id="features" className="py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Everything you need</h2>
          <p className="text-slate-400 text-center mb-16 max-w-lg mx-auto">A complete design-to-code workflow in one tool</p>

          <div className="grid grid-cols-3 gap-6">
            {[
              {
                title: 'Visual Canvas',
                desc: 'Pan & zoom infinite canvas with drag-and-drop components. Resize, reorder, and arrange elements visually.',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-400">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M3 9h18M9 3v18"/>
                  </svg>
                ),
              },
              {
                title: 'Design Tokens',
                desc: 'Manage colors, typography, spacing, border radius, and shadows. Theme switching between light and dark.',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M12 3v18M3 12h18"/>
                  </svg>
                ),
              },
              {
                title: 'Code Export',
                desc: 'Export to React JSX, HTML+CSS, Tailwind CSS, Vue SFC, and CSS Modules. Production-ready code instantly.',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400">
                    <polyline points="16 18 22 12 16 6"/>
                    <polyline points="8 6 2 12 8 18"/>
                  </svg>
                ),
              },
            ].map((feature, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-indigo-500/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 px-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xs text-slate-500">DesignFlow Studio — Design System Manager</span>
          <span className="text-xs text-slate-600">Built with Next.js + Zustand</span>
        </div>
      </footer>
    </div>
  );
}
