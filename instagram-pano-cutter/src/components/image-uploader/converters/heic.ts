import decode from "heic-decode";
import { dataToCanvas } from "./data-to-canvas";
import type { ICanvasFactory } from "./types";

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
    onError?: (error: unknown) => void,
    canvasFactory?: ICanvasFactory,
): Promise<Blob> {
    try {
        // heic-decode exports a `decode` function which accepts ArrayBuffer/Uint8Array
        const buffer = new Uint8Array(
            await file.arrayBuffer(),
        ) as unknown as ArrayBufferLike;
        const { width, height, data } = await decode({ buffer });

        if (!width || !height || !data)
            throw new Error("Invalid HEIC decode result");

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
        onError?.(e);
        throw e;
    }
}
