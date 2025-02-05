// self.onmessage = function(e) {
//     const { imageData, value, clickedPoints } = e.data;
//     console.log("Worker received:", { rotation: value.rotation, points: clickedPoints.length });
    
//     const result = applySkewAroundPoints(imageData, value, clickedPoints);
//     self.postMessage({ imageData: result });
// };


// function applySkewAroundPoints(imageData, value, clickedPoints) {
//     const { width, height, data } = imageData;
//     const newData = new Uint8ClampedArray(data.length);

//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             let maxSkew = 0;
//             let closestPoint = null;

//             clickedPoints.forEach(point => {
//                 const dx = x - point.x;
//                 const dy = y - point.y;
//                 const distance = Math.sqrt(dx * dx + dy * dy);
//                 const skew = Math.exp(-distance * 0.005);
                
//                 if (skew > maxSkew) {
//                     maxSkew = skew;
//                     closestPoint = point;
//                 }
//             });

//             if (maxSkew > 0) {
//                 const skewX = value.skewX * maxSkew;
//                 const skewY = value.skewY * maxSkew;

//                 const sourceX = Math.round(x - skewY * (y - closestPoint.y));
//                 const sourceY = Math.round(y - skewX * (x - closestPoint.x));

//                 if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
//                     const targetIndex = (y * width + x) * 4;
//                     const sourceIndex = (sourceY * width + sourceX) * 4;
//                     for (let i = 0; i < 4; i++) {
//                         newData[targetIndex + i] = data[sourceIndex + i];
//                     }
//                 }
//             } else {
//                 const index = (y * width + x) * 4;
//                 for (let i = 0; i < 4; i++) {
//                     newData[index + i] = data[index + i];
//                 }
//             }
//         }
//     }

//     return new ImageData(newData, width, height);
// }

const DEFAULT_ITERATIONS = 120;
let currentIteration = 0;

// Diagonal Skew - skews along both X and Y axes
function diagonalSkew(imageData, value, selectedRegions) {
    const width = imageData.width;
    const height = imageData.height;
    const pixels = imageData.data;
    const newImageData = new ImageData(new Uint8ClampedArray(pixels), width, height);
    
    if (!selectedRegions?.length) return newImageData;
    
    selectedRegions.forEach(region => {
        if (!region.length) return;
        
        let minX = width, maxX = 0, minY = height, maxY = 0;
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        });
        
        const regionSet = new Set(region);
        const skewAngle = (value - 0.5) * Math.PI / 3;
        const skewFactor = Math.tan(skewAngle);
        
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if (!regionSet.has(y * width + x)) continue;
                
                // Apply skew in both X and Y directions
                const skewedX = Math.round(x + (y - minY) * skewFactor);
                const skewedY = Math.round(y + (x - minX) * skewFactor);
                
                if (skewedX >= 0 && skewedX < width && skewedY >= 0 && skewedY < height) {
                    const sourceIndex = (y * width + x) * 4;
                    const targetIndex = (skewedY * width + skewedX) * 4;
                    
                    newImageData.data[targetIndex] = pixels[sourceIndex];
                    newImageData.data[targetIndex + 1] = pixels[sourceIndex + 1];
                    newImageData.data[targetIndex + 2] = pixels[sourceIndex + 2];
                    newImageData.data[targetIndex + 3] = pixels[sourceIndex + 3];
                }
            }
        }
    });
    
    return newImageData;
}

// Perspective Skew - creates a 3D-like effect
function perspectiveSkew(imageData, value, selectedRegions) {
    const width = imageData.width;
    const height = imageData.height;
    const pixels = imageData.data;
    const newImageData = new ImageData(new Uint8ClampedArray(pixels), width, height);
    
    if (!selectedRegions?.length) return newImageData;
    
    selectedRegions.forEach(region => {
        if (!region.length) return;
        
        let minX = width, maxX = 0, minY = height, maxY = 0;
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        });
        
        const regionSet = new Set(region);
        const perspectiveFactor = value * 0.5; // Controls the strength of perspective
        
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if (!regionSet.has(y * width + x)) continue;
                
                // Calculate perspective transformation
                const normalizedY = (y - minY) / (maxY - minY);
                const scale = 1 + (perspectiveFactor * normalizedY);
                const centerX = minX + (maxX - minX) / 2;
                
                const skewedX = Math.round(centerX + (x - centerX) * scale);
                
                if (skewedX >= 0 && skewedX < width) {
                    const sourceIndex = (y * width + x) * 4;
                    const targetIndex = (y * width + skewedX) * 4;
                    
                    newImageData.data[targetIndex] = pixels[sourceIndex];
                    newImageData.data[targetIndex + 1] = pixels[sourceIndex + 1];
                    newImageData.data[targetIndex + 2] = pixels[sourceIndex + 2];
                    newImageData.data[targetIndex + 3] = pixels[sourceIndex + 3];
                }
            }
        }
    });
    
    return newImageData;
}

// Wave Skew - creates a wave-like distortion
function waveSkew(imageData, value, selectedRegions) {
    const width = imageData.width;
    const height = imageData.height;
    const pixels = imageData.data;
    const newImageData = new ImageData(new Uint8ClampedArray(pixels), width, height);
    
    if (!selectedRegions?.length) return newImageData;
    
    selectedRegions.forEach(region => {
        if (!region.length) return;
        
        let minX = width, maxX = 0, minY = height, maxY = 0;
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        });
        
        const regionSet = new Set(region);
        const waveAmplitude = value * 30; // Controls wave height
        const waveFrequency = Math.PI * 2 / (maxY - minY); // One complete wave cycle
        
        for (let y = minY; y <= maxY; y++) {
            const waveOffset = Math.sin((y - minY) * waveFrequency) * waveAmplitude;
            
            for (let x = minX; x <= maxX; x++) {
                if (!regionSet.has(y * width + x)) continue;
                
                const skewedX = Math.round(x + waveOffset);
                
                if (skewedX >= 0 && skewedX < width) {
                    const sourceIndex = (y * width + x) * 4;
                    const targetIndex = (y * width + skewedX) * 4;
                    
                    newImageData.data[targetIndex] = pixels[sourceIndex];
                    newImageData.data[targetIndex + 1] = pixels[sourceIndex + 1];
                    newImageData.data[targetIndex + 2] = pixels[sourceIndex + 2];
                    newImageData.data[targetIndex + 3] = pixels[sourceIndex + 3];
                }
            }
        }
    });
    
    return newImageData;
}

self.onmessage = function(e) {
    const { imageData, selectedRegions, value = 0.5, value5: iterations = DEFAULT_ITERATIONS, reset, transformType = 'wave' } = e.data;
    
    try {
        if (reset) currentIteration = 0;
        
        let resultImageData;
        switch(transformType) {
            case 'diagonal':
                resultImageData = diagonalSkew(imageData, value, selectedRegions);
                break;
            case 'perspective':
                resultImageData = perspectiveSkew(imageData, value, selectedRegions);
                break;
            case 'wave':
                resultImageData = waveSkew(imageData, value, selectedRegions);
                break;
            default:
                resultImageData = waveSkew(imageData, value, selectedRegions);
        }
        
        currentIteration = (currentIteration + 1) % iterations;
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress: currentIteration / iterations
        });
    } catch (error) {
        self.postMessage({ error: error.message, isComplete: true });
    }
};