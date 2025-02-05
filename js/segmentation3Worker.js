self.onmessage = function(e) {
    const { imageData, value, clickedPoints, lines, debugMode } = e.data;
    
    try {
        const result = segmentImage(imageData, value);
        self.postMessage({ imageData: result });
    } catch (error) {
        self.postMessage({ error: error.message });
    }
};

function segmentImage(imageData, threshold = 30) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const segmentedData = new Uint8ClampedArray(data.length);
    const visited = new Uint8Array(width * height);
    const segments = [];

    const hueThreshold = 30; // in degrees
    const saturationThreshold = 0.3;
    const valueThreshold = 0.4;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = y * width + x;
            if (!visited[index]) {
                const segment = floodFill(data, segmentedData, width, height, x, y, hueThreshold, saturationThreshold, valueThreshold, visited);
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

function floodFill(data, segmentedData, width, height, x, y, hueThreshold, saturationThreshold, valueThreshold, visited) {
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

function isColorSimilarHSV(hsv1, hsv2, hueThreshold, saturationThreshold, valueThreshold) {
    const hueDiff = Math.abs(hsv1[0] - hsv2[0]);
    const hueDiffWrapped = Math.min(hueDiff, 360 - hueDiff);
    const saturationDiff = Math.abs(hsv1[1] - hsv2[1]);
    const valueDiff = Math.abs(hsv1[2] - hsv2[2]);

    return hueDiffWrapped <= hueThreshold &&
           saturationDiff <= saturationThreshold &&
           valueDiff <= valueThreshold;
}

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
            case r:
                h = (g - b) / diff + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / diff + 2;
                break;
            case b:
                h = (r - g) / diff + 4;
                break;
        }
        h /= 6;
    }

    return [h * 360, s, v];
}