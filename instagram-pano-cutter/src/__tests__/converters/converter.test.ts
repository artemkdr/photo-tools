import { describe, it, expect } from "vitest";
import { convertToBlob } from "../../components/image-uploader/converters/converter";

describe("convertToBlob", () => {
	it("should reject unsupported file types", async () => {
		const unsupportedFile = new File(["content"], "test.txt", {
			type: "text/plain",
		});

		await expect(
			convertToBlob(unsupportedFile, { quality: 0.95 }),
		).rejects.toThrow(/Unsupported file type/);
	});

	it("should reject files with unsupported extensions", async () => {
		const unsupportedFile = new File(["content"], "video.mp4", {
			type: "video/mp4",
		});

		await expect(
			convertToBlob(unsupportedFile, { quality: 0.95 }),
		).rejects.toThrow(/Unsupported file type/);
	});

	it("should accept JPEG files", async () => {
		const jpegFile = new File(["fake-jpeg-content"], "photo.jpg", {
			type: "image/jpeg",
		});

		// This will fail during processing but should pass type validation
		await expect(
			convertToBlob(jpegFile, { quality: 0.95 }),
		).rejects.toThrow(/Failed to load image/);
	});

	it("should accept PNG files", async () => {
		const pngFile = new File(["fake-png-content"], "image.png", {
			type: "image/png",
		});

		await expect(convertToBlob(pngFile, { quality: 0.95 })).rejects.toThrow(
			/Failed to load image/,
		);
	});

	it("should handle file extension-based detection for supported formats", async () => {
		// Test with a file that has supported extension but generic MIME type
		const fileWithExtension = new File(
			["content"],
			"photo.jpg",
			{ type: "application/octet-stream" }, // Generic MIME type
		);

		// Should pass type validation since extension is .jpg
		await expect(
			convertToBlob(fileWithExtension, { quality: 0.95 }),
		).rejects.toThrow(/Failed to load image/);
	});

	it("should recognize HEIC files by extension", async () => {
		const heicFile = new File(["fake-heic-content"], "photo.heic", {
			type: "image/heic",
		});

		// Should attempt HEIC conversion (will fail due to fake content)
		await expect(
			convertToBlob(heicFile, { quality: 0.95 }),
		).rejects.toThrow(/Failed to load image/);
	});

	it("should recognize TIFF files by extension", async () => {
		const tiffFile = new File(["fake-tiff-content"], "photo.tiff", {
			type: "image/tiff",
		});

		// Should attempt TIFF conversion (will fail due to fake content)
		await expect(
			convertToBlob(tiffFile, { quality: 0.95 }),
		).rejects.toThrow(/Failed to load image/);
	});

	it("should accept configuration options", async () => {
		const jpegFile = new File(["fake-content"], "test.jpg", {
			type: "image/jpeg",
		});

		const config = {
			quality: 0.8,
			format: "image/jpeg" as const,
			maxWidth: 1920,
			maxHeight: 1080,
		};

		await expect(convertToBlob(jpegFile, config)).rejects.toThrow(
			/Failed to load image/,
		);
	});
});
