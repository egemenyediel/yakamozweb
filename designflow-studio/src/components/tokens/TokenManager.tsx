'use client';

import React, { useState } from 'react';
import { useTokenStore } from '@/lib/token-store';
import { useThemeStore } from '@/lib/theme-store';
import { DesignTokenType } from '@/types';
import { Palette, Type, Move, BoxSelect, Layers, Sun, Plus, Trash2 } from 'lucide-react';

const tokenTabs: { key: DesignTokenType; label: string; icon: React.ReactNode }[] = [
  { key: 'color', label: 'Color', icon: <Palette size={12} /> },
  { key: 'typography', label: 'Type', icon: <Type size={12} /> },
  { key: 'spacing', label: 'Space', icon: <Move size={12} /> },
  { key: 'borderRadius', label: 'Radius', icon: <BoxSelect size={12} /> },
  { key: 'shadow', label: 'Shadow', icon: <Layers size={12} /> },
];

export default function TokenManager() {
  const { tokens, activeTokenTab, setActiveTokenTab, addToken, updateToken, removeToken, themes, activeTheme, setActiveTheme, addTheme } = useTokenStore();
  const isDark = useThemeStore(s => s.isDark);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenValue, setNewTokenValue] = useState('');
  const [newThemeName, setNewThemeName] = useState('');
  const [showThemeInput, setShowThemeInput] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const currentTokens = tokens.filter(t => t.type === activeTokenTab);
  const handleAddToken = () => { if (!newTokenName.trim()) return; addToken({ name: newTokenName, type: activeTokenTab, value: newTokenValue || '#000000', group: activeTokenTab }); setNewTokenName(''); setNewTokenValue(''); };
  const handleAddTheme = () => { if (!newThemeName.trim()) return; addTheme(newThemeName); setNewThemeName(''); setShowThemeInput(false); };
  const groups = [...new Set(currentTokens.map(t => t.group).filter(Boolean))];

  const icls = isDark ? 'bg-[#1e1e2e] border-[#2a2a40] text-slate-200' : 'bg-slate-50 border-slate-200';

  return (
    <div className="flex flex-col h-full">
      <div className={`px-2 py-1 border-b flex items-center justify-between ${isDark ? 'border-[#1e1e2e]' : 'border-slate-100'}`}>
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Tokens</span>
        <div className="flex items-center gap-1">
          <Sun size={10} className={isDark ? 'text-slate-600' : 'text-slate-400'} />
          <select value={activeTheme} onChange={e => setActiveTheme(e.target.value)}
            className={`text-[10px] border rounded px-1 py-0.5 focus:outline-none ${icls}`}>
            {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {showThemeInput ? (
            <div className="flex items-center gap-0.5">
              <input type="text" value={newThemeName} onChange={e => setNewThemeName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTheme()} placeholder="Name" className={`text-[10px] w-16 px-1 py-0.5 border rounded focus:outline-none ${icls}`} autoFocus />
              <button onClick={handleAddTheme} className="text-[10px] text-indigo-400">+</button>
            </div>
          ) : (
            <button onClick={() => setShowThemeInput(true)} className={`text-[10px] ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>+Theme</button>
          )}
        </div>
      </div>

      <div className={`flex border-b ${isDark ? 'border-[#1e1e2e]' : 'border-slate-100'}`}>
        {tokenTabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTokenTab(tab.key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 text-[9px] transition-colors ${
              activeTokenTab === tab.key
                ? isDark ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/10' : 'text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50/50'
                : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
            }`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5">
        {groups.map(group => (
          <div key={group}>
            <div className={`text-[9px] uppercase tracking-wider mb-0.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{group}</div>
            <div className="space-y-0.5">
              {currentTokens.filter(t => t.group === group).map(token => (
                <div key={token.id} className={`flex items-center gap-1 group rounded px-1.5 py-[3px] border ${isDark ? 'bg-[#1e1e2e] border-[#2a2a40]' : 'bg-slate-50 border-slate-100'}`}>
                  {activeTokenTab === 'color' && (
                    <input type="color" value={token.value} onChange={e => updateToken(token.id, { value: e.target.value })} className={`w-5 h-5 rounded border cursor-pointer p-0 ${isDark ? 'border-[#2a2a40]' : 'border-slate-200'}`} />
                  )}
                  {editingId === token.id ? (
                    <input type="text" value={token.name} onChange={e => updateToken(token.id, { name: e.target.value })} onBlur={() => setEditingId(null)} onKeyDown={e => e.key === 'Enter' && setEditingId(null)}
                      className={`flex-1 text-[10px] border rounded px-1 py-0.5 focus:outline-none ${isDark ? 'bg-[#0d0d1a] border-indigo-500/50 text-slate-200' : 'bg-white border-indigo-300'}`} autoFocus />
                  ) : (
                    <span className={`flex-1 text-[10px] cursor-pointer ${isDark ? 'text-slate-300 hover:text-indigo-400' : 'text-slate-700 hover:text-indigo-600'}`} onDoubleClick={() => setEditingId(token.id)}>{token.name}</span>
                  )}
                  <input type="text" value={token.value} onChange={e => updateToken(token.id, { value: e.target.value })}
                    className={`text-[10px] bg-transparent border border-transparent rounded px-0.5 py-0 focus:outline-none w-20 ${isDark ? 'text-slate-500 hover:border-[#2a2a40]' : 'text-slate-500 hover:border-slate-200'}`} />
                  <button className={`opacity-0 group-hover:opacity-100 ${isDark ? 'text-slate-600 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`} onClick={() => removeToken(token.id)}>
                    <Trash2 size={9} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className={`pt-1.5 border-t ${isDark ? 'border-[#1e1e2e]' : 'border-slate-100'}`}>
          <div className="flex gap-1">
            <input type="text" value={newTokenName} onChange={e => setNewTokenName(e.target.value)} placeholder="Name" onKeyDown={e => e.key === 'Enter' && handleAddToken()}
              className={`flex-1 text-[10px] px-1.5 py-[3px] border rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-[#1e1e2e] border-[#2a2a40] text-slate-200 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 placeholder:text-slate-400'}`} />
            <input type={activeTokenTab === 'color' ? 'color' : 'text'} value={newTokenValue} onChange={e => setNewTokenValue(e.target.value)} placeholder="Value"
              className={`${activeTokenTab === 'color' ? 'w-7' : 'w-16'} text-[10px] px-1 py-[3px] border rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 ${icls}`} />
            <button onClick={handleAddToken} className="px-1.5 py-[3px] bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"><Plus size={12} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
