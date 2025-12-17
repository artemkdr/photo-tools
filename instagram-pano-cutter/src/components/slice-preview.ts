import type { ICanvasFactory } from "../types";
import { Hideable } from "./hideable";
import { Processable } from "./processable";

/**
 * Slice preview component showing all generated slices
 */
export class SlicePreview extends Hideable {
    private previewContainer: HTMLElement;
    private wrapperMap: Map<
        HTMLElement,
        {
            canvas: HTMLCanvasElement;
            requestedAnimationFrameId?: number;
        }
    > = new Map();
    private selectorClasses = {
        previewGrid: "preview-grid",
        slicePreviewClass: "slice-preview",
        previewHeader: "preview-header",
        previewTitle: "preview-title",
        previewInfo: "preview-info",
        previewItem: "preview-item",
        previewLabel: "preview-label",
        previewDots: "preview-dots",
        previewDot: "preview-dot",
        previewDotActive: "preview-dot--active",
    };
    private canvasFactory: ICanvasFactory;
    private processable: Processable;
    private dotContainer?: HTMLElement;
    private dotMap: Map<HTMLElement, HTMLElement> = new Map();
    private intersectionObserver?: IntersectionObserver;
    private initRequestedAnimationFrameId?: number;

    constructor(container: HTMLElement, canvasFactory: ICanvasFactory) {
        super(container);
        this.canvasFactory = canvasFactory;
        this.element = this.render();
        // instantiate Processable behavior using composition
        this.processable = new Processable(this.element);
        this.previewContainer = this.element.querySelector(
            `.${this.selectorClasses.previewGrid}`,
        )!;
        container.appendChild(this.element);
    }

    // Delegate processing API to the composed Processable to preserve previous surface
    public setIsProcessing(isProcessing: boolean): void {
        this.processable.setIsProcessing(isProcessing);
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
                <div class="${this.selectorClasses.previewDots}" role="tablist" aria-label="Slides"></div>
                `;
        return el;
    }

    /**
     * Update the preview with new slices
     */
    public updateSlices(slices: ImageBitmap[]): void {
        const tempContainer = document.createDocumentFragment();
        const wrappers: {
            imageBitmap: ImageBitmap;
            previewCanvas: HTMLCanvasElement;
            wrapper: HTMLElement;
        }[] = [];
        slices.forEach((imageBitmap, index) => {
            const wrapper = document.createElement("div");
            wrapper.className = this.selectorClasses.previewItem;

            // create preview canvas placeholder
            const previewCanvas = this.canvasFactory.getCanvas(
                1,
                1,
                `slice-preview-thumb-${index}`,
            );

            // Append wrapper first so it participates in layout and we can measure its CSS size
            wrapper.appendChild(previewCanvas);
            tempContainer.appendChild(wrapper);

            wrappers.push({ imageBitmap, previewCanvas, wrapper });
        });

        // destroy previous slices properly for memory management
        this.clear();

        // Append all new wrappers to preview container
        this.previewContainer.replaceChildren(tempContainer);
        tempContainer.replaceChildren();

        // Ensure final high-quality rendering after layout (use RAF to wait for layout)
        for (let i = 0; i < wrappers.length; i++) {
            const { imageBitmap, previewCanvas, wrapper } = wrappers[i];
            const refId = requestAnimationFrame(() => {
                this.updatePreviewCanvas(previewCanvas, imageBitmap, wrapper);
            });

            // Remember mapping wrapper -> source canvas for later updates
            this.wrapperMap.set(wrapper, {
                canvas: previewCanvas,
                requestedAnimationFrameId: refId,
            });

            // Create dot for this slide and keep it in map (append later after cap)
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = this.selectorClasses.previewDot;
            dot.setAttribute("role", "tab");
            dot.setAttribute("aria-selected", "false");
            dot.setAttribute(
                "aria-label",
                `Slide ${i + 1} of ${slices.length}`,
            );
            this.dotMap.set(wrapper, dot);
        }

        // Render dots: cap to 20
        const maxDots = 20;
        const dotsToShow = Math.min(slices.length, maxDots);
        this.dotContainer = this.element.querySelector(
            `.${this.selectorClasses.previewDots}`,
        ) as HTMLElement;
        if (this.dotContainer) {
            this.dotContainer.innerHTML = "";
            let i = 0;
            for (const [wrapper, dot] of this.dotMap) {
                if (i >= dotsToShow) break;
                // update aria label reflecting total count
                dot.setAttribute(
                    "aria-label",
                    `Slide ${i + 1} of ${slices.length}`,
                );
                dot.addEventListener("click", () => {
                    wrapper.scrollIntoView({
                        behavior: "smooth",
                        inline: "start",
                    });
                });
                this.dotContainer.appendChild(dot);
                i++;
            }
        }

        // Update info text
        const infoEl = this.element.querySelector(
            `.${this.selectorClasses.previewInfo}`,
        );
        if (infoEl) {
            infoEl.textContent = `${slices.length} slide${slices.length !== 1 ? "s" : ""} generated`;
        }

        this.element.classList.add("has-slices");

        // reset preview grid scroll position
        this.previewContainer.scrollLeft = 0;
        this.previewContainer.scrollTop = 0;

        // Setup intersection observer to highlight active dot and hide dots when all visible
        this.initRequestedAnimationFrameId = requestAnimationFrame(() => {
            this.setupIntersectionObserver();
        });
    }

    /**
     * Clear all previews
     */
    private clear(): void {
        // clear init RAF
        if (this.initRequestedAnimationFrameId !== undefined) {
            cancelAnimationFrame(this.initRequestedAnimationFrameId);
            this.initRequestedAnimationFrameId = undefined;
        }
        // clear wrappers
        this.wrapperMap.forEach((value, wrapper) => {
            wrapper.innerHTML = "";
            wrapper.remove();
            // cancel any pending animation frames
            const rafId = value.requestedAnimationFrameId;
            if (rafId !== undefined) {
                cancelAnimationFrame(rafId);
            }
        });
        this.wrapperMap.clear();

        // Clear preview container
        this.previewContainer.innerHTML = "";
        this.element.classList.remove("has-slices");

        // clear dots
        if (this.dotContainer) {
            this.dotContainer.innerHTML = "";
        }
        this.dotMap.forEach((dot) => {
            // remove any listeners by cloning
            const newDot = dot.cloneNode(true) as HTMLElement;
            dot.replaceWith(newDot);
        });
        this.dotMap.clear();

        // disconnect observer
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
            this.intersectionObserver = undefined;
        }

        const infoEl = this.element.querySelector(
            `.${this.selectorClasses.previewInfo}`,
        );
        if (infoEl) {
            infoEl.textContent = "";
        }
    }

    private setupIntersectionObserver(): void {
        // teardown any existing observer
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }

        // if no dot container or no items, nothing to observe
        if (!this.dotContainer) return;

        // Hide dots when all items fit inside container (no overflow)
        const shouldHideDots =
            this.previewContainer.scrollWidth /
                this.previewContainer.clientWidth <=
            1.5;
        if (shouldHideDots) {
            this.dotContainer.style.display = "none";
            return;
        } else {
            this.dotContainer.style.display = "flex";
        }

        const options: IntersectionObserverInit = {
            root: this.previewContainer,
            rootMargin: "0px",
            threshold: [0.5], // consider active when >=50% visible
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            // For each entry, if it's at least half visible mark corresponding dot active
            entries.forEach((entry) => {
                const target = entry.target as HTMLElement;
                const dot = this.dotMap.get(target);
                if (!dot) return;
                if (entry.intersectionRatio >= 0.5) {
                    dot.classList.add(this.selectorClasses.previewDotActive);
                    dot.setAttribute("aria-selected", "true");
                } else {
                    dot.classList.remove(this.selectorClasses.previewDotActive);
                    dot.setAttribute("aria-selected", "false");
                }
            });
        }, options);

        // observe wrappers in the order they exist in wrapperMap
        for (const wrapper of this.wrapperMap.keys()) {
            try {
                this.intersectionObserver.observe(wrapper);
            } catch (_) {
                // ignore observation failures for detached nodes
            }
        }
    }

    /**
     * Update a preview canvas to match wrapper CSS size using DPR-backed rendering.
     */
    private updatePreviewCanvas(
        previewCanvas: HTMLCanvasElement,
        sourceImageBitmap: ImageBitmap,
        wrapper: HTMLElement,
    ) {
        // check if wrapper is still in DOM
        if (!document.body.contains(wrapper)) {
            return;
        }

        const rect = wrapper.getBoundingClientRect();
        const cssWidth = Math.max(1, Math.round(rect.width));
        const aspect = sourceImageBitmap.width / sourceImageBitmap.height;
        const cssHeight = Math.round(cssWidth / aspect);

        const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

        // Set CSS size
        previewCanvas.style.width = `${cssWidth}px`;
        previewCanvas.style.height = `${cssHeight}px`;

        // Set backing store size
        previewCanvas.width = Math.round(cssWidth * dpr);
        previewCanvas.height = Math.round(cssHeight * dpr);

        // check that canvas dimensions are valid
        if (
            sourceImageBitmap.width > 0 &&
            sourceImageBitmap.height > 0 &&
            cssWidth > 0 &&
            cssHeight > 0
        ) {
            const ctx = previewCanvas.getContext("2d");
            if (ctx) {
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                ctx.imageSmoothingQuality = "low";
                ctx.clearRect(0, 0, cssWidth, cssHeight);
                ctx.drawImage(
                    sourceImageBitmap,
                    0,
                    0,
                    sourceImageBitmap.width,
                    sourceImageBitmap.height,
                    0,
                    0,
                    cssWidth,
                    cssHeight,
                );
            }
        }
    }
}
