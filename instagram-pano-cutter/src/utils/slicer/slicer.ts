import {
    type ICanvasFactory,
    type SliceConfig,
    type SliceResult,
    INSTAGRAM_DIMENSIONS,
} from "../../types";
import { getOptimalCropping } from "../get-optimal-cropping";

/**
 * Slice an image into Instagram-ready carousel slides
 */
export function sliceImage(
    imageBitmap: ImageBitmap,
    config: SliceConfig,
    canvasFactory: ICanvasFactory,
): SliceResult {
    const { aspectRatio, unevenHandling, paddingColor } = config;
    const targetDimensions = INSTAGRAM_DIMENSIONS[aspectRatio];

    const sourceImageBitmap = buildSourceImageBitmap(
        config,
        imageBitmap,
        canvasFactory,
    );
    // Track if we created a new ImageBitmap for cleanup
    const shouldCloseSource = sourceImageBitmap !== imageBitmap;

    const imageWidth = sourceImageBitmap.width;
    const imageHeight = sourceImageBitmap.height;

    const conversionRatio = targetDimensions.height / imageHeight;

    // we normalize the image width to the target height to calculate number of slices
    const normalizedWidth = Math.round(imageWidth * conversionRatio);

    // effective slice width of the image
    let sliceWidth = Math.round(targetDimensions.width / conversionRatio);
    let sliceHeight = imageHeight;
    let sliceCount = Math.ceil(imageWidth / sliceWidth);

    const slices: ImageBitmap[] = [];
    const adjustedCanvas = canvasFactory.getOffscreenCanvas(
        1,
        1,
        "slicer-adjusted-canvas",
    );

    // If padding is requested, pad the entire image left/right so all slices align seamlessly.
    // If cropping is requested, crop the whole image to the nearest slice multiple before slicing.
    const needsAdjustment =
        normalizedWidth % sliceWidth !== 0 || unevenHandling === "oneSlideFit";
    const ctx = adjustedCanvas.getContext("2d", { alpha: false });
    if (!ctx) {
        throw new Error("Failed to get 2D context");
    }
    // Adjust the source image as needed
    if (needsAdjustment) {
        if (unevenHandling === "pad") {
            // padded real width of the whole image
            const paddedWidth = sliceCount * sliceWidth;
            if (
                adjustedCanvas.width !== paddedWidth ||
                adjustedCanvas.height !== imageHeight
            ) {
                adjustedCanvas.width = paddedWidth;
                adjustedCanvas.height = imageHeight;
            }
            adjustedCanvas.width = paddedWidth;
            adjustedCanvas.height = imageHeight;

            // Fill background with padding color, then center the original image
            ctx.fillStyle = paddingColor;
            ctx.fillRect(0, 0, paddedWidth, imageHeight);
            const offsetX = Math.round((paddedWidth - imageWidth) / 2);
            // center the image
            ctx.drawImage(
                sourceImageBitmap,
                offsetX,
                0,
                imageWidth,
                imageHeight,
            );
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
            sliceWidth = Math.round(optimalCropping.cropWidth / sliceCount);
            sliceHeight = Math.round(optimalCropping.cropHeight);

            const cropWidth = Math.round(optimalCropping.cropWidth);
            const cropHeight = Math.round(optimalCropping.cropHeight);

            if (
                adjustedCanvas.width !== cropWidth ||
                adjustedCanvas.height !== cropHeight
            ) {
                adjustedCanvas.width = cropWidth;
                adjustedCanvas.height = cropHeight;
            }
            adjustedCanvas.width = cropWidth;
            adjustedCanvas.height = cropHeight;

            // Center-crop the whole image horizontally and vertically
            ctx.drawImage(
                sourceImageBitmap,
                Math.round(optimalCropping.x),
                Math.round(optimalCropping.y),
                cropWidth,
                cropHeight,
                0,
                0,
                cropWidth,
                cropHeight,
            );
        } else if (unevenHandling === "oneSlideFit") {
            // we resize the image to fit ENTIRELY into one slide
            // i.e. we could add horizontal or vertical padding to fit the aspect ratio
            if (
                adjustedCanvas.width !== targetDimensions.width ||
                adjustedCanvas.height !== targetDimensions.height
            ) {
                adjustedCanvas.width = Math.round(targetDimensions.width);
                adjustedCanvas.height = Math.round(targetDimensions.height);
            }
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
                destHeight = Math.round(targetDimensions.width / imageAspect);
                destY = Math.round((targetDimensions.height - destHeight) / 2);
            } else if (imageAspect < targetAspect) {
                // image is taller than target, fit height and pad width
                destWidth = Math.round(targetDimensions.height * imageAspect);
                destX = Math.round((targetDimensions.width - destWidth) / 2);
            }
            // Fill background with padding color
            ctx.fillStyle = paddingColor;
            ctx.fillRect(
                0,
                0,
                Math.round(targetDimensions.width),
                Math.round(targetDimensions.height),
            );
            // Draw the image resized to fit within the target dimensions
            ctx.drawImage(
                sourceImageBitmap,
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
        if (
            adjustedCanvas.width !== imageWidth ||
            adjustedCanvas.height !== imageHeight
        ) {
            adjustedCanvas.width = imageWidth;
            adjustedCanvas.height = imageHeight;
        }
        ctx.drawImage(sourceImageBitmap, 0, 0, imageWidth, imageHeight);
    }
    // now slice the (possibly adjusted) image
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

    // Clean up intermediate ImageBitmap created for manual padding
    if (shouldCloseSource) {
        sourceImageBitmap?.close();
    }

    return {
        slices,
        sliceCount: slices.length,
        sliceWidth,
        originalWidth: imageWidth,
        originalHeight: imageHeight,
    };
}

function buildSourceImageBitmap(
    config: SliceConfig,
    imageBitmap: ImageBitmap,
    canvasFactory: ICanvasFactory,
): ImageBitmap {
    const { manualPaddingX, manualPaddingY } = config;

    // add one at each side
    const paddingX = Math.max(0, manualPaddingX) * 2;
    const paddingY = Math.max(0, manualPaddingY) * 2;

    if (paddingX === 0 && paddingY === 0) {
        return imageBitmap;
    }

    const paddedWidth = Math.round(imageBitmap.width + paddingX);
    const paddedHeight = Math.round(imageBitmap.height + paddingY);

    const canvas = canvasFactory.getOffscreenCanvas(
        paddedWidth,
        paddedHeight,
        "slicer-source-canvas",
    );
    if (canvas.width !== paddedWidth || canvas.height !== paddedHeight) {
        canvas.width = paddedWidth;
        canvas.height = paddedHeight;
    }

    const ctx = canvas.getContext("2d", { alpha: false });
    if (ctx) {
        // Fill background with padding color, then center the original image
        ctx.fillStyle = config.paddingColor;
        ctx.fillRect(0, 0, paddedWidth, paddedHeight);
        // Draw the original image centered with padding
        ctx.drawImage(
            imageBitmap,
            Math.round(manualPaddingX),
            Math.round(manualPaddingY),
        );
    }

    // Convert to ImageBitmap for better cross-browser compatibility
    // Older iOS Safari has issues drawing from OffscreenCanvas to OffscreenCanvas
    return canvas.transferToImageBitmap();
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
): ImageBitmap {
    const canvas = canvasFactory.getOffscreenCanvas(
        targetDimensions.width,
        targetDimensions.height,
        `slicer-full-slice-${index}`,
    );
    if (
        canvas.width !== targetDimensions.width ||
        canvas.height !== targetDimensions.height
    ) {
        canvas.width = targetDimensions.width;
        canvas.height = targetDimensions.height;
    }
    const ctx = canvas.getContext("2d", { alpha: false });
    if (ctx) {
        ctx.drawImage(
            image,
            Math.round(sourceX),
            Math.round(sourceY),
            Math.round(sourceWidth),
            Math.round(sourceHeight), // Source rectangle
            0,
            0,
            Math.round(targetDimensions.width),
            Math.round(targetDimensions.height), // Destination rectangle
        );
    }
    return canvas.transferToImageBitmap();
}
