'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useCanvasStore } from '@/lib/canvas-store';
import { useThemeStore } from '@/lib/theme-store';
import { ComponentTemplate } from '@/types';
import { Monitor, Tablet, Smartphone, Trash2, Link2, Palette } from 'lucide-react';

const droppableNodeTypes = new Set(['div', 'flex', 'grid', 'row', 'column', 'container', 'card', 'navbar', 'hero']);

export default function Canvas() {
  const {
    nodes, artboards, activeArtboardId, selectedNodeId, hoveredNodeId,
    canvasOffset, canvasZoom, canvasBgColor, syncChanges,
    addNode, moveNode, resizeNode, selectNode, hoverNode,
    setCanvasOffset, setCanvasZoom, setCanvasBgColor, setSyncChanges,
    setActiveArtboard, addArtboard, removeArtboard,
  } = useCanvasStore();
  const isDark = useThemeStore(s => s.isDark);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [dragInfo, setDragInfo] = useState<{ id: string; startX: number; startY: number; nodeX: number; nodeY: number } | null>(null);
  const [resizeInfo, setResizeInfo] = useState<{ id: string; handle: string; startX: number; startY: number; startW: number; startH: number; startNX: number; startNY: number } | null>(null);
  const [showBgPicker, setShowBgPicker] = useState(false);

  const getArtboardScreenRect = useCallback((artboard: typeof artboards[number], canvasRect: DOMRect) => ({
    left: canvasRect.width / 2 + canvasOffset.x + (artboard.x - artboard.width / 2) * canvasZoom,
    top: canvasRect.height / 2 + canvasOffset.y + (artboard.y - artboard.height / 2) * canvasZoom,
    width: artboard.width * canvasZoom,
    height: artboard.height * canvasZoom,
  }), [canvasOffset.x, canvasOffset.y, canvasZoom]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault();
      setCanvasZoom(canvasZoom + (e.deltaY > 0 ? -0.1 : 0.1));
    } else {
      setCanvasOffset({ x: canvasOffset.x - e.deltaX, y: canvasOffset.y - e.deltaY });
    }
  }, [canvasOffset, canvasZoom, setCanvasOffset, setCanvasZoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).dataset.canvasBg === 'true') {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
      } else if (e.button === 0) {
        selectNode(null);
      }
    }
  }, [canvasOffset, selectNode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) setCanvasOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    if (dragInfo) {
      moveNode(dragInfo.id, dragInfo.nodeX + (e.clientX - dragInfo.startX) / canvasZoom, dragInfo.nodeY + (e.clientY - dragInfo.startY) / canvasZoom);
    }
    if (resizeInfo) {
      const dx = (e.clientX - resizeInfo.startX) / canvasZoom;
      const dy = (e.clientY - resizeInfo.startY) / canvasZoom;
      let newW = resizeInfo.startW, newH = resizeInfo.startH, newX = resizeInfo.startNX, newY = resizeInfo.startNY;
      if (resizeInfo.handle.includes('e')) newW = Math.max(20, resizeInfo.startW + dx);
      if (resizeInfo.handle.includes('w')) { newW = Math.max(20, resizeInfo.startW - dx); newX = resizeInfo.startNX + dx; }
      if (resizeInfo.handle.includes('s')) newH = Math.max(20, resizeInfo.startH + dy);
      if (resizeInfo.handle.includes('n')) { newH = Math.max(20, resizeInfo.startH - dy); newY = resizeInfo.startNY + dy; }
      resizeNode(resizeInfo.id, newW, newH);
      moveNode(resizeInfo.id, newX, newY);
    }
  }, [isPanning, panStart, dragInfo, resizeInfo, canvasZoom, moveNode, resizeNode, setCanvasOffset]);

  const handleMouseUp = useCallback(() => { setIsPanning(false); setDragInfo(null); setResizeInfo(null); }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('component-template');
    if (!data || !canvasRef.current) return;
    const template = JSON.parse(data) as ComponentTemplate;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const targetArtboard = artboards.find((artboard) => {
      const rect = getArtboardScreenRect(artboard, canvasRect);
      return (
        e.clientX >= canvasRect.left + rect.left &&
        e.clientX <= canvasRect.left + rect.left + rect.width &&
        e.clientY >= canvasRect.top + rect.top &&
        e.clientY <= canvasRect.top + rect.top + rect.height
      );
    }) || artboards.find((artboard) => artboard.id === activeArtboardId) || artboards[0];

    if (!targetArtboard) return;

    const hoverElements = document.elementsFromPoint(e.clientX, e.clientY);
    const targetNodeId = hoverElements
      .map((element) => (element instanceof HTMLElement ? element.dataset.nodeId : undefined))
      .find((nodeId) => nodeId && droppableNodeTypes.has(nodes[nodeId]?.type));

    if (targetNodeId) {
      const targetNodeElement = hoverElements.find(
        (element): element is HTMLElement => element instanceof HTMLElement && element.dataset.nodeId === targetNodeId,
      );
      if (targetNodeElement) {
        const nodeRect = targetNodeElement.getBoundingClientRect();
        const x = Math.max(0, (e.clientX - nodeRect.left) / canvasZoom - template.defaultWidth / 2);
        const y = Math.max(0, (e.clientY - nodeRect.top) / canvasZoom - template.defaultHeight / 2);
        addNode(template, targetArtboard.id, x, y, targetNodeId);
        setActiveArtboard(targetArtboard.id);
        return;
      }
    }

    const artboardRect = getArtboardScreenRect(targetArtboard, canvasRect);
    const x = Math.max(0, (e.clientX - canvasRect.left - artboardRect.left) / canvasZoom - template.defaultWidth / 2);
    const y = Math.max(0, (e.clientY - canvasRect.top - artboardRect.top) / canvasZoom - template.defaultHeight / 2);
    addNode(template, targetArtboard.id, x, y);
    setActiveArtboard(targetArtboard.id);
  }, [activeArtboardId, addNode, artboards, canvasZoom, getArtboardScreenRect, nodes, setActiveArtboard]);

  const startDrag = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const node = nodes[id];
    if (!node || node.locked) return;
    selectNode(id);
    setDragInfo({ id, startX: e.clientX, startY: e.clientY, nodeX: node.x, nodeY: node.y });
  };

  const startResize = (e: React.MouseEvent, id: string, handle: string) => {
    e.stopPropagation();
    const node = nodes[id];
    if (!node || node.locked) return;
    setResizeInfo({ id, handle, startX: e.clientX, startY: e.clientY, startW: node.width, startH: node.height, startNX: node.x, startNY: node.y });
  };

  const renderNode = (id: string) => {
    const node = nodes[id];
    if (!node || !node.visible) return null;
    const isSelected = selectedNodeId === id;
    const isHovered = hoveredNodeId === id;
    const isContainer = droppableNodeTypes.has(node.type);
    const style: React.CSSProperties = {
      position: 'absolute', left: node.x, top: node.y, width: node.width, height: node.height,
      opacity: node.opacity, overflow: node.styles.overflow || (isContainer ? 'visible' : undefined),
      transform: node.rotation ? `rotate(${node.rotation}deg)` : undefined,
      transition: dragInfo || resizeInfo ? 'none' : 'box-shadow 0.15s ease',
      ...Object.fromEntries(Object.entries(node.styles).filter(([, v]) => v !== undefined && v !== '')),
    } as React.CSSProperties;

    if (node.type === 'image') { style.backgroundColor = style.backgroundColor || '#f1f5f9'; style.display = 'flex'; style.alignItems = 'center'; style.justifyContent = 'center'; }

    return (
      <div key={id} data-node-id={id} onMouseDown={e => startDrag(e, id)} onMouseEnter={() => hoverNode(id)} onMouseLeave={() => hoverNode(null)}
        style={style} className={`group/node ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-0' : ''} ${isHovered && !isSelected ? 'ring-1 ring-indigo-400/50' : ''}`}>
        {node.type === 'text' && <span style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>{node.content || 'Text'}</span>}
        {node.type === 'button' && <span style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{node.content || 'Button'}</span>}
        {node.type === 'input' && <span style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', color: '#94a3b8', fontSize: '14px' }}>{node.placeholder || 'Input'}</span>}
        {node.type === 'image' && <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
        {isContainer && node.children.map(childId => renderNode(childId))}
        {node.type === 'badge' && <span style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{node.content || 'Badge'}</span>}
        {node.type === 'link' && <span style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', textDecoration: 'underline' }}>{node.content || 'Link'}</span>}
        {node.type === 'icon' && <span style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: node.styles.fontSize || '24px' }}>{node.content || '★'}</span>}
        {node.type === 'textarea' && <span style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-start', color: '#94a3b8', fontSize: '14px' }}>{node.placeholder || 'Textarea'}</span>}
        {node.type === 'select' && <span style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>{node.content || 'Select...'}<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></span>}
        {node.type === 'toggle' && <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fff', margin: '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />}
        {node.type === 'avatar' && <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '600', fontSize: '16px' }}>U</div>}
        {isSelected && !node.locked && (
          <>
            {['nw','n','ne','e','se','s','sw','w'].map(h => {
              const pos: Record<string, string> = { nw: '-top-1 -left-1', n: '-top-1 left-1/2 -translate-x-1/2', ne: '-top-1 -right-1', e: 'top-1/2 -right-1 -translate-y-1/2', se: '-bottom-1 -right-1', s: '-bottom-1 left-1/2 -translate-x-1/2', sw: '-bottom-1 -left-1', w: 'top-1/2 -left-1 -translate-y-1/2' };
              const cursor: Record<string, string> = { nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize', e: 'e-resize', se: 'se-resize', s: 's-resize', sw: 'sw-resize', w: 'w-resize' };
              return <div key={h} className={`absolute ${pos[h]} w-2 h-2 bg-white border-2 border-indigo-500 rounded-sm z-50`} style={{ cursor: cursor[h] }} onMouseDown={e => startResize(e, id, h)} />;
            })}
            <div className="absolute -top-5 left-0 bg-indigo-500 text-white text-[9px] px-1.5 py-0.5 rounded z-50 pointer-events-none whitespace-nowrap">{node.name}</div>
          </>
        )}
      </div>
    );
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') { e.preventDefault(); if (selectedNodeId) useCanvasStore.getState().duplicateNode(selectedNodeId); }
      if (e.key === 'Delete' || e.key === 'Backspace') { if (selectedNodeId && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) useCanvasStore.getState().removeNode(selectedNodeId); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') { if (selectedNodeId) useCanvasStore.getState().copyNode(selectedNodeId); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') { e.preventDefault(); useCanvasStore.getState().pasteNode(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [selectedNodeId]);

  const dotColor = isDark ? '#1e1e30' : '#d4d4d8';

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className={`flex items-center gap-1 px-2 py-1 border-b ${isDark ? 'bg-[#141422] border-[#2a2a40]' : 'bg-white border-slate-200'}`}>
        <span className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>ARTBOARDS</span>
        <div className="flex items-center gap-0.5 ml-1">
          {[
            { icon: <Monitor size={11} />, w: 1440, h: 900, label: 'Desktop' },
            { icon: <Tablet size={11} />, w: 768, h: 1024, label: 'Tablet' },
            { icon: <Smartphone size={11} />, w: 375, h: 812, label: 'Mobile' },
          ].map(preset => (
            <button key={preset.label}
              className={`p-1 rounded text-[10px] flex items-center gap-0.5 ${isDark ? 'text-slate-400 hover:bg-[#1e1e2e]' : 'text-slate-500 hover:bg-slate-50'}`}
              onClick={() => addArtboard(preset.label, preset.w, preset.h)}
              title={`Add ${preset.label}`}>
              {preset.icon}
            </button>
          ))}
        </div>
        <div className={`w-px h-3.5 ${isDark ? 'bg-[#2a2a40]' : 'bg-slate-200'}`} />
        <button onClick={() => setSyncChanges(!syncChanges)} className={`flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded ${syncChanges ? 'bg-indigo-500/20 text-indigo-400' : isDark ? 'text-slate-500' : 'text-slate-400'}`} title="Sync changes across artboards">
          <Link2 size={10} />
          Sync
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          {artboards.map(ab => (
            <div key={ab.id} className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${activeArtboardId === ab.id ? (isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : (isDark ? 'text-slate-500 hover:bg-[#1e1e2e]' : 'text-slate-400 hover:bg-slate-50')}`}
              onClick={() => setActiveArtboard(ab.id)}>
              <span>{ab.name}</span>
              <button onClick={e => { e.stopPropagation(); removeArtboard(ab.id); }} className={`ml-0.5 hover:text-red-400 ${isDark ? 'text-slate-600' : 'text-slate-300'}`}><Trash2 size={9} /></button>
            </div>
          ))}
        </div>
        <div className={`w-px h-3.5 ${isDark ? 'bg-[#2a2a40]' : 'bg-slate-200'}`} />
        <div className="relative">
          <button onClick={() => setShowBgPicker(!showBgPicker)} className={`p-1 rounded ${isDark ? 'text-slate-400 hover:bg-[#1e1e2e]' : 'text-slate-500 hover:bg-slate-50'}`} title="Canvas background">
            <Palette size={12} />
          </button>
          {showBgPicker && (
            <div className={`absolute right-0 top-6 p-2 rounded-lg shadow-xl z-50 ${isDark ? 'bg-[#1e1e2e] border border-[#2a2a40]' : 'bg-white border border-slate-200'}`}>
              <input type="color" value={canvasBgColor} onChange={e => setCanvasBgColor(e.target.value)} className="w-24 h-24 cursor-pointer rounded" />
              <input type="text" value={canvasBgColor} onChange={e => setCanvasBgColor(e.target.value)} className={`w-full mt-1 text-[10px] px-1.5 py-1 rounded border text-center ${isDark ? 'bg-[#0d0d1a] border-[#2a2a40] text-slate-300' : 'bg-slate-50 border-slate-200'}`} />
            </div>
          )}
        </div>
      </div>

      <div ref={canvasRef} className="flex-1 overflow-hidden relative cursor-crosshair"
        style={{ background: `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`, backgroundSize: '24px 24px', backgroundColor: canvasBgColor }}
        onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        onDrop={handleDrop} onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }} data-canvas-bg="true">

        {artboards.map(ab => (
          <div key={ab.id}
            className={`absolute canvas-artboard-bg ${activeArtboardId === ab.id ? '' : 'opacity-70'}`}
            style={{
              transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${canvasZoom})`,
              transformOrigin: '0 0', width: ab.width, height: ab.height,
              left: '50%', top: '50%',
              marginLeft: ab.x - ab.width / 2, marginTop: ab.y - ab.height / 2,
              background: '#ffffff',
              boxShadow: isDark ? '0 4px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)' : '0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
            }}
            onClick={() => setActiveArtboard(ab.id)}
          >
            <div className={`absolute -top-5 left-0 text-[9px] px-1.5 py-0.5 rounded-t font-medium ${activeArtboardId === ab.id ? (isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : (isDark ? 'text-slate-600' : 'text-slate-400')}`}>
              {ab.name} ({ab.width}×{ab.height})
            </div>
            {ab.nodes.map(id => renderNode(id))}
          </div>
        ))}

        <div className={`absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg shadow-lg px-2 py-1 text-[10px] ${isDark ? 'bg-[#1e1e2e] border border-[#2a2a40] text-slate-400' : 'bg-white text-slate-500'}`}>
          <button className="px-1 hover:text-slate-200" onClick={() => setCanvasZoom(canvasZoom - 0.1)}>−</button>
          <span className="min-w-[36px] text-center">{Math.round(canvasZoom * 100)}%</span>
          <button className="px-1 hover:text-slate-200" onClick={() => setCanvasZoom(canvasZoom + 0.1)}>+</button>
          <div className={`w-px h-3 ${isDark ? 'bg-[#2a2a40]' : 'bg-slate-200'}`} />
          <button className="hover:text-slate-200" onClick={() => { setCanvasZoom(1); setCanvasOffset({ x: 0, y: 0 }); }}>Reset</button>
        </div>
      </div>
    </div>
  );
}
