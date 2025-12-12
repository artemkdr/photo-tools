import {
    isHeicMimeType,
    isSupportedExtension,
    isSupportedImageType,
    isTiffMimeType,
    SUPPORTED_EXTENSIONS,
} from "../../../types";
import { convertDefaultToBlob } from "./format/default";
import { convertHeicToBlob } from "./format/heic";
import { convertTiffToBlob } from "./format/tiff";
import type { ICanvasFactory } from "./types";

export async function convertToBlob(
    file: File,
    config: {
        quality?: number; // 0 to 1
        format?: "image/jpeg" | "image/png" | "image/webp";
        maxWidth?: number;
        maxHeight?: number;
    },
    canvasFactory?: ICanvasFactory,
): Promise<Blob> {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    const isHeic = isHeicMimeType(ext);
    const isTiff = isTiffMimeType(ext);
    if (
        !isHeic &&
        !isTiff &&
        !isSupportedImageType(file.type) &&
        !isSupportedExtension(file.name)
    ) {
        const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
        // reject
        return Promise.reject(
            new Error(
                `Unsupported file type: ${file.type} (${ext}). Supported formats: ${SUPPORTED_EXTENSIONS.join(
                    ", ",
                )}`,
            ),
        );
    }

    try {
        let processedFile: File | Blob = file;

        if (isHeic) {
            // import dynamically to reduce initial bundle size
            //const { convertHeicToBlob } = await import("./format/heic");
            processedFile = await convertHeicToBlob(
                file,
                {
                    quality: config.quality,
                    format: config.format,
                    maxWidth: config.maxWidth,
                    maxHeight: config.maxHeight,
                },
                canvasFactory,
            );
        } else if (isTiff) {
            // import dynamically to reduce initial bundle size
            //const { convertTiffToBlob } = await import("./format/tiff");
            processedFile = await convertTiffToBlob(
                file,
                {
                    quality: config.quality,
                    format: config.format,
                    maxWidth: config.maxWidth,
                    maxHeight: config.maxHeight,
                },
                canvasFactory,
            );
        } else {
            // convert to image/webp, 0.95 quality to reduce size and improve loading
            processedFile = await convertDefaultToBlob(
                file,
                {
                    quality: config.quality,
                    format: config.format,
                    maxWidth: config.maxWidth,
                    maxHeight: config.maxHeight,
                },
                canvasFactory,
            );
        }
        return processedFile;
    } catch {
        return Promise.reject(
            new Error(
                "Failed to load image. The file may be corrupted or the format is not supported.",
            ),
        );
    }
}
