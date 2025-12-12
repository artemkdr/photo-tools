/**
 * Worker wrapper of converter
 *
 * Event data:
 * {
 *   type: "convert",
 *   file: File,
 *   config: {
 *     quality?: number; // 0 to 1
 *     format?: "image/jpeg" | "image/png" | "image/webp";
 *     maxWidth?: number;
 *     maxHeight?: number;
 *   }
 * }
 *
 * Post message data:
 * {
 *   success: boolean;
 *   type: "convert";
 *   blob?: Blob; // if success
 *   error?: string; // if !success
 * }
 */
self.onmessage = async (event: MessageEvent) => {
    if (event.data.type !== "convert") return;

    const { file, config } = event.data as {
        file: File;
        config: {
            quality?: number; // 0 to 1
            format?: "image/jpeg" | "image/png" | "image/webp";
            maxWidth?: number;
            maxHeight?: number;
        };
    };
    try {
        // import converter dynamically
        const { convertToBlob } = await import("./converter");
        const resultBlob = await convertToBlob(file, config);
        postMessage({ success: true, type: "convert", blob: resultBlob });
    } catch (e) {
        postMessage({
            success: false,
            type: "convert",
            error: (e as Error).message,
        });
    }
};
