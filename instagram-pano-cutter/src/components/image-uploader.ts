import {
    isSupportedImageType,
    isSupportedExtension,
    SUPPORTED_EXTENSIONS,
} from "../types";

export type ImageLoadCallback = (image: HTMLImageElement, file: File) => void;
export type ErrorCallback = (message: string) => void;

/**
 * Image uploader component with drag-drop and file input support
 */
export class ImageUploader {
    private element: HTMLElement;
    private fileInput: HTMLInputElement;
    private onImageLoad: ImageLoadCallback;
    private onError: ErrorCallback;

    constructor(
        container: HTMLElement,
        onImageLoad: ImageLoadCallback,
        onError: ErrorCallback,
    ) {
        this.onImageLoad = onImageLoad;
        this.onError = onError;
        this.element = this.render();
        this.fileInput = this.element.querySelector('input[type="file"]')!;
        container.appendChild(this.element);
        this.bindEvents();
    }

    private render(): HTMLElement {
        const el = document.createElement("div");
        el.className = "image-uploader";
        el.innerHTML = `
      <div class="upload-zone" tabindex="0" role="button" aria-label="Upload image">
        <div class="upload-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <p class="upload-text">
          <strong>Drop your image here</strong>
          <span>or click to browse</span>
        </p>
        <p class="upload-formats">
          Supports: ${SUPPORTED_EXTENSIONS.join(", ")}
        </p>
        <input 
          type="file" 
          accept="${SUPPORTED_EXTENSIONS.map((ext) => ext).join(",")},image/jpeg,image/png,image/gif,image/webp,image/avif,image/bmp"
          class="file-input"
          aria-hidden="true"
        />
      </div>
      <div class="error-message" role="alert" aria-live="polite"></div>
    `;
        return el;
    }

    private bindEvents(): void {
        const uploadZone = this.element.querySelector(".upload-zone");

        if (!uploadZone) {
            throw new Error("Upload zone not found");
        }

        // Click to upload
        uploadZone.addEventListener("click", () => {
            this.fileInput.click();
        });

        // Keyboard support
        uploadZone.addEventListener("keydown", (e: Event) => {
            const keyEvent = e as KeyboardEvent;
            if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                e.preventDefault();
                this.fileInput.click();
            }
        });

        // File input change
        this.fileInput.addEventListener("change", () => {
            const file = this.fileInput.files?.[0];
            if (file) {
                this.handleFile(file);
            }
        });

        // Drag and drop
        uploadZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadZone.classList.add("drag-over");
        });

        uploadZone.addEventListener("dragleave", (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadZone.classList.remove("drag-over");
        });

        uploadZone.addEventListener("drop", (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadZone.classList.remove("drag-over");

            const file = (e as DragEvent).dataTransfer?.files[0];
            if (file) {
                this.handleFile(file);
            }
        });
    }

    private async handleFile(file: File): Promise<void> {
        this.clearError();

        // Validate file type
        if (
            !isSupportedImageType(file.type) &&
            !isSupportedExtension(file.name)
        ) {
            const ext = file.name
                .slice(file.name.lastIndexOf("."))
                .toLowerCase();
            this.showError(
                `Unsupported format "${ext}". Please use: ${SUPPORTED_EXTENSIONS.join(", ")}`,
            );
            return;
        }

        try {
            const img = await this.loadImage(file);
            this.onImageLoad(img, file);
        } catch {
            this.showError("Failed to load image. The file may be corrupted.");
        }
    }

    private loadImage(file: File): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error("Failed to load image"));
            };

            img.src = url;
        });
    }

    private showError(message: string): void {
        const errorEl = this.element.querySelector(".error-message");
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add("visible");
        }
        this.onError(message);
    }

    private clearError(): void {
        const errorEl = this.element.querySelector(".error-message")!;
        errorEl.textContent = "";
        errorEl.classList.remove("visible");
    }

    /**
     * Reset the uploader to initial state
     */
    public reset(): void {
        this.fileInput.value = "";
        this.clearError();
    }

    /**
     * Show/hide the uploader
     */
    public setVisible(visible: boolean): void {
        this.element.style.display = visible ? "" : "none";
    }
}
