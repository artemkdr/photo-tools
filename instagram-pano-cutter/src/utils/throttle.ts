export function throttle<F extends (...args: unknown[]) => unknown>(
    func: F,
    limit: number,
) {
    let inThrottle: boolean;
    return (...args: Parameters<F>): void => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}
