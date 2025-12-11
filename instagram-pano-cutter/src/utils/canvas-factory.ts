export class CanvasFactory {
    private static canvasPool: HTMLCanvasElement[] = [];

    static getCanvas(
        width: number,
        height: number,
        key?: string,
    ): HTMLCanvasElement {
        let canvas: HTMLCanvasElement | undefined = CanvasFactory.canvasPool.find((c) =>
            key ? c.getAttribute("data-canvas-key") === key : false,
        );
        if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            canvas.setAttribute("data-canvas-key", key || "");
            CanvasFactory.canvasPool.push(canvas);
            console.log(
                `Created new canvas ${width}x${height}, pool size: ${CanvasFactory.canvasPool.length}`,
            );
        }
        return canvas;
    }

    static cleanCanvas(canvas: HTMLCanvasElement): void {
        // Optionally clear the canvas before releasing
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
}
