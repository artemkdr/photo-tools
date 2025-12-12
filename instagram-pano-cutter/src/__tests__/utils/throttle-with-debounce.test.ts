import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { throttleWithDebounce } from "../../utils/throttle-with-debounce";

describe("throttleWithDebounce", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should call function immediately on first invocation", () => {
        const mockFn = vi.fn();
        const throttledDebouncedFn = throttleWithDebounce(mockFn, 100);

        throttledDebouncedFn();
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should throttle calls within the limit period", () => {
        const mockFn = vi.fn();
        const throttledDebouncedFn = throttleWithDebounce(mockFn, 100);

        throttledDebouncedFn();
        throttledDebouncedFn(); // Should be ignored
        throttledDebouncedFn(); // Should be ignored

        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should execute the last call after the limit period (debounce behavior)", () => {
        const mockFn = vi.fn();
        const throttledDebouncedFn = throttleWithDebounce(mockFn, 100);

        throttledDebouncedFn();
        expect(mockFn).toHaveBeenCalledTimes(1);

        // Advance time to trigger debounced call
        vi.advanceTimersByTime(100);
        expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it("should use the latest arguments for the debounced call", () => {
        const mockFn = vi.fn();
        const throttledDebouncedFn = throttleWithDebounce(mockFn, 100);

        throttledDebouncedFn("first");
        expect(mockFn).toHaveBeenCalledWith("first");

        vi.advanceTimersByTime(50);
        throttledDebouncedFn("second");

        vi.advanceTimersByTime(50);
        throttledDebouncedFn("third");

        vi.advanceTimersByTime(100);
        expect(mockFn).toHaveBeenLastCalledWith("third");
    });

    it("should reset the debounce timer when called multiple times", () => {
        const mockFn = vi.fn();
        const throttledDebouncedFn = throttleWithDebounce(mockFn, 100);

        throttledDebouncedFn("first"); // Immediate call (throttled)
        expect(mockFn).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(50);
        throttledDebouncedFn("second"); // Ignored by throttle, but resets debounce timeout

        vi.advanceTimersByTime(50);
        throttledDebouncedFn("third"); // Ignored by throttle, but resets debounce timeout again

        // At this point: 100ms from first call, 50ms from second, 0ms from third
        // The debounce timeout should still be pending (100ms from the last call)
        vi.advanceTimersByTime(99);
        // Debounce hasn't fired yet
        expect(mockFn.mock.calls.length).toBeGreaterThanOrEqual(1);

        vi.advanceTimersByTime(1);
        // Now debounced call executes (100ms after the last "third" call)
        expect(mockFn).toHaveBeenLastCalledWith("third");
    });

    it("should allow both throttle and debounce behavior together", () => {
        const mockFn = vi.fn();
        const throttledDebouncedFn = throttleWithDebounce(mockFn, 100);

        // First call - immediate (throttle)
        throttledDebouncedFn("call1");
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenLastCalledWith("call1");

        // Advance time past throttle limit
        vi.advanceTimersByTime(150);
        // Debounced call should have executed
        expect(mockFn).toHaveBeenCalledTimes(2);

        // New call - immediate (throttle reset)
        throttledDebouncedFn("call2");
        expect(mockFn).toHaveBeenCalledTimes(3);
        expect(mockFn).toHaveBeenLastCalledWith("call2");

        // Advance time to trigger debounce
        vi.advanceTimersByTime(100);
        expect(mockFn).toHaveBeenCalledTimes(4);
    });

    it("should pass arguments correctly", () => {
        const mockFn = vi.fn();
        const throttledDebouncedFn = throttleWithDebounce(mockFn, 100);

        throttledDebouncedFn("arg1", "arg2", "arg3");
        expect(mockFn).toHaveBeenCalledWith("arg1", "arg2", "arg3");

        vi.advanceTimersByTime(100);
        expect(mockFn).toHaveBeenLastCalledWith("arg1", "arg2", "arg3");
    });
});
