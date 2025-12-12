/**
 * Canvas factory
 */
export interface ICanvasFactory {
    /** Get/Create a new canvas with specified width and height */
    getCanvas(width: number, height: number, key?: string): HTMLCanvasElement;
    /** Get/Create a new offscreen canvas with specified width and height */
    getOffscreenCanvas(
        width: number,
        height: number,
        key?: string,
    ): OffscreenCanvas;
    /** Clean up a canvas (e.g., clear its contents) */
    clearCanvas(canvas: HTMLCanvasElement | OffscreenCanvas): void;
    /** Dispose of a canvas (optional cleanup) */
    disposeCanvas(canvas: HTMLCanvasElement | OffscreenCanvas): void;
}
