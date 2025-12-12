/**
 * Canvas factory
 */
export interface ICanvasFactory {
    /** Get/Create a new canvas with specified width and height */
    getCanvas(width: number, height: number, key?: string): HTMLCanvasElement;
    /** Clean up a canvas (e.g., clear its contents) */
    clearCanvas(canvas: HTMLCanvasElement): void;
    /** Dispose of a canvas (optional cleanup) */
    disposeCanvas(canvas: HTMLCanvasElement): void;
}

/**
 * Instagram aspect ratio options
 */
export type AspectRatio = "1:1" | "4:5";

/**
 * How to handle slices that don't perfectly fit the aspect ratio
 */
export type UnevenHandling = "crop" | "pad" | "oneSlideFit";

/**
 * Theme options
 */
export type Theme = "light" | "dark" | "auto";

/**
 * Configuration for slicing an image
 */
export interface SliceConfig {
    /** Target aspect ratio for each slice */
    aspectRatio: AspectRatio;
    /** How to handle the last slice if it doesn't fit perfectly */
    unevenHandling: UnevenHandling;
    /** Padding color (hex) when unevenHandling is 'pad' */
    paddingColor: string;
    /** Optional manual horizontal padding (in pixels) to add before slicing */
    manualPaddingX: number;
    /** Optional manual vertical padding (in pixels) to add before slicing */
    manualPaddingY: number;
}

/**
 * Dimensions for Instagram formats
 */
export const INSTAGRAM_DIMENSIONS: Record<
    AspectRatio,
    { width: number; height: number }
> = {
    "1:1": { width: 1080, height: 1080 },
    "4:5": { width: 1080, height: 1350 },
};

/**
 * Result of slicing an image
 */
export interface SliceResult {
    /** Array of canvas elements, one per slice */
    slices: HTMLCanvasElement[];
    /** Number of slices created */
    sliceCount: number;
    /** Width of each slice in pixels */
    sliceWidth: number;
    /** Original image width in pixels */
    originalWidth: number;
    /** Original image height in pixels */
    originalHeight: number;
}

/**
 * Supported image MIME types (native browser support)
 */
export const SUPPORTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/avif",
    "image/bmp",
    "image/x-canon-cr2", // Canon RAW
    "image/tiff", // tiff, dng, nef, nrw, pef...
    "image/octet-stream", // for some RAW files
] as const;

/**
 * Extensions that are TIFF or TIFF-like (including some proprietary whole-slide/imaging formats)
 * These are often encoded using TIFF containers or are commonly treated as TIFF by decoders
 */
export const TIFF_EXTENSIONS = [
    ".tif",
    ".tiff",
    ".ptif",
    ".btf",
    ".dng", // Adobe Digital Negative (TIFF-based)
    ".pef", // Pentax RAW (TIFF-based)
    ".nef", // Nikon RAW (TIFF-based)
    ".nrw", // Nikon RAW (TIFF-based)
    // Extended TIFF formats
    // Whole-slide / proprietary TIFF-based formats
    ".svs",
    ".ndpi",
    ".mrxs",
    ".scn",
] as const;

/**
 * Supported file extensions
 */
export const SUPPORTED_EXTENSIONS = [
    // Common image formats
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".avif",
    ".bmp",
    ".heic",
    ".heif",
    ".arw", // Sony RAW (supported by some browsers)
    ".raw", // Generic RAW
    // TIFF and TIFF-like formats
    ...TIFF_EXTENSIONS,
] as const;

/**
 * Check if a file type is supported
 */
export function isSupportedImageType(type: string): boolean {
    return SUPPORTED_IMAGE_TYPES.includes(
        type as (typeof SUPPORTED_IMAGE_TYPES)[number],
    );
}

export function isTiffMimeType(extensionOrMimeType: string): boolean {
    const ext = extensionOrMimeType.toLowerCase();
    return (
        ext === "image/tiff" ||
        (TIFF_EXTENSIONS as readonly string[]).includes(ext)
    );
}

export function isHeicMimeType(extensionOrMimeType: string): boolean {
    const ext = extensionOrMimeType.toLowerCase();
    return (
        ext === "image/heic" ||
        ext === "image/heif" ||
        ext === ".heic" ||
        ext === ".heif"
    );
}

/**
 * Check if a file extension is supported
 */
export function isSupportedExtension(filename: string): boolean {
    const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
    return SUPPORTED_EXTENSIONS.includes(
        ext as (typeof SUPPORTED_EXTENSIONS)[number],
    );
}
