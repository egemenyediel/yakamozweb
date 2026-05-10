import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { DesignToken, DesignTheme, DesignTokenType } from '@/types';

interface TokenState {
  tokens: DesignToken[];
  themes: DesignTheme[];
  activeTheme: string;
  activeTokenTab: DesignTokenType;

  addToken: (token: Omit<DesignToken, 'id'>) => void;
  updateToken: (id: string, updates: Partial<DesignToken>) => void;
  removeToken: (id: string) => void;
  addTheme: (name: string) => void;
  setActiveTheme: (id: string) => void;
  removeTheme: (id: string) => void;
  setActiveTokenTab: (tab: DesignTokenType) => void;
  getTokenValue: (name: string, type?: DesignTokenType) => string | undefined;
  getColorTokens: () => DesignToken[];
  getTypographyTokens: () => DesignToken[];
  getSpacingTokens: () => DesignToken[];
  getTokensByType: (type: DesignTokenType) => DesignToken[];
}

const defaultColors: DesignToken[] = [
  { id: uuidv4(), name: 'primary', type: 'color', value: '#6366f1', group: 'brand' },
  { id: uuidv4(), name: 'primary-light', type: 'color', value: '#818cf8', group: 'brand' },
  { id: uuidv4(), name: 'primary-dark', type: 'color', value: '#4f46e5', group: 'brand' },
  { id: uuidv4(), name: 'secondary', type: 'color', value: '#8b5cf6', group: 'brand' },
  { id: uuidv4(), name: 'accent', type: 'color', value: '#06b6d4', group: 'brand' },
  { id: uuidv4(), name: 'success', type: 'color', value: '#10b981', group: 'semantic' },
  { id: uuidv4(), name: 'warning', type: 'color', value: '#f59e0b', group: 'semantic' },
  { id: uuidv4(), name: 'error', type: 'color', value: '#ef4444', group: 'semantic' },
  { id: uuidv4(), name: 'info', type: 'color', value: '#3b82f6', group: 'semantic' },
  { id: uuidv4(), name: 'background', type: 'color', value: '#ffffff', group: 'surface' },
  { id: uuidv4(), name: 'surface', type: 'color', value: '#f8fafc', group: 'surface' },
  { id: uuidv4(), name: 'text-primary', type: 'color', value: '#0f172a', group: 'text' },
  { id: uuidv4(), name: 'text-secondary', type: 'color', value: '#64748b', group: 'text' },
  { id: uuidv4(), name: 'text-muted', type: 'color', value: '#94a3b8', group: 'text' },
  { id: uuidv4(), name: 'border', type: 'color', value: '#e2e8f0', group: 'border' },
  { id: uuidv4(), name: 'border-focus', type: 'color', value: '#6366f1', group: 'border' },
];

const defaultSpacing: DesignToken[] = [
  { id: uuidv4(), name: 'xxs', type: 'spacing', value: '2px', group: 'spacing' },
  { id: uuidv4(), name: 'xs', type: 'spacing', value: '4px', group: 'spacing' },
  { id: uuidv4(), name: 'sm', type: 'spacing', value: '8px', group: 'spacing' },
  { id: uuidv4(), name: 'md', type: 'spacing', value: '12px', group: 'spacing' },
  { id: uuidv4(), name: 'lg', type: 'spacing', value: '16px', group: 'spacing' },
  { id: uuidv4(), name: 'xl', type: 'spacing', value: '24px', group: 'spacing' },
  { id: uuidv4(), name: '2xl', type: 'spacing', value: '32px', group: 'spacing' },
  { id: uuidv4(), name: '3xl', type: 'spacing', value: '48px', group: 'spacing' },
  { id: uuidv4(), name: '4xl', type: 'spacing', value: '64px', group: 'spacing' },
];

const defaultBorderRadius: DesignToken[] = [
  { id: uuidv4(), name: 'none', type: 'borderRadius', value: '0px', group: 'radius' },
  { id: uuidv4(), name: 'sm', type: 'borderRadius', value: '4px', group: 'radius' },
  { id: uuidv4(), name: 'md', type: 'borderRadius', value: '8px', group: 'radius' },
  { id: uuidv4(), name: 'lg', type: 'borderRadius', value: '12px', group: 'radius' },
  { id: uuidv4(), name: 'xl', type: 'borderRadius', value: '16px', group: 'radius' },
  { id: uuidv4(), name: '2xl', type: 'borderRadius', value: '24px', group: 'radius' },
  { id: uuidv4(), name: 'full', type: 'borderRadius', value: '9999px', group: 'radius' },
];

const defaultShadow: DesignToken[] = [
  { id: uuidv4(), name: 'sm', type: 'shadow', value: '0 1px 2px 0 rgba(0,0,0,0.05)', group: 'shadow' },
  { id: uuidv4(), name: 'md', type: 'shadow', value: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)', group: 'shadow' },
  { id: uuidv4(), name: 'lg', type: 'shadow', value: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)', group: 'shadow' },
  { id: uuidv4(), name: 'xl', type: 'shadow', value: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', group: 'shadow' },
];

const defaultTypography: DesignToken[] = [
  { id: uuidv4(), name: 'display', type: 'typography', value: JSON.stringify({ fontFamily: 'Inter', fontSize: '48px', fontWeight: '700', lineHeight: '1.1', letterSpacing: '-0.02em' }), group: 'heading' },
  { id: uuidv4(), name: 'h1', type: 'typography', value: JSON.stringify({ fontFamily: 'Inter', fontSize: '36px', fontWeight: '700', lineHeight: '1.2', letterSpacing: '-0.01em' }), group: 'heading' },
  { id: uuidv4(), name: 'h2', type: 'typography', value: JSON.stringify({ fontFamily: 'Inter', fontSize: '30px', fontWeight: '600', lineHeight: '1.3', letterSpacing: '0' }), group: 'heading' },
  { id: uuidv4(), name: 'h3', type: 'typography', value: JSON.stringify({ fontFamily: 'Inter', fontSize: '24px', fontWeight: '600', lineHeight: '1.3', letterSpacing: '0' }), group: 'heading' },
  { id: uuidv4(), name: 'h4', type: 'typography', value: JSON.stringify({ fontFamily: 'Inter', fontSize: '20px', fontWeight: '500', lineHeight: '1.4', letterSpacing: '0' }), group: 'heading' },
  { id: uuidv4(), name: 'body', type: 'typography', value: JSON.stringify({ fontFamily: 'Inter', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', letterSpacing: '0' }), group: 'body' },
  { id: uuidv4(), name: 'body-sm', type: 'typography', value: JSON.stringify({ fontFamily: 'Inter', fontSize: '14px', fontWeight: '400', lineHeight: '1.5', letterSpacing: '0' }), group: 'body' },
  { id: uuidv4(), name: 'caption', type: 'typography', value: JSON.stringify({ fontFamily: 'Inter', fontSize: '12px', fontWeight: '400', lineHeight: '1.5', letterSpacing: '0.01em' }), group: 'body' },
];

const lightTheme: DesignTheme = {
  id: 'light',
  name: 'Light',
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    border: '#e2e8f0',
  },
  typography: {},
  spacing: {},
  borderRadius: {},
  shadows: {},
};

const darkTheme: DesignTheme = {
  id: 'dark',
  name: 'Dark',
  colors: {
    primary: '#818cf8',
    secondary: '#a78bfa',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    border: '#334155',
  },
  typography: {},
  spacing: {},
  borderRadius: {},
  shadows: {},
};

export const useTokenStore = create<TokenState>((set, get) => ({
  tokens: [
    ...defaultColors,
    ...defaultTypography,
    ...defaultSpacing,
    ...defaultBorderRadius,
    ...defaultShadow,
  ],
  themes: [lightTheme, darkTheme],
  activeTheme: 'light',
  activeTokenTab: 'color',

  addToken: (token) => {
    set(state => ({
      tokens: [...state.tokens, { ...token, id: uuidv4() }],
    }));
  },

  updateToken: (id, updates) => {
    set(state => ({
      tokens: state.tokens.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  },

  removeToken: (id) => {
    set(state => ({
      tokens: state.tokens.filter(t => t.id !== id),
    }));
  },

  addTheme: (name) => {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    set(state => ({
      themes: [...state.themes, {
        id,
        name,
        colors: { ...lightTheme.colors },
        typography: {},
        spacing: {},
        borderRadius: {},
        shadows: {},
      }],
    }));
  },

  setActiveTheme: (id) => set({ activeTheme: id }),

  removeTheme: (id) => {
    set(state => ({
      themes: state.themes.filter(t => t.id !== id),
      activeTheme: state.activeTheme === id ? 'light' : state.activeTheme,
    }));
  },

  setActiveTokenTab: (tab) => set({ activeTokenTab: tab }),

  getTokenValue: (name, type) => {
    const token = get().tokens.find(t => t.name === name && (!type || t.type === type));
    return token?.value;
  },

  getColorTokens: () => get().tokens.filter(t => t.type === 'color'),
  getTypographyTokens: () => get().tokens.filter(t => t.type === 'typography'),
  getSpacingTokens: () => get().tokens.filter(t => t.type === 'spacing'),
  getTokensByType: (type) => get().tokens.filter(t => t.type === type),
}));
