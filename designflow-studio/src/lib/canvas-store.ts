import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { CanvasNode, NodeStyles, ComponentTemplate } from '@/types';

export interface Artboard {
  id: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  nodes: string[];
}

const ARTBOARD_GAP = 96;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const layoutArtboards = (artboards: Artboard[]) => {
  if (artboards.length === 0) return artboards;
  const totalWidth = artboards.reduce((sum, artboard) => sum + artboard.width, 0) + ARTBOARD_GAP * (artboards.length - 1);
  let cursor = -totalWidth / 2;

  return artboards.map((artboard) => {
    const x = cursor + artboard.width / 2;
    cursor += artboard.width + ARTBOARD_GAP;
    return { ...artboard, x, y: 0 };
  });
};

const subtreeContainsNode = (
  nodes: Record<string, CanvasNode>,
  rootId: string,
  targetId: string,
): boolean => {
  if (rootId === targetId) return true;
  const node = nodes[rootId];
  return node ? node.children.some((childId) => subtreeContainsNode(nodes, childId, targetId)) : false;
};

const findArtboardByNodeId = (
  artboards: Artboard[],
  nodes: Record<string, CanvasNode>,
  nodeId: string,
) => artboards.find((artboard) => artboard.nodes.some((rootId) => subtreeContainsNode(nodes, rootId, nodeId)));

const getAbsolutePosition = (nodes: Record<string, CanvasNode>, nodeId: string) => {
  let current = nodes[nodeId];
  if (!current) return { x: 0, y: 0 };

  let x = current.x;
  let y = current.y;

  while (current.parentId) {
    current = nodes[current.parentId];
    if (!current) break;
    x += current.x;
    y += current.y;
  }

  return { x, y };
};

const removeNodeFromRoot = (artboards: Artboard[], artboardId: string | undefined, nodeId: string) =>
  artboards.map((artboard) =>
    artboard.id === artboardId
      ? { ...artboard, nodes: artboard.nodes.filter((rootNodeId) => rootNodeId !== nodeId) }
      : artboard,
  );

const mapRelativePosition = (
  position: number,
  sourceExtent: number,
  nodeExtent: number,
  targetExtent: number,
) => {
  const sourceMax = Math.max(0, sourceExtent - nodeExtent);
  const targetMax = Math.max(0, targetExtent - nodeExtent);
  if (sourceMax === 0 || targetMax === 0) return clamp(position, 0, targetMax);
  return clamp((position / sourceMax) * targetMax, 0, targetMax);
};

interface CanvasState {
  nodes: Record<string, CanvasNode>;
  artboards: Artboard[];
  activeArtboardId: string | null;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  canvasOffset: { x: number; y: number };
  canvasZoom: number;
  canvasBgColor: string;
  syncChanges: boolean;
  clipboard: CanvasNode | null;

  addArtboard: (name: string, width: number, height: number) => string;
  removeArtboard: (id: string) => void;
  setActiveArtboard: (id: string) => void;
  updateArtboardPosition: (id: string, x: number, y: number) => void;

  addNode: (template: ComponentTemplate, artboardId?: string, x?: number, y?: number, parentId?: string | null) => string;
  removeNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  moveNode: (id: string, x: number, y: number) => void;
  resizeNode: (id: string, width: number, height: number) => void;
  updateNodeStyles: (id: string, styles: Partial<NodeStyles>) => void;
  updateNodeContent: (id: string, content: string) => void;
  updateNodeName: (id: string, name: string) => void;
  selectNode: (id: string | null) => void;
  hoverNode: (id: string | null) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  toggleLock: (id: string) => void;
  toggleVisibility: (id: string) => void;
  copyNode: (id: string) => void;
  pasteNode: () => void;
  moveToChild: (parentId: string, childId: string) => void;
  removeFromParent: (id: string) => void;

  setCanvasOffset: (offset: { x: number; y: number }) => void;
  setCanvasZoom: (zoom: number) => void;
  setCanvasBgColor: (color: string) => void;
  setSyncChanges: (v: boolean) => void;
  getSelectedNode: () => CanvasNode | null;
  getNodeTree: (artboardId: string) => CanvasNode[];
}

const defaultDesktopId = uuidv4();

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: {},
  artboards: layoutArtboards([
    { id: defaultDesktopId, name: 'Desktop', width: 1440, height: 900, x: 0, y: 0, nodes: [] },
  ]),
  activeArtboardId: defaultDesktopId,
  selectedNodeId: null,
  hoveredNodeId: null,
  canvasOffset: { x: 0, y: 0 },
  canvasZoom: 1,
  canvasBgColor: '#0d0d1a',
  syncChanges: false,
  clipboard: null,

  addArtboard: (name, width, height) => {
    const id = uuidv4();
    set(s => ({
      artboards: layoutArtboards([...s.artboards, { id, name, width, height, x: 0, y: 0, nodes: [] }]),
      activeArtboardId: id,
    }));
    return id;
  },

  removeArtboard: (id) => {
    set(s => {
      const ab = s.artboards.find(a => a.id === id);
      if (!ab) return s;
      const newNodes = { ...s.nodes };
      const removeRecursive = (nodeId: string) => {
        const node = newNodes[nodeId];
        if (!node) return;
        node.children.forEach(removeRecursive);
        delete newNodes[nodeId];
      };
      ab.nodes.forEach(removeRecursive);
      const newArtboards = layoutArtboards(s.artboards.filter(a => a.id !== id));
      return {
        artboards: newArtboards,
        nodes: newNodes,
        activeArtboardId: s.activeArtboardId === id ? (newArtboards[0]?.id ?? null) : s.activeArtboardId,
        selectedNodeId: s.selectedNodeId && ab.nodes.some(rootId => subtreeContainsNode(s.nodes, rootId, s.selectedNodeId!)) ? null : s.selectedNodeId,
      };
    });
  },

  setActiveArtboard: (id) => set({ activeArtboardId: id }),

  updateArtboardPosition: (id, x, y) => {
    set(s => ({
      artboards: s.artboards.map(a => a.id === id ? { ...a, x, y } : a),
    }));
  },

  addNode: (template, artboardId, x, y, parentId) => {
    const id = uuidv4();
    const abId = artboardId || get().activeArtboardId;
    if (!abId) return id;
    const syncGroupId = uuidv4();
    const node: CanvasNode = {
      id,
      syncGroupId,
      type: template.type,
      name: `${template.name} ${Object.keys(get().nodes).filter(n => get().nodes[n]?.type === template.type).length + 1}`,
      x: x ?? 20 + Math.random() * 100,
      y: y ?? 20 + Math.random() * 100,
      width: template.defaultWidth,
      height: template.defaultHeight,
      rotation: 0,
      opacity: 1,
      styles: { ...template.defaultStyles } as NodeStyles,
      children: [],
      parentId: parentId ?? null,
      locked: false,
      visible: true,
      content: template.defaultContent,
      placeholder: template.placeholder,
    };

    set(s => {
      const newArtboards = parentId
        ? s.artboards
        : s.artboards.map(a =>
            a.id === abId ? { ...a, nodes: [...a.nodes, id] } : a,
          );
      return {
        nodes: {
          ...s.nodes,
          [id]: node,
          ...(parentId && s.nodes[parentId]
            ? {
                [parentId]: {
                  ...s.nodes[parentId],
                  children: [...s.nodes[parentId].children, id],
                },
              }
            : {}),
        },
        artboards: newArtboards,
        selectedNodeId: id,
      };
    });

    if (get().syncChanges) {
      const state = get();
      const sourceArtboard = state.artboards.find((artboard) => artboard.id === abId);
      const sourceParent = parentId ? state.nodes[parentId] : null;
      if (!sourceArtboard) return id;

      const otherArtboards = state.artboards.filter(a => a.id !== abId);
      otherArtboards.forEach(otherAb => {
        const syncedParent = sourceParent?.syncGroupId
          ? Object.values(get().nodes).find((candidate) =>
              candidate.syncGroupId === sourceParent.syncGroupId &&
              findArtboardByNodeId(get().artboards, get().nodes, candidate.id)?.id === otherAb.id,
            )
          : null;
        const targetWidth = syncedParent?.width ?? otherAb.width;
        const targetHeight = syncedParent?.height ?? otherAb.height;
        const sourceWidth = sourceParent?.width ?? sourceArtboard.width;
        const sourceHeight = sourceParent?.height ?? sourceArtboard.height;
        const syncedId = uuidv4();
        const syncedNode: CanvasNode = {
          ...JSON.parse(JSON.stringify(node)),
          id: syncedId,
          syncGroupId,
          x: mapRelativePosition(node.x, sourceWidth, node.width, targetWidth),
          y: mapRelativePosition(node.y, sourceHeight, node.height, targetHeight),
          name: node.name,
          children: [],
          parentId: syncedParent?.id ?? null,
        };
        set(s => ({
          nodes: {
            ...s.nodes,
            [syncedId]: syncedNode,
            ...(syncedParent
              ? {
                  [syncedParent.id]: {
                    ...s.nodes[syncedParent.id],
                    children: [...s.nodes[syncedParent.id].children, syncedId],
                  },
                }
              : {}),
          },
          artboards: syncedParent
            ? s.artboards
            : s.artboards.map(a =>
                a.id === otherAb.id ? { ...a, nodes: [...a.nodes, syncedId] } : a,
              ),
        }));
      });
    }

    return id;
  },

  removeNode: (id) => {
    set(state => {
      const node = state.nodes[id];
      if (!node) return state;
      const newNodes = { ...state.nodes };
      const removeRecursive = (nodeId: string) => {
        const n = newNodes[nodeId];
        if (n) {
          n.children.forEach(childId => removeRecursive(childId));
          delete newNodes[nodeId];
        }
      };
      removeRecursive(id);
      if (node.parentId && newNodes[node.parentId]) {
        newNodes[node.parentId] = {
          ...newNodes[node.parentId],
          children: newNodes[node.parentId].children.filter(c => c !== id),
        };
      }
      return {
        nodes: newNodes,
        artboards: state.artboards.map(a => ({
          ...a,
          nodes: a.nodes.filter(n => n !== id),
        })),
        selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
      };
    });
  },

  duplicateNode: (id) => {
    const state = get();
    const node = state.nodes[id];
    if (!node) return;

    const cloneRecursive = (nodeId: string, newParentId: string | null): Record<string, CanvasNode> => {
      const src = state.nodes[nodeId];
      if (!src) return {};
      const newId = uuidv4();
      const clonedChildren = src.children.flatMap(childId => {
        const childClones = cloneRecursive(childId, newId);
        return Object.values(childClones);
      });
      const childIds = clonedChildren.map(c => c.id);
      const cloned: CanvasNode = {
        ...JSON.parse(JSON.stringify(src)),
        id: newId,
        syncGroupId: uuidv4(),
        name: nodeId === id ? `${src.name} Copy` : src.name,
        x: nodeId === id ? src.x + 20 : src.x,
        y: nodeId === id ? src.y + 20 : src.y,
        parentId: newParentId,
        children: childIds,
      };
      const result: Record<string, CanvasNode> = { [newId]: cloned };
      clonedChildren.forEach(c => { result[c.id] = c; });
      return result;
    };

    const clonedNodes = cloneRecursive(id, node.parentId ?? null);
    const rootCloneId = Object.values(clonedNodes).find(n => n.name === `${node.name} Copy`)?.id
      ?? Object.keys(clonedNodes)[0];

    set(s => {
      const newNodes = { ...s.nodes, ...clonedNodes };
      if (node.parentId) {
        const parent = s.nodes[node.parentId];
        if (!parent) return { nodes: newNodes, selectedNodeId: rootCloneId };
        newNodes[node.parentId] = { ...parent, children: [...parent.children, rootCloneId] };
        return { nodes: newNodes, selectedNodeId: rootCloneId };
      }
      const ab = s.artboards.find(a => a.nodes.includes(id));
      return {
        nodes: newNodes,
        artboards: s.artboards.map(a =>
          a.id === ab?.id ? { ...a, nodes: [...a.nodes, rootCloneId] } : a
        ),
        selectedNodeId: rootCloneId,
      };
    });
  },

  moveNode: (id, x, y) => {
    set(state => ({
      nodes: {
        ...state.nodes,
        [id]: { ...state.nodes[id], x, y },
      },
    }));
  },

  resizeNode: (id, width, height) => {
    set(state => {
      const node = state.nodes[id];
      if (!node) return state;
      return {
        nodes: {
          ...state.nodes,
          [id]: { ...node, width: Math.max(20, width), height: Math.max(20, height) },
        },
      };
    });
  },

  updateNodeStyles: (id, styles) => {
    set(state => {
      const node = state.nodes[id];
      if (!node) return state;
      return {
        nodes: {
          ...state.nodes,
          [id]: { ...node, styles: { ...node.styles, ...styles } },
        },
      };
    });
    if (get().syncChanges) {
      const node = get().nodes[id];
      if (!node) return;
      const matchingNodes = Object.values(get().nodes).filter((candidate) =>
        candidate.id !== id && (
          (node.syncGroupId && candidate.syncGroupId === node.syncGroupId) ||
          candidate.name === node.name
        ),
      );
      matchingNodes.forEach((matchNode) => {
        set(s => ({
          nodes: {
            ...s.nodes,
            [matchNode.id]: { ...matchNode, styles: { ...matchNode.styles, ...styles } },
          },
        }));
      });
    }
  },

  updateNodeContent: (id, content) => {
    set(state => ({
      nodes: { ...state.nodes, [id]: { ...state.nodes[id], content } },
    }));
    if (get().syncChanges) {
      const node = get().nodes[id];
      if (!node) return;
      Object.values(get().nodes)
        .filter((candidate) => candidate.id !== id && candidate.syncGroupId && candidate.syncGroupId === node.syncGroupId)
        .forEach((matchNode) => {
          set((state) => ({
            nodes: { ...state.nodes, [matchNode.id]: { ...state.nodes[matchNode.id], content } },
          }));
        });
    }
  },

  updateNodeName: (id, name) => {
    set(state => ({
      nodes: { ...state.nodes, [id]: { ...state.nodes[id], name } },
    }));
    if (get().syncChanges) {
      const node = get().nodes[id];
      if (!node) return;
      Object.values(get().nodes)
        .filter((candidate) => candidate.id !== id && candidate.syncGroupId && candidate.syncGroupId === node.syncGroupId)
        .forEach((matchNode) => {
          set((state) => ({
            nodes: { ...state.nodes, [matchNode.id]: { ...state.nodes[matchNode.id], name } },
          }));
        });
    }
  },

  selectNode: (id) => set({ selectedNodeId: id }),
  hoverNode: (id) => set({ hoveredNodeId: id }),

  bringForward: (id) => {
    set(state => {
      const node = state.nodes[id];
      if (!node) return state;
      if (node.parentId) {
        const parent = state.nodes[node.parentId];
        if (!parent) return state;
        const idx = parent.children.indexOf(id);
        if (idx < parent.children.length - 1) {
          const newChildren = [...parent.children];
          [newChildren[idx], newChildren[idx + 1]] = [newChildren[idx + 1], newChildren[idx]];
          return { nodes: { ...state.nodes, [parent.id]: { ...parent, children: newChildren } } };
        }
        return state;
      }
      const ab = state.artboards.find(a => a.nodes.includes(id));
      if (!ab) return state;
      const idx = ab.nodes.indexOf(id);
      if (idx < ab.nodes.length - 1) {
        const newNodes = [...ab.nodes];
        [newNodes[idx], newNodes[idx + 1]] = [newNodes[idx + 1], newNodes[idx]];
        return { artboards: state.artboards.map(a => a.id === ab.id ? { ...a, nodes: newNodes } : a) };
      }
      return state;
    });
  },

  sendBackward: (id) => {
    set(state => {
      const node = state.nodes[id];
      if (!node) return state;
      if (node.parentId) {
        const parent = state.nodes[node.parentId];
        if (!parent) return state;
        const idx = parent.children.indexOf(id);
        if (idx > 0) {
          const newChildren = [...parent.children];
          [newChildren[idx], newChildren[idx - 1]] = [newChildren[idx - 1], newChildren[idx]];
          return { nodes: { ...state.nodes, [parent.id]: { ...parent, children: newChildren } } };
        }
        return state;
      }
      const ab = state.artboards.find(a => a.nodes.includes(id));
      if (!ab) return state;
      const idx = ab.nodes.indexOf(id);
      if (idx > 0) {
        const newNodes = [...ab.nodes];
        [newNodes[idx], newNodes[idx - 1]] = [newNodes[idx - 1], newNodes[idx]];
        return { artboards: state.artboards.map(a => a.id === ab.id ? { ...a, nodes: newNodes } : a) };
      }
      return state;
    });
  },

  toggleLock: (id) => {
    set(state => ({
      nodes: { ...state.nodes, [id]: { ...state.nodes[id], locked: !state.nodes[id]?.locked } },
    }));
  },

  toggleVisibility: (id) => {
    set(state => ({
      nodes: { ...state.nodes, [id]: { ...state.nodes[id], visible: !state.nodes[id]?.visible } },
    }));
  },

  copyNode: (id) => {
    const node = get().nodes[id];
    if (node) set({ clipboard: JSON.parse(JSON.stringify(node)) });
  },

  pasteNode: () => {
    const state = get();
    if (!state.clipboard || !state.activeArtboardId) return;
    const newId = uuidv4();
    const node: CanvasNode = {
      ...JSON.parse(JSON.stringify(state.clipboard)),
      id: newId,
      syncGroupId: uuidv4(),
      name: `${state.clipboard.name} Copy`,
      x: state.clipboard.x + 20,
      y: state.clipboard.y + 20,
      children: [],
    };
    set(s => ({
      nodes: { ...s.nodes, [newId]: node },
      artboards: s.artboards.map(a =>
        a.id === s.activeArtboardId ? { ...a, nodes: [...a.nodes, newId] } : a
      ),
      selectedNodeId: newId,
    }));
  },

  moveToChild: (parentId, childId) => {
    set(s => {
      const parent = s.nodes[parentId];
      const child = s.nodes[childId];
      if (!parent || !child || childId === parentId || subtreeContainsNode(s.nodes, childId, parentId)) return s;
      const childAbsolute = getAbsolutePosition(s.nodes, childId);
      const parentAbsolute = getAbsolutePosition(s.nodes, parentId);
      const currentArtboard = findArtboardByNodeId(s.artboards, s.nodes, childId);
      const nextNodes = { ...s.nodes };

      if (child.parentId && nextNodes[child.parentId]) {
        nextNodes[child.parentId] = {
          ...nextNodes[child.parentId],
          children: nextNodes[child.parentId].children.filter((nodeId) => nodeId !== childId),
        };
      }

      nextNodes[parentId] = {
        ...parent,
        children: parent.children.includes(childId) ? parent.children : [...parent.children, childId],
      };
      nextNodes[childId] = {
        ...child,
        parentId,
        x: childAbsolute.x - parentAbsolute.x,
        y: childAbsolute.y - parentAbsolute.y,
      };

      return {
        nodes: nextNodes,
        artboards: removeNodeFromRoot(s.artboards, currentArtboard?.id, childId),
      };
    });
  },

  removeFromParent: (id) => {
    set(s => {
      const node = s.nodes[id];
      if (!node || !node.parentId) return s;
      const parentId = node.parentId;
      const parent = s.nodes[parentId];
      if (!parent) return s;
      const absolutePosition = getAbsolutePosition(s.nodes, id);
      const ab = findArtboardByNodeId(s.artboards, s.nodes, parentId);
      return {
        nodes: {
          ...s.nodes,
          [parentId]: { ...parent, children: parent.children.filter(c => c !== id) },
          [id]: { ...node, parentId: null, x: absolutePosition.x, y: absolutePosition.y },
        },
        artboards: s.artboards.map(a =>
          a.id === ab?.id && !a.nodes.includes(id) ? { ...a, nodes: [...a.nodes, id] } : a
        ),
      };
    });
  },

  setCanvasOffset: (offset) => set({ canvasOffset: offset }),
  setCanvasZoom: (zoom) => set({ canvasZoom: Math.max(0.1, Math.min(5, zoom)) }),
  setCanvasBgColor: (color) => set({ canvasBgColor: color }),
  setSyncChanges: (v) => set({ syncChanges: v }),

  getSelectedNode: () => {
    const state = get();
    return state.selectedNodeId ? state.nodes[state.selectedNodeId] || null : null;
  },

  getNodeTree: (artboardId) => {
    const state = get();
    const ab = state.artboards.find(a => a.id === artboardId);
    if (!ab) return [];
    return ab.nodes.map(id => state.nodes[id]).filter(Boolean);
  },
}));
