// debounce
export function debounce<F extends (...args: unknown[]) => unknown>(
    func: F,
    waitFor: number,
) {
    let timeout: number | null = null;
    return (...args: Parameters<F>): void => {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = window.setTimeout(() => {
            func(...args);
            timeout = null;
        }, waitFor);
    };
}
