import { 
  type SliceConfig, 
  type SliceResult, 
  type AspectRatio,
  INSTAGRAM_DIMENSIONS 
} from '../types';

/**
 * Calculate the number of slices needed for an image
 */
export function calculateSliceCount(
  imageWidth: number,
  imageHeight: number,
  aspectRatio: AspectRatio
): number {
  const targetDimensions = INSTAGRAM_DIMENSIONS[aspectRatio];
  const targetRatio = targetDimensions.width / targetDimensions.height;
  
  // Calculate width of each slice based on image height and target ratio
  const sliceWidth = imageHeight * targetRatio;
  
  // Calculate how many slices we need
  return Math.ceil(imageWidth / sliceWidth);
}

/**
 * Slice an image into Instagram-ready carousel slides
 */
export function sliceImage(
  image: HTMLImageElement,
  config: SliceConfig
): SliceResult {
  const { aspectRatio, unevenHandling, paddingColor } = config;
  const targetDimensions = INSTAGRAM_DIMENSIONS[aspectRatio];
  const targetRatio = targetDimensions.width / targetDimensions.height;
  
  const imageWidth = image.naturalWidth;
  const imageHeight = image.naturalHeight;
  
  // Calculate slice width based on image height to maintain aspect ratio
  const sliceWidth = imageHeight * targetRatio;
  const sliceCount = Math.ceil(imageWidth / sliceWidth);
  
  const slices: HTMLCanvasElement[] = [];
  let lastSliceAdjusted = false;
  
  for (let i = 0; i < sliceCount; i++) {
    const sourceX = i * sliceWidth;
    const remainingWidth = imageWidth - sourceX;
    
    // Check if this is the last slice and it's smaller than expected
    const isLastSlice = i === sliceCount - 1;
    const isUneven = remainingWidth < sliceWidth;
    
    if (isLastSlice && isUneven) {
      lastSliceAdjusted = true;
      
      if (unevenHandling === 'crop') {
        // Crop: center-crop from the available content
        slices.push(createCroppedSlice(image, sourceX, remainingWidth, imageHeight, targetDimensions));
      } else {
        // Pad: add equal padding on both sides
        slices.push(createPaddedSlice(image, sourceX, remainingWidth, imageHeight, targetDimensions, paddingColor));
      }
    } else {
      // Regular full slice
      slices.push(createFullSlice(image, sourceX, sliceWidth, imageHeight, targetDimensions));
    }
  }
  
  return {
    slices,
    count: slices.length,
    lastSliceAdjusted,
  };
}

/**
 * Create a full slice (no adjustments needed)
 */
function createFullSlice(
  image: HTMLImageElement,
  sourceX: number,
  sourceWidth: number,
  sourceHeight: number,
  targetDimensions: { width: number; height: number }
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = targetDimensions.width;
  canvas.height = targetDimensions.height;
  
  const ctx = canvas.getContext('2d')!;
  
  ctx.drawImage(
    image,
    sourceX, 0, sourceWidth, sourceHeight,  // Source rectangle
    0, 0, targetDimensions.width, targetDimensions.height  // Destination rectangle
  );
  
  return canvas;
}

/**
 * Create a cropped slice (center-crop for uneven last slice)
 */
function createCroppedSlice(
  image: HTMLImageElement,
  sourceX: number,
  availableWidth: number,
  sourceHeight: number,
  targetDimensions: { width: number; height: number }
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = targetDimensions.width;
  canvas.height = targetDimensions.height;
  
  const ctx = canvas.getContext('2d')!;
  const targetRatio = targetDimensions.width / targetDimensions.height;
  
  // Calculate the portion of the image we can use
  // We need to crop height to match the available width's aspect ratio
  const croppedHeight = availableWidth / targetRatio;
  const heightOffset = (sourceHeight - croppedHeight) / 2;
  
  ctx.drawImage(
    image,
    sourceX, heightOffset, availableWidth, croppedHeight,
    0, 0, targetDimensions.width, targetDimensions.height
  );
  
  return canvas;
}

/**
 * Create a padded slice (equal padding on both sides for uneven last slice)
 */
function createPaddedSlice(
  image: HTMLImageElement,
  sourceX: number,
  availableWidth: number,
  sourceHeight: number,
  targetDimensions: { width: number; height: number },
  paddingColor: string
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = targetDimensions.width;
  canvas.height = targetDimensions.height;
  
  const ctx = canvas.getContext('2d')!;
  const targetRatio = targetDimensions.width / targetDimensions.height;
  const expectedSliceWidth = sourceHeight * targetRatio;
  
  // Fill with padding color first
  ctx.fillStyle = paddingColor;
  ctx.fillRect(0, 0, targetDimensions.width, targetDimensions.height);
  
  // Calculate the scaled dimensions for the available content
  const scale = targetDimensions.height / sourceHeight;
  const scaledContentWidth = availableWidth * scale;
  
  // Center the content horizontally (equal padding on both sides)
  const offsetX = (targetDimensions.width - scaledContentWidth) / 2;
  
  ctx.drawImage(
    image,
    sourceX, 0, availableWidth, sourceHeight,
    offsetX, 0, scaledContentWidth, targetDimensions.height
  );
  
  return canvas;
}

/**
 * Load an image from a File object
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Get image info for display
 */
export function getImageInfo(image: HTMLImageElement, aspectRatio: AspectRatio): {
  originalWidth: number;
  originalHeight: number;
  sliceCount: number;
  sliceWidth: number;
} {
  const sliceCount = calculateSliceCount(image.naturalWidth, image.naturalHeight, aspectRatio);
  const targetDimensions = INSTAGRAM_DIMENSIONS[aspectRatio];
  const sliceWidth = image.naturalHeight * (targetDimensions.width / targetDimensions.height);
  
  return {
    originalWidth: image.naturalWidth,
    originalHeight: image.naturalHeight,
    sliceCount,
    sliceWidth: Math.round(sliceWidth),
  };
}
