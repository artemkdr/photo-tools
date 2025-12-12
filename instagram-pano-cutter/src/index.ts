import { ControlPanel } from "./components/control-panel";
import { DownloadPanel } from "./components/download-panel";
import { ImageUploader } from "./components/image-uploader/image-uploader";
import { SlicePreview } from "./components/slice-preview";
import { ThemeToggle } from "./components/theme-toggle";
import type { ICanvasFactory, SliceConfig, SliceResult, Theme } from "./types";
import { CanvasFactory } from "./utils/canvas-factory";
import { generateBaseName } from "./utils/download";
import { sliceImage } from "./utils/slicer";
import { throttle } from "./utils/throttle";

/**
 * Main application class
 */
class App {
    private slicePreview!: SlicePreview;
    private downloadPanel!: DownloadPanel;
    private controlPanel!: ControlPanel;
    private uploader!: ImageUploader;
    private canvasFactory: ICanvasFactory;

    private currentImage: HTMLImageElement | null = null;
    private currentFile: File | null = null;
    private config: SliceConfig = {
        aspectRatio: "4:5",
        unevenHandling: "crop",
        paddingColor: "#ffffff",
        manualPaddingX: 0,
        manualPaddingY: 0,
    };

    constructor() {
        /**
         * Canvas factory instance.
         * Or use default one like:
         * this.canvasFactory = {
         *   getCanvas: (width, height) => {
         *     const canvas = document.createElement("canvas");
         *     canvas.width = width;
         *     canvas.height = height;
         *     return canvas;
         *   },
         *   clearCanvas: (canvas) => {
         *     const ctx = canvas.getContext("2d");
         *     if (ctx) {
         *       ctx.clearRect(0, 0, canvas.width, canvas.height);
         *     }
         *   },
         *   disposeCanvas: (canvas) => {
         *     // Optional cleanup logic here
         *   },
         * };
         */
        this.canvasFactory = new CanvasFactory();

        this.init();
    }

    private init(): void {
        // global error handler
        window.addEventListener("error", (event) => {
            this.handleError(event);
        });
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
        const uploaderContainer = this.getUploadContainer();
        this.uploader = new ImageUploader(
            uploaderContainer,
            (image: HTMLImageElement, file: File) => {
                this.handleImageLoad(image, file);
            },
            (_) => {
                // console.error("Uploader error:", error);
            },
            this.canvasFactory,
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
        // hide control panel until an image is loaded
        this.controlPanel.hide();

        // Initialize preview
        const previewContainer = document.getElementById("preview-container");
        if (!previewContainer) {
            throw new Error("Preview container not found");
        }
        this.slicePreview = new SlicePreview(
            previewContainer,
            this.canvasFactory,
        );
        // hide preview until an image is loaded
        this.slicePreview.hide();

        // Initialize download panel
        const downloadContainer = document.getElementById(
            "download-panel-container",
        );
        if (!downloadContainer) {
            throw new Error("Download panel container not found");
        }
        this.downloadPanel = new DownloadPanel(downloadContainer);
        // hide download panel until an image is loaded
        this.downloadPanel.hide();
    }

    private getUploadContainer(): HTMLElement {
        const container = document.getElementById("uploader-container");
        if (!container) {
            throw new Error("Uploader container not found");
        }
        return container;
    }

    private handleImageLoad(image: HTMLImageElement, file: File): void {
        this.currentImage = image;
        this.currentFile = file;

        // validate image dimensions
        // minimum 500x500
        if (image.naturalWidth < 500 || image.naturalHeight < 500) {
            this.handleError({
                message:
                    "Image is too small. Please upload an image at least 500 pixels in width and height.",
            });
            return;
        }
        // maximum 10000x10000
        if (image.naturalWidth > 10000 || image.naturalHeight > 10000) {
            this.handleError({
                message:
                    "Image is too large. Please upload an image smaller than 10,000 pixels in width and height.",
            });
            return;
        }

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
        // minimize uploader
        this.uploader.minimize();

        // Show control panel
        this.controlPanel.show();

        // Show preview
        this.slicePreview.show();

        // Show download panel
        this.downloadPanel.show();
    }

    private readonly throttlerProcessImage = throttle(() => {
        this.processImage();
    }, 50);

    private handleConfigChange(config: SliceConfig): void {
        this.config = config;

        // Re-process if we have an image
        if (this.currentImage) {
            // process with debouncer
            // use closure for debouncer
            this.throttlerProcessImage();
        }
    }

    private handleThemeChange(_theme: Theme): void {
        // do nothing for the moment
    }

    private handleError(error: { message: string; hidden?: boolean }): void {
        console.error("Error:", error);
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

    private processImage(): SliceResult | undefined {
        if (!this.currentImage || !this.currentFile) return;

        // Slice the image
        const result = sliceImage(
            this.currentImage,
            this.config,
            this.canvasFactory,
        );

        // Update preview
        this.slicePreview.updateSlices(result.slices);

        // Update download panel
        const baseName = generateBaseName(this.currentFile.name);
        this.downloadPanel.setSlices(result.slices, baseName);

        // Update slice count in info
        const slicesEl = document.getElementById("info-slices");
        if (slicesEl) {
            slicesEl.textContent = result.sliceCount.toString();
        }

        return result;
    }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    new App();
});
