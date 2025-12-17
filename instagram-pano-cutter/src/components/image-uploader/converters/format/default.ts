import { dataToCanvas } from "./data-to-canvas";
import type { ICanvasFactory } from ".././types";

export async function convertDefaultToBlob(
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
    canvasFactory?: ICanvasFactory,
): Promise<Blob> {
    let imgBitmap: ImageBitmap | null = null;
    try {
        imgBitmap = await createImageBitmap(file);
        const width = imgBitmap.width;
        const height = imgBitmap.height;
        // convert imgBitmap to buffer array
        const offscreenCanvas = new OffscreenCanvas(width, height);
        const ctx = offscreenCanvas.getContext("2d", {
            willReadFrequently: true,
            alpha: false,
        });
        if (!ctx) throw new Error("Failed to create OffscreenCanvas context");
        ctx.drawImage(imgBitmap, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data.buffer;

        const canvas = dataToCanvas(data, width, height, config, canvasFactory);
        const result = await new Promise<Blob>((resolve, reject) => {
            return canvas
                .convertToBlob({
                    type: config.format,
                    quality: config.quality,
                })
                .then((b) => {
                    resolve(b);
                })
                .catch((e) => {
                    reject(e);
                });
        });
        // clean up canvas
        canvasFactory?.clearCanvas(canvas);
        return result;
    } catch (e) {
        return Promise.reject(e);
    } finally {
        // clean up imgBitmap
        imgBitmap?.close();
    }
}
