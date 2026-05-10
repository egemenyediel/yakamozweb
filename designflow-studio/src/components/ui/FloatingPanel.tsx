'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePanelStore, PanelId } from '@/lib/panel-store';
import { useThemeStore } from '@/lib/theme-store';
import { X, Minus, Maximize2, GripVertical } from 'lucide-react';

interface FloatingPanelProps {
  panelId: PanelId;
  title: string;
  children: React.ReactNode;
}

export default function FloatingPanel({ panelId, title, children }: FloatingPanelProps) {
  const { panels, hidePanel, setPosition, setSize, toggleCollapse, bringToFront, setMode } = usePanelStore();
  const isDark = useThemeStore(s => s.isDark);
  const panel = panels[panelId];
  const panelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const isDarkBg = isDark;
  const borderColor = isDarkBg ? '#2a2a40' : '#e2e8f0';
  const bg = isDarkBg ? '#141422' : '#ffffff';

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!panel || panel.mode !== 'float') return;
    e.preventDefault();
    bringToFront(panelId);
    setIsDragging(true);
    const rect = panelRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleResizeDown = (e: React.MouseEvent) => {
    if (!panel || panel.mode !== 'float') return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY, w: panel.width, h: panel.height });
  };

  useEffect(() => {
    if (!panel || !isDragging) return;
    const handleMove = (e: MouseEvent) => {
      setPosition(panelId, e.clientX - dragOffset.x, e.clientY - dragOffset.y);
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
  }, [dragOffset, isDragging, panel, panelId, setPosition]);

  useEffect(() => {
    if (!panel || !isResizing) return;
    const handleMove = (e: MouseEvent) => {
      const w = Math.max(200, resizeStart.w + (e.clientX - resizeStart.x));
      const h = Math.max(100, resizeStart.h + (e.clientY - resizeStart.y));
      setSize(panelId, w, h);
    };
    const handleUp = () => setIsResizing(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
  }, [isResizing, panel, panelId, resizeStart, setSize]);

  if (!panel || !panel.visible) return null;

  if (panel.mode === 'dock-left' || panel.mode === 'dock-right') {
    return (
      <div
        ref={panelRef}
        className={`flex flex-col h-full ${panel.mode === 'dock-left' ? 'border-r' : 'border-l'}`}
        style={{ width: panel.width, background: bg, borderColor }}
        onMouseDown={() => bringToFront(panelId)}
      >
        <div
          className={`flex items-center gap-1 px-2 py-1 border-b select-none ${isDarkBg ? 'border-[#2a2a40]' : 'border-slate-200'}`}
          onDoubleClick={() => {
            const rect = panelRef.current?.getBoundingClientRect();
            setMode(panelId, 'float');
            if (rect) setPosition(panelId, rect.left, rect.top);
          }}
        >
          <GripVertical size={11} className={isDarkBg ? 'text-slate-600' : 'text-slate-300'} />
          <span className={`flex-1 text-[10px] font-semibold uppercase tracking-wider ${isDarkBg ? 'text-slate-400' : 'text-slate-600'}`}>{title}</span>
          <button onClick={() => toggleCollapse(panelId)} className={`p-0.5 rounded hover:bg-black/10 ${isDarkBg ? 'text-slate-500' : 'text-slate-400'}`}>
            <Minus size={11} />
          </button>
          <button onClick={() => {
            const rect = panelRef.current?.getBoundingClientRect();
            setMode(panelId, 'float');
            if (rect) setPosition(panelId, rect.left, rect.top);
          }} className={`p-0.5 rounded hover:bg-black/10 ${isDarkBg ? 'text-slate-500' : 'text-slate-400'}`}>
            <Maximize2 size={10} />
          </button>
          <button onClick={() => hidePanel(panelId)} className={`p-0.5 rounded hover:bg-red-500/20 ${isDarkBg ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}>
            <X size={11} />
          </button>
        </div>
        {!panel.collapsed && <div className="flex-1 overflow-hidden">{children}</div>}
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className="absolute flex flex-col shadow-2xl rounded-lg overflow-hidden"
      style={{
        left: panel.x,
        top: panel.y,
        width: panel.width,
        height: panel.collapsed ? 'auto' : panel.height,
        background: bg,
        border: `1px solid ${borderColor}`,
        zIndex: panel.zIndex,
      }}
      onMouseDown={() => bringToFront(panelId)}
    >
      <div
        className={`flex items-center gap-1 px-2 py-1.5 border-b select-none cursor-move ${isDarkBg ? 'border-[#2a2a40]' : 'border-slate-200'}`}
        onMouseDown={handleMouseDown}
      >
        <GripVertical size={11} className={isDarkBg ? 'text-slate-600' : 'text-slate-300'} />
        <span className={`flex-1 text-[10px] font-semibold uppercase tracking-wider ${isDarkBg ? 'text-slate-400' : 'text-slate-600'}`}>{title}</span>
        <button onClick={() => toggleCollapse(panelId)} className={`p-0.5 rounded hover:bg-black/10 ${isDarkBg ? 'text-slate-500' : 'text-slate-400'}`}>
          <Minus size={11} />
        </button>
        <button onClick={() => setMode(panelId, panelId === 'components' || panelId === 'layers' ? 'dock-left' : 'dock-right')} className={`p-0.5 rounded hover:bg-black/10 ${isDarkBg ? 'text-slate-500' : 'text-slate-400'}`}>
          <Maximize2 size={10} />
        </button>
        <button onClick={() => hidePanel(panelId)} className={`p-0.5 rounded hover:bg-red-500/20 ${isDarkBg ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}>
          <X size={11} />
        </button>
      </div>
      {!panel.collapsed && (
        <div className="flex-1 overflow-hidden" style={{ maxHeight: panel.height - 32 }}>
          {children}
        </div>
      )}
      {!panel.collapsed && (
        <div
          className={`absolute bottom-0 right-0 w-4 h-4 cursor-se-resize ${isDarkBg ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}
          onMouseDown={handleResizeDown}
        />
      )}
    </div>
  );
}
