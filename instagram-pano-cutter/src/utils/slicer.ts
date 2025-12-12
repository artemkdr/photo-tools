import {
    type ICanvasFactory,
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
    canvasFactory: ICanvasFactory,
): SliceResult {
    const { aspectRatio, unevenHandling, paddingColor } = config;
    const targetDimensions = INSTAGRAM_DIMENSIONS[aspectRatio];

    const sourceCanvas = buildSourceCanvas(config, image, canvasFactory);

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
    const adjustedCanvas = canvasFactory.getCanvas(
        1,
        1,
        "slicer-adjusted-canvas",
    );

    // If padding is requested, pad the entire image left/right so all slices align seamlessly.
    // If cropping is requested, crop the whole image to the nearest slice multiple before slicing.
    const needsAdjustment =
        normalizedWidth % sliceWidth !== 0 || unevenHandling === "oneSlideFit";
    const ctx = adjustedCanvas.getContext("2d");
    if (!ctx) {
        throw new Error("Failed to get 2D context");
    }
    if (needsAdjustment) {
        if (unevenHandling === "pad") {
            // padded real width of the whole image
            const paddedWidth = sliceCount * sliceWidth;
            adjustedCanvas.width = paddedWidth;
            adjustedCanvas.height = imageHeight;

            // Fill background with padding color, then center the original image
            ctx.fillStyle = paddingColor;
            ctx.fillRect(0, 0, paddedWidth, imageHeight);
            const offsetX = (paddedWidth - imageWidth) / 2;
            // center the image
            ctx.drawImage(sourceCanvas, offsetX, 0, imageWidth, imageHeight);
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

            adjustedCanvas.width = optimalCropping.cropWidth;
            adjustedCanvas.height = optimalCropping.cropHeight;

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
        } else if (unevenHandling === "oneSlideFit") {
            // we resize the image to fit ENTIRELY into one slide
            // i.e. we could add horizontal or vertical padding to fit the aspect ratio
            adjustedCanvas.width = targetDimensions.width;
            adjustedCanvas.height = targetDimensions.height;

            // calculate aspect ratios
            const imageAspect = imageWidth / imageHeight;
            const targetAspect =
                targetDimensions.width / targetDimensions.height;

            let destWidth = targetDimensions.width;
            let destHeight = targetDimensions.height;
            let destX = 0;
            let destY = 0;

            if (imageAspect > targetAspect) {
                // image is wider than target, fit width and pad height
                destHeight = targetDimensions.width / imageAspect;
                destY = (targetDimensions.height - destHeight) / 2;
            } else if (imageAspect < targetAspect) {
                // image is taller than target, fit height and pad width
                destWidth = targetDimensions.height * imageAspect;
                destX = (targetDimensions.width - destWidth) / 2;
            }
            // Fill background with padding color
            ctx.fillStyle = paddingColor;
            ctx.fillRect(0, 0, targetDimensions.width, targetDimensions.height);
            // Draw the image resized to fit within the target dimensions
            ctx.drawImage(
                sourceCanvas,
                0,
                0,
                imageWidth,
                imageHeight,
                destX,
                destY,
                destWidth,
                destHeight,
            );

            // only one slice
            sliceCount = 1;
            sliceWidth = targetDimensions.width;
            sliceHeight = targetDimensions.height;
        }
    } else {
        // no adjustment needed, use original
        adjustedCanvas.width = imageWidth;
        adjustedCanvas.height = imageHeight;
        ctx.drawImage(sourceCanvas, 0, 0, imageWidth, imageHeight);
    }

    for (let i = 0; i < sliceCount; i++) {
        const sourceX = i * sliceWidth;
        const sourceY = 0;
        slices.push(
            createFullSlice(
                canvasFactory,
                adjustedCanvas,
                sourceX,
                sourceY,
                sliceWidth,
                sliceHeight,
                targetDimensions,
                i,
            ),
        );
    }

    return {
        slices,
        sliceCount: slices.length,
        sliceWidth,
        originalWidth: imageWidth,
        originalHeight: imageHeight,
    };
}

function buildSourceCanvas(
    config: SliceConfig,
    image: HTMLImageElement,
    canvasFactory: ICanvasFactory,
): HTMLCanvasElement {
    const { manualPaddingX, manualPaddingY } = config;

    // add one at each side
    const paddingX = Math.max(0, manualPaddingX) * 2;
    const paddingY = Math.max(0, manualPaddingY) * 2;

    const paddedWidth = image.naturalWidth + paddingX;
    const paddedHeight = image.naturalHeight + paddingY;

    const canvas = canvasFactory.getCanvas(1, 1, "slicer-source-canvas");
    canvasFactory.clearCanvas(canvas);
    canvas.width = paddedWidth;
    canvas.height = paddedHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
        // Fill background with padding color, then center the original image
        ctx.clearRect(0, 0, paddedWidth, paddedHeight);
        ctx.fillStyle = config.paddingColor;
        ctx.fillRect(0, 0, paddedWidth, paddedHeight);
        // Draw the original image centered with padding
        ctx.drawImage(image, manualPaddingX, manualPaddingY);
    }

    return canvas;
}

function createFullSlice(
    canvasFactory: ICanvasFactory,
    image: CanvasImageSource,
    sourceX: number,
    sourceY: number,
    sourceWidth: number,
    sourceHeight: number,
    targetDimensions: { width: number; height: number },
    index = 0,
): HTMLCanvasElement {
    const canvas = canvasFactory.getCanvas(
        targetDimensions.width,
        targetDimensions.height,
        `slicer-full-slice-${index}`,
    );
    canvasFactory.clearCanvas(canvas);
    canvas.width = targetDimensions.width;
    canvas.height = targetDimensions.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
        // clear previous rendering
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
    }
    return canvas;
}
