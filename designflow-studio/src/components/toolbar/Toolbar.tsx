'use client';

import React from 'react';
import { ZoomIn, ZoomOut, Moon, Sun, LayoutGrid, Layers, BoxSelect, Palette, Code } from 'lucide-react';
import { useCanvasStore } from '@/lib/canvas-store';
import { useThemeStore } from '@/lib/theme-store';
import { usePanelStore, PanelId } from '@/lib/panel-store';

const panelButtons: { id: PanelId; icon: React.ReactNode; label: string }[] = [
  { id: 'components', icon: <LayoutGrid size={13} />, label: 'Components' },
  { id: 'layers', icon: <Layers size={13} />, label: 'Layers' },
  { id: 'properties', icon: <BoxSelect size={13} />, label: 'Properties' },
  { id: 'tokens', icon: <Palette size={13} />, label: 'Tokens' },
  { id: 'export', icon: <Code size={13} />, label: 'Export' },
];

export default function Toolbar() {
  const { canvasZoom, setCanvasZoom, artboards } = useCanvasStore();
  const { isDark, toggle } = useThemeStore();
  const { panels, togglePanel } = usePanelStore();

  return (
    <div className={`h-9 flex items-center px-2 gap-1 border-b shrink-0 ${isDark ? 'bg-[#141422] border-[#2a2a40]' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center gap-0.5 mr-1">
        <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center mr-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
        </div>
        <span className={`text-[11px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>DesignFlow</span>
      </div>

      <div className={`w-px h-4 ${isDark ? 'bg-[#2a2a40]' : 'bg-slate-200'}`} />

      <div className="flex items-center gap-0.5">
        <button className={`p-1 rounded ${isDark ? 'text-slate-400 hover:bg-[#2a2a40]' : 'text-slate-500 hover:bg-slate-50'}`} onClick={() => setCanvasZoom(canvasZoom - 0.1)}><ZoomOut size={14} /></button>
        <span className={`text-[10px] min-w-[36px] text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{Math.round(canvasZoom * 100)}%</span>
        <button className={`p-1 rounded ${isDark ? 'text-slate-400 hover:bg-[#2a2a40]' : 'text-slate-500 hover:bg-slate-50'}`} onClick={() => setCanvasZoom(canvasZoom + 0.1)}><ZoomIn size={14} /></button>
      </div>

      <div className={`w-px h-4 ${isDark ? 'bg-[#2a2a40]' : 'bg-slate-200'}`} />

      <div className="flex items-center gap-0.5">
        {panelButtons.map(pb => {
          const p = panels[pb.id];
          const active = p?.visible;
          return (
            <button key={pb.id} onClick={() => togglePanel(pb.id)}
              title={`${active ? 'Hide' : 'Show'} ${pb.label}`}
              className={`p-1 rounded text-[10px] flex items-center gap-0.5 transition-colors ${
                active
                  ? isDark ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                  : isDark ? 'text-slate-600 hover:bg-[#1e1e2e] hover:text-slate-400' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}>
              {pb.icon}
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      <div className={`text-[9px] mr-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>
        {artboards.map(ab => `${ab.name}: ${ab.width}×${ab.height}`).join(' · ')}
      </div>

      <button className={`p-1 rounded transition-colors ${isDark ? 'text-amber-400 hover:bg-amber-500/10' : 'text-slate-500 hover:bg-slate-50'}`} onClick={toggle} title={isDark ? 'Light Mode' : 'Dark Mode'}>
        {isDark ? <Sun size={14} /> : <Moon size={14} />}
      </button>
    </div>
  );
}
