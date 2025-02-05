// Placeholder for downchangeWorker.js
// Constants
const DEFAULT_CURVE_INTENSITY = 0.5;
const DEFAULT_ITERATIONS = 120;

let currentIteration = 0;

function applyExtendAroundPoints(imageData, value, clickedPoints) {
    const { width, height, data } = imageData;
    const newData = new Uint8ClampedArray(data.length);
    
    if (!clickedPoints || clickedPoints.length === 0) {
        return imageData;
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let maxExtend = 0;
            let closestPoint = null;
            
            clickedPoints.forEach(point => {
                const dx = x - point.x;
                const dy = y - point.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const extend = Math.exp(-distance * 0.005);
                
                if (extend > maxExtend) {
                    maxExtend = extend;
                    closestPoint = point;
                }
            });
            
            if (maxExtend > 0) {
                const extendX = 1 + value.extendX * maxExtend;
                const extendY = 1 + value.extendY * maxExtend;
                
                const sourceX = Math.round(closestPoint.x + (x - closestPoint.x) * extendX);
                const sourceY = Math.round(closestPoint.y + (y - closestPoint.y) * extendY);
                
                if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                    const targetIndex = (y * width + x) * 4;
                    const sourceIndex = (sourceY * width + sourceX) * 4;
                    for (let i = 0; i < 4; i++) {
                        newData[targetIndex + i] = data[sourceIndex + i];
                    }
                }
            } else {
                const index = (y * width + x) * 4;
                for (let i = 0; i < 4; i++) {
                    newData[index + i] = data[index + i];
                }
            }
        }
    }
    
    return new ImageData(newData, width, height);
}

function applyCurveDistortion(imageData, curveIntensity) {
    const width = imageData.width;
    const height = imageData.height;
    const pixels = imageData.data;
    const newImageData = new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
    const newPixels = newImageData.data;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const normalizedX = (x / width - 0.5) * 2;
            const normalizedY = (y / height - 0.5) * 2;

            const distortion = 1 + curveIntensity * (normalizedX * normalizedX);
            const sourceY = (normalizedY / distortion + 1) * height / 2;

            if (sourceY >= 0 && sourceY < height - 1) {
                const y1 = Math.floor(sourceY);
                const y2 = y1 + 1;
                const wy = sourceY - y1;

                const targetIndex = (y * width + x) * 4;

                for (let i = 0; i < 4; i++) {
                    const top = pixels[(y1 * width + x) * 4 + i];
                    const bottom = pixels[(y2 * width + x) * 4 + i];
                    const interpolatedValue = top * (1 - wy) + bottom * wy;
                    newPixels[targetIndex + i] = interpolatedValue;
                }
            }
        }
    }

    return newImageData;
}

self.onmessage = function(e) {
    const { 
        imageData, 
        value = DEFAULT_CURVE_INTENSITY,
        clickedPoints = [],
        value5: iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;
    
    try {
        if (reset) {
            currentIteration = 0;
        }

        let resultImageData = imageData;
        
        // Apply point-based distortion if points exist
        if (clickedPoints.length > 0) {
            resultImageData = applyExtendAroundPoints(resultImageData, value, clickedPoints);
        }
        
        // Apply curve distortion
        const curveIntensity = value * 0.5;
        resultImageData = applyCurveDistortion(resultImageData, curveIntensity);
        
        currentIteration = (currentIteration + 1) % iterations;
        const progress = currentIteration / iterations;

        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};