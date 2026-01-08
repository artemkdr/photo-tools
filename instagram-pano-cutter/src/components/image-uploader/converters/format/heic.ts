import decode from "heic-decode";
import { dataToCanvas } from "./data-to-canvas";
import type { ICanvasFactory } from "./../types";

// Convert HEIC to a browser-friendly blob using heic2any (WASM). Returns a Blob (image/jpeg by default).
export async function convertHeicToBlob(
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
    try {
        performance.mark("heic-read-start");
        // heic-decode exports a `decode` function which accepts ArrayBuffer/Uint8Array
        const buffer = new Uint8Array(
            await file.arrayBuffer(),
        ) as unknown as ArrayBufferLike;
        performance.mark("heic-read-end");
        
        performance.mark("heic-decode-start");
        const { width, height, data } = await decode({ buffer });
        performance.mark("heic-decode-end");

        if (!width || !height || !data)
            throw new Error("Invalid HEIC decode result");

        performance.mark("heic-canvas-start");
        const canvas = dataToCanvas(data, width, height, config, canvasFactory);
        performance.mark("heic-canvas-end");

        performance.mark("heic-encode-start");
        const result = await canvas.convertToBlob({
            type: config.format,
            quality: config.quality,
        });
        performance.mark("heic-encode-end");
        
        // clean up canvas
        canvasFactory?.clearCanvas(canvas);
        return result;
    } catch (e) {
        return Promise.reject(e);
    }
}
