import { Hideable } from "./hideable";

/**
 * Slice preview component showing all generated slices
 */
export class SlicePreview extends Hideable {
    private previewContainer: HTMLElement;
    private slices: HTMLCanvasElement[] = [];
    private wrapperMap: Map<HTMLElement, HTMLCanvasElement> = new Map();
    private resizeObserver: ResizeObserver | null = null;
    private selectorClasses = {
        previewGrid: "preview-grid",
        slicePreviewClass: "slice-preview",
        previewHeader: "preview-header",
        previewTitle: "preview-title",
        previewInfo: "preview-info",
        previewItem: "preview-item",
        previewLabel: "preview-label",
    };

    constructor(container: HTMLElement) {
        super(container);
        this.element = this.render();
        this.previewContainer = this.element.querySelector(
            `.${this.selectorClasses.previewGrid}`,
        )!;
        container.appendChild(this.element);

        // Create a ResizeObserver to update thumbnails when their container size changes
        if (typeof ResizeObserver !== "undefined") {
            this.resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const wrapper = entry.target as HTMLElement;
                    const previewCanvas = wrapper.querySelector(
                        "canvas",
                    ) as HTMLCanvasElement | null;
                    const source = this.wrapperMap.get(wrapper);
                    if (previewCanvas && source) {
                        this.updatePreviewCanvas(
                            previewCanvas,
                            source,
                            wrapper,
                        );
                    }
                }
            });
        }
    }

    private render(): HTMLElement {
        const el = document.createElement("div");
        el.className = this.selectorClasses.slicePreviewClass;
        el.innerHTML = `
                <div class="${this.selectorClasses.previewHeader}">
                    <h2 class="${this.selectorClasses.previewTitle}">Preview</h2>
                    <p class="${this.selectorClasses.previewInfo}"></p>
                </div>
                <div class="${this.selectorClasses.previewGrid}"></div>
                `;
        return el;
    }

    /**
     * Update the preview with new slices
     */
    public updateSlices(slices: HTMLCanvasElement[]): void {
        // destroy previous slices properly for memory management
        this.clear();

        this.slices = slices;

        slices.forEach((canvas, index) => {
            const wrapper = document.createElement("div");
            wrapper.className = this.selectorClasses.previewItem;

            // Create a DPR-aware scaled preview canvas so CSS scaling stays crisp.
            // Compute a target display width (in CSS pixels) — keep it moderate to save memory.
            const previewCanvas = document.createElement("canvas");
            const displayMaxWidth = 200; // CSS pixels — preview thumb size

            // Determine scale to fit the slice into displayMaxWidth while preserving aspect ratio
            const aspect = canvas.width / canvas.height;
            const displayWidth = Math.min(displayMaxWidth, canvas.width);
            const displayHeight = Math.round(displayWidth / aspect);

            // Use devicePixelRatio to set backing store size for crisp rendering
            const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
            previewCanvas.width = Math.round(displayWidth * dpr);
            previewCanvas.height = Math.round(displayHeight * dpr);

            // CSS size (how it appears on the page)
            previewCanvas.style.width = `${displayWidth}px`;
            previewCanvas.style.height = `${displayHeight}px`;

            const ctx = previewCanvas.getContext("2d");
            if (ctx) {
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                ctx.imageSmoothingQuality = "high";
                ctx.drawImage(
                    canvas,
                    0,
                    0,
                    canvas.width,
                    canvas.height,
                    0,
                    0,
                    displayWidth,
                    displayHeight,
                );
            }

            // Create and append label
            const label = document.createElement("span");
            label.className = this.selectorClasses.previewLabel;
            label.textContent = `${index + 1}`;

            // Append wrapper first so it participates in layout and we can measure its CSS size
            wrapper.appendChild(previewCanvas);
            wrapper.appendChild(label);
            this.previewContainer.appendChild(wrapper);

            // Remember mapping wrapper -> source canvas for later updates
            this.wrapperMap.set(wrapper, canvas);

            // Observe size changes for this wrapper so we can re-render thumbnails responsively
            if (this.resizeObserver) {
                this.resizeObserver.observe(wrapper);
            }

            // Ensure final high-quality rendering after layout (use RAF to wait for layout)
            requestAnimationFrame(() =>
                this.updatePreviewCanvas(previewCanvas, canvas, wrapper),
            );
        });

        // Update info text
        const infoEl = this.element.querySelector(
            `.${this.selectorClasses.previewInfo}`,
        );
        if (infoEl) {
            infoEl.textContent = `${slices.length} slide${slices.length !== 1 ? "s" : ""} generated`;
        }

        this.element.classList.add("has-slices");
    }

    /**
     * Clear all previews
     */
    private clear(): void {
        this.slices.forEach((canvas) => {
            // Clean up canvas resources if needed
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            canvas.width = 0;
            canvas.height = 0;
            canvas.remove();
        });
        this.slices = [];
        // Clear preview container
        this.previewContainer.innerHTML = "";
        this.element.classList.remove("has-slices");

        const infoEl = this.element.querySelector(
            `.${this.selectorClasses.previewInfo}`,
        );
        if (infoEl) {
            infoEl.textContent = "";
        }

        // remove resize observers
        if (this.resizeObserver) {
            this.wrapperMap.forEach((_, wrapper) => {
                this.resizeObserver!.unobserve(wrapper);
            });
        }

        this.wrapperMap = new Map();
    }

    /**
     * Update a preview canvas to match wrapper CSS size using DPR-backed rendering.
     */
    private updatePreviewCanvas(
        previewCanvas: HTMLCanvasElement,
        sourceCanvas: HTMLCanvasElement,
        wrapper: HTMLElement,
    ) {
        const rect = wrapper.getBoundingClientRect();
        const cssWidth = Math.max(1, Math.round(rect.width));
        const aspect = sourceCanvas.width / sourceCanvas.height;
        const cssHeight = Math.round(cssWidth / aspect);

        const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

        // Set CSS size
        previewCanvas.style.width = `${cssWidth}px`;
        previewCanvas.style.height = `${cssHeight}px`;

        // Set backing store size
        previewCanvas.width = Math.round(cssWidth * dpr);
        previewCanvas.height = Math.round(cssHeight * dpr);

        const ctx = previewCanvas.getContext("2d");
        if (ctx) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.imageSmoothingQuality = "high";
            ctx.clearRect(0, 0, cssWidth, cssHeight);
            ctx.drawImage(
                sourceCanvas,
                0,
                0,
                sourceCanvas.width,
                sourceCanvas.height,
                0,
                0,
                cssWidth,
                cssHeight,
            );
        }
    }
}
