import { describe, it, expect } from "vitest";
import {
    isSupportedImageType,
    isSupportedExtension,
    isHeicMimeType,
    isTiffMimeType,
} from "../types";

describe("Type Helper Functions", () => {
    describe("isSupportedImageType", () => {
        it("should return true for supported MIME types", () => {
            expect(isSupportedImageType("image/jpeg")).toBe(true);
            expect(isSupportedImageType("image/png")).toBe(true);
            expect(isSupportedImageType("image/gif")).toBe(true);
            expect(isSupportedImageType("image/webp")).toBe(true);
            expect(isSupportedImageType("image/avif")).toBe(true);
            expect(isSupportedImageType("image/bmp")).toBe(true);
            expect(isSupportedImageType("image/tiff")).toBe(true);
        });

        it("should return false for unsupported MIME types", () => {
            expect(isSupportedImageType("image/svg+xml")).toBe(false);
            expect(isSupportedImageType("text/plain")).toBe(false);
            expect(isSupportedImageType("application/pdf")).toBe(false);
            expect(isSupportedImageType("")).toBe(false);
        });

        it("should return true for RAW format MIME types", () => {
            expect(isSupportedImageType("image/x-canon-cr2")).toBe(true);
            expect(isSupportedImageType("image/octet-stream")).toBe(true);
        });
    });

    describe("isSupportedExtension", () => {
        it("should return true for common image extensions", () => {
            expect(isSupportedExtension("photo.jpg")).toBe(true);
            expect(isSupportedExtension("image.jpeg")).toBe(true);
            expect(isSupportedExtension("picture.png")).toBe(true);
            expect(isSupportedExtension("animation.gif")).toBe(true);
            expect(isSupportedExtension("modern.webp")).toBe(true);
            expect(isSupportedExtension("new.avif")).toBe(true);
        });

        it("should return true for HEIC/HEIF extensions", () => {
            expect(isSupportedExtension("photo.heic")).toBe(true);
            expect(isSupportedExtension("image.heif")).toBe(true);
        });

        it("should return true for TIFF and RAW extensions", () => {
            expect(isSupportedExtension("image.tif")).toBe(true);
            expect(isSupportedExtension("photo.tiff")).toBe(true);
            expect(isSupportedExtension("raw.dng")).toBe(true);
            expect(isSupportedExtension("nikon.nef")).toBe(true);
            expect(isSupportedExtension("pentax.pef")).toBe(true);
            expect(isSupportedExtension("sony.arw")).toBe(true);
        });

        it("should be case-insensitive", () => {
            expect(isSupportedExtension("photo.JPG")).toBe(true);
            expect(isSupportedExtension("image.PNG")).toBe(true);
            expect(isSupportedExtension("file.HEIC")).toBe(true);
        });

        it("should return false for unsupported extensions", () => {
            expect(isSupportedExtension("document.pdf")).toBe(false);
            expect(isSupportedExtension("video.mp4")).toBe(false);
            expect(isSupportedExtension("file.txt")).toBe(false);
            expect(isSupportedExtension("noextension")).toBe(false);
        });

        it("should handle filenames with multiple dots", () => {
            expect(isSupportedExtension("my.photo.jpg")).toBe(true);
            expect(isSupportedExtension("file.backup.png")).toBe(true);
        });
    });

    describe("isHeicMimeType", () => {
        it("should return true for HEIC MIME types", () => {
            expect(isHeicMimeType("image/heic")).toBe(true);
            expect(isHeicMimeType("image/heif")).toBe(true);
        });

        it("should return true for HEIC extensions", () => {
            expect(isHeicMimeType(".heic")).toBe(true);
            expect(isHeicMimeType(".heif")).toBe(true);
        });

        it("should be case-insensitive", () => {
            expect(isHeicMimeType("image/HEIC")).toBe(true);
            expect(isHeicMimeType(".HEIC")).toBe(true);
            expect(isHeicMimeType("IMAGE/HEIF")).toBe(true);
        });

        it("should return false for non-HEIC formats", () => {
            expect(isHeicMimeType("image/jpeg")).toBe(false);
            expect(isHeicMimeType(".jpg")).toBe(false);
            expect(isHeicMimeType("image/png")).toBe(false);
            expect(isHeicMimeType("")).toBe(false);
        });
    });

    describe("isTiffMimeType", () => {
        it("should return true for TIFF MIME type", () => {
            expect(isTiffMimeType("image/tiff")).toBe(true);
        });

        it("should return true for TIFF extensions", () => {
            expect(isTiffMimeType(".tif")).toBe(true);
            expect(isTiffMimeType(".tiff")).toBe(true);
        });

        it("should return true for TIFF-based RAW formats", () => {
            expect(isTiffMimeType(".dng")).toBe(true);
            expect(isTiffMimeType(".pef")).toBe(true);
            expect(isTiffMimeType(".nef")).toBe(true);
            expect(isTiffMimeType(".nrw")).toBe(true);
        });

        it("should return true for proprietary TIFF formats", () => {
            expect(isTiffMimeType(".svs")).toBe(true);
            expect(isTiffMimeType(".ndpi")).toBe(true);
            expect(isTiffMimeType(".mrxs")).toBe(true);
            expect(isTiffMimeType(".scn")).toBe(true);
        });

        it("should be case-insensitive", () => {
            expect(isTiffMimeType("IMAGE/TIFF")).toBe(true);
            expect(isTiffMimeType(".TIFF")).toBe(true);
            expect(isTiffMimeType(".DNG")).toBe(true);
        });

        it("should return false for non-TIFF formats", () => {
            expect(isTiffMimeType("image/jpeg")).toBe(false);
            expect(isTiffMimeType(".jpg")).toBe(false);
            expect(isTiffMimeType(".heic")).toBe(false);
            expect(isTiffMimeType("")).toBe(false);
        });
    });
});
