import { ControlPanel } from "./components/control-panel";
import { DownloadPanel } from "./components/download-panel";
import { ImageUploader } from "./components/image-uploader/image-uploader";
import { SlicePreview } from "./components/slice-preview";
import { ThemeToggle } from "./components/theme-toggle";
import type { ICanvasFactory, SliceConfig, SliceResult, Theme } from "./types";
import { CanvasFactory } from "./utils/canvas-factory";
import { debounce } from "./utils/debounce";
import { generateBaseName } from "./utils/download";

/**
 * Main application class
 */
class App {
    private slicePreview!: SlicePreview;
    private downloadPanel!: DownloadPanel;
    private controlPanel!: ControlPanel;
    private uploader!: ImageUploader;
    private canvasFactory: ICanvasFactory;

    private sliceWorker: Worker | null = null;
    private sliceWorkerResult: SliceResult | null = null;
    private isSliceWorkerBusy: boolean = false;

    private currentImageBitmap: ImageBitmap | null = null;
    private currentFileName: string | null = null;
    private config: SliceConfig = {
        aspectRatio: "4:5",
        unevenHandling: "crop",
        paddingColor: "#ffffff",
        manualPaddingX: 0,
        manualPaddingY: 0,
    };

    // performance category
    private performanceCategory: "fast" | "slow" = "fast";

    // Debounced image processing to avoid excessive calls
    private debounceProcessImage: (() => void) | null = null;

    constructor() {
        // global error handler
        window.addEventListener("error", (event) => {
            this.handleError(event);
        });

        // test performance
        // warm up
        this.getDevicePerformance(10);
        // actual test
        this.performanceCategory = this.getDevicePerformance(100);

        /**
         * Canvas factory instance.
         */
        this.canvasFactory = new CanvasFactory();

        this.init();
    }

    private init(): void {
        // Initialize theme toggle
        const themeContainer = document.getElementById(
            "theme-toggle-container",
        );
        if (!themeContainer) {
            throw new Error("Theme toggle container not found");
        }
        new ThemeToggle(themeContainer, (theme: Theme) => {
            this.handleThemeChange(theme);
        });

        // Initialize uploader
        const uploaderContainer = document.getElementById("uploader-container");
        if (!uploaderContainer) {
            throw new Error("Uploader container not found");
        }
        this.uploader = new ImageUploader(
            uploaderContainer,
            {
                quality: 0.95,
                format: "image/webp",
                maxWidth: 5000,
                maxHeight: 5000,
            },
            {
                onStart: () => {
                    // reset current image and file
                    this.currentImageBitmap = null;
                    this.currentFileName = null;
                    this.updateUI();
                },
                onImageLoad: (imageBitmap: ImageBitmap, fileName: string) => {
                    this.handleImageLoad(imageBitmap, fileName);
                },
                onError: (_) => {
                    // console.error("Uploader error:", error);
                },
            },
        );

        // Initialize control panel
        const controlContainer = document.getElementById(
            "control-panel-container",
        );
        if (!controlContainer) {
            throw new Error("Control panel container not found");
        }
        this.controlPanel = new ControlPanel(
            controlContainer,
            this.config,
            (config: SliceConfig) => {
                this.handleConfigChange(config);
            },
        );

        // Initialize preview
        const previewContainer = document.getElementById("preview-container");
        if (!previewContainer) {
            throw new Error("Preview container not found");
        }
        this.slicePreview = new SlicePreview(
            previewContainer,
            this.canvasFactory,
        );

        // Initialize download panel
        const downloadContainer = document.getElementById(
            "download-panel-container",
        );
        if (!downloadContainer) {
            throw new Error("Download panel container not found");
        }
        this.downloadPanel = new DownloadPanel(downloadContainer);

        // Initial UI update
        this.updateUI();
    }

    private initializeSliceWorker(): void {
        if (this.sliceWorker) return;
        this.sliceWorker = new Worker(
            new URL("./utils/slicer/worker.ts", import.meta.url),
            { type: "module" },
        );
        // Initialize slice worker message handler
        this.sliceWorker.onmessage = (event: MessageEvent) => {
            this.setIsSliceWorkerBusy(false);
            // dispose last result slices to free memory
            this.sliceWorkerResult?.slices.forEach((slice) => {
                slice.close();
            });
            const { success, type, result } = event.data;
            this.sliceWorkerResult = result;
            if (type === "slice" && success === true && result) {
                // check if this result matches the current processing id
                if (event.data.id !== this.currentProcessingId) {
                    // outdated result, ignore
                    return;
                }
                this.processImageResult(result);
            } else if (type === "slice" && success === false) {
                this.handleError({
                    message: event.data.error || "Unknown slicing error",
                });
            }
        };
        this.sliceWorker.onerror = (e) => {
            this.setIsSliceWorkerBusy(false);
            this.handleError({ message: `Slicing failed: ${e.message}` });
        };
    }

    private terminateSliceWorkerImmediately(): void {
        if (this.sliceWorker) {
            this.sliceWorker.terminate();
            this.sliceWorkerResult?.slices.forEach((slice) => {
                slice.close();
            });
            // unsubscribe message handler
            this.sliceWorker.onerror = null;
            this.sliceWorker.onmessage = null;
            this.sliceWorker.onmessageerror = null;
            this.sliceWorker = null;
        }
        this.setIsSliceWorkerBusy(false);
    }

    private setIsSliceWorkerBusy(isBusy: boolean): void {
        this.isSliceWorkerBusy = isBusy;
        // update UI loading state
        this.slicePreview.setIsProcessing(isBusy);
    }

    private handleImageLoad(imageBitmap: ImageBitmap, fileName: string): void {
        if (this.currentImageBitmap) {
            // Dispose previous image bitmap to free memory
            this.currentImageBitmap.close();
        }
        this.currentImageBitmap = imageBitmap;
        this.currentFileName = fileName;

        // validate image dimensions
        // minimum 500x500
        if (imageBitmap.width < 500 || imageBitmap.height < 500) {
            this.handleError({
                message:
                    "Image is too small. Please upload an image at least 500 pixels in width and height.",
            });
            return;
        }
        // maximum 10000x10000
        if (imageBitmap.width > 10000 || imageBitmap.height > 10000) {
            this.handleError({
                message:
                    "Image is too large. Please upload an image smaller than 10,000 pixels in width and height.",
            });
            return;
        }

        const pixelsCount = imageBitmap.width * imageBitmap.height;

        // initialize process image debounce with a delay adapted to the image size
        const baseDelay = this.performanceCategory === "fast" ? 50 : 300;
        this.debounceProcessImage = debounce(
            () => {
                this.processImage();
            },
            baseDelay +
                (pixelsCount > 5000 * 5000
                    ? 50
                    : pixelsCount > 2000 * 2000
                      ? 30
                      : 10),
        );

        // Process and update info display
        this.processImage();

        // update UI visibility
        this.updateUI();

        // Fallback for browsers that don't support :has(): toggle a class on root
        // so CSS can target `.app-container.has-image` as a substitute for :has().
        // We keep this minimal and non-invasive.
        const root = document.querySelector<HTMLElement>(".app-container");
        if (root && !CSS.supports("selector(:has(*))")) {
            root.classList.add("has-image");
        }
    }

    private updateUI(): void {
        if (!this.currentImageBitmap) {
            // hide all panels
            this.controlPanel.hide();
            this.slicePreview.hide();
            this.downloadPanel.hide();
            return;
        } else {
            // minimize uploader
            this.uploader.minimize();

            // Show control panel
            this.controlPanel.show();

            // Show preview
            this.slicePreview.show();

            // Show download panel
            this.downloadPanel.show();
        }
    }

    private handleConfigChange(config: SliceConfig): void {
        // check if config actually changed
        // compaing JSON strings for simplicity (it's not 100% reliable but good enough here)
        if (JSON.stringify(config) === JSON.stringify(this.config)) {
            return;
        }
        this.config = config;
        this.debounceProcessImage?.();
    }

    /**
     * Estimates CPU performance by counting operations in a fixed time window.
     * @param {number} duration - How long to run the test in milliseconds (default 50ms).
     * @returns category - 'fast' | 'slow'.
     */
    private getDevicePerformance(duration = 50) {
        const start = performance.now();
        let operations = 0;

        // We use a tight loop to block the main thread intentionally
        while (performance.now() - start < duration) {
            // Perform some heavy lifting
            Math.sqrt(Math.random() * 10000);
            operations++;
        }

        // Calculate score: Operations per millisecond
        const score = Math.floor(operations / duration);
        // Determine performance category based on score
        return score > 2000 ? "fast" : "slow";
    }

    private handleThemeChange(_theme: Theme): void {
        // do nothing for the moment
    }

    private handleError(error: { message: string; hidden?: boolean }): void {
        const message =
            error.message || String(error) || "An unknown error occurred";
        if (
            error instanceof Error &&
            "hidden" in error &&
            error.hidden === true
        ) {
            return;
        }
        this.showErrorMessage(message);
    }

    private showErrorMessage(message: string): void {
        // show alert for now
        alert(`Error: ${message}`);
    }

    private currentProcessingId: string | null = null;

    private processImage(): void {
        if (!this.currentImageBitmap) return;

        // generate a unique id for this processing task
        this.currentProcessingId =
            Date.now().toString(36) + Math.random().toString(36).substring(2);

        // slice image using worker
        if (this.isSliceWorkerBusy) {
            this.terminateSliceWorkerImmediately();
        }
        this.initializeSliceWorker();
        if (this.sliceWorker) {
            this.setIsSliceWorkerBusy(true);
            // Post message in a setTimeout to avoid blocking UI update
            // because requestIdleCallback is not supported in Safari and Safari iOS
            setTimeout(() => {
                this.sliceWorker?.postMessage({
                    type: "slice",
                    id: this.currentProcessingId,
                    imageBitmap: this.currentImageBitmap,
                    config: this.config,
                });
            }, 1);
        }
    }

    private processImageResult(result: SliceResult): void {
        // Update preview
        this.slicePreview.updateSlices(result.slices);

        // Update download panel
        const baseName = `${generateBaseName(
            `${this.currentFileName}`,
        )}-${Date.now()}`;
        this.downloadPanel.setSlices(result.slices, baseName);

        // Update slice count in info
        const slicesEl = document.getElementById("info-slices");
        if (slicesEl) {
            slicesEl.textContent = result.sliceCount.toString();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    new App();
});
