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
        performance.mark("default-createImageBitmap-start");
        imgBitmap = await createImageBitmap(file);
        performance.mark("default-createImageBitmap-end");

        const width = imgBitmap.width;
        const height = imgBitmap.height;

        // Calculate target dimensions
        let targetWidth = width;
        let targetHeight = height;
        let needsResize = false;
        if (config.maxWidth && targetWidth > config.maxWidth) {
            targetWidth = config.maxWidth;
            targetHeight = Math.round((height * targetWidth) / width);
            needsResize = true;
        }
        if (config.maxHeight && targetHeight > config.maxHeight) {
            targetHeight = config.maxHeight;
            targetWidth = Math.round((width * targetHeight) / height);
            needsResize = true;
        }

        // Quick path: if no resize needed and format matches, return original file
        const needsFormatConversion =
            config.format && file.type !== config.format;
        if (!needsResize && !needsFormatConversion) {
            imgBitmap?.close();
            return file;
        }

        performance.mark("default-canvas-start");
        // Direct approach: draw ImageBitmap to canvas and encode
        const canvas = canvasFactory
            ? canvasFactory.getOffscreenCanvas(
                  targetWidth,
                  targetHeight,
                  "converter",
              )
            : new OffscreenCanvas(targetWidth, targetHeight);

        if (canvasFactory) {
            canvasFactory.clearCanvas(canvas);
        }
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) throw new Error("Failed to create OffscreenCanvas context");

        // Single draw operation - GPU accelerated, no pixel buffer copying
        ctx.drawImage(imgBitmap, 0, 0, targetWidth, targetHeight);
        performance.mark("default-canvas-end");

        performance.mark("default-encode-start");
        const result = await canvas.convertToBlob({
            type: config.format,
            quality: config.quality,
        });
        performance.mark("default-encode-end");

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
