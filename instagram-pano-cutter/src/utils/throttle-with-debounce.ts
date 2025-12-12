// throttle with debounce: throttle calls func at most once every limit ms,
// but also ensure that the last call is executed after the limit period
import { throttle } from "./throttle";
export function throttleWithDebounce<F extends (...args: unknown[]) => unknown>(
    func: F,
    limit: number,
) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const throttledFunc = throttle(func, limit);
    return (...args: Parameters<F>): void => {
        throttledFunc(...args);
        // Set a timeout to ensure the last call is executed after the limit period
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func(...args);
            timeoutId = null;
        }, limit);
    };
}
