import { downloadSlice, downloadAllSlices } from '../utils/download';

export type DownloadCallback = () => void;

/**
 * Download panel component with individual and batch download options
 */
export class DownloadPanel {
  private element: HTMLElement;
  private slices: HTMLCanvasElement[] = [];
  private baseName: string = 'slide';
  private isDownloading: boolean = false;
  
  constructor(container: HTMLElement) {
    this.element = this.render();
    container.appendChild(this.element);
    this.bindEvents();
    this.updateState();
  }
  
  private render(): HTMLElement {
    const el = document.createElement('div');
    el.className = 'download-panel';
    el.innerHTML = `
      <div class="download-header">
        <h2 class="download-title">Download</h2>
      </div>
      
      <div class="download-actions">
        <button type="button" class="btn btn-primary download-all-btn" disabled>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>Download All</span>
        </button>
      </div>
      
      <div class="download-individual">
        <p class="download-hint">Or download individually:</p>
        <div class="download-buttons"></div>
      </div>
      
      <div class="download-progress" aria-live="polite">
        <span class="progress-text"></span>
      </div>
    `;
    return el;
  }
  
  private bindEvents(): void {
    const downloadAllBtn = this.element.querySelector('.download-all-btn')!;
    downloadAllBtn.addEventListener('click', () => this.handleDownloadAll());
  }
  
  private async handleDownloadAll(): Promise<void> {
    if (this.isDownloading || this.slices.length === 0) return;
    
    this.isDownloading = true;
    this.updateState();
    this.showProgress('Downloading...');
    
    try {
      await downloadAllSlices(this.slices, this.baseName);
      this.showProgress('Download complete!');
      setTimeout(() => this.hideProgress(), 2000);
    } catch (error) {
      this.showProgress('Download failed. Please try again.');
      console.error('Download error:', error);
    } finally {
      this.isDownloading = false;
      this.updateState();
    }
  }
  
  private async handleDownloadSingle(index: number): Promise<void> {
    if (this.isDownloading) return;
    
    try {
      await downloadSlice(this.slices[index], index, this.baseName);
    } catch (error) {
      console.error('Download error:', error);
    }
  }
  
  private updateState(): void {
    const hasSlices = this.slices.length > 0;
    const downloadAllBtn = this.element.querySelector('.download-all-btn') as HTMLButtonElement;
    const individualSection = this.element.querySelector('.download-individual') as HTMLElement;
    
    downloadAllBtn.disabled = !hasSlices || this.isDownloading;
    individualSection.style.display = hasSlices ? '' : 'none';
  }
  
  private showProgress(text: string): void {
    const progressEl = this.element.querySelector('.download-progress')!;
    const textEl = progressEl.querySelector('.progress-text')!;
    textEl.textContent = text;
    progressEl.classList.add('visible');
  }
  
  private hideProgress(): void {
    const progressEl = this.element.querySelector('.download-progress')!;
    progressEl.classList.remove('visible');
  }
  
  /**
   * Update the panel with new slices
   */
  public setSlices(slices: HTMLCanvasElement[], baseName: string): void {
    this.slices = slices;
    this.baseName = baseName;
    
    // Rebuild individual download buttons
    const buttonsContainer = this.element.querySelector('.download-buttons')!;
    buttonsContainer.innerHTML = '';
    
    slices.forEach((_, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-secondary download-single-btn';
      btn.textContent = `Slide ${index + 1}`;
      btn.addEventListener('click', () => this.handleDownloadSingle(index));
      buttonsContainer.appendChild(btn);
    });
    
    this.updateState();
  }
  
  /**
   * Clear the panel
   */
  public clear(): void {
    this.slices = [];
    this.baseName = 'slide';
    
    const buttonsContainer = this.element.querySelector('.download-buttons')!;
    buttonsContainer.innerHTML = '';
    
    this.hideProgress();
    this.updateState();
  }
}
