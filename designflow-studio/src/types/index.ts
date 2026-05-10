export type DesignTokenType = 'color' | 'typography' | 'spacing' | 'borderRadius' | 'shadow' | 'opacity';

export interface DesignToken {
  id: string;
  name: string;
  type: DesignTokenType;
  value: string;
  group?: string;
}

export interface TokenGroup {
  id: string;
  name: string;
  type: DesignTokenType;
  tokens: DesignToken[];
}

export interface DesignTheme {
  id: string;
  name: string;
  colors: Record<string, string>;
  typography: Record<string, TypographyToken>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

export interface TypographyToken {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
}

export type CanvasNodeType = 'div' | 'text' | 'button' | 'input' | 'image' | 'container' | 'row' | 'column' | 'card' | 'navbar' | 'hero' | 'grid' | 'flex' | 'separator' | 'icon' | 'link' | 'badge' | 'avatar' | 'checkbox' | 'toggle' | 'select' | 'textarea';

export interface CanvasNode {
  id: string;
  syncGroupId?: string;
  type: CanvasNodeType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  styles: NodeStyles;
  children: string[];
  parentId: string | null;
  locked: boolean;
  visible: boolean;
  content?: string;
  placeholder?: string;
  props?: Record<string, string>;
}

export interface NodeStyles {
  backgroundColor?: string;
  color?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  borderRadius?: string;
  borderTopLeftRadius?: string;
  borderTopRightRadius?: string;
  borderBottomLeftRadius?: string;
  borderBottomRightRadius?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderColor?: string;
  boxShadow?: string;
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
  overflow?: string;
  position?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  zIndex?: string;
  opacity?: string;
  cursor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  objectFit?: string;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  flexWrap?: string;
  flexGrow?: string;
  flexShrink?: string;
  width?: string;
  height?: string;
}

export interface ComponentTemplate {
  id: string;
  name: string;
  type: CanvasNodeType;
  icon: string;
  category: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultStyles: Partial<NodeStyles>;
  defaultContent?: string;
  placeholder?: string;
  children?: ComponentTemplate[];
}

export type ExportFormat = 'react' | 'html' | 'tailwind' | 'vue' | 'css';

export interface ProjectData {
  id: string;
  name: string;
  nodes: Record<string, CanvasNode>;
  rootNodes: string[];
  tokens: DesignToken[];
  themes: DesignTheme[];
  activeTheme: string;
  canvasOffset: { x: number; y: number };
  canvasZoom: number;
  artboardSize: { width: number; height: number };
}
