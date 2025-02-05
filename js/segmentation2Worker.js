self.onmessage = function(e) {
    const { imageData, value, clickedPoints, lines, debugMode } = e.data;
    const result = segmentImage(imageData, value);
    self.postMessage({ imageData: result });
};

function segmentImage(imageData, threshold = 30) {
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
                if (segment.length >= 100) { // minArea = 100
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
    
    const luminanceThreshold = 0.2;
    
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