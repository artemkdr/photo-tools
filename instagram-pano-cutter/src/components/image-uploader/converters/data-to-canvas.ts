export function dataToCanvas(
    data: ArrayBuffer | Uint8Array | Uint8ClampedArray<ArrayBufferLike>,
    width: number,
    height: number,
    config: {
        maxWidth?: number;
        maxHeight?: number;
    },
    canvasFactory?: {
        getCanvas: (
            width: number,
            height: number,
            key?: string,
        ) => HTMLCanvasElement;
        clearCanvas: (canvas: HTMLCanvasElement) => void;
        disposeCanvas: (canvas: HTMLCanvasElement) => void;
    },
) {
    const canvas = canvasFactory
        ? canvasFactory.getCanvas(width, height, "converter")
        : document.createElement("canvas");
    if (canvasFactory) {
        canvasFactory.clearCanvas(canvas);
    }
    // resize keeping aspect ratio if maxWidth or maxHeight is set
    let targetWidth = width;
    let targetHeight = height;
    if (config.maxWidth && targetWidth > config.maxWidth) {
        targetWidth = config.maxWidth;
        targetHeight = Math.round((height * targetWidth) / width);
    }
    if (config.maxHeight && targetHeight > config.maxHeight) {
        targetHeight = config.maxHeight;
        targetWidth = Math.round((width * targetHeight) / height);
    }
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to create canvas");

    // resize the data into target dimensions
    const tmpCanvas = canvasFactory
        ? canvasFactory.getCanvas(width, height, "converter-tmp")
        : document.createElement("canvas");
    if (canvasFactory) {
        canvasFactory.clearCanvas(tmpCanvas);
    }
    tmpCanvas.width = width;
    tmpCanvas.height = height;
    const tmpCtx = tmpCanvas.getContext("2d");
    if (!tmpCtx) throw new Error("Failed to create temporary canvas");
    const tmpImageData = tmpCtx.createImageData(width, height);
    tmpImageData.data.set(new Uint8ClampedArray(data));
    tmpCtx.putImageData(tmpImageData, 0, 0);
    ctx.drawImage(
        tmpCanvas,
        0,
        0,
        width,
        height,
        0,
        0,
        targetWidth,
        targetHeight,
    );
    return canvas;
}
