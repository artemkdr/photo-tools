import type { SliceConfig, Theme } from './types';
import { sliceImage, getImageInfo } from './utils/slicer';
import { generateBaseName } from './utils/download';
import { ImageUploader } from './components/image-uploader';
import { ControlPanel } from './components/control-panel';
import { SlicePreview } from './components/slice-preview';
import { DownloadPanel } from './components/download-panel';
import { ThemeToggle } from './components/theme-toggle';

/**
 * Main application class
 */
class App {
  private imageUploader!: ImageUploader;
  private controlPanel!: ControlPanel;
  private slicePreview!: SlicePreview;
  private downloadPanel!: DownloadPanel;
  private themeToggle!: ThemeToggle;
  
  private currentImage: HTMLImageElement | null = null;
  private currentFile: File | null = null;
  private config: SliceConfig = {
    aspectRatio: '1:1',
    unevenHandling: 'pad',
    paddingColor: '#ffffff',
  };
  
  constructor() {
    this.init();
  }
  
  private init(): void {
    // Initialize theme toggle
    const themeContainer = document.getElementById('theme-toggle-container')!;
    this.themeToggle = new ThemeToggle(themeContainer, this.handleThemeChange.bind(this));
    
    // Initialize uploader
    const uploaderContainer = document.getElementById('uploader-container')!;
    this.imageUploader = new ImageUploader(
      uploaderContainer,
      this.handleImageLoad.bind(this),
      this.handleError.bind(this)
    );
    
    // Initialize control panel
    const controlContainer = document.getElementById('control-panel-container')!;
    this.controlPanel = new ControlPanel(
      controlContainer,
      this.config,
      this.handleConfigChange.bind(this)
    );
    
    // Initialize preview
    const previewContainer = document.getElementById('preview-container')!;
    this.slicePreview = new SlicePreview(previewContainer);
    
    // Initialize download panel
    const downloadContainer = document.getElementById('download-panel-container')!;
    this.downloadPanel = new DownloadPanel(downloadContainer);
    
    // Create image info container
    this.createImageInfoContainer();
    
    // Set initial visibility
    this.updateVisibility();
  }
  
  private createImageInfoContainer(): void {
    const container = document.getElementById('image-info-container')!;
    container.innerHTML = `
      <div class="image-info" style="display: none;">
        <h3 class="image-info-title">Image Info</h3>
        <div class="image-info-grid">
          <div class="image-info-item">
            <span class="image-info-label">Dimensions</span>
            <span class="image-info-value" id="info-dimensions">-</span>
          </div>
          <div class="image-info-item">
            <span class="image-info-label">Slices</span>
            <span class="image-info-value" id="info-slices">-</span>
          </div>
        </div>
        <button type="button" class="btn btn-secondary reset-btn" id="reset-btn">
          Choose Another Image
        </button>
      </div>
    `;
    
    // Bind reset button
    document.getElementById('reset-btn')?.addEventListener('click', () => {
      this.reset();
    });
  }
  
  private handleImageLoad(image: HTMLImageElement, file: File): void {
    this.currentImage = image;
    this.currentFile = file;
    
    // Update info display
    this.updateImageInfo();
    
    // Process the image
    this.processImage();
    
    // Update visibility
    this.updateVisibility();
  }
  
  private handleConfigChange(config: SliceConfig): void {
    this.config = config;
    
    // Re-process if we have an image
    if (this.currentImage) {
      this.processImage();
    }
  }
  
  private handleThemeChange(theme: Theme): void {
    // Theme is already applied by ThemeToggle component
    console.log('Theme changed to:', theme);
  }
  
  private handleError(message: string): void {
    console.error('Error:', message);
  }
  
  private processImage(): void {
    if (!this.currentImage || !this.currentFile) return;
    
    // Slice the image
    const result = sliceImage(this.currentImage, this.config);
    
    // Update preview
    this.slicePreview.updateSlices(result.slices, result.lastSliceAdjusted);
    
    // Update download panel
    const baseName = generateBaseName(this.currentFile.name);
    this.downloadPanel.setSlices(result.slices, baseName);
    
    // Update slice count in info
    const slicesEl = document.getElementById('info-slices');
    if (slicesEl) {
      slicesEl.textContent = result.count.toString();
    }
  }
  
  private updateImageInfo(): void {
    if (!this.currentImage) return;
    
    const info = getImageInfo(this.currentImage, this.config.aspectRatio);
    
    const dimensionsEl = document.getElementById('info-dimensions');
    const slicesEl = document.getElementById('info-slices');
    
    if (dimensionsEl) {
      dimensionsEl.textContent = `${info.originalWidth} × ${info.originalHeight}`;
    }
    if (slicesEl) {
      slicesEl.textContent = info.sliceCount.toString();
    }
  }
  
  private updateVisibility(): void {
    const hasImage = this.currentImage !== null;
    
    // Show/hide uploader
    this.imageUploader.setVisible(!hasImage);
    
    // Show/hide image info
    const infoEl = document.querySelector('.image-info') as HTMLElement;
    if (infoEl) {
      infoEl.style.display = hasImage ? '' : 'none';
    }
  }
  
  private reset(): void {
    this.currentImage = null;
    this.currentFile = null;
    
    // Reset components
    this.imageUploader.reset();
    this.slicePreview.clear();
    this.downloadPanel.clear();
    
    // Update visibility
    this.updateVisibility();
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
