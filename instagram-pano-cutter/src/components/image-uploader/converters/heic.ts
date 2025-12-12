import decode from "heic-decode";
import { dataToCanvas } from "./data-to-canvas";

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
        // heic-decode exports a `decode` function which accepts ArrayBuffer/Uint8Array
        const buffer = new Uint8Array(
            await file.arrayBuffer(),
        ) as unknown as ArrayBufferLike;
        const { width, height, data } = await decode({ buffer });

        if (!width || !height || !data)
            throw new Error("Invalid HEIC decode result");

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
