self.onmessage = function(e) {
    const { imageData, threshold, evaluate, minArea } = e.data;
    const result = segmentImage(imageData, threshold, minArea);
    
    if (evaluate) {
        const score = evaluateSegmentation(result);
        self.postMessage({ segmentedData: result, threshold: threshold, score: score });
    } else {
        self.postMessage({ segmentedData: result });
    }
};

function segmentImage(imageData, threshold = 30, minArea = 100) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const segmentedData = new Uint8ClampedArray(data.length);
    const visited = new Uint8Array(width * height);
    const segments = [];
    
    const thresholdSquared = threshold * threshold;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = y * width + x;
            if (!visited[index]) {
                const segment = floodFill(data, segmentedData, width, height, x, y, thresholdSquared, visited);
                if (segment.length >= minArea) {
                    segments.push(segment);
                }
            }
        }
    }

    segments.forEach((segment) => {
        const color = new Uint8Array([
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            255
        ]);
        for (let i = 0; i < segment.length; i++) {
            const idx = segment[i] * 4;
            segmentedData.set(color, idx);
        }
    });
    
    // Fill unsegmented areas with original image data
    for (let i = 0; i < segmentedData.length; i += 4) {
        if (segmentedData[i + 3] === 0) {
            segmentedData.set(data.slice(i, i + 4), i);
        }
    }
    
    return new ImageData(segmentedData, width, height);
}

function floodFill(data, segmentedData, width, height, x, y, thresholdSquared, visited) {
    const stack = [[x, y]];
    const segment = [];
    const baseColor = new Uint8Array([
        data[(y * width + x) * 4],
        data[(y * width + x) * 4 + 1],
        data[(y * width + x) * 4 + 2]
    ]);
    
    const luminanceThreshold = 0.2; // Adjust this value to control shadow tolerance
    
    while (stack.length) {
        const [cx, cy] = stack.pop();
        const index = cy * width + cx;
        
        if (visited[index]) continue;
        visited[index] = 1;
        
        const pixelIndex = index * 4;
        const currentColor = [data[pixelIndex], data[pixelIndex + 1], data[pixelIndex + 2]];
        
        if (isColorSimilar(baseColor, currentColor, thresholdSquared, luminanceThreshold)) {
            segment.push(index);
            
            if (cx > 0) stack.push([cx - 1, cy]);
            if (cx < width - 1) stack.push([cx + 1, cy]);
            if (cy > 0) stack.push([cx, cy - 1]);
            if (cy < height - 1) stack.push([cx, cy + 1]);
        }
    }
    
    return segment;
}

function isColorSimilar(c1, c2, thresholdSquared, luminanceThreshold) {
    const colorDistance = colorDistanceSquared(c1, c2);
    if (colorDistance < thresholdSquared) return true;
    
    const l1 = getLuminance(c1);
    const l2 = getLuminance(c2);
    const luminanceDiff = Math.abs(l1 - l2);
    
    return luminanceDiff < luminanceThreshold;
}

function colorDistanceSquared(c1, c2) {
    const dr = c1[0] - c2[0];
    const dg = c1[1] - c2[1];
    const db = c1[2] - c2[2];
    return dr * dr + dg * dg + db * db;
}

function getLuminance(color) {
    return (0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2]) / 255;
}



function evaluateSegmentation(segmentedData) {
    const segments = new Map();
    const totalPixels = segmentedData.width * segmentedData.height;

    // Count pixels in each segment
    for (let i = 0; i < segmentedData.data.length; i += 4) {
        const color = `${segmentedData.data[i]},${segmentedData.data[i+1]},${segmentedData.data[i+2]}`;
        segments.set(color, (segments.get(color) || 0) + 1);
    }

    const segmentSizes = Array.from(segments.values());
    const minSize = Math.min(...segmentSizes);
    const maxSize = Math.max(...segmentSizes);

    // Calculate score based on segment size distribution
    const sizeRange = maxSize - minSize;
    const avgSize = totalPixels / segments.size;
    const sizeVariance = segmentSizes.reduce((acc, size) => acc + Math.pow(size - avgSize, 2), 0) / segments.size;

    // Lower score is better
    return sizeRange + sizeVariance / avgSize;
}
