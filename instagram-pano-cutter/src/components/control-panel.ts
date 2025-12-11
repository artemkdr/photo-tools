import type { AspectRatio, UnevenHandling, SliceConfig } from "../types";
import { Hideable } from "./hideable";

export type ConfigChangeCallback = (config: SliceConfig) => void;

/**
 * Control panel component for configuring slice settings
 */
export class ControlPanel extends Hideable {
    private config: SliceConfig;
    private onChange: ConfigChangeCallback;
    private selectorClasses = {
        controlPanel: "control-panel",
        controlGroup: "control-group",
        controlLabel: "control-label",
        controlHint: "control-hint",
        radioGroup: "radio-group",
        radioOption: "radio-option",
        radioLabel: "radio-label",
        ratioIcon: "ratio-icon",
        ratioPortrait: "ratio-portrait",
        ratioSquare: "ratio-square",
        paddingInputs: "padding-inputs",
        paddingInput: "padding-input",
        numberInputLabel: "number-input-label",
        colorPickerGroup: "color-picker-group",
        colorOptions: "color-options",
        colorPreset: "color-preset",
        colorWhite: "color-white",
        colorBlack: "color-black",
        colorCustom: "color-custom",
        colorInput: "color-input",
        colorCustomLabel: "color-custom-label",
    };

    constructor(
        container: HTMLElement,
        initialConfig: SliceConfig,
        onChange: ConfigChangeCallback,
    ) {
        super(container);
        this.config = { ...initialConfig };
        this.onChange = onChange;
        this.element = this.render();
        container.appendChild(this.element);
        this.bindEvents();
        this.updateColorPickerVisibility();
    }

    private render(): HTMLElement {
        const el = document.createElement("div");
        el.className = this.selectorClasses.controlPanel;
        el.innerHTML = `
      <div class="${this.selectorClasses.controlGroup}">
        <label class="${this.selectorClasses.controlLabel}" for="aspectRatio">Slide Format</label>
        <div class="${this.selectorClasses.radioGroup}" role="radiogroup" aria-label="Aspect ratio">
          <label class="${this.selectorClasses.radioOption}">
            <input 
              type="radio" 
              name="aspectRatio" 
              value="4:5" 
              ${this.config.aspectRatio === "4:5" ? "checked" : ""}
            />
            <span class="${this.selectorClasses.radioLabel}">
              <span class="${this.selectorClasses.ratioIcon} ${this.selectorClasses.ratioPortrait}"></span>
              <span>Portrait (4:5)</span>
            </span>
          </label>
          <label class="${this.selectorClasses.radioOption}">
            <input 
              type="radio" 
              name="aspectRatio" 
              value="1:1" 
              ${this.config.aspectRatio === "1:1" ? "checked" : ""}
            />
            <span class="${this.selectorClasses.radioLabel}">
              <span class="${this.selectorClasses.ratioIcon} ${this.selectorClasses.ratioSquare}"></span>
              <span>Square (1:1)</span>
            </span>
          </label>
        </div>
      </div>
      
      <div class="${this.selectorClasses.controlGroup}">
        <label class="${this.selectorClasses.controlLabel}" for="unevenHandling">Uneven Slice Handling</label>
        <p class="${this.selectorClasses.controlHint}">What to do if the image doesn't fit perfectly into slides</p>
        <div class="${this.selectorClasses.radioGroup}" role="radiogroup" aria-label="Uneven handling">
          <label class="${this.selectorClasses.radioOption}">
            <input 
              type="radio" 
              name="unevenHandling" 
              value="crop" 
              ${this.config.unevenHandling === "crop" ? "checked" : ""}
            />
            <span class="${this.selectorClasses.radioLabel}">
              <span>Crop to fit</span>
            </span>
          </label>
          <label class="${this.selectorClasses.radioOption}">
            <input 
              type="radio" 
              name="unevenHandling" 
              value="pad" 
              ${this.config.unevenHandling === "pad" ? "checked" : ""}
            />
            <span class="${this.selectorClasses.radioLabel}">
              <span>Add left/right padding</span>
            </span>
          </label>          
        </div>
      </div>

      <div class="${this.selectorClasses.controlGroup}">
        <label class="${this.selectorClasses.controlLabel}" for="manualPaddingX">Manual Padding</label>
        <div class="${this.selectorClasses.paddingInputs}">
          <label class="${this.selectorClasses.paddingInput}">
            <span class="${this.selectorClasses.numberInputLabel}">Top/Bottom</span>
            <input
              type="range"
              name="manualPaddingY"
              min="0" max="120"
              step="1"
              value="${this.convertPixelsToRem(this.config.manualPaddingY)}"
              aria-label="Vertical padding in rem"
            />
          </label>
          <label class="${this.selectorClasses.paddingInput}">
            <span class="${this.selectorClasses.numberInputLabel}">Left/Right</span>
            <input
              type="range"
              name="manualPaddingX"
              min="0" max="120"
              step="1"
              value="${this.convertPixelsToRem(this.config.manualPaddingX)}"
              aria-label="Horizontal padding in rem"
            />
          </label>
        </div>
      </div>
      
      <div class="${this.selectorClasses.controlGroup} ${this.selectorClasses.colorPickerGroup}">
        <label class="${this.selectorClasses.controlLabel}" for="paddingColor">Padding Color</label>
        <div class="${this.selectorClasses.colorOptions}">
          <button 
            type="button" 
            class="${this.selectorClasses.colorPreset} ${this.selectorClasses.colorWhite} ${this.config.paddingColor === "#ffffff" ? "selected" : ""}" 
            data-color="#ffffff"
            aria-label="White"
          ></button>
          <button 
            type="button" 
            class="${this.selectorClasses.colorPreset} ${this.selectorClasses.colorBlack} ${this.config.paddingColor === "#000000" ? "selected" : ""}" 
            data-color="#000000"
            aria-label="Black"
          ></button>
          <div class="${this.selectorClasses.colorCustom}">
            <input 
              type="color" 
              class="${this.selectorClasses.colorInput}" 
              name="paddingColor"
              value="${this.config.paddingColor}"
              aria-label="Custom color"
            />
            <span class="${this.selectorClasses.colorCustomLabel}">Custom</span>
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
        this.element
            .querySelectorAll(`.${this.selectorClasses.colorPreset}`)
            .forEach((btn) => {
                btn.addEventListener("click", (e) => {
                    const color = (e.currentTarget as HTMLElement).dataset
                        .color;
                    if (!color) return;
                    this.setColor(color);
                    this.emitChange();
                });
            });

        // Custom color picker
        const colorInput = this.element.querySelector(
            `.${this.selectorClasses.colorInput}`,
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
        this.element
            .querySelectorAll(`.${this.selectorClasses.colorPreset}`)
            .forEach((btn) => {
                btn.classList.toggle(
                    "selected",
                    (btn as HTMLElement).dataset.color === color,
                );
            });

        const colorInput = this.element.querySelector(
            `.${this.selectorClasses.colorInput}`,
        ) as HTMLInputElement;
        colorInput.value = color;
    }

    private updateColorPickerVisibility(): void {
        const colorGroup = this.element.querySelector(
            `.${this.selectorClasses.colorPickerGroup}`,
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
}
