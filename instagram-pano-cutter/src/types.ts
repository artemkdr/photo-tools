/**
 * Instagram aspect ratio options
 */
export type AspectRatio = '1:1' | '4:5';

/**
 * How to handle slices that don't perfectly fit the aspect ratio
 */
export type UnevenHandling = 'crop' | 'pad';

/**
 * Theme options
 */
export type Theme = 'light' | 'dark' | 'auto';

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
}

/**
 * Dimensions for Instagram formats
 */
export const INSTAGRAM_DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  '1:1': { width: 1080, height: 1080 },
  '4:5': { width: 1080, height: 1350 },
};

/**
 * Result of slicing an image
 */
export interface SliceResult {
  /** Array of canvas elements, one per slice */
  slices: HTMLCanvasElement[];
  /** Number of slices created */
  count: number;
  /** Whether the last slice needed special handling */
  lastSliceAdjusted: boolean;
}

/**
 * Supported image MIME types (native browser support)
 */
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/bmp',
] as const;

/**
 * Supported file extensions
 */
export const SUPPORTED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.avif',
  '.bmp',
] as const;

/**
 * Check if a file type is supported
 */
export function isSupportedImageType(type: string): boolean {
  return SUPPORTED_IMAGE_TYPES.includes(type as typeof SUPPORTED_IMAGE_TYPES[number]);
}

/**
 * Check if a file extension is supported
 */
export function isSupportedExtension(filename: string): boolean {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return SUPPORTED_EXTENSIONS.includes(ext as typeof SUPPORTED_EXTENSIONS[number]);
}
