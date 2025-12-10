import type { SliceConfig, SliceResult, Theme } from "./types";
import { sliceImage } from "./utils/slicer";
import { generateBaseName } from "./utils/download";
import { ImageUploader } from "./components/image-uploader";
import { ControlPanel } from "./components/control-panel";
import { SlicePreview } from "./components/slice-preview";
import { DownloadPanel } from "./components/download-panel";
import { ThemeToggle } from "./components/theme-toggle";

/**
 * Main application class
 */
class App {
    private slicePreview!: SlicePreview;
    private downloadPanel!: DownloadPanel;

    private currentImage: HTMLImageElement | null = null;
    private currentFile: File | null = null;
    private config: SliceConfig = {
        aspectRatio: "1:1",
        unevenHandling: "pad",
        paddingColor: "#ffffff",
        manualPaddingX: 0,
        manualPaddingY: 0,
    };

    constructor() {
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
        new ThemeToggle(themeContainer, this.handleThemeChange.bind(this));

        // Initialize uploader
        const uploaderContainer = this.getUploadContainer();
        new ImageUploader(
            uploaderContainer,
            this.handleImageLoad.bind(this),
            this.handleError.bind(this),
        );

        // Initialize control panel
        const controlContainer = document.getElementById(
            "control-panel-container",
        );
        if (!controlContainer) {
            throw new Error("Control panel container not found");
        }
        new ControlPanel(
            controlContainer,
            this.config,
            this.handleConfigChange.bind(this),
        );

        // Initialize preview
        const previewContainer = document.getElementById("preview-container");
        if (!previewContainer) {
            throw new Error("Preview container not found");
        }
        this.slicePreview = new SlicePreview(previewContainer);

        // Initialize download panel
        const downloadContainer = document.getElementById(
            "download-panel-container",
        );
        if (!downloadContainer) {
            throw new Error("Download panel container not found");
        }
        this.downloadPanel = new DownloadPanel(downloadContainer);
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

        // Process and update info display
        this.processImage();
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
        console.log("Theme changed to:", theme);
    }

    private handleError(message: string): void {
        console.error("Error:", message);
    }

    private processImage(): SliceResult | undefined {
        if (!this.currentImage || !this.currentFile) return;

        // Slice the image
        const result = sliceImage(this.currentImage, this.config);

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
