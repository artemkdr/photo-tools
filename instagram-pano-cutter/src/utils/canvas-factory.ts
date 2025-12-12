import type { ICanvasFactory } from "../types";

export class CanvasFactory implements ICanvasFactory {
    private canvasPool: Map<string, HTMLCanvasElement> = new Map();
    private attributeKey = "data-canvas-key";

    public getCanvas(
        width: number,
        height: number,
        key?: string,
    ): HTMLCanvasElement {
        const mapKey = key || `${width}x${height}`;
        let canvas = this.canvasPool.get(mapKey);
        if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            canvas.setAttribute(this.attributeKey, key || "");
            this.canvasPool.set(mapKey, canvas);
        }
        return canvas;
    }

    public clearCanvas(canvas: HTMLCanvasElement): void {
        // Optionally clear the canvas before releasing
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    public disposeCanvas(canvas: HTMLCanvasElement): void {
        const key = canvas.getAttribute(this.attributeKey) || "";
        const mapKey = key || `${canvas.width}x${canvas.height}`;
        if (this.canvasPool.has(mapKey)) {
            this.canvasPool.delete(mapKey);
        }
    }
}
