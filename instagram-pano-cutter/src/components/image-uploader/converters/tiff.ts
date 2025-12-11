import UTIF from "utif2";

// Convert TIFF to a browser image using UTIF library
export async function convertTiffToBlob(
    file: File,
    onError?: (error: unknown) => void,
): Promise<Blob> {
    try {
        const buffer = await file.arrayBuffer();
        const ifds = UTIF.decode(buffer);
        const first = ifds[0];
        UTIF.decodeImage(buffer, first);
        const rgba = UTIF.toRGBA8(first);

        const width = first.width;
        const height = first.height;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Failed to create canvas");

        const imageData = ctx.createImageData(width, height);
        imageData.data.set(new Uint8ClampedArray(rgba));
        ctx.putImageData(imageData, 0, 0);

        return await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((b) => {
                if (b) resolve(b);
                else reject(new Error("Canvas toBlob failed"));
            }, "image/png");
        });
    } catch (e) {
        onError?.(e);
        throw e;
    }
}
