'use client';

import React, { useState } from 'react';
import { useThemeStore } from '@/lib/theme-store';
import { componentTemplates, categories } from '@/lib/component-templates';
import {
  Square, Type, Image as ImageIcon, LayoutGrid, CreditCard, Menu, Sparkles, Link, Star,
  Tag, Minus, User, TextCursorInput, ToggleLeft, CheckSquare, AlignLeft,
  ChevronDown, ChevronRight, Columns, AlignHorizontalSpaceAround, AlignVerticalSpaceAround,
  RectangleHorizontal, Heading, Search
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Square: <Square size={14} />, Type: <Type size={14} />, Image: <ImageIcon size={14} />,
  Columns: <Columns size={14} />, LayoutGrid: <LayoutGrid size={14} />,
  CreditCard: <CreditCard size={14} />, Menu: <Menu size={14} />,
  Sparkles: <Sparkles size={14} />, Link: <Link size={14} />, Star: <Star size={14} />,
  Tag: <Tag size={14} />, Minus: <Minus size={14} />, User: <User size={14} />,
  TextCursorInput: <TextCursorInput size={14} />, ToggleLeft: <ToggleLeft size={14} />,
  CheckSquare: <CheckSquare size={14} />, AlignLeft: <AlignLeft size={14} />,
  ChevronDown: <ChevronDown size={14} />, AlignHorizontalSpaceAround: <AlignHorizontalSpaceAround size={14} />,
  AlignVerticalSpaceAround: <AlignVerticalSpaceAround size={14} />,
  RectangleHorizontal: <RectangleHorizontal size={14} />, Heading: <Heading size={14} />,
};

export default function ComponentPanel() {
  const isDark = useThemeStore(s => s.isDark);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>(
    Object.fromEntries(categories.map(c => [c, true]))
  );
  const [search, setSearch] = useState('');

  const handleDragStart = (e: React.DragEvent, template: typeof componentTemplates[0]) => {
    e.dataTransfer.setData('component-template', JSON.stringify(template));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const filtered = componentTemplates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = categories.reduce((acc, cat) => {
    const items = filtered.filter(t => t.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, typeof componentTemplates>);

  return (
    <div className="flex flex-col h-full">
      <div className={`px-2 py-1 border-b ${isDark ? 'border-[#1e1e2e]' : 'border-slate-100'}`}>
        <div className="relative">
          <Search size={10} className={`absolute left-1.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            className={`w-full text-[11px] pl-5 pr-1.5 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
              isDark ? 'bg-[#1e1e2e] border-[#2a2a40] text-slate-200 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 placeholder:text-slate-400'
            }`} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {Object.entries(grouped).map(([category, templates]) => (
          <div key={category}>
            <button
              className={`w-full flex items-center gap-1 px-2 py-[5px] text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500 hover:bg-[#1e1e2e]' : 'text-slate-500 hover:bg-slate-50'}`}
              onClick={() => setExpandedCats(p => ({ ...p, [category]: !p[category] }))}
            >
              {expandedCats[category] ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
              {category}
            </button>
            {expandedCats[category] && (
              <div className="grid grid-cols-2 gap-0.5 px-1.5 pb-1">
                {templates.map(template => (
                  <div key={template.id} draggable onDragStart={e => handleDragStart(e, template)}
                    className={`flex items-center gap-1.5 px-1.5 py-[5px] rounded cursor-grab transition-all active:cursor-grabbing active:scale-95 border ${
                      isDark ? 'border-transparent hover:bg-indigo-500/10 hover:border-indigo-500/20' : 'border-transparent hover:bg-indigo-50 hover:border-indigo-200'
                    }`}>
                    <div className={`w-5 h-5 flex items-center justify-center rounded ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {iconMap[template.icon] || <Square size={14} />}
                    </div>
                    <span className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{template.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
