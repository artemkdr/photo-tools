import {
    type SliceConfig,
    type SliceResult,
    INSTAGRAM_DIMENSIONS,
} from "../types";
import { getOptimalCropping } from "./get-optimal-cropping";

/**
 * Slice an image into Instagram-ready carousel slides
 */
export function sliceImage(
    image: HTMLImageElement,
    config: SliceConfig,
): SliceResult {
    const { aspectRatio, unevenHandling, paddingColor } = config;
    const targetDimensions = INSTAGRAM_DIMENSIONS[aspectRatio];

    const sourceCanvas = buildSourceCanvas(config, image);

    const imageWidth = sourceCanvas.width;
    const imageHeight = sourceCanvas.height;

    const conversionRatio = targetDimensions.height / imageHeight;

    // we normalize the image width to the target height to calculate number of slices
    const normalizedWidth = imageWidth * conversionRatio;

    // effective slice width of the image
    let sliceWidth = targetDimensions.width / conversionRatio;
    let sliceHeight = imageHeight;
    let sliceCount = Math.ceil(imageWidth / sliceWidth);

    const slices: HTMLCanvasElement[] = [];
    let lastSliceAdjusted = false;

    // If padding is requested, pad the entire image left/right so all slices align seamlessly.
    // If cropping is requested, crop the whole image to the nearest slice multiple before slicing.
    const needsAdjustment = normalizedWidth % sliceWidth !== 0;
    let sliceSource: CanvasImageSource = sourceCanvas;

    if (needsAdjustment) {
        if (unevenHandling === "pad") {
            // padded real width of the whole image
            const paddedWidth = sliceCount * sliceWidth;
            const paddedCanvas = document.createElement("canvas");
            paddedCanvas.width = paddedWidth;
            paddedCanvas.height = imageHeight;
            const ctx = paddedCanvas.getContext("2d");

            if (!ctx) {
                throw new Error("Failed to get 2D context");
            }

            // Fill background with padding color, then center the original image
            ctx.fillStyle = paddingColor;
            ctx.fillRect(0, 0, paddedWidth, imageHeight);
            const offsetX = (paddedWidth - imageWidth) / 2;
            // center the image
            ctx.drawImage(sourceCanvas, offsetX, 0, imageWidth, imageHeight);

            sliceSource = paddedCanvas;
            lastSliceAdjusted = true;
        } else if (unevenHandling === "crop") {
            // try to find optimal number of slices
            // objectif: we have to crop as less as possible
            // so we have to find an ideal width/height crop amount to fit into slices with minimal cropping
            const optimalCropping = getOptimalCropping(
                imageWidth,
                imageHeight,
                targetDimensions.width / targetDimensions.height,
            );
            sliceCount = optimalCropping.sliceCount;
            sliceWidth = optimalCropping.cropWidth / sliceCount;
            sliceHeight = optimalCropping.cropHeight;

            const cropCanvas = document.createElement("canvas");
            cropCanvas.width = optimalCropping.cropWidth;
            cropCanvas.height = optimalCropping.cropHeight;
            const ctx = cropCanvas.getContext("2d");
            if (!ctx) {
                throw new Error("Failed to get 2D context");
            }

            // Center-crop the whole image horizontally and vertically
            ctx.drawImage(
                sourceCanvas,
                optimalCropping.x,
                optimalCropping.y,
                optimalCropping.cropWidth,
                optimalCropping.cropHeight,
                0,
                0,
                optimalCropping.cropWidth,
                optimalCropping.cropHeight,
            );

            sliceSource = cropCanvas;
            lastSliceAdjusted = imageWidth !== optimalCropping.cropWidth;
        }
    }

    for (let i = 0; i < sliceCount; i++) {
        const sourceX = i * sliceWidth;
        const sourceY = 0;
        slices.push(
            createFullSlice(
                sliceSource,
                sourceX,
                sourceY,
                sliceWidth,
                sliceHeight,
                targetDimensions,
            ),
        );
    }

    return {
        slices,
        sliceCount: slices.length,
        sliceWidth,
        originalWidth: imageWidth,
        originalHeight: imageHeight,
        lastSliceAdjusted,
    };
}

function buildSourceCanvas(
    config: SliceConfig,
    image: HTMLImageElement,
): HTMLCanvasElement {
    const { manualPaddingX, manualPaddingY } = config;

    // add one at each side
    const paddingX = Math.max(0, manualPaddingX) * 2;
    const paddingY = Math.max(0, manualPaddingY) * 2;

    const paddedWidth = image.naturalWidth + paddingX;
    const paddedHeight = image.naturalHeight + paddingY;

    const canvas = document.createElement("canvas");
    canvas.width = paddedWidth;
    canvas.height = paddedHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("Failed to get 2D context");
    }

    // Fill background with padding color, then center the original image
    ctx.clearRect(0, 0, paddedWidth, paddedHeight);
    ctx.fillStyle = config.paddingColor;
    ctx.fillRect(0, 0, paddedWidth, paddedHeight);
    // Draw the original image centered with padding
    ctx.drawImage(image, manualPaddingX, manualPaddingY);

    return canvas;
}

/**
 * Create a full slice (no adjustments needed)
 */
function createFullSlice(
    image: CanvasImageSource,
    sourceX: number,
    sourceY: number,
    sourceWidth: number,
    sourceHeight: number,
    targetDimensions: { width: number; height: number },
): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = targetDimensions.width;
    canvas.height = targetDimensions.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("Failed to get 2D context");
    }

    ctx.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight, // Source rectangle
        0,
        0,
        targetDimensions.width,
        targetDimensions.height, // Destination rectangle
    );

    return canvas;
}
