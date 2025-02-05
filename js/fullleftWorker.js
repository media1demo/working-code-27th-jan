// Placeholder for fullleftWorker.js
self.onmessage = function(e) {
    const { imageData, value , selectedRegions} = e.data;
    const width = imageData.width;
    const height = imageData.height;

    const newImageData = new ImageData(width, height);

    // Animation parameters
    const cycleLength = 1.0; // Full cycle of run animation
    const t = (value % cycleLength) / cycleLength; // Normalized time within cycle
    const frames = 10; // Number of distinct poses in run cycle
    const currentFrame = Math.floor(t * frames);

    // Character dimensions (adjust based on your sprite)
    const charWidth = width / 5; // Assuming 5 frames fit horizontally
    const charHeight = height;

    // Movement parameters
    const bounceHeight = charHeight * 0.1;
    const strideLength = charWidth * 0.5;
    const leanAngle = 10 * (Math.PI / 180); // Max lean angle in radians

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sourceX = x;
            let sourceY = y;

            // Calculate character's current position
            const charCenterX = (width + charWidth) * t - charWidth / 2;
            const charLeft = charCenterX - charWidth / 2;
            const charRight = charCenterX + charWidth / 2;

            if (x >= charLeft && x < charRight) {
                // We're within the character bounds, apply deformations

                // Normalize x and y within character bounds
                const localX = (x - charLeft) / charWidth;
                const localY = y / charHeight;

                // Vertical bounce
                sourceY += Math.sin(t * Math.PI * 2) * bounceHeight;

                // Forward lean
                const leanAmount = Math.sin(t * Math.PI * 2) * leanAngle;
                const xOffset = (localY - 0.5) * Math.sin(leanAmount) * charWidth;
                const yOffset = (localY - 0.5) * (1 - Math.cos(leanAmount)) * charHeight;
                sourceX += xOffset;
                sourceY += yOffset;

                // Limb movement (simplified)
                if (localY > 0.5) { // Lower body
                    sourceX += Math.sin((t + localY) * Math.PI * 2) * strideLength * (localY - 0.5) * 2;
                } else { // Upper body
                    sourceX += Math.sin((t + localY + 0.5) * Math.PI * 2) * strideLength * (0.5 - localY) * 2;
                }

                // Map back to full image coordinates
                sourceX += charLeft;
            } else {
                // Outside character bounds, create simple scrolling background effect
                sourceX = (x + width * t) % width;
            }

            // Ensure sourceX and sourceY are within bounds
            sourceX = Math.max(0, Math.min(width - 1, sourceX));
            sourceY = Math.max(0, Math.min(height - 1, sourceY));

            const sourceIndex = (Math.floor(sourceY) * width + Math.floor(sourceX)) * 4;
            const targetIndex = (y * width + x) * 4;

            // Copy pixel data
            for (let i = 0; i < 4; i++) {
                newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
            }
        }
    }

    // self.postMessage({ imageData: newImageData });
    self.postMessage({
        segmentedImages: [newImageData],
        isComplete: true
    });
};