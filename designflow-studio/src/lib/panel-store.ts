import { create } from 'zustand';

export type PanelId = 'components' | 'layers' | 'properties' | 'tokens' | 'export';

export interface PanelState {
  id: PanelId;
  visible: boolean;
  mode: 'dock-left' | 'dock-right' | 'float';
  x: number;
  y: number;
  width: number;
  height: number;
  collapsed: boolean;
  zIndex: number;
}

interface PanelStoreState {
  panels: Record<PanelId, PanelState>;
  topZ: number;
  togglePanel: (id: PanelId) => void;
  showPanel: (id: PanelId) => void;
  hidePanel: (id: PanelId) => void;
  setMode: (id: PanelId, mode: PanelState['mode']) => void;
  setPosition: (id: PanelId, x: number, y: number) => void;
  setSize: (id: PanelId, w: number, h: number) => void;
  toggleCollapse: (id: PanelId) => void;
  bringToFront: (id: PanelId) => void;
}

const defaultPanels: Record<PanelId, PanelState> = {
  components: { id: 'components', visible: true, mode: 'dock-left', x: 0, y: 0, width: 240, height: 500, collapsed: false, zIndex: 1 },
  layers: { id: 'layers', visible: true, mode: 'dock-left', x: 0, y: 0, width: 220, height: 400, collapsed: false, zIndex: 1 },
  properties: { id: 'properties', visible: true, mode: 'dock-right', x: 0, y: 0, width: 280, height: 600, collapsed: false, zIndex: 1 },
  tokens: { id: 'tokens', visible: false, mode: 'dock-right', x: 0, y: 0, width: 280, height: 500, collapsed: false, zIndex: 1 },
  export: { id: 'export', visible: false, mode: 'dock-right', x: 0, y: 0, width: 280, height: 500, collapsed: false, zIndex: 1 },
};

export const usePanelStore = create<PanelStoreState>((set, get) => ({
  panels: { ...defaultPanels },
  topZ: 10,
  togglePanel: (id) => set(s => ({
    panels: { ...s.panels, [id]: { ...s.panels[id], visible: !s.panels[id].visible } },
  })),
  showPanel: (id) => set(s => ({
    panels: { ...s.panels, [id]: { ...s.panels[id], visible: true } },
  })),
  hidePanel: (id) => set(s => ({
    panels: { ...s.panels, [id]: { ...s.panels[id], visible: false } },
  })),
  setMode: (id, mode) => set(s => ({
    panels: { ...s.panels, [id]: { ...s.panels[id], mode } },
  })),
  setPosition: (id, x, y) => set(s => ({
    panels: { ...s.panels, [id]: { ...s.panels[id], x, y } },
  })),
  setSize: (id, w, h) => set(s => ({
    panels: { ...s.panels, [id]: { ...s.panels[id], width: w, height: h } },
  })),
  toggleCollapse: (id) => set(s => ({
    panels: { ...s.panels, [id]: { ...s.panels[id], collapsed: !s.panels[id].collapsed } },
  })),
  bringToFront: (id) => {
    const s = get();
    const newZ = s.topZ + 1;
    set({
      topZ: newZ,
      panels: { ...s.panels, [id]: { ...s.panels[id], zIndex: newZ } },
    });
  },
}));
