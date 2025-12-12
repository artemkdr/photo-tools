import { describe, it, expect } from "vitest";
import { getOptimalCropping } from "../../utils/get-optimal-cropping";

describe("getOptimalCropping", () => {
    it("should return correct values for perfect aspect ratio match", () => {
        const result = getOptimalCropping(2160, 1080, 1); // 2:1 ratio, target 1:1
        expect(result.sliceCount).toBe(2);
        expect(result.cropWidth).toBe(2160);
        expect(result.cropHeight).toBe(1080);
        expect(result.x).toBe(0);
        expect(result.y).toBe(0);
    });

    it("should handle single slice for square image with 1:1 ratio", () => {
        const result = getOptimalCropping(1080, 1080, 1);
        expect(result.sliceCount).toBe(1);
        expect(result.cropWidth).toBe(1080);
        expect(result.cropHeight).toBe(1080);
        expect(result.x).toBe(0);
        expect(result.y).toBe(0);
    });

    it("should calculate optimal slicing for wide image", () => {
        const result = getOptimalCropping(3240, 1080, 1); // 3:1 ratio, target 1:1
        expect(result.sliceCount).toBe(3);
        expect(result.cropWidth).toBe(3240);
        expect(result.cropHeight).toBe(1080);
        expect(result.x).toBe(0);
        expect(result.y).toBe(0);
    });

    it("should center crop when image is wider than needed", () => {
        const result = getOptimalCropping(2500, 1080, 1); // Between 2 and 3 slices
        // Should pick either 2 or 3 slices based on efficiency
        expect(result.sliceCount).toBeGreaterThanOrEqual(2);
        expect(result.sliceCount).toBeLessThanOrEqual(3);
        expect(result.x).toBeGreaterThanOrEqual(0);
        expect(result.y).toBe(0);
    });

    it("should handle 4:5 aspect ratio", () => {
        const result = getOptimalCropping(2160, 1080, 0.8); // 2:1 image, 4:5 target
        expect(result.sliceCount).toBeGreaterThanOrEqual(1);
        expect(result.cropWidth).toBeGreaterThan(0);
        expect(result.cropHeight).toBeGreaterThan(0);
    });

    it("should ensure at least 1 slice for very small images", () => {
        const result = getOptimalCropping(500, 1000, 1);
        expect(result.sliceCount).toBeGreaterThanOrEqual(1);
    });

    it("should handle tall images (height > width)", () => {
        const result = getOptimalCropping(1080, 2160, 1);
        expect(result.sliceCount).toBe(1);
        expect(result.cropWidth).toBe(1080);
        expect(result.cropHeight).toBe(1080);
        expect(result.x).toBe(0);
        expect(result.y).toBeGreaterThanOrEqual(0);
    });

    it("should return integer values for crop dimensions", () => {
        const result = getOptimalCropping(1920, 1080, 1.5);
        expect(Number.isInteger(result.cropWidth)).toBe(true);
        expect(Number.isInteger(result.cropHeight)).toBe(true);
        expect(Number.isInteger(result.x)).toBe(true);
        expect(Number.isInteger(result.y)).toBe(true);
    });

    it("should handle edge case with very wide panorama", () => {
        const result = getOptimalCropping(10800, 1080, 1); // 10:1 ratio
        expect(result.sliceCount).toBe(10);
        expect(result.cropWidth).toBe(10800);
        expect(result.cropHeight).toBe(1080);
    });

    it("should center the crop area", () => {
        const result = getOptimalCropping(2000, 1000, 1);
        // For a 2:1 image with 1:1 target, should crop to 2 slices
        // If cropWidth < imageWidth, x should be > 0 (centered)
        if (result.cropWidth < 2000) {
            expect(result.x).toBeGreaterThan(0);
            expect(result.x).toBe(Math.round((2000 - result.cropWidth) / 2));
        }
    });
});
