// Placeholder for leftrightVRWorker.js

function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h, s, v = max;
    s = max === 0 ? 0 : diff / max;

    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / diff + (g < b ? 6 : 0); break;
            case g: h = (b - r) / diff + 2; break;
            case b: h = (r - g) / diff + 4; break;
        }
        h /= 6;
    }
    return [h * 360, s, v];
}

function isColorSimilarHSV(hsv1, hsv2, hueThreshold, saturationThreshold, valueThreshold) {
    const hueDiff = Math.abs(hsv1[0] - hsv2[0]);
    const hueDiffWrapped = Math.min(hueDiff, 360 - hueDiff);
    const saturationDiff = Math.abs(hsv1[1] - hsv2[1]);
    const valueDiff = Math.abs(hsv1[2] - hsv2[2]);

    return hueDiffWrapped <= hueThreshold &&
           saturationDiff <= saturationThreshold &&
           valueDiff <= valueThreshold;
}

function floodFill(data, width, height, x, y, hueThreshold, saturationThreshold, valueThreshold, visited) {
    const stack = [[x, y]];
    const segment = [];
    const baseColor = new Uint8Array([
        data[(y * width + x) * 4],
        data[(y * width + x) * 4 + 1],
        data[(y * width + x) * 4 + 2]
    ]);
    const baseHSV = rgbToHsv(baseColor[0], baseColor[1], baseColor[2]);

    while (stack.length) {
        const [cx, cy] = stack.pop();
        const index = cy * width + cx;

        if (visited[index]) continue;
        visited[index] = 1;

        const pixelIndex = index * 4;
        const currentColor = [data[pixelIndex], data[pixelIndex + 1], data[pixelIndex + 2]];
        const currentHSV = rgbToHsv(currentColor[0], currentColor[1], currentColor[2]);

        if (isColorSimilarHSV(baseHSV, currentHSV, hueThreshold, saturationThreshold, valueThreshold)) {
            segment.push(index);

            if (cx > 0) stack.push([cx - 1, cy]);
            if (cx < width - 1) stack.push([cx + 1, cy]);
            if (cy > 0) stack.push([cx, cy - 1]);
            if (cy < height - 1) stack.push([cx, cy + 1]);
        }
    }

    return segment;
}

function applyLeftRightMovement(imageData, segment, value, width, height) {
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );

    // Determine movement direction and magnitude
    const movementDirection = value > 0.5 ? 1 : -1;
    const movementIntensity = Math.abs(value - 0.5) * 2;
    const maxDisplacement = Math.floor(width * 0.1 * movementIntensity);

    // Calculate displacement for the segment
    const displacementMap = new Float32Array(width * height * 2);

    segment.forEach(pixelIndex => {
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        
        const index = pixelIndex * 2;
        displacementMap[index] = maxDisplacement * movementDirection;
        displacementMap[index + 1] = 0;
    });

    // Apply displacement with bilinear interpolation
    const tempBuffer = new Uint8ClampedArray(imageData.data);
    
    segment.forEach(pixelIndex => {
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        const index = pixelIndex * 2;
        
        const dx = displacementMap[index];
        const dy = displacementMap[index + 1];
        
        if (dx !== 0 || dy !== 0) {
            const sourceX = x + dx;
            const sourceY = y + dy;
            
            if (sourceX >= 0 && sourceX < width - 1 && 
                sourceY >= 0 && sourceY < height - 1) {
                
                const x1 = Math.floor(sourceX);
                const y1 = Math.floor(sourceY);
                const x2 = x1 + 1;
                const y2 = y1 + 1;
                
                const fx = sourceX - x1;
                const fy = sourceY - y1;
                
                const targetIndex = pixelIndex * 4;
                const i11 = (y1 * width + x1) * 4;
                const i12 = (y2 * width + x1) * 4;
                const i21 = (y1 * width + x2) * 4;
                const i22 = (y2 * width + x2) * 4;
                
                for (let c = 0; c < 4; c++) {
                    const value =
                        tempBuffer[i11 + c] * (1 - fx) * (1 - fy) +
                        tempBuffer[i21 + c] * fx * (1 - fy) +
                        tempBuffer[i12 + c] * (1 - fx) * fy +
                        tempBuffer[i22 + c] * fx * fy;
                    
                    newImageData.data[targetIndex + c] = value;
                }
            }
        }
    });

    return newImageData;
}

self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const width = imageData.width;
    const height = imageData.height;
    
    try {
        const visited = new Uint8Array(width * height);
        const segments = [];
        const hueThreshold = 30;
        const saturationThreshold = 0.3;
        const valueThreshold = 0.4;

        // Find segments
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = y * width + x;
                if (!visited[index]) {
                    const segment = floodFill(
                        imageData.data,
                        width,
                        height,
                        x,
                        y,
                        hueThreshold,
                        saturationThreshold,
                        valueThreshold,
                        visited
                    );
                    if (segment.length >= 350) {
                        segments.push(segment);
                    }
                }
            }
        }

        // Apply left-right movement to each segment
        let resultImageData = imageData;
        segments.forEach(segment => {
            resultImageData = applyLeftRightMovement(resultImageData, segment, value || 0.5, width, height);
        });

        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};