'use client';

import React from 'react';
import { useThemeStore } from '@/lib/theme-store';
import { usePanelStore, type PanelId, type PanelState } from '@/lib/panel-store';
import Toolbar from '@/components/toolbar/Toolbar';
import Canvas from '@/components/canvas/Canvas';
import FloatingPanel from '@/components/ui/FloatingPanel';
import ComponentPanel from '@/components/panels/ComponentPanel';
import LayerPanel from '@/components/panels/LayerPanel';
import PropertiesPanel from '@/components/panels/PropertiesPanel';
import TokenManager from '@/components/tokens/TokenManager';
import CodeExportPanel from '@/components/export/CodeExportPanel';

export default function StudioPage() {
  const isDark = useThemeStore(s => s.isDark);
  const { panels } = usePanelStore();

  const leftPanels = (['components', 'layers'] as const).filter(id => panels[id].visible && panels[id].mode !== 'float');
  const rightPanels = (['properties', 'tokens', 'export'] as const).filter(id => panels[id].visible && panels[id].mode !== 'float');

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${isDark ? 'dark' : ''}`}>
      <div className={`flex flex-col h-full ${isDark ? 'bg-[#0d0d1a]' : 'bg-slate-50'} relative`}>
        <Toolbar />
        <div className="flex flex-1 overflow-hidden">
          {leftPanels.length > 0 && (
            <div className="flex-shrink-0 flex">
              {leftPanels.map(id => (
                <FloatingPanel key={id} panelId={id} title={id === 'components' ? 'Components' : 'Layers'}>
                  {id === 'components' ? <ComponentPanel /> : <LayerPanel />}
                </FloatingPanel>
              ))}
            </div>
          )}

          <Canvas />

          {rightPanels.length > 0 && (
            <div className="flex-shrink-0 flex">
              {rightPanels.map(id => (
                <FloatingPanel key={id} panelId={id} title={id === 'properties' ? 'Properties' : id === 'tokens' ? 'Tokens' : 'Export'}>
                  {id === 'properties' && <PropertiesPanel />}
                  {id === 'tokens' && <TokenManager />}
                  {id === 'export' && <CodeExportPanel />}
                </FloatingPanel>
              ))}
            </div>
          )}
        </div>

        {(Object.entries(panels) as [PanelId, PanelState][])
          .filter(([, p]) => p.visible && p.mode === 'float')
          .map(([id, p]) => (
          <FloatingPanel key={id} panelId={p.id} title={p.id === 'components' ? 'Components' : p.id === 'layers' ? 'Layers' : p.id === 'properties' ? 'Properties' : p.id === 'tokens' ? 'Tokens' : 'Export'}>
            {p.id === 'components' && <ComponentPanel />}
            {p.id === 'layers' && <LayerPanel />}
            {p.id === 'properties' && <PropertiesPanel />}
            {p.id === 'tokens' && <TokenManager />}
            {p.id === 'export' && <CodeExportPanel />}
          </FloatingPanel>
        ))}
      </div>
    </div>
  );
}
