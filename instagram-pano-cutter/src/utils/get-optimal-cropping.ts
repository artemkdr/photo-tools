export function getOptimalCropping(
    imageWidth: number,
    imageHeight: number,
    targetRatio: number,
) {
    const originalRatio = imageWidth / imageHeight;

    // 1. Calculate ideal (non-integer) number of slices
    const idealSliceCount = originalRatio / targetRatio;

    // 2. Identify candidates (Floor and Ceil), ensuring at least 1 slice
    const minSliceCount = Math.max(1, Math.floor(idealSliceCount));
    const maxSliceCount = Math.max(1, Math.ceil(idealSliceCount));

    // 3. Helper to calculate efficiency (Retained Area Percentage)
    // Logic: Efficiency is simply the ratio of smallAspectRatio / largeAspectRatio
    const getEfficiency = (c: number): number => {
        const totalAspectRatio = c * targetRatio;
        if (totalAspectRatio === 0) return 0;
        return Math.min(
            totalAspectRatio / originalRatio,
            originalRatio / totalAspectRatio,
        );
    };

    // 4. Compare Candidates
    const minSliceEfficiency = getEfficiency(minSliceCount);
    const maxSliceEfficiency = getEfficiency(maxSliceCount);

    // Pick the winner (Highest Efficiency)
    // If equal, prefer fewer slices (cLow) for simplicity, or cHigh for more content.
    // Here we default to the higher score.
    const bestSliceCount =
        minSliceEfficiency >= maxSliceEfficiency
            ? minSliceCount
            : maxSliceCount;

    // 5. Calculate Crop Dimensions based on the Winner
    const bestAspectRatio = bestSliceCount * targetRatio;
    let cropW: number;
    let cropH: number;

    if (originalRatio > bestAspectRatio) {
        // Original is wider than target -> Height constrained (Match Height)
        cropH = imageHeight;
        cropW = imageHeight * bestAspectRatio;
    } else {
        // Original is taller/narrower -> Width constrained (Match Width)
        cropW = imageWidth;
        cropH = imageWidth / bestAspectRatio;
    }

    // 6. Calculate Centering Coordinates
    const x = (imageWidth - cropW) / 2;
    const y = (imageHeight - cropH) / 2;

    return {
        sliceCount: bestSliceCount,
        cropWidth: Math.round(cropW),
        cropHeight: Math.round(cropH),
        x: Math.round(x),
        y: Math.round(y),
    };
}
