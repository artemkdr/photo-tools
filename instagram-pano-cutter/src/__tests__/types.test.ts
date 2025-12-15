import { describe, expect, it } from "vitest";
import { isHeicMimeType, isTiffMimeType } from "../types";

describe("Type Helper Functions", () => {
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
