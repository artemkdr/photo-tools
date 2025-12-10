/**
 * Slice preview component showing all generated slices
 */
export class SlicePreview {
  private element: HTMLElement;
  private previewContainer: HTMLElement;
  private slices: HTMLCanvasElement[] = [];
  
  constructor(container: HTMLElement) {
    this.element = this.render();
    this.previewContainer = this.element.querySelector('.preview-grid')!;
    container.appendChild(this.element);
  }
  
  private render(): HTMLElement {
    const el = document.createElement('div');
    el.className = 'slice-preview';
    el.innerHTML = `
      <div class="preview-header">
        <h2 class="preview-title">Preview</h2>
        <p class="preview-info"></p>
      </div>
      <div class="preview-grid"></div>
    `;
    return el;
  }
  
  /**
   * Update the preview with new slices
   */
  public updateSlices(slices: HTMLCanvasElement[], lastSliceAdjusted: boolean): void {
    this.slices = slices;
    this.previewContainer.innerHTML = '';
    
    slices.forEach((canvas, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'preview-item';
      
      // Create a scaled preview canvas
      const previewCanvas = document.createElement('canvas');
      const maxSize = 200;
      const scale = Math.min(maxSize / canvas.width, maxSize / canvas.height);
      previewCanvas.width = canvas.width * scale;
      previewCanvas.height = canvas.height * scale;
      
      const ctx = previewCanvas.getContext('2d')!;
      ctx.drawImage(canvas, 0, 0, previewCanvas.width, previewCanvas.height);
      
      const isLast = index === slices.length - 1;
      const label = document.createElement('span');
      label.className = 'preview-label';
      label.textContent = `${index + 1}${isLast && lastSliceAdjusted ? ' (adjusted)' : ''}`;
      
      wrapper.appendChild(previewCanvas);
      wrapper.appendChild(label);
      this.previewContainer.appendChild(wrapper);
    });
    
    // Update info text
    const infoEl = this.element.querySelector('.preview-info')!;
    infoEl.textContent = `${slices.length} slide${slices.length !== 1 ? 's' : ''} generated`;
    
    this.element.classList.add('has-slices');
  }
  
  /**
   * Clear all previews
   */
  public clear(): void {
    this.slices = [];
    this.previewContainer.innerHTML = '';
    this.element.classList.remove('has-slices');
    
    const infoEl = this.element.querySelector('.preview-info')!;
    infoEl.textContent = '';
  }
  
  /**
   * Get current slices
   */
  public getSlices(): HTMLCanvasElement[] {
    return this.slices;
  }
  
  /**
   * Check if there are slices to show
   */
  public hasSlices(): boolean {
    return this.slices.length > 0;
  }
}
