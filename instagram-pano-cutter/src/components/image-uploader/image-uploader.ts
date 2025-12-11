import {
    isHeicMimeType,
    isSupportedExtension,
    isSupportedImageType,
    isTiffMimeType,
    SUPPORTED_EXTENSIONS,
} from "../../types";
import { Hideable } from "../hideable";
import { convertHeicToBlob } from "./converters/heic";
import { convertTiffToBlob } from "./converters/tiff";

export type ImageLoadCallback = (image: HTMLImageElement, file: File) => void;
export type ErrorCallback = (message: string) => void;

/**
 * Image uploader component with drag-drop and file input support
 */
export class ImageUploader extends Hideable {
    private fileInput: HTMLInputElement;
    private onImageLoad: ImageLoadCallback;
    private onError?: ErrorCallback;
    private selectorClasses = {
        uploadZone: "upload-zone",
        uploadIcon: "upload-icon",
        uploadText: "upload-text",
        fileInput: "file-input",
        errorMessage: "error-message",
        imageUploader: "image-uploader",
        minimized: "minimized",
        visible: "visible",
        loading: "loading",
        uploaderSpinner: "uploader-spinner",
    };
    private isLoading = false;

    constructor(
        container: HTMLElement,
        onImageLoad: ImageLoadCallback,
        onError?: ErrorCallback,
    ) {
        super(container);
        this.onImageLoad = onImageLoad;
        this.onError = onError;
        this.element = this.render();
        this.fileInput = this.element.querySelector('input[type="file"]')!;
        container.appendChild(this.element);
        this.bindEvents();
    }

    private render(): HTMLElement {
        const el = document.createElement("div");
        el.className = this.selectorClasses.imageUploader;
        el.innerHTML = `
          <div class="${this.selectorClasses.uploadZone}" tabindex="0" role="button" aria-label="Upload image">
        <div class="${this.selectorClasses.uploadIcon}">
          <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24px" width="24px" xmlns="http://www.w3.org/2000/svg"><path d="M21 15V18H24V20H21V23H19V20H16V18H19V15H21ZM21.0082 3C21.556 3 22 3.44495 22 3.9934L22.0007 13.3417C21.3749 13.1204 20.7015 13 20 13V5H4L4.001 19L13.2929 9.70715C13.6528 9.34604 14.22 9.31823 14.6123 9.62322L14.7065 9.70772L18.2521 13.2586C15.791 14.0069 14 16.2943 14 19C14 19.7015 14.1204 20.3749 14.3417 21.0007L2.9918 21C2.44405 21 2 20.5551 2 20.0066V3.9934C2 3.44476 2.45531 3 2.9918 3H21.0082ZM8 7C9.10457 7 10 7.89543 10 9C10 10.1046 9.10457 11 8 11C6.89543 11 6 10.1046 6 9C6 7.89543 6.89543 7 8 7Z"></path></svg>
        </div>
        <p class="${this.selectorClasses.uploadText}">
          <strong>Drop image here or click to select</strong>
          <span>Your photos stay private on your device</span>
        </p>
        <input 
          type="file" 
          accept="${SUPPORTED_EXTENSIONS.map((ext) => ext).join(",")},image/*"
          class="${this.selectorClasses.fileInput}"
          aria-hidden="true"
        />
        <div class="${this.selectorClasses.uploaderSpinner}" aria-hidden="true" style="display:none">
            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 256 256" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm87.82,98.46c-28.34,20-49.57,14.68-71.87,4.39,20.06-14.19,38.86-32.21,39.53-67.11A87.92,87.92,0,0,1,215.82,122.46ZM167.11,49.19C170.24,83.71,155,99.44,135,113.61c-2.25-24.48-8.44-49.8-38.37-67.82a87.89,87.89,0,0,1,70.5,3.4ZM79.32,54.73c31.45,14.55,37.47,35.58,39.71,60-22.33-10.29-47.35-17.59-77.93-.68A88.18,88.18,0,0,1,79.32,54.73ZM40.18,133.54c28.34-20,49.57-14.68,71.87-4.39C92,143.34,73.19,161.36,72.52,196.26A87.92,87.92,0,0,1,40.18,133.54Zm48.71,73.27C85.76,172.29,101,156.56,121,142.39c2.25,24.48,8.44,49.8,38.37,67.82a87.89,87.89,0,0,1-70.5-3.4Zm87.79-5.54c-31.45-14.55-37.47-35.58-39.71-60,12.72,5.86,26.31,10.75,41.3,10.75,11.33,0,23.46-2.8,36.63-10.08A88.2,88.2,0,0,1,176.68,201.27Z"></path></svg>
        </div>
        </div>
        <div class="${this.selectorClasses.errorMessage}" role="alert" aria-live="polite"></div>
        `;
        return el;
    }

    public maximize(): void {
        // remove minimized class from element
        this.element.classList.remove(this.selectorClasses.minimized);
    }

    public minimize(): void {
        // add minimized class to element
        this.element.classList.add(this.selectorClasses.minimized);
    }

    private bindEvents(): void {
        const uploadZone = this.element.querySelector(
            `.${this.selectorClasses.uploadZone}`,
        );
        if (!uploadZone) {
            throw new Error("Upload zone not found");
        }

        // Click to upload
        uploadZone.addEventListener("click", () => {
            if (this.isLoading) return;
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

            if (this.isLoading) return;

            const file = (e as DragEvent).dataTransfer?.files[0];
            if (file) {
                this.handleFile(file);
            }
        });
    }

    private async handleFile(file: File): Promise<void> {
        this.clearError();
        this.setLoading(true);

        // Validate file type
        // Allow some RAW/HEIC/TIFF extensions to pass here so we can attempt conversion
        const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
        const isHeic = isHeicMimeType(ext);
        const isTiff = isTiffMimeType(ext);
        if (
            !isHeic &&
            !isTiff &&
            !isSupportedImageType(file.type) &&
            !isSupportedExtension(file.name)
        ) {
            const ext = file.name
                .slice(file.name.lastIndexOf("."))
                .toLowerCase();
            this.showError(
                `Unsupported format "${ext}". Please use: ${SUPPORTED_EXTENSIONS.join(", ")}`,
            );
            this.setLoading(false);
            return;
        }

        try {
            let processedFile: File | Blob = file;

            if (isHeic) {
                processedFile = await convertHeicToBlob(file, (_) => {
                    this.showError(
                        "Failed to decode HEIC. Try converting the file to JPEG/PNG using your OS or an online tool.",
                    );
                });
            } else if (isTiff) {
                processedFile = await convertTiffToBlob(file, (_) => {
                    this.showError(
                        "Failed to decode TIFF. Try converting the file to JPEG/PNG using a tool.",
                    );
                });
            }
            const img = await this.loadImage(processedFile as File);
            this.onImageLoad(img, file);
        } catch {
            this.showError(
                "Failed to load image. The file may be corrupted or not supported.",
            );
        }
        this.setLoading(false);
    }

    private loadImage(file: File | Blob): Promise<HTMLImageElement> {
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
        const errorEl = this.element.querySelector(
            `.${this.selectorClasses.errorMessage}`,
        );
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add(this.selectorClasses.visible);
        }
        this.onError?.(message);
    }

    private setLoading(loading: boolean): void {
        this.isLoading = loading;
        const uploadZone = this.element.querySelector(
            `.${this.selectorClasses.uploadZone}`,
        ) as HTMLElement;
        const spinner = this.element.querySelector(
            `.${this.selectorClasses.uploaderSpinner}`,
        ) as HTMLElement;
        if (!uploadZone || !spinner) return;

        if (loading) {
            uploadZone.classList.add(this.selectorClasses.loading);
            spinner.style.display = "flex";
            this.fileInput.disabled = true;
        } else {
            uploadZone.classList.remove(this.selectorClasses.loading);
            spinner.style.display = "none";
            this.fileInput.disabled = false;
            // reset file input so same file can be selected again
            try {
                this.fileInput.value = "";
            } catch {}
        }
    }

    private clearError(): void {
        const errorEl = this.element.querySelector(
            `.${this.selectorClasses.errorMessage}`,
        )!;
        errorEl.textContent = "";
        errorEl.classList.remove(this.selectorClasses.visible);
    }
}
