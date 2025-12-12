import UTIF from "utif2";
import { dataToCanvas } from "./data-to-canvas";
import type { ICanvasFactory } from "./types";

// Convert TIFF to a browser image using UTIF library
export async function convertTiffToBlob(
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
        const buffer = await file.arrayBuffer();
        const ifds = UTIF.decode(buffer);
        const first = ifds[0];
        UTIF.decodeImage(buffer, first);
        const rgba = UTIF.toRGBA8(first);

        const width = first.width;
        const height = first.height;

        const canvas = dataToCanvas(rgba, width, height, config, canvasFactory);

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
