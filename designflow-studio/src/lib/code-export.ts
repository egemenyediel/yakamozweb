import { CanvasNode, ExportFormat, NodeStyles } from '@/types';

const styleToCSS = (styles: Partial<NodeStyles>): string => {
  const css: Record<string, string> = {};
  if (styles.backgroundColor) css['background-color'] = styles.backgroundColor;
  if (styles.color) css['color'] = styles.color;
  if (styles.fontFamily) css['font-family'] = styles.fontFamily;
  if (styles.fontSize) css['font-size'] = styles.fontSize;
  if (styles.fontWeight) css['font-weight'] = styles.fontWeight;
  if (styles.lineHeight) css['line-height'] = styles.lineHeight;
  if (styles.letterSpacing) css['letter-spacing'] = styles.letterSpacing;
  if (styles.textAlign) css['text-align'] = styles.textAlign;
  if (styles.padding) css['padding'] = styles.padding;
  if (styles.paddingTop) css['padding-top'] = styles.paddingTop;
  if (styles.paddingRight) css['padding-right'] = styles.paddingRight;
  if (styles.paddingBottom) css['padding-bottom'] = styles.paddingBottom;
  if (styles.paddingLeft) css['padding-left'] = styles.paddingLeft;
  if (styles.margin) css['margin'] = styles.margin;
  if (styles.marginTop) css['margin-top'] = styles.marginTop;
  if (styles.marginRight) css['margin-right'] = styles.marginRight;
  if (styles.marginBottom) css['margin-bottom'] = styles.marginBottom;
  if (styles.marginLeft) css['margin-left'] = styles.marginLeft;
  if (styles.borderRadius) css['border-radius'] = styles.borderRadius;
  if (styles.borderWidth) css['border-width'] = styles.borderWidth;
  if (styles.borderStyle) css['border-style'] = styles.borderStyle;
  if (styles.borderColor) css['border-color'] = styles.borderColor;
  if (styles.boxShadow) css['box-shadow'] = styles.boxShadow;
  if (styles.display) css['display'] = styles.display;
  if (styles.flexDirection) css['flex-direction'] = styles.flexDirection;
  if (styles.justifyContent) css['justify-content'] = styles.justifyContent;
  if (styles.alignItems) css['align-items'] = styles.alignItems;
  if (styles.gap) css['gap'] = styles.gap;
  if (styles.overflow) css['overflow'] = styles.overflow;
  if (styles.opacity) css['opacity'] = styles.opacity;
  if (styles.cursor) css['cursor'] = styles.cursor;
  if (styles.objectFit) css['object-fit'] = styles.objectFit;
  if (styles.minWidth) css['min-width'] = styles.minWidth;
  if (styles.maxWidth) css['max-width'] = styles.maxWidth;
  if (styles.minHeight) css['min-height'] = styles.minHeight;
  if (styles.maxHeight) css['max-height'] = styles.maxHeight;
  if (styles.flexWrap) css['flex-wrap'] = styles.flexWrap;
  if (styles.flexGrow) css['flex-grow'] = styles.flexGrow;
  if (styles.position) css['position'] = styles.position;
  if (styles.width) css['width'] = styles.width;
  if (styles.height) css['height'] = styles.height;
  return Object.entries(css).map(([k, v]) => `${k}: ${v}`).join('; ');
};

const styleToTailwind = (styles: Partial<NodeStyles>): string => {
  const classes: string[] = [];
  if (styles.display === 'flex') classes.push('flex');
  if (styles.flexDirection === 'column') classes.push('flex-col');
  if (styles.flexDirection === 'row') classes.push('flex-row');
  if (styles.justifyContent === 'center') classes.push('justify-center');
  if (styles.justifyContent === 'space-between') classes.push('justify-between');
  if (styles.justifyContent === 'flex-start') classes.push('justify-start');
  if (styles.justifyContent === 'flex-end') classes.push('justify-end');
  if (styles.alignItems === 'center') classes.push('items-center');
  if (styles.alignItems === 'flex-start') classes.push('items-start');
  if (styles.alignItems === 'flex-end') classes.push('items-end');
  if (styles.gap) {
    const gapMap: Record<string, string> = { '4px': 'gap-1', '8px': 'gap-2', '12px': 'gap-3', '16px': 'gap-4', '24px': 'gap-6', '32px': 'gap-8', '48px': 'gap-12' };
    classes.push(gapMap[styles.gap] || `gap-[${styles.gap}]`);
  }
  if (styles.padding) {
    const pMap: Record<string, string> = { '8px': 'p-2', '12px': 'p-3', '16px': 'p-4', '24px': 'p-6', '32px': 'p-8', '48px': 'p-12' };
    classes.push(pMap[styles.padding] || `p-[${styles.padding}]`);
  }
  if (styles.backgroundColor) {
    const bgMap: Record<string, string> = { '#ffffff': 'bg-white', '#f8fafc': 'bg-slate-50', '#f1f5f9': 'bg-slate-100', '#0f172a': 'bg-slate-900', '#1e293b': 'bg-slate-800', '#6366f1': 'bg-indigo-500', '#818cf8': 'bg-indigo-400', '#ede9fe': 'bg-violet-100', '#e2e8f0': 'bg-slate-200' };
    classes.push(bgMap[styles.backgroundColor] || `bg-[${styles.backgroundColor}]`);
  }
  if (styles.color) {
    const cMap: Record<string, string> = { '#0f172a': 'text-slate-900', '#64748b': 'text-slate-500', '#ffffff': 'text-white', '#6366f1': 'text-indigo-500' };
    classes.push(cMap[styles.color] || `text-[${styles.color}]`);
  }
  if (styles.fontSize) {
    const fsMap: Record<string, string> = { '12px': 'text-xs', '14px': 'text-sm', '16px': 'text-base', '20px': 'text-lg', '24px': 'text-xl', '30px': 'text-2xl', '36px': 'text-3xl', '48px': 'text-5xl' };
    classes.push(fsMap[styles.fontSize] || `text-[${styles.fontSize}]`);
  }
  if (styles.fontWeight) {
    const fwMap: Record<string, string> = { '400': 'font-normal', '500': 'font-medium', '600': 'font-semibold', '700': 'font-bold' };
    classes.push(fwMap[styles.fontWeight] || '');
  }
  if (styles.textAlign === 'center') classes.push('text-center');
  if (styles.textAlign === 'right') classes.push('text-right');
  if (styles.borderRadius) {
    const rMap: Record<string, string> = { '4px': 'rounded', '8px': 'rounded-lg', '12px': 'rounded-xl', '16px': 'rounded-2xl', '9999px': 'rounded-full' };
    classes.push(rMap[styles.borderRadius] || `rounded-[${styles.borderRadius}]`);
  }
  if (styles.borderStyle === 'solid' && styles.borderWidth) classes.push('border');
  if (styles.borderColor) {
    const bcMap: Record<string, string> = { '#e2e8f0': 'border-slate-200', '#6366f1': 'border-indigo-500' };
    classes.push(bcMap[styles.borderColor] || `border-[${styles.borderColor}]`);
  }
  if (styles.boxShadow) classes.push('shadow-md');
  if (styles.cursor === 'pointer') classes.push('cursor-pointer');
  if (styles.objectFit === 'cover') classes.push('object-cover');
  if (styles.flexWrap === 'wrap') classes.push('flex-wrap');
  return classes.join(' ');
};

const getHtmlTag = (node: CanvasNode): string => {
  switch (node.type) {
    case 'text': return 'p';
    case 'button': return 'button';
    case 'input': return 'input';
    case 'textarea': return 'textarea';
    case 'image': case 'avatar': return 'img';
    case 'link': return 'a';
    case 'select': return 'select';
    case 'separator': return 'hr';
    default: return 'div';
  }
};

const getReactTag = (node: CanvasNode): string => {
  switch (node.type) {
    case 'text': return 'p';
    case 'button': return 'button';
    case 'input': return 'input';
    case 'textarea': return 'textarea';
    case 'image': case 'avatar': return 'img';
    case 'link': return 'a';
    case 'select': return 'select';
    case 'separator': return 'hr';
    default: return 'div';
  }
};

const generateChildren = (
  node: CanvasNode,
  nodes: Record<string, CanvasNode>,
  format: ExportFormat,
  indent: number
): string => {
  if (node.children.length === 0) return '';
  return node.children
    .map(childId => {
      const child = nodes[childId];
      if (!child) return '';
      return generateNode(child, nodes, format, indent);
    })
    .join('\n');
};

function generateNode(
  node: CanvasNode,
  nodes: Record<string, CanvasNode>,
  format: ExportFormat,
  indent: number = 0
): string {
  const pad = '  '.repeat(indent);
  const tag = format === 'react' ? getReactTag(node) : getHtmlTag(node);
  const isSelfClosing = ['img', 'input', 'hr', 'br'].includes(tag);

  if (format === 'tailwind') {
    const tw = styleToTailwind(node.styles);
    const children = generateChildren(node, nodes, format, indent + 1);
    const content = node.content || '';
    const cls = tw ? ` class="${tw}"` : '';
    if (isSelfClosing) return `${pad}<${tag}${cls} />`;
    return `${pad}<${tag}${cls}>${content ? `\n${pad}  ${content}\n${pad}` : ''}${children ? '\n' + children + '\n' + pad : ''}</${tag}>`;
  }

  if (format === 'react') {
    const styleObj = Object.entries(node.styles)
      .filter(([, v]) => v)
      .reduce((acc, [k, v]) => {
        const camelKey = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        return { ...acc, [camelKey]: v };
      }, {} as Record<string, string>);
    const styleStr = JSON.stringify(styleObj, null, 2)
      .split('\n')
      .map((l, i) => i === 0 ? l : `${pad}    ${l}`)
      .join('\n');
    const children = generateChildren(node, nodes, format, indent + 1);
    const content = node.content || '';
    if (isSelfClosing) return `${pad}<${tag} style={${styleStr}} />`;
    return `${pad}<${tag} style={${styleStr}}>${content ? `\n${pad}  ${content}` : ''}${children ? '\n' + children : ''}\n${pad}</${tag}>`;
  }

  if (format === 'html' || format === 'css') {
    const children = generateChildren(node, nodes, format, indent + 1);
    const content = node.content || '';
    const cls = ` class="node-${node.id.slice(0, 8)}"`;
    if (isSelfClosing) return `${pad}<${tag}${cls} />`;
    return `${pad}<${tag}${cls}>${content ? `\n${pad}  ${content}\n${pad}` : ''}${children ? '\n' + children + '\n' + pad : ''}</${tag}>`;
  }

  if (format === 'vue') {
    const css = styleToCSS(node.styles);
    const children = generateChildren(node, nodes, format, indent + 1);
    const content = node.content || '';
    const cls = css ? ` style="${css}"` : '';
    if (isSelfClosing) return `${pad}<${tag}${cls} />`;
    return `${pad}<${tag}${cls}>${content ? `\n${pad}  ${content}\n${pad}` : ''}${children ? '\n' + children + '\n' + pad : ''}</${tag}>`;
  }

  return '';
}

function generateCSS(nodes: Record<string, CanvasNode>, rootNodes: string[]): string {
  const allNodes: CanvasNode[] = [];
  const collectNodes = (ids: string[]) => {
    ids.forEach(id => {
      const node = nodes[id];
      if (node) {
        allNodes.push(node);
        collectNodes(node.children);
      }
    });
  };
  collectNodes(rootNodes);

  return allNodes.map(node => {
    const css = styleToCSS(node.styles);
    return `.node-${node.id.slice(0, 8)} {\n  ${css.split('; ').join(';\n  ')};\n}`;
  }).join('\n\n');
}

export function exportCode(
  nodes: Record<string, CanvasNode>,
  rootNodes: string[],
  format: ExportFormat
): string {
  if (format === 'css') {
    const html = rootNodes
      .map(id => {
        const node = nodes[id];
        return node ? generateNode(node, nodes, 'css', 0) : '';
      })
      .join('\n');
    const css = generateCSS(nodes, rootNodes);
    return `/* HTML */\n${html}\n\n/* CSS */\n${css}`;
  }

  if (format === 'react') {
    const body = rootNodes
      .map(id => {
        const node = nodes[id];
        return node ? generateNode(node, nodes, 'react', 2) : '';
      })
      .join('\n');
    return `import React from 'react';\n\nexport default function Component() {\n  return (\n${body}\n  );\n}`;
  }

  if (format === 'vue') {
    const body = rootNodes
      .map(id => {
        const node = nodes[id];
        return node ? generateNode(node, nodes, 'vue', 2) : '';
      })
      .join('\n');
    return `<template>\n${body}\n</template>\n\n<script setup>\n</script>`;
  }

  const html = rootNodes
    .map(id => {
      const node = nodes[id];
      return node ? generateNode(node, nodes, format, 2) : '';
    })
    .join('\n');

  if (format === 'html') {
    const css = generateCSS(nodes, rootNodes);
    return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Exported Design</title>\n  <style>\n${css.split('\n').map(l => '    ' + l).join('\n')}\n  </style>\n</head>\n<body>\n${html}\n</body>\n</html>`;
  }

  return html;
}
