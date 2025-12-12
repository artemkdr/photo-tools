import { dataToCanvas } from "./data-to-canvas";

export async function convertToBlob(
    file: File,
    config: {
        quality?: number; // 0 to 1
        format?: "image/jpeg" | "image/png" | "image/webp";
        maxWidth?: number;
        maxHeight?: number;
    } = {
        quality: 0.95,
        format: "image/webp",
    },
    onError?: (error: unknown) => void,
    canvasFactory?: {
        getCanvas: (
            width: number,
            height: number,
            key?: string,
        ) => HTMLCanvasElement;
        clearCanvas: (canvas: HTMLCanvasElement) => void;
        disposeCanvas: (canvas: HTMLCanvasElement) => void;
    },
): Promise<Blob> {
    try {
        const imgBitmap = await createImageBitmap(file);
        const width = imgBitmap.width;
        const height = imgBitmap.height;
        // convert imgBitmap to buffer array
        const offscreenCanvas = new OffscreenCanvas(width, height);
        const ctx = offscreenCanvas.getContext("2d");
        if (!ctx) throw new Error("Failed to create OffscreenCanvas context");
        ctx.drawImage(imgBitmap, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data.buffer;

        const canvas = dataToCanvas(data, width, height, config, canvasFactory);
        const result = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
                (b) => {
                    if (b) resolve(b);
                    else reject(new Error("Canvas toBlob failed"));
                },
                config.format,
                config.quality,
            );
        });
        // clean up canvas
        canvasFactory?.clearCanvas(canvas);
        return result;
    } catch (e) {
        onError?.(e);
        throw e;
    }
}
