// self.onmessage = function(e) {
//     const { imageData, selectedRegions, value1 } = e.data;
//     const chunkSize = 10000; // Process 10000 pixels at a time
//     let processedPixels = 0;

//     const smoothedImageData = new ImageData(
//         new Uint8ClampedArray(imageData.data),
//         imageData.width,
//         imageData.height
//     );

//     function processChunk() {
//         const endPixel = Math.min(processedPixels + chunkSize, selectedRegions[0].length);
//         for (let i = processedPixels; i < endPixel; i++) {
//             const pixelIndex = selectedRegions[0][i];
//             const x = pixelIndex % imageData.width;
//             const y = Math.floor(pixelIndex / imageData.width);
//             if (isEdgePixel(smoothedImageData, x, y)) {
//                 gaussianBlur(smoothedImageData, x, y, 3);
//                 applyAdditionalEffects(smoothedImageData, x, y, value1);
//             }
//         }
//         processedPixels = endPixel;

//         if (processedPixels < selectedRegions[0].length) {
//             self.postMessage({ progress: processedPixels / selectedRegions[0].length });
//             setTimeout(processChunk, 0);
//         } else {
//             self.postMessage({ segmentedImages: [smoothedImageData], effect: 'SmoothEdges' });
//         }
//     }

//     processChunk();
// };

// function isEdgePixel(imageData, x, y) {
//     // Implement a simple edge detection
//     const idx = (y * imageData.width + x) * 4;
//     const leftIdx = idx - 4;
//     const rightIdx = idx + 4;
//     const topIdx = ((y - 1) * imageData.width + x) * 4;
//     const bottomIdx = ((y + 1) * imageData.width + x) * 4;
    
//     for (let c = 0; c < 3; c++) {
//         if (Math.abs(imageData.data[leftIdx + c] - imageData.data[rightIdx + c]) > 30 ||
//             Math.abs(imageData.data[topIdx + c] - imageData.data[bottomIdx + c]) > 30) {
//             return true;
//         }
//     }
//     return false;
// }

// function gaussianBlur(imageData, x, y, radius) {
//     // Implement a simple blur
//     let r = 0, g = 0, b = 0, count = 0;
//     for (let i = -radius; i <= radius; i++) {
//         for (let j = -radius; j <= radius; j++) {
//             const newX = Math.min(Math.max(x + i, 0), imageData.width - 1);
//             const newY = Math.min(Math.max(y + j, 0), imageData.height - 1);
//             const idx = (newY * imageData.width + newX) * 4;
//             r += imageData.data[idx];
//             g += imageData.data[idx + 1];
//             b += imageData.data[idx + 2];
//             count++;
//         }
//     }
//     const resultIdx = (y * imageData.width + x) * 4;
//     imageData.data[resultIdx] = r / count;
//     imageData.data[resultIdx + 1] = g / count;
//     imageData.data[resultIdx + 2] = b / count;
// }

// function applyAdditionalEffects(imageData, x, y, value1) {
//     const idx = (y * imageData.width + x) * 4;
//     const factor = 1 + value1 / 100;
//     for (let i = 0; i < 3; i++) {
//         imageData.data[idx + i] = Math.min(255, imageData.data[idx + i] * factor);
//     }
// }

function findAllEdgePixels(imageData, selectedRegions) {
    const edgePixels = new Set();
    for (const region of selectedRegions) {
        for (const pixelIndex of region) {
            const x = pixelIndex % imageData.width;
            const y = Math.floor(pixelIndex / imageData.width);
            if (isEdgePixel(imageData, x, y)) {
                edgePixels.add(pixelIndex);
            }
        }
    }
    return Array.from(edgePixels);
}

function smoothEdgesForSelectedRegions(imageData, edgePixels) {
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
    );

    for (const pixelIndex of edgePixels) {
        const x = pixelIndex % newImageData.width;
        const y = Math.floor(pixelIndex / newImageData.width);
        gaussianBlur(newImageData, x, y, 3);
    }

    return newImageData;
}

function smoothEdgePixels(imageData, edgePixels) {
    for (const pixelIndex of edgePixels) {
        const x = pixelIndex % imageData.width;
        const y = Math.floor(pixelIndex / imageData.width);
        gaussianBlur(imageData, x, y, 3);
    }
}


function findEdgePixels(imageData, region) {
    const edgePixels = [];
    for (const pixelIndex of region) {
        const x = pixelIndex % imageData.width;
        const y = Math.floor(pixelIndex / imageData.width);
        if (isEdgePixel(imageData, x, y)) {
            edgePixels.push(pixelIndex);
        }
    }
    return edgePixels;
}


function smoothEdges(imageData, selectedRegions) {

  
    
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
    );
    
    manualRefinement(newImageData, selectedRegions);
    smoothSelection(newImageData, selectedRegions);

    
    featherEdges(newImageData, selectedRegions);
    adjustContrast(newImageData, selectedRegions);
    shiftEdges(newImageData, selectedRegions);

    

    return newImageData;
}

function manualRefinement(imageData, selectedRegions) {
    for (const pixelIndex of selectedRegions[0]) {
        const x = pixelIndex % imageData.width;
        const y = Math.floor(pixelIndex / imageData.width);
        if (isEdgePixel(imageData, x, y)) {
            averageWithNeighbors(imageData, x, y);
        }
    }
}

function smoothSelection(imageData, selectedRegions) {
    for (const pixelIndex of selectedRegions[0]) {
        const x = pixelIndex % imageData.width;
        const y = Math.floor(pixelIndex / imageData.width);
        boxBlur(imageData, x, y, 3);
    }
}

function featherEdges(imageData, selectedRegions) {
    for (const pixelIndex of selectedRegions[0]) {
        const x = pixelIndex % imageData.width;
        const y = Math.floor(pixelIndex / imageData.width);
        if (isEdgePixel(imageData, x, y)) {
            gaussianBlur(imageData, x, y, 5);
        }
    }
}

function adjustContrast(imageData, selectedRegions) {
    const contrastFactor = 1.2;
    for (const pixelIndex of selectedRegions[0]) {
        const x = pixelIndex % imageData.width;
        const y = Math.floor(pixelIndex / imageData.width);
        if (isEdgePixel(imageData, x, y)) {
            const idx = (y * imageData.width + x) * 4;
            for (let c = 0; c < 3; c++) {
                let color = imageData.data[idx + c];
                color = ((color / 255 - 0.5) * contrastFactor + 0.5) * 255;
                imageData.data[idx + c] = Math.max(0, Math.min(255, color));
            }
        }
    }
}

function shiftEdges(imageData, selectedRegions) {
    // Adjust selection edges inward or outward
    

    
    // This is a complex operation that would require sophisticated edge detection and manipulation
    // A simplified version might involve expanding or contracting the selection
    const shiftAmount = 1; // Positive to expand, negative to contract
    for (let region of selectedRegions) {
        let { x, y, width, height } = region;
        x -= shiftAmount;
        y -= shiftAmount;
        width += 2 * shiftAmount;
        height += 2 * shiftAmount;
        // Ensure we don't go out of bounds

        
        x = Math.max(0, x);
        y = Math.max(0, y);
        width = Math.min(width, imageData.width - x);
        height = Math.min(height, imageData.height - y);
        // Update the region
        region.x = x;
        region.y = y;
        region.width = width;
        region.height = height;
    }
}

function averageWithNeighbors(imageData, x, y) {
  
    

    let idx = (y * imageData.width + x) * 4;
    for (let c = 0; c < 3; c++) {
        let sum = 0;
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                let newX = x + i;
                let newY = y + j;
                if (newX >= 0 && newX < imageData.width && newY >= 0 && newY < imageData.height) {
                    sum += imageData.data[(newY * imageData.width + newX) * 4 + c];
                    count++;
                }
            }
        }
        imageData.data[idx + c] = sum / count;
    }
}

function boxBlur(imageData, x, y, size) {
  
    
    let idx = (y * imageData.width + x) * 4;
    for (let c = 0; c < 3; c++) {
        let sum = 0;
        let count = 0;
        for (let i = -Math.floor(size/2); i <= Math.floor(size/2); i++) {
          
            
            for (let j = -Math.floor(size/2); j <= Math.floor(size/2); j++) {
                let newX = x + i;
                let newY = y + j;
                if (newX >= 0 && newX < imageData.width && newY >= 0 && newY < imageData.height) {
                    sum += imageData.data[(newY * imageData.width + newX) * 4 + c];
                    count++;
                }
            }
        }
        imageData.data[idx + c] = sum / count;
    }
}
const DEFAULT_MAX_HORIZONTAL_OFFSET = 50;
const DEFAULT_ITERATIONS = 120;
const DEFAULT_MOVE_STEP = 20;

let currentIteration = 0;

// [Previous helper functions remain the same]
function copyImageData(source, destination) {
    destination.data.set(source.data);
}

function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

// [Add all the edge detection and smoothing functions]
function isEdgePixel(imageData, x, y) {
    const idx = (y * imageData.width + x) * 4;
    const leftIdx = idx - 4;
    const rightIdx = idx + 4;
    const topIdx = ((y - 1) * imageData.width + x) * 4;
    const bottomIdx = ((y + 1) * imageData.width + x) * 4;
    
    for (let c = 0; c < 3; c++) {
        if (Math.abs(imageData.data[leftIdx + c] - imageData.data[rightIdx + c]) > 30 ||
            Math.abs(imageData.data[topIdx + c] - imageData.data[bottomIdx + c]) > 30) {
            return true;
        }
    }
    return false;
}

// [Include all other provided functions]
function gaussianBlur(imageData, x, y, radius) {
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = -radius; i <= radius; i++) {
        for (let j = -radius; j <= radius; j++) {
            const newX = Math.min(Math.max(x + i, 0), imageData.width - 1);
            const newY = Math.min(Math.max(y + j, 0), imageData.height - 1);
            const idx = (newY * imageData.width + newX) * 4;
            r += imageData.data[idx];
            g += imageData.data[idx + 1];
            b += imageData.data[idx + 2];
            count++;
        }
    }
    const resultIdx = (y * imageData.width + x) * 4;
    imageData.data[resultIdx] = r / count;
    imageData.data[resultIdx + 1] = g / count;
    imageData.data[resultIdx + 2] = b / count;
}

// [Include all other smoothing and processing functions]
// ... [Include all other functions from the provided code]

// Function to apply sitting/compression effect
function applySittingEffect(imageData, value) {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    
    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');
    
    const compressionFactor = 1 - value * 0.3;
    const midPoint = imageData.height / 2;
    
    tempCtx.drawImage(canvas, 0, 0, imageData.width, midPoint, 0, 0, imageData.width, midPoint);
    tempCtx.drawImage(canvas, 0, midPoint, imageData.width, midPoint, 0, midPoint, imageData.width, midPoint * compressionFactor);
    
    return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
}

// Modified function to move selected regions with edge smoothing
function moveSelectedRegionsRight(imageData, selectedRegions, maxHorizontalOffset) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    copyImageData(imageData, newImageData);

    // First find and smooth edges for all regions
    const edgePixels = findAllEdgePixels(newImageData, selectedRegions);
    smoothEdgesForSelectedRegions(newImageData, edgePixels);

    selectedRegions.forEach(region => {
        const horizontalOffset = Math.random() * maxHorizontalOffset;
        const tempBuffer = new Uint8ClampedArray(width * height * 4);

        // Clear selected region
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            for (let c = 0; c < 4; c++) {
                newImageData.data[baseIndex + c] = 0;
            }
        });

        // Move pixels with additional effects
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            const newX = Math.min(width - 1, x + horizontalOffset);

            if (newX >= 0 && newX < width) {
                const sourceIndex = (y * width + x) * 4;
                const targetIndex = (y * width + Math.floor(newX)) * 4;

                for (let c = 0; c < 4; c++) {
                    tempBuffer[targetIndex + c] = imageData.data[sourceIndex + c];
                }
            }
        });

        // Blend moved pixels
        for (let i = 0; i < tempBuffer.length; i += 4) {
            if (tempBuffer[i + 3] > 0) {
                for (let c = 0; c < 4; c++) {
                    newImageData.data[i + c] = tempBuffer[i + c];
                }
            }
        }
    });

    // Apply final smoothing and effects
    smoothEdges(newImageData, selectedRegions);
    
    return newImageData;
}

// Web Worker message handler
self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value, 
        value1,
        value2: maxHorizontalOffset = DEFAULT_MAX_HORIZONTAL_OFFSET,
        value5: iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;

    try {
        // Reset counter if requested
        if (reset) {
            currentIteration = 0;
        }

        let resultImageData;
        let progress;

        // First apply the sitting/compression effect
        let processedImageData = applySittingEffect(imageData, value);

        // Then handle different modes with enhanced edge processing
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Selected regions mode with edge smoothing
            resultImageData = moveSelectedRegionsRight(processedImageData, selectedRegions, maxHorizontalOffset);
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // Full image mode
            resultImageData = new ImageData(
                new Uint8ClampedArray(processedImageData.data),
                processedImageData.width,
                processedImageData.height
            );
            const totalMove = DEFAULT_MOVE_STEP * (currentIteration + 1);
            moveRegionRight(resultImageData, totalMove);
            currentIteration++;
            progress = undefined;
        }

        // Send the processed image data back to the main thread
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress
        }, [resultImageData.data.buffer]);
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};