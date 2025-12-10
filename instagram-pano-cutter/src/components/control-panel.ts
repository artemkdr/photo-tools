import type { AspectRatio, UnevenHandling, SliceConfig } from "../types";

export type ConfigChangeCallback = (config: SliceConfig) => void;

/**
 * Control panel component for configuring slice settings
 */
export class ControlPanel {
    private element: HTMLElement;
    private config: SliceConfig;
    private onChange: ConfigChangeCallback;

    constructor(
        container: HTMLElement,
        initialConfig: SliceConfig,
        onChange: ConfigChangeCallback,
    ) {
        this.config = { ...initialConfig };
        this.onChange = onChange;
        this.element = this.render();
        container.appendChild(this.element);
        this.bindEvents();
        this.updateColorPickerVisibility();
    }

    private render(): HTMLElement {
        const el = document.createElement("div");
        el.className = "control-panel";
        el.innerHTML = `
      <div class="control-group">
        <label class="control-label">Slide Format</label>
        <div class="radio-group" role="radiogroup" aria-label="Aspect ratio">
          <label class="radio-option">
            <input 
              type="radio" 
              name="aspectRatio" 
              value="1:1" 
              ${this.config.aspectRatio === "1:1" ? "checked" : ""}
            />
            <span class="radio-label">
              <span class="ratio-icon ratio-square"></span>
              <span>Square (1:1)</span>
            </span>
          </label>
          <label class="radio-option">
            <input 
              type="radio" 
              name="aspectRatio" 
              value="4:5" 
              ${this.config.aspectRatio === "4:5" ? "checked" : ""}
            />
            <span class="radio-label">
              <span class="ratio-icon ratio-portrait"></span>
              <span>Portrait (4:5)</span>
            </span>
          </label>
        </div>
      </div>

      <div class="control-group">
        <label class="control-label">Manual Padding</label>
        <p class="control-hint">Optional margins added before slicing</p>
        <div class="padding-inputs">
          <label class="padding-input">
            <span class="number-input-label">V</span>
            <input
              type="number"
              name="manualPaddingY"
              min="0" max="100"
              step="1"
              value="${this.convertPixelsToRem(this.config.manualPaddingY)}"
              aria-label="Vertical padding in rem"
            />
          </label>
          <label class="padding-input">
            <span class="number-input-label">H</span>
            <input
              type="number"
              name="manualPaddingX"
              min="0" max="100"
              step="1"
              value="${this.convertPixelsToRem(this.config.manualPaddingX)}"
              aria-label="Horizontal padding in rem"
            />
          </label>
        </div>
      </div>
      
      <div class="control-group">
        <label class="control-label">Uneven Slice Handling</label>
        <p class="control-hint">What to do if the last slide doesn't fit perfectly</p>
        <div class="radio-group" role="radiogroup" aria-label="Uneven handling">
          <label class="radio-option">
            <input 
              type="radio" 
              name="unevenHandling" 
              value="pad" 
              ${this.config.unevenHandling === "pad" ? "checked" : ""}
            />
            <span class="radio-label">
              <span>Add padding</span>
            </span>
          </label>
          <label class="radio-option">
            <input 
              type="radio" 
              name="unevenHandling" 
              value="crop" 
              ${this.config.unevenHandling === "crop" ? "checked" : ""}
            />
            <span class="radio-label">
              <span>Crop to fit</span>
            </span>
          </label>
        </div>
      </div>
      
      <div class="control-group color-picker-group">
        <label class="control-label">Padding Color</label>
        <div class="color-options">
          <button 
            type="button" 
            class="color-preset color-white ${this.config.paddingColor === "#ffffff" ? "selected" : ""}" 
            data-color="#ffffff"
            aria-label="White"
          ></button>
          <button 
            type="button" 
            class="color-preset color-black ${this.config.paddingColor === "#000000" ? "selected" : ""}" 
            data-color="#000000"
            aria-label="Black"
          ></button>
          <div class="color-custom">
            <input 
              type="color" 
              class="color-input" 
              value="${this.config.paddingColor}"
              aria-label="Custom color"
            />
            <span class="color-custom-label">Custom</span>
          </div>
        </div>
      </div>
    `;
        return el;
    }

    private bindEvents(): void {
        // Aspect ratio change
        this.element
            .querySelectorAll('input[name="aspectRatio"]')
            .forEach((input) => {
                input.addEventListener("change", (e) => {
                    this.config.aspectRatio = (e.target as HTMLInputElement)
                        .value as AspectRatio;
                    this.emitChange();
                });
            });

        // Uneven handling change
        this.element
            .querySelectorAll('input[name="unevenHandling"]')
            .forEach((input) => {
                input.addEventListener("change", (e) => {
                    this.config.unevenHandling = (e.target as HTMLInputElement)
                        .value as UnevenHandling;
                    this.updateColorPickerVisibility();
                    this.emitChange();
                });
            });

        // Color presets
        this.element.querySelectorAll(".color-preset").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const color = (e.currentTarget as HTMLElement).dataset.color;
                if (!color) return;
                this.setColor(color);
                this.emitChange();
            });
        });

        // Custom color picker
        const colorInput = this.element.querySelector(
            ".color-input",
        ) as HTMLInputElement;
        colorInput.addEventListener("input", (e) => {
            const color = (e.target as HTMLInputElement).value;
            this.setColor(color);
            this.emitChange();
        });

        // Manual padding inputs
        const paddingInputs = this.element.querySelectorAll(
            'input[name="manualPaddingX"], input[name="manualPaddingY"]',
        );
        paddingInputs.forEach((input) => {
            input.addEventListener("input", (e) => {
                const target = e.target as HTMLInputElement;
                const value = Math.max(
                    0,
                    Math.round(Number(target.value) || 0),
                );
                target.value = value.toString();
                if (target.name === "manualPaddingX") {
                    this.config.manualPaddingX = this.convertRemToPixels(value);
                } else if (target.name === "manualPaddingY") {
                    this.config.manualPaddingY = this.convertRemToPixels(value);
                }
                this.updateColorPickerVisibility();
                this.emitChange();
            });
        });
    }

    private convertRemToPixels(rem: number): number {
        return (
            rem *
            parseFloat(getComputedStyle(document.documentElement).fontSize)
        );
    }

    private convertPixelsToRem(pixels: number): number {
        return (
            pixels /
            parseFloat(getComputedStyle(document.documentElement).fontSize)
        );
    }

    private setColor(color: string): void {
        this.config.paddingColor = color;

        // Update UI
        this.element.querySelectorAll(".color-preset").forEach((btn) => {
            btn.classList.toggle(
                "selected",
                (btn as HTMLElement).dataset.color === color,
            );
        });

        const colorInput = this.element.querySelector(
            ".color-input",
        ) as HTMLInputElement;
        colorInput.value = color;
    }

    private updateColorPickerVisibility(): void {
        const colorGroup = this.element.querySelector(
            ".color-picker-group",
        ) as HTMLElement;
        const hasManualPadding =
            this.config.manualPaddingX > 0 || this.config.manualPaddingY > 0;
        colorGroup.style.display =
            this.config.unevenHandling === "pad" || hasManualPadding
                ? ""
                : "none";
    }

    private emitChange(): void {
        this.onChange({ ...this.config });
    }

    /**
     * Get current configuration
     */
    public getConfig(): SliceConfig {
        return { ...this.config };
    }

    /**
     * Update configuration externally
     */
    public setConfig(config: Partial<SliceConfig>): void {
        this.config = { ...this.config, ...config };
        // Re-render would be needed for full update, but for now just emit
        this.emitChange();
    }
}
