import { startLoading, endLoading } from './loading';

// Content Management System - Static JSON Only (No Database)

export interface HeroContent {
  tr: {
    title: string;
    subtitle: string;
    buttonText: string;
  };
  de: {
    title: string;
    subtitle: string;
    buttonText: string;
  };
  en: {
    title: string;
    subtitle: string;
    buttonText: string;
  };
}

export interface Solution {
  id: string;
  icon: string;
  title: {
    tr: string;
    de: string;
    en: string;
  };
  description: {
    tr: string;
    de: string;
    en: string;
  };
  details?: {
    tr: string;
    de: string;
    en: string;
  };
}

export interface Reference {
  id: string;
  name: {
    tr: string;
    de: string;
    en: string;
  };
  description: {
    tr: string;
    de: string;
    en: string;
  };
  image: string;
  projectUrl?: string;
  ownProduct?: boolean;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: {
    tr: string;
    de: string;
    en: string;
  };
}

export interface SiteContent {
  hero: HeroContent;
  solutions: Solution[];
  references: Reference[];
  contact: ContactInfo;
}

// Load content from static JSON file only
export const loadContent = async (): Promise<SiteContent> => {
  startLoading();
  try {
    console.log('[loadContent] Fetching from: /content.json');
    
    const response = await fetch('/content.json');
    console.log('[loadContent] Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(String(response.status));
    }
    
    const content = await response.json();
    console.log('✅ Content loaded from JSON:', content);
    return content;
  } catch (error) {
    console.error('❌ Error loading content:', error);
    throw error;
  } finally {
    endLoading();
  }
};

// Sync version (for components that need sync access)
let cachedContent: SiteContent | null = null;

export const loadContentSync = (): SiteContent => {
  if (!cachedContent) {
    throw new Error('Content not loaded yet. Call loadContent() first.');
  }
  return cachedContent;
};

// Cache content after async load
export const initializeContent = async (): Promise<void> => {
  try {
    cachedContent = await loadContent();
    console.log('� Content initialized from JSON');
  } catch (error) {
    console.error('❌ Failed to initialize content:', error);
    throw error;
  }
};
