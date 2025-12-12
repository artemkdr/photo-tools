import decode from "heic-decode";

// Convert HEIC to a browser-friendly blob using heic2any (WASM). Returns a Blob (image/jpeg by default).
export async function convertHeicToBlob(
    file: File,
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

        const canvas = canvasFactory
            ? canvasFactory.getCanvas(width, height, "converter")
            : document.createElement("canvas");
        if (canvasFactory) {
            canvasFactory.clearCanvas(canvas);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Failed to create canvas");

        const imageData = ctx.createImageData(width, height);
        imageData.data.set(new Uint8ClampedArray(data));
        ctx.putImageData(imageData, 0, 0);

        const result = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((b) => {
                if (b) resolve(b);
                else reject(new Error("Canvas toBlob failed"));
            }, "image/png");
        });
        // clean up canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 0;
        canvas.height = 0;
        return result;
    } catch (e) {
        onError?.(e);
        throw e;
    }
}
