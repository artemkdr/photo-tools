import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { debounce } from "../../utils/debounce";

describe("debounce", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should call function after wait time", () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn, 100);

		debouncedFn();
		expect(mockFn).not.toHaveBeenCalled();

		vi.advanceTimersByTime(100);
		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	it("should delay function call if called multiple times", () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn, 100);

		debouncedFn();
		vi.advanceTimersByTime(50);
		debouncedFn();
		vi.advanceTimersByTime(50);

		expect(mockFn).not.toHaveBeenCalled();

		vi.advanceTimersByTime(50);
		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	it("should pass arguments to the debounced function", () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn, 100);

		debouncedFn("arg1", "arg2");
		vi.advanceTimersByTime(100);

		expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
	});

	it("should only call function once when invoked multiple times within wait period", () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn, 100);

		debouncedFn();
		debouncedFn();
		debouncedFn();

		vi.advanceTimersByTime(100);
		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	it("should use the latest arguments when called multiple times", () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn, 100);

		debouncedFn("first");
		vi.advanceTimersByTime(50);
		debouncedFn("second");
		vi.advanceTimersByTime(50);
		debouncedFn("third");

		vi.advanceTimersByTime(100);
		expect(mockFn).toHaveBeenCalledWith("third");
		expect(mockFn).toHaveBeenCalledTimes(1);
	});
});
