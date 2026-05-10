'use client';

import React, { useState } from 'react';
import { useCanvasStore } from '@/lib/canvas-store';
import { useTokenStore } from '@/lib/token-store';
import { useThemeStore } from '@/lib/theme-store';
import type { NodeStyles } from '@/types';
import { Layout, Palette, Type, BoxSelect, MoreHorizontal, ChevronDown, ChevronRight } from 'lucide-react';

const defaultExpandedSections: Record<string, boolean> = { layout: true, appearance: true };

const styleSections: Array<{ key: string; label: string; icon: React.ReactNode; fields: Array<keyof NodeStyles> }> = [
  { key: 'layout', label: 'Layout', icon: <Layout size={12} />, fields: ['display', 'flexDirection', 'justifyContent', 'alignItems', 'gap', 'flexWrap', 'overflow'] },
  { key: 'size', label: 'Size', icon: <BoxSelect size={12} />, fields: ['width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight'] },
  { key: 'spacing', label: 'Spacing', icon: <MoreHorizontal size={12} />, fields: ['padding', 'margin'] },
  { key: 'typography', label: 'Type', icon: <Type size={12} />, fields: ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textAlign', 'color'] },
  { key: 'appearance', label: 'Style', icon: <Palette size={12} />, fields: ['backgroundColor', 'borderRadius', 'borderWidth', 'borderStyle', 'borderColor', 'boxShadow', 'opacity', 'cursor'] },
];

const fieldLabels: Partial<Record<keyof NodeStyles, string>> = {
  display: 'Display', flexDirection: 'Direction', justifyContent: 'Justify', alignItems: 'Align',
  gap: 'Gap', flexWrap: 'Wrap', overflow: 'Overflow',
  width: 'W', height: 'H', minWidth: 'Min W', maxWidth: 'Max W', minHeight: 'Min H', maxHeight: 'Max H',
  padding: 'Padding', margin: 'Margin',
  fontFamily: 'Font', fontSize: 'Size', fontWeight: 'Weight', lineHeight: 'Line H',
  letterSpacing: 'Spacing', textAlign: 'Align', color: 'Color',
  backgroundColor: 'BG', borderRadius: 'Radius', borderWidth: 'Border W', borderStyle: 'Border S',
  borderColor: 'Border C', boxShadow: 'Shadow', opacity: 'Opacity', cursor: 'Cursor',
};

const selectOptions: Partial<Record<keyof NodeStyles, string[]>> = {
  display: ['block', 'flex', 'grid', 'inline', 'inline-flex', 'none'],
  flexDirection: ['row', 'column', 'row-reverse', 'column-reverse'],
  justifyContent: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'],
  alignItems: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'],
  flexWrap: ['nowrap', 'wrap', 'wrap-reverse'],
  overflow: ['visible', 'hidden', 'scroll', 'auto'],
  borderStyle: ['none', 'solid', 'dashed', 'dotted'],
  textAlign: ['left', 'center', 'right', 'justify'],
  fontWeight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  cursor: ['default', 'pointer', 'text', 'move', 'not-allowed'],
};

const colorFields: Array<keyof NodeStyles> = ['color', 'backgroundColor', 'borderColor'];
const unitOptions: Partial<Record<keyof NodeStyles, string[]>> = {
  width: ['px', '%', 'vw', 'vh', 'rem', 'em', 'pt'],
  height: ['px', '%', 'vw', 'vh', 'rem', 'em', 'pt'],
  minWidth: ['px', '%', 'vw', 'rem', 'em', 'pt'],
  maxWidth: ['px', '%', 'vw', 'rem', 'em', 'pt'],
  minHeight: ['px', '%', 'vh', 'rem', 'em', 'pt'],
  maxHeight: ['px', '%', 'vh', 'rem', 'em', 'pt'],
  padding: ['px', '%', 'rem', 'em', 'pt', 'vw', 'vh'],
  margin: ['px', '%', 'rem', 'em', 'pt', 'vw', 'vh'],
  gap: ['px', '%', 'rem', 'em', 'pt', 'vw', 'vh'],
  fontSize: ['px', 'pt', 'rem', 'em', '%'],
  letterSpacing: ['px', 'pt', 'rem', 'em', '%'],
  borderRadius: ['px', '%', 'rem', 'em'],
  borderWidth: ['px', 'pt', 'rem'],
};

const parseUnitValue = (value: string | undefined, defaultUnit: string) => {
  if (!value) return { amount: '', unit: defaultUnit, custom: false };
  const trimmed = value.trim();
  const match = trimmed.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
  if (!match) return { amount: trimmed, unit: defaultUnit, custom: true };
  return {
    amount: match[1],
    unit: match[2] || defaultUnit,
    custom: false,
  };
};

const buildUnitValue = (amount: string, unit: string) => {
  if (!amount.trim()) return '';
  return `${amount}${unit}`;
};

export default function PropertiesPanel() {
  const { nodes, selectedNodeId, updateNodeStyles, updateNodeContent, updateNodeName, resizeNode, moveNode } = useCanvasStore();
  const { getColorTokens } = useTokenStore();
  const isDark = useThemeStore(s => s.isDark);
  const [sectionState, setSectionState] = useState<{
    nodeId: string | null;
    sections: Record<string, boolean>;
  }>({
    nodeId: selectedNodeId,
    sections: defaultExpandedSections,
  });
  const [activeTab, setActiveTab] = useState<'style' | 'content'>('style');

  const node = selectedNodeId ? nodes[selectedNodeId] : null;
  const colorTokens = getColorTokens();
  const expandedSections = sectionState.nodeId === selectedNodeId ? sectionState.sections : defaultExpandedSections;

  const icls = isDark
    ? 'bg-[#1e1e2e] border-[#2a2a40] text-slate-200 placeholder:text-slate-600'
    : 'bg-slate-50 border-slate-200 placeholder:text-slate-400';
  const inputCls = `w-full text-[11px] px-1.5 py-[3px] border rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 ${icls}`;
  const selectCls = `w-full text-[11px] px-1.5 py-[3px] border rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 ${icls}`;

  if (!node) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <div className={`w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center ${isDark ? 'bg-[#1e1e2e]' : 'bg-slate-50'}`}>
              <BoxSelect size={18} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
            </div>
            <p className={`text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Select an element</p>
          </div>
        </div>
      </div>
    );
  }

  const handleStyleChange = (field: keyof NodeStyles, value: string) =>
    updateNodeStyles(node.id, { ...node.styles, [field]: value });

  return (
    <div className="flex flex-col h-full">
      <div className={`px-2 py-1.5 border-b space-y-1 ${isDark ? 'border-[#1e1e2e]' : 'border-slate-100'}`}>
        <div className="flex items-center gap-1">
          <input type="text" value={node.name} onChange={e => updateNodeName(node.id, e.target.value)} className={`flex-1 text-[11px] px-1.5 py-[3px] border rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 ${icls}`} />
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[{ label: 'X', key: 'x', value: Math.round(node.x) }, { label: 'Y', key: 'y', value: Math.round(node.y) },
            { label: 'W', key: 'w', value: Math.round(node.width) }, { label: 'H', key: 'h', value: Math.round(node.height) }].map(item => (
            <div key={item.key}>
              <label className={`text-[9px] uppercase ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{item.label}</label>
              <input type="number" value={item.value} onChange={e => {
                const v = parseInt(e.target.value) || 0;
                if (item.key === 'x') moveNode(node.id, v, node.y);
                if (item.key === 'y') moveNode(node.id, node.x, v);
                if (item.key === 'w') resizeNode(node.id, v, node.height);
                if (item.key === 'h') resizeNode(node.id, node.width, v);
              }} className={`w-full text-[10px] text-center px-0.5 py-[2px] border rounded focus:outline-none ${icls}`} />
            </div>
          ))}
        </div>
        {(node.type === 'text' || node.type === 'button' || node.type === 'link' || node.type === 'badge' || node.type === 'input' || node.type === 'textarea' || node.type === 'hero' || node.type === 'navbar' || node.type === 'select' || node.type === 'icon') && (
          <div className="flex gap-0.5">
            <button onClick={() => setActiveTab('style')} className={`flex-1 text-[10px] py-[2px] rounded ${activeTab === 'style' ? (isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>Style</button>
            <button onClick={() => setActiveTab('content')} className={`flex-1 text-[10px] py-[2px] rounded ${activeTab === 'content' ? (isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>Content</button>
          </div>
        )}
        {activeTab === 'content' && (
          <textarea value={node.content || ''} onChange={e => updateNodeContent(node.id, e.target.value)} className={`${inputCls} resize-none h-14`} placeholder="Content..." />
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {styleSections.map(section => {
          const isExpanded = expandedSections[section.key] !== false;
          return (
            <div key={section.key}>
              <button className={`w-full flex items-center gap-1.5 px-2 py-[5px] text-[10px] font-medium border-b ${isDark ? 'text-slate-400 hover:bg-[#1e1e2e] border-[#1e1e2e]' : 'text-slate-600 hover:bg-slate-50 border-slate-100'}`}
                onClick={() =>
                  setSectionState(current => {
                    const sections = current.nodeId === selectedNodeId ? current.sections : defaultExpandedSections;
                    return {
                      nodeId: selectedNodeId,
                      sections: { ...sections, [section.key]: !sections[section.key] },
                    };
                  })
                }>
                {section.icon}
                <span className="flex-1 text-left">{section.label}</span>
                {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
              </button>
              {isExpanded && (
                <div className="px-2 pb-1.5 space-y-1">
                  {section.fields.map(field => (
                    <div key={field} className="flex items-center gap-1">
                      <label className={`text-[9px] uppercase w-12 shrink-0 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{fieldLabels[field] || field}</label>
                      {selectOptions[field] ? (
                        <select value={node.styles[field] || ''} onChange={e => handleStyleChange(field, e.target.value)} className={selectCls}>
                          <option value="">—</option>
                          {selectOptions[field].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : colorFields.includes(field) ? (
                        <div className="flex gap-0.5 flex-1">
                          <input type="color" value={node.styles[field] || '#000000'} onChange={e => handleStyleChange(field, e.target.value)} className={`w-5 h-5 rounded border cursor-pointer p-0 ${isDark ? 'border-[#2a2a40]' : 'border-slate-200'}`} />
                          <input type="text" value={node.styles[field] || ''} onChange={e => handleStyleChange(field, e.target.value)} className={`flex-1 text-[10px] px-1 py-[2px] border rounded focus:outline-none ${icls}`} placeholder="#" />
                          <select value="" onChange={e => { if (e.target.value) handleStyleChange(field, e.target.value); }} className={`text-[9px] px-0.5 border rounded ${icls}`}>
                            <option value="">Tk</option>
                            {colorTokens.map(t => <option key={t.id} value={t.value}>{t.name}</option>)}
                          </select>
                        </div>
                      ) : unitOptions[field] ? (
                        (() => {
                          const options = unitOptions[field];
                          const parsed = parseUnitValue(node.styles[field], options?.[0] || 'px');
                          if (!options || parsed.custom) {
                            return (
                              <input
                                type="text"
                                value={node.styles[field] || ''}
                                onChange={e => handleStyleChange(field, e.target.value)}
                                className={`${inputCls} flex-1`}
                                placeholder={options ? options.join(' / ') : ''}
                              />
                            );
                          }
                          return (
                            <div className="flex gap-0.5 flex-1">
                              <input
                                type="number"
                                value={parsed.amount}
                                onChange={e => handleStyleChange(field, buildUnitValue(e.target.value, parsed.unit))}
                                className={`flex-1 text-[10px] px-1 py-[2px] border rounded focus:outline-none ${icls}`}
                              />
                              <select
                                value={parsed.unit}
                                onChange={e => handleStyleChange(field, buildUnitValue(parsed.amount, e.target.value))}
                                className={`w-16 text-[9px] px-0.5 border rounded ${icls}`}
                              >
                                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>
                          );
                        })()
                      ) : (
                        <input type="text" value={node.styles[field] || ''} onChange={e => handleStyleChange(field, e.target.value)} className={`${inputCls} flex-1`} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
