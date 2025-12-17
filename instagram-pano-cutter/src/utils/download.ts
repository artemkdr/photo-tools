/**
 * Download a single canvas as an image file
 */
export function downloadCanvas(
    imageBitmap: ImageBitmap,
    filename: string,
    format: "image/png" | "image/jpeg" = "image/png",
): Promise<void> {
    return new Promise((resolve, reject) => {
        const canvas = new OffscreenCanvas(
            imageBitmap.width,
            imageBitmap.height,
        );
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.drawImage(imageBitmap, 0, 0);
        }
        return canvas
            .convertToBlob({
                type: format,
                quality: 0.95,
            })
            .then((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                resolve();
            })
            .catch((_) => {
                reject(
                    new Error("Failed to create downloadable data from canvas"),
                );
            });
    });
}

/**
 * Download a single slice
 */
export function downloadSlice(
    imageBitmap: ImageBitmap,
    index: number,
    baseName: string = "slide",
): Promise<void> {
    const filename = `${baseName}-${String(index + 1).padStart(2, "0")}.jpg`;
    return downloadCanvas(imageBitmap, filename, "image/jpeg");
}

/**
 * Delay utility for sequential downloads
 */
function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Download all slices sequentially with a small delay between each
 * to prevent browser blocking
 */
export async function downloadAllSlices(
    imageBitmaps: ImageBitmap[],
    baseName: string = "slide",
    delayMs: number = 150,
): Promise<void> {
    for (let i = 0; i < imageBitmaps.length; i++) {
        await downloadSlice(imageBitmaps[i], i, baseName);

        // Add delay between downloads (except for the last one)
        if (i < imageBitmaps.length - 1) {
            await delay(delayMs);
        }
    }
}

/**
 * Generate a base name from the original filename
 */
export function generateBaseName(originalFilename: string): string {
    // Remove extension
    const withoutExt = originalFilename.replace(/\.[^/.]+$/, "");
    // Sanitize for filename use
    return withoutExt.replace(/[^a-zA-Z0-9-_]/g, "_");
}
