'use client';

import React, { useState, useMemo } from 'react';
import { useCanvasStore } from '@/lib/canvas-store';
import { useTokenStore } from '@/lib/token-store';
import { useThemeStore } from '@/lib/theme-store';
import { exportCode } from '@/lib/code-export';
import { ExportFormat } from '@/types';
import { Copy, Download, Check } from 'lucide-react';

const formats: { key: ExportFormat; label: string; ext: string }[] = [
  { key: 'react', label: 'React', ext: '.jsx' },
  { key: 'html', label: 'HTML', ext: '.html' },
  { key: 'tailwind', label: 'Tailwind', ext: '.html' },
  { key: 'vue', label: 'Vue', ext: '.vue' },
  { key: 'css', label: 'CSS', ext: '.css' },
];

export default function CodeExportPanel() {
  const { nodes, artboards } = useCanvasStore();
  const { tokens } = useTokenStore();
  const isDark = useThemeStore(s => s.isDark);
  const [activeFormat, setActiveFormat] = useState<ExportFormat>('react');
  const [copied, setCopied] = useState(false);

  const allNodeIds = artboards.flatMap(ab => ab.nodes);
  const code = useMemo(() => {
    if (allNodeIds.length === 0) return '// Add components to see code';
    return exportCode(nodes, allNodeIds, activeFormat);
  }, [nodes, allNodeIds, activeFormat]);

  const handleCopy = async () => { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleDownload = () => {
    const format = formats.find(f => f.key === activeFormat);
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `component${format?.ext || '.txt'}`; a.click();
    URL.revokeObjectURL(url);
  };

  const tokenCSS = useMemo(() => {
    const lines: string[] = [':root {'];
    tokens.filter(t => t.type === 'color').forEach(t => lines.push(`  --color-${t.name}: ${t.value};`));
    tokens.filter(t => t.type === 'spacing').forEach(t => lines.push(`  --spacing-${t.name}: ${t.value};`));
    tokens.filter(t => t.type === 'borderRadius').forEach(t => lines.push(`  --radius-${t.name}: ${t.value};`));
    lines.push('}');
    return lines.join('\n');
  }, [tokens]);

  return (
    <div className="flex flex-col h-full">
      <div className={`px-2 py-1 border-b flex items-center justify-between ${isDark ? 'border-[#1e1e2e]' : 'border-slate-100'}`}>
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Export</span>
        <div className="flex items-center gap-0.5">
          <button onClick={handleCopy} className={`flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'bg-[#1e1e2e] hover:bg-[#2a2a40] text-slate-300' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`}>
            {copied ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
            {copied ? 'OK' : 'Copy'}
          </button>
          <button onClick={handleDownload} className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-indigo-500 text-white hover:bg-indigo-600">
            <Download size={10} />
          </button>
        </div>
      </div>

      <div className={`flex border-b ${isDark ? 'border-[#1e1e2e]' : 'border-slate-100'}`}>
        {formats.map(f => (
          <button key={f.key} onClick={() => setActiveFormat(f.key)}
            className={`flex-1 text-[9px] py-1 transition-colors ${
              activeFormat === f.key
                ? isDark ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/10' : 'text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50/50'
                : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        <pre className={`p-2 text-[10px] leading-relaxed font-mono min-h-full ${isDark ? 'bg-[#0a0a14] text-emerald-400' : 'bg-slate-950 text-green-400'}`}>
          <code>{code}</code>
        </pre>
      </div>

      <div className={`border-t ${isDark ? 'border-[#1e1e2e]' : 'border-slate-100'}`}>
        <div className="px-2 py-1">
          <div className={`text-[9px] uppercase tracking-wider mb-0.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Token CSS</div>
          <pre className={`text-[9px] rounded p-1.5 max-h-20 overflow-auto font-mono ${isDark ? 'text-slate-500 bg-[#1e1e2e]' : 'text-slate-500 bg-slate-50'}`}>{tokenCSS}</pre>
        </div>
      </div>
    </div>
  );
}
