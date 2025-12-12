import { describe, it, expect } from "vitest";
import { generateBaseName } from "../../utils/download";

describe("generateBaseName", () => {
	it("should remove file extension", () => {
		expect(generateBaseName("photo.jpg")).toBe("photo");
		expect(generateBaseName("image.png")).toBe("image");
		expect(generateBaseName("picture.jpeg")).toBe("picture");
	});

	it("should handle multiple dots in filename", () => {
		expect(generateBaseName("my.photo.jpg")).toBe("my_photo");
		expect(generateBaseName("test.file.name.png")).toBe("test_file_name");
	});

	it("should sanitize special characters", () => {
		expect(generateBaseName("photo with spaces.jpg")).toBe(
			"photo_with_spaces",
		);
		expect(generateBaseName("my@photo#2024!.png")).toBe("my_photo_2024_");
		expect(generateBaseName("photo(1).jpg")).toBe("photo_1_");
	});

	it("should preserve alphanumeric, hyphens, and underscores", () => {
		expect(generateBaseName("my-photo_123.jpg")).toBe("my-photo_123");
		expect(generateBaseName("Test-File_2024.png")).toBe("Test-File_2024");
	});

	it("should handle filename without extension", () => {
		expect(generateBaseName("photoname")).toBe("photoname");
	});

	it("should handle empty string edge case", () => {
		expect(generateBaseName("")).toBe("");
	});

	it("should handle filename with only extension", () => {
		expect(generateBaseName(".jpg")).toBe("");
	});

	it("should convert complex filenames", () => {
		expect(generateBaseName("Vacation 2024 - Beach (Day 1).heic")).toBe(
			"Vacation_2024_-_Beach__Day_1_",
		);
	});

	it("should handle unicode characters", () => {
		expect(generateBaseName("фото.jpg")).toBe("____");
		expect(generateBaseName("照片.png")).toBe("__");
	});

	it("should handle filenames with forward slashes", () => {
		expect(generateBaseName("folder/photo.jpg")).toBe("folder_photo");
	});
});
