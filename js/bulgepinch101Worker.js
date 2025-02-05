function bulgeDistort(imageData, selectedRegions, value = 0.5) {
    const width = imageData.width;
    const height = imageData.height;
    
    // Create output buffer
    const output = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );

    // Process each selected region
    selectedRegions.forEach(region => {
        // Find region bounds
        let minX = width, minY = height, maxX = 0, maxY = 0;
        region.forEach(idx => {
            const x = idx % width;
            const y = Math.floor(idx / width);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        });

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const radius = Math.max(maxX - minX, maxY - minY) / 2;
        
        // Map value 0-1 to distortion strength -1 to 1
        const strength = (value - 0.5) * 2;

        // Process each pixel in and around the region
        for (let y = minY - radius; y <= maxY + radius; y++) {
            for (let x = minX - radius; x <= maxX + radius; x++) {
                if (x < 0 || x >= width || y < 0 || y >= height) continue;

                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= radius) {
                    // Calculate distortion factor
                    const factor = Math.pow(distance / radius, 1 - strength);
                    const angle = Math.atan2(dy, dx);

                    // Get source pixel
                    const srcX = centerX + Math.cos(angle) * distance * factor;
                    const srcY = centerY + Math.sin(angle) * distance * factor;

                    if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
                        // Simple bilinear interpolation
                        const x1 = Math.floor(srcX);
                        const y1 = Math.floor(srcY);
                        const x2 = Math.min(x1 + 1, width - 1);
                        const y2 = Math.min(y1 + 1, height - 1);

                        const fx = srcX - x1;
                        const fy = srcY - y1;

                        const destIdx = (y * width + x) * 4;
                        const idx11 = (y1 * width + x1) * 4;
                        const idx12 = (y1 * width + x2) * 4;
                        const idx21 = (y2 * width + x1) * 4;
                        const idx22 = (y2 * width + x2) * 4;

                        for (let c = 0; c < 4; c++) {
                            const val11 = imageData.data[idx11 + c];
                            const val12 = imageData.data[idx12 + c];
                            const val21 = imageData.data[idx21 + c];
                            const val22 = imageData.data[idx22 + c];

                            const val = (val11 * (1 - fx) * (1 - fy) +
                                       val12 * fx * (1 - fy) +
                                       val21 * (1 - fx) * fy +
                                       val22 * fx * fy);

                            output.data[destIdx + c] = val;
                        }
                    }
                }
            }
        }
    });

    return output;
}

self.onmessage = function(e) {
    try {
        const { imageData, selectedRegions, value } = e.data;
        const result = bulgeDistort(imageData, selectedRegions, value);
        
        self.postMessage({
            segmentedImages: [result],
            isComplete: true
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};