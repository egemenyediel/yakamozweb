'use client';

import React, { useState } from 'react';
import { useCanvasStore } from '@/lib/canvas-store';
import { useThemeStore } from '@/lib/theme-store';
import {
  Eye, EyeOff, Lock, Unlock, Trash2, Copy, ChevronDown, ChevronRight,
  ArrowUp, ArrowDown, Square, Type, Image as ImageIcon, LayoutGrid, CreditCard, Menu,
  Link, Star, Tag, Minus, User, TextCursorInput, ToggleLeft, CheckSquare,
  AlignLeft, ChevronDownSquare, Monitor, Tablet, Smartphone, Users
} from 'lucide-react';
import { CanvasNodeType } from '@/types';

const typeIcons: Record<CanvasNodeType, React.ReactNode> = {
  div: <Square size={12} />, text: <Type size={12} />, button: <Square size={12} />,
  input: <TextCursorInput size={12} />, image: <ImageIcon size={12} />,
  container: <Square size={12} />, row: <LayoutGrid size={12} />, column: <LayoutGrid size={12} />,
  card: <CreditCard size={12} />, navbar: <Menu size={12} />, hero: <Star size={12} />,
  grid: <LayoutGrid size={12} />, flex: <LayoutGrid size={12} />,
  separator: <Minus size={12} />, icon: <Star size={12} />, link: <Link size={12} />,
  badge: <Tag size={12} />, avatar: <User size={12} />, checkbox: <CheckSquare size={12} />,
  toggle: <ToggleLeft size={12} />, select: <ChevronDownSquare size={12} />, textarea: <AlignLeft size={12} />,
};

export default function LayerPanel() {
  const { nodes, artboards, selectedNodeId, selectNode, toggleVisibility, toggleLock, removeNode, duplicateNode, bringForward, sendBackward, moveToChild, removeFromParent } = useCanvasStore();
  const isDark = useThemeStore(s => s.isDark);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverId(targetId);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverId(null);
    const nodeId = e.dataTransfer.getData('layer-node-id');
    if (nodeId && nodeId !== targetId) {
      moveToChild(targetId, nodeId);
    }
  };

  const handleDragStart = (e: React.DragEvent, nodeId: string) => {
    e.dataTransfer.setData('layer-node-id', nodeId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const renderNode = (id: string, depth: number) => {
    const node = nodes[id];
    if (!node) return null;
    const isSelected = selectedNodeId === id;
    const hasChildren = node.children.length > 0;
    const isCollapsed = collapsed[id];
    const isDragOver = dragOverId === id;

    return (
      <div key={id} draggable onDragStart={e => handleDragStart(e, id)} onDragOver={e => handleDragOver(e, id)} onDrop={e => handleDrop(e, id)} onDragLeave={() => setDragOverId(null)}>
        <div
          className={`flex items-center gap-0.5 px-1 py-[3px] cursor-pointer text-[11px] group transition-colors border border-transparent ${
            isSelected
              ? isDark ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              : isDragOver
                ? isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
                : isDark ? 'text-slate-400 hover:bg-[#1e1e2e]' : 'text-slate-600 hover:bg-slate-50'
          }`}
          style={{ paddingLeft: `${depth * 12 + 6}px` }}
          onClick={() => selectNode(id)}
        >
          {hasChildren ? (
            <button className={`p-0 rounded ${isDark ? 'hover:bg-[#2a2a40]' : 'hover:bg-slate-200'}`} onClick={e => { e.stopPropagation(); setCollapsed(p => ({ ...p, [id]: !p[id] })); }}>
              {isCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
            </button>
          ) : <span className="w-[10px]" />}
          <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{typeIcons[node.type]}</span>
          <span className="flex-1 truncate">{node.name}</span>
          <div className="hidden group-hover:flex items-center">
            <button className={`p-0.5 rounded ${isDark ? 'hover:bg-[#2a2a40]' : 'hover:bg-slate-200'}`} onClick={e => { e.stopPropagation(); bringForward(id); }}><ArrowUp size={9} /></button>
            <button className={`p-0.5 rounded ${isDark ? 'hover:bg-[#2a2a40]' : 'hover:bg-slate-200'}`} onClick={e => { e.stopPropagation(); sendBackward(id); }}><ArrowDown size={9} /></button>
            {node.parentId && (
              <button className={`p-0.5 rounded ${isDark ? 'hover:bg-[#2a2a40]' : 'hover:bg-slate-200'}`} onClick={e => { e.stopPropagation(); removeFromParent(id); }} title="Detach from parent">
                <Users size={9} />
              </button>
            )}
            <button className={`p-0.5 rounded ${isDark ? 'hover:bg-[#2a2a40]' : 'hover:bg-slate-200'}`} onClick={e => { e.stopPropagation(); duplicateNode(id); }}><Copy size={9} /></button>
            <button className={`p-0.5 rounded hover:text-red-400 ${isDark ? 'hover:bg-[#2a2a40]' : 'hover:bg-slate-200'}`} onClick={e => { e.stopPropagation(); removeNode(id); }}><Trash2 size={9} /></button>
          </div>
          <button className="p-0 opacity-40 hover:opacity-100" onClick={e => { e.stopPropagation(); toggleVisibility(id); }}>
            {node.visible ? <Eye size={9} /> : <EyeOff size={9} />}
          </button>
          <button className="p-0 opacity-40 hover:opacity-100" onClick={e => { e.stopPropagation(); toggleLock(id); }}>
            {node.locked ? <Lock size={9} /> : <Unlock size={9} />}
          </button>
        </div>
        {hasChildren && !isCollapsed && node.children.map(childId => renderNode(childId, depth + 1))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`px-2 py-1.5 border-b flex items-center justify-between ${isDark ? 'border-[#1e1e2e]' : 'border-slate-100'}`}>
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Layers</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {artboards.length === 0 ? (
          <div className={`px-3 py-6 text-center text-[11px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>No artboards</div>
        ) : (
          artboards.map(ab => {
            const isCollapsed = collapsed[ab.id];
            return (
              <div key={ab.id} className={`border-b ${isDark ? 'border-[#1e1e2e]' : 'border-slate-100'}`}>
                <button
                  className={`w-full flex items-center gap-1 px-2 py-1 text-[11px] font-medium ${isDark ? 'text-slate-300 hover:bg-[#1e1e2e]' : 'text-slate-700 hover:bg-slate-50'}`}
                  onClick={() => setCollapsed(p => ({ ...p, [ab.id]: !p[ab.id] }))}
                >
                  {isCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                  {ab.width <= 430
                    ? <Smartphone size={11} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                    : ab.width <= 1024
                    ? <Tablet size={11} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                    : <Monitor size={11} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                  }
                  <span className="flex-1 truncate text-left">{ab.name}</span>
                  <span className={`text-[9px] ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>{ab.width}×{ab.height}</span>
                </button>
                {!isCollapsed && (
                  ab.nodes.length === 0 ? (
                    <div className={`px-4 py-2 text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Drop component here</div>
                  ) : (
                    ab.nodes.map(id => renderNode(id, 1))
                  )
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
