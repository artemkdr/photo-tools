import { downloadSlice, downloadAllSlices } from "../utils/download";
import { Hideable } from "./hideable";

export type DownloadCallback = () => void;

/**
 * Download panel component with individual and batch download options
 */
export class DownloadPanel extends Hideable {
    private slices: HTMLCanvasElement[] = [];
    private baseName: string = "slide";
    private isDownloading: boolean = false;
    private selectorClasses = {
        downloadPanelClass: "download-panel",
        downloadActions: "download-actions",
        downloadAllBtn: "download-all-btn",
        downloadSingleBtn: "download-single-btn",
        btn: "btn",
        btnPrimary: "btn-primary",
        btnSecondary: "btn-secondary",
        downloadIndividual: "download-individual",
        downloadHint: "download-hint",
        downloadButtons: "download-buttons",
        downloadProgress: "download-progress",
        progressText: "progress-text",
        visible: "visible",
    };

    constructor(container: HTMLElement) {
        super(container);
        this.element = this.render();
        container.appendChild(this.element);
        this.bindEvents();
        this.updateState();
    }

    private render(): HTMLElement {
        const el = document.createElement("div");
        el.className = this.selectorClasses.downloadPanelClass;
        el.innerHTML = `      
      <div class="${this.selectorClasses.downloadActions}">
        <button type="button" class="${this.selectorClasses.btn} ${this.selectorClasses.btnPrimary} ${this.selectorClasses.downloadAllBtn}" disabled>
          <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="24px" width="24px" xmlns="http://www.w3.org/2000/svg"><path d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path></svg>
          <span>Download all slides</span>
        </button>
      </div>
      
      <div class="${this.selectorClasses.downloadIndividual}">
        <p class="${this.selectorClasses.downloadHint}">Or download individually:</p>
        <div class="${this.selectorClasses.downloadButtons}"></div>
      </div>
      
      <div class="${this.selectorClasses.downloadProgress}" aria-live="polite">
        <span class="${this.selectorClasses.progressText}"></span>
      </div>
    `;
        return el;
    }

    private bindEvents(): void {
        const downloadAllBtn = this.element.querySelector(
            `.${this.selectorClasses.downloadAllBtn}`,
        );
        if (downloadAllBtn) {
            downloadAllBtn.addEventListener("click", () =>
                this.handleDownloadAll(),
            );
        }
    }

    private async handleDownloadAll(): Promise<void> {
        if (this.isDownloading || this.slices.length === 0) return;

        this.isDownloading = true;
        this.updateState();
        this.showProgress("Downloading...");

        try {
            await downloadAllSlices(this.slices, this.baseName);
            this.showProgress("Download complete!");
            setTimeout(() => this.hideProgress(), 2000);
        } catch (error) {
            this.showProgress("Download failed. Please try again.");
            console.error("Download error:", error);
        } finally {
            this.isDownloading = false;
            this.updateState();
        }
    }

    private async handleDownloadSingle(index: number): Promise<void> {
        if (this.isDownloading) return;

        try {
            await downloadSlice(this.slices[index], index, this.baseName);
        } catch (error) {
            console.error("Download error:", error);
        }
    }

    private updateState(): void {
        const hasSlices = this.slices.length > 0;
        const downloadAllBtn = this.element.querySelector(
            `.${this.selectorClasses.downloadAllBtn}`,
        ) as HTMLButtonElement;
        const individualSection = this.element.querySelector(
            `.${this.selectorClasses.downloadIndividual}`,
        ) as HTMLElement;

        downloadAllBtn.disabled = !hasSlices || this.isDownloading;
        individualSection.style.display = hasSlices ? "" : "none";
    }

    private showProgress(text: string): void {
        const progressEl = this.element.querySelector(
            `.${this.selectorClasses.downloadProgress}`,
        );
        if (progressEl) {
            const textEl = progressEl.querySelector(
                `.${this.selectorClasses.progressText}`,
            );
            if (textEl) {
                textEl.textContent = text;
            }
            progressEl.classList.add(this.selectorClasses.visible);
        }
    }

    private hideProgress(): void {
        const progressEl = this.element.querySelector(
            `.${this.selectorClasses.downloadProgress}`,
        );
        if (progressEl) {
            progressEl.classList.remove(this.selectorClasses.visible);
        }
    }

    /**
     * Update the panel with new slices
     */
    public setSlices(slices: HTMLCanvasElement[], baseName: string): void {
        this.clear();

        this.slices = slices;
        this.baseName = baseName;

        // Rebuild individual download buttons
        const buttonsContainer = this.element.querySelector(
            `.${this.selectorClasses.downloadButtons}`,
        )!;
        buttonsContainer.innerHTML = "";

        slices.forEach((_, index) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = `${this.selectorClasses.btn} ${this.selectorClasses.btnSecondary} ${this.selectorClasses.downloadSingleBtn}`;
            btn.textContent = `Download slide ${index + 1}`;
            btn.addEventListener("click", () =>
                this.handleDownloadSingle(index),
            );
            buttonsContainer.appendChild(btn);
        });

        this.updateState();
    }

    /**
     * Clear the panel
     */
    private clear(): void {
        this.slices = [];
        this.baseName = "slide";

        const buttonsContainer = this.element.querySelector(
            `.${this.selectorClasses.downloadButtons}`,
        );
        if (buttonsContainer) {
            buttonsContainer.innerHTML = "";
        }

        this.hideProgress();
        this.updateState();
    }
}
