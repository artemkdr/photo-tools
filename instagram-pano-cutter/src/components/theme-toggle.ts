import type { Theme } from '../types';

export type ThemeChangeCallback = (theme: Theme) => void;

const STORAGE_KEY = 'instagram-pano-cutter-theme';

/**
 * Theme toggle component supporting light/dark/auto modes
 */
export class ThemeToggle {
  private element: HTMLElement;
  private currentTheme: Theme;
  private onChange: ThemeChangeCallback;
  
  constructor(
    container: HTMLElement,
    onChange: ThemeChangeCallback
  ) {
    this.onChange = onChange;
    this.currentTheme = this.loadTheme();
    this.element = this.render();
    container.appendChild(this.element);
    this.bindEvents();
    this.applyTheme(this.currentTheme);
  }
  
  private render(): HTMLElement {
    const el = document.createElement('div');
    el.className = 'theme-toggle';
    el.innerHTML = `
      <button 
        type="button" 
        class="theme-btn" 
        aria-label="Toggle theme"
        title="Toggle theme"
      >
        <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
    `;
    return el;
  }
  
  private bindEvents(): void {
    const btn = this.element.querySelector('.theme-btn')!;
    btn.addEventListener('click', () => this.cycleTheme());
  }
  
  private cycleTheme(): void {
    const themes: Theme[] = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex]);
  }
  
  private setTheme(theme: Theme): void {
    this.currentTheme = theme;
    this.saveTheme(theme);
    this.applyTheme(theme);
    this.onChange(theme);
  }
  
  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    
    if (theme === 'auto') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
    
    // Update button state
    const btn = this.element.querySelector('.theme-btn')!;
    btn.setAttribute('data-theme', theme);
    
    // Update title
    const titles: Record<Theme, string> = {
      light: 'Switch to dark mode',
      dark: 'Switch to auto mode',
      auto: 'Switch to light mode',
    };
    btn.setAttribute('title', titles[theme]);
  }
  
  private loadTheme(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'auto') {
      return stored;
    }
    return 'auto';
  }
  
  private saveTheme(theme: Theme): void {
    localStorage.setItem(STORAGE_KEY, theme);
  }
  
  /**
   * Get current theme
   */
  public getTheme(): Theme {
    return this.currentTheme;
  }
}
