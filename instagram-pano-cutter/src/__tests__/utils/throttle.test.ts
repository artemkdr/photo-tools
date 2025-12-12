import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { throttle } from "../../utils/throttle";

describe("throttle", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should call function immediately on first invocation", () => {
        const mockFn = vi.fn();
        const throttledFn = throttle(mockFn, 100);

        throttledFn();
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should not call function again within throttle period", () => {
        const mockFn = vi.fn();
        const throttledFn = throttle(mockFn, 100);

        throttledFn();
        throttledFn();
        throttledFn();

        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should allow function to be called again after throttle period", () => {
        const mockFn = vi.fn();
        const throttledFn = throttle(mockFn, 100);

        throttledFn();
        expect(mockFn).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(100);

        throttledFn();
        expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it("should pass arguments to the throttled function", () => {
        const mockFn = vi.fn();
        const throttledFn = throttle(mockFn, 100);

        throttledFn("arg1", "arg2");
        expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
    });

    it("should ignore intermediate calls during throttle period", () => {
        const mockFn = vi.fn();
        const throttledFn = throttle(mockFn, 100);

        throttledFn("first");
        expect(mockFn).toHaveBeenCalledWith("first");

        vi.advanceTimersByTime(50);
        throttledFn("second"); // should be ignored

        vi.advanceTimersByTime(50);
        throttledFn("third"); // should be executed

        expect(mockFn).toHaveBeenCalledTimes(2);
        expect(mockFn).toHaveBeenLastCalledWith("third");
    });
});
