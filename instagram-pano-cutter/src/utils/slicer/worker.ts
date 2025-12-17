import type { SliceConfig } from "../../types";
import { CanvasFactory } from "../canvas-factory";
import { sliceImage } from "./slicer";

/**
 * Worker wrapper of slicer
 *
 * Event data:
 * {
 *   type: "slice",
 *   imageBitmap: ImageBitmap,
 *   config: SliceConfig,
 *   id: string; // unique request id in order to match response
 * }
 *
 * Post message data:
 * {
 *   success: boolean;
 *   id: string; // matches request id
 *   type: "slice";
 *   result?: SliceResult; // if success
 *   error?: string; // if !success
 * }
 */
const canvasFactory = new CanvasFactory();

self.onmessage = async (event: MessageEvent) => {
    if (event.data.type !== "slice") return;

    const { imageBitmap, config } = event.data as {
        imageBitmap: ImageBitmap;
        config: SliceConfig;
    };

    try {
        const sliceResult = await sliceImage(
            imageBitmap,
            config,
            canvasFactory,
        );
        postMessage(
            {
                success: true,
                type: "slice",
                result: sliceResult,
                id: event.data.id,
            },
            {
                // transfer ImageBitmaps rights to main thread
                transfer: sliceResult.slices,
            },
        );
    } catch (e) {
        postMessage({
            id: event.data.id,
            success: false,
            type: "slice",
            error: (e as Error).message,
        });
    } finally {
        imageBitmap.close();
    }
};
