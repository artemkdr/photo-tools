import UTIF from "utif2";

// Convert TIFF to a browser image using UTIF library
export async function convertTiffToBlob(
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
        const buffer = await file.arrayBuffer();
        const ifds = UTIF.decode(buffer);
        const first = ifds[0];
        UTIF.decodeImage(buffer, first);
        const rgba = UTIF.toRGBA8(first);

        const width = first.width;
        const height = first.height;

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
        imageData.data.set(new Uint8ClampedArray(rgba));
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
