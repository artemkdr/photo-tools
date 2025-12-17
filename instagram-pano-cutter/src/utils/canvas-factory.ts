import type { ICanvasFactory } from "../types";

export class CanvasFactory implements ICanvasFactory {
    private readonly MAX_CANVAS_POOL_SIZE = 1000; // Maximum canvas pool size
    private canvasPool: Map<string, HTMLCanvasElement> = new Map();
    private offscreenCanvasPool: Map<string, OffscreenCanvas> = new Map();
    private attributeKey = "data-canvas-key";

    public getCanvas(
        width: number,
        height: number,
        key?: string,
    ): HTMLCanvasElement {
        const mapKey = key || `${Math.random().toString(36).substring(2, 11)}`;
        let canvas = this.canvasPool.get(mapKey);
        if (!canvas) {
            // Limit pool size
            if (this.canvasPool.size > this.MAX_CANVAS_POOL_SIZE) {
                this.disposeCanvas(this.canvasPool.values().next().value!);
            }
            canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            canvas.setAttribute(this.attributeKey, key || "");
            this.canvasPool.set(mapKey, canvas);
        }
        return canvas;
    }

    public getOffscreenCanvas(
        width: number,
        height: number,
        key?: string,
    ): OffscreenCanvas {
        const mapKey = key || `${Math.random().toString(36).substring(2, 11)}`;
        let canvas = this.offscreenCanvasPool.get(mapKey);
        if (!canvas) {
            // Limit pool size
            if (this.offscreenCanvasPool.size > this.MAX_CANVAS_POOL_SIZE) {
                this.disposeCanvas(
                    this.offscreenCanvasPool.values().next().value!,
                );
            }
            const offscreenCanvas = new OffscreenCanvas(width, height);
            offscreenCanvas.width = width;
            offscreenCanvas.height = height;
            this.offscreenCanvasPool.set(mapKey, offscreenCanvas);
            canvas = offscreenCanvas;
        }
        return canvas;
    }

    public clearCanvas(canvas: HTMLCanvasElement | OffscreenCanvas): void {
        // Optionally clear the canvas before releasing
        const ctx = canvas.getContext("2d");
        if (ctx) {
            if ("clearRect" in ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }

    public disposeCanvas(canvas: HTMLCanvasElement | OffscreenCanvas): void {
        this.canvasPool.forEach((value, key) => {
            if (value === canvas) {
                this.canvasPool.delete(key);
            }
        });
        this.offscreenCanvasPool.forEach((value, key) => {
            if (value === canvas) {
                this.offscreenCanvasPool.delete(key);
            }
        });
    }

    public disposeAll(): void {
        this.canvasPool.clear();
        this.offscreenCanvasPool.clear();
    }
}
