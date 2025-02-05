
// Import necessary libraries
importScripts('opencv.js'); // Import OpenCV.js
importScripts('tesseract.min.js'); // Import Tesseract.js

// Constants
const DEFAULT_INTENSITY = 1; // Controls the strength of the bulge
const DEFAULT_ITERATIONS = 5; // Number of iterations (if needed)

// Initialize OpenCV and Tesseract
let cv;
let tesseractWorker;

// Ensure OpenCV is ready
function onOpenCvReady() {
    cv = self.cv;
    console.log('OpenCV.js is ready in Web Worker.');
}

if (self.cv) {
    onOpenCvReady();
} else {
    self.addEventListener('opencv-loaded', onOpenCvReady);
}

// Initialize Tesseract.js
async function initTesseract() {
    if (!tesseractWorker) {
        tesseractWorker = await Tesseract.createWorker();
        await tesseractWorker.loadLanguage('eng');
        await tesseractWorker.initialize('eng');
    }
    return tesseractWorker;
}

// Helper functions
function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

function copyImageData(source, destination) {
    destination.data.set(source.data);
}

// Main worker message handler
self.onmessage = async function(e) {
    const { imageData, selectedRegions, value = DEFAULT_INTENSITY } = e.data;
    
    try {
        await initTesseract(); // Ensure Tesseract is initialized

        if (!cv) {
            throw new Error('OpenCV.js is not ready.');
        }

        let resultImageData;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Process selected regions
            resultImageData = await applyAntiWalkingToRegions(imageData, selectedRegions, value);
        } else {
            // Process the entire image
            resultImageData = await applyAntiWalking(imageData, value);
        }
        
        self.postMessage({
            segmentedImages: [resultImageData]
        });
    } catch (error) {
        self.postMessage({
            error: error.message
        });
    }
};

// Function to apply anti-walking effect to regions
async function applyAntiWalkingToRegions(imageData, selectedRegions, value) {
    const width = imageData.width;
    const height = imageData.height;
    const result = createTransparentImageData(width, height);
    copyImageData(imageData, result);
    
    selectedRegions.forEach(region => {
        // Find bounds of the region
        let minX = width, minY = height, maxX = 0, maxY = 0;
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        });
        
        // Create a temporary canvas for the region
        const regionWidth = maxX - minX + 1;
        const regionHeight = maxY - minY + 1;
        const regionCanvas = new OffscreenCanvas(regionWidth, regionHeight);
        const regionCtx = regionCanvas.getContext('2d');
        
        // Draw the region
        const regionData = new ImageData(regionWidth, regionHeight);
        const regionSet = new Set(region);
        
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const sourceIdx = (y * width + x) * 4;
                const targetIdx = ((y - minY) * regionWidth + (x - minX)) * 4;
                const pixelIndex = y * width + x;
                
                if (regionSet.has(pixelIndex)) {
                    for (let c = 0; c < 4; c++) {
                        regionData.data[targetIdx + c] = imageData.data[sourceIdx + c];
                    }
                }
            }
        }
        
        regionCtx.putImageData(regionData, 0, 0);
        
        // Apply anti-walking effect to the region
        const processedRegion = await applyAntiWalking(regionData, value);
        
        // Copy the processed region back to the result
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const sourceIdx = ((y - minY) * regionWidth + (x - minX)) * 4;
                const targetIdx = (y * width + x) * 4;
                const pixelIndex = y * width + x;
                
                if (regionSet.has(pixelIndex)) {
                    for (let c = 0; c < 4; c++) {
                        result.data[targetIdx + c] = processedRegion.data[sourceIdx + c];
                    }
                }
            }
        }
    });
    
    return result;
}

// Implement the anti-walking effect
async function applyAntiWalking(imageData, value) {
    // Placeholder for anti-walking effect implementation
    // For demonstration, return the original image data
    return imageData;
}

// Process image with multiple thresholds
async function processWithMultipleThresholds(imageData) {
    try {
        await initTesseract(); // Ensure Tesseract is initialized

        const thresholds = [150, 175]; // Threshold values for preprocessing
        let bestThreshold = 0;
        let maxTextLength = 0;
        let bestText = '';
        let bestWords = [];
        let thresholdResults = [];

        const canvas = new OffscreenCanvas(imageData.width, imageData.height);
        const ctx = canvas.getContext('2d');
        ctx.putImageData(imageData, 0, 0);

        // Process image with each threshold
        for (let threshold of thresholds) {
            const preprocessedCanvas = preprocess(canvas, threshold);
            const { text, words } = await detectText(preprocessedCanvas);

            if (text.length > maxTextLength) {
                maxTextLength = text.length;
                bestThreshold = threshold;
                bestText = text;
                bestWords = words;
            }

            thresholdResults.push({
                value: threshold,
                image: preprocessedCanvas.toDataURL(),
                textLength: text.length,
                text: text,
            });
        }

        // Remove detected text and fill with surrounding pixels
        const textRemovedCanvas = await removeTextAndFillWithFallback(canvas, bestWords);

        // Send results back to the main thread
        self.postMessage({
            action: 'processComplete',
            result: {
                bestThreshold: bestThreshold,
                maxTextLength: maxTextLength,
                bestText: bestText,
                originalImage: canvas.toDataURL(),
                textRemovedImage: textRemovedCanvas.toDataURL(),
                thresholds: thresholdResults,
            },
        });
    } catch (error) {
        console.error('An error occurred during processing:', error);
        self.postMessage({ action: 'error', message: error.message });
    }
}

// Preprocess image with a given threshold
function preprocess(canvas, threshold) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply thresholding
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const val = avg > threshold ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = val;
    }

    const outputCanvas = new OffscreenCanvas(canvas.width, canvas.height);
    const outputCtx = outputCanvas.getContext('2d');
    outputCtx.putImageData(imageData, 0, 0);
    return outputCanvas;
}

// Detect text using Tesseract
async function detectText(canvas) {
    try {
        const result = await tesseractWorker.recognize(canvas);
        return { text: result.data.text, words: result.data.words };
    } catch (error) {
        console.error('Error in text detection:', error);
        return { text: '', words: [] };
    }
}

// Remove text and fill with surrounding pixels
async function removeTextAndFillWithFallback(canvas, words) {
    try {
        return await removeTextAndFillOpenCV(canvas, words);
    } catch (error) {
        console.warn('OpenCV.js processing failed, falling back to JavaScript method:', error);
        return removeTextAndFillJS(canvas, words);
    }
}

// Remove text using OpenCV
async function removeTextAndFillOpenCV(canvas, words) {
    return new Promise((resolve, reject) => {
        if (!cv) {
            reject(new Error('OpenCV.js is not ready.'));
            return;
        }

        try {
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const src = cv.matFromImageData(imageData);
            const mask = cv.Mat.zeros(src.rows, src.cols, cv.CV_8U);

            // Create mask for text regions
            for (let word of words) {
                const pt1 = new cv.Point(word.bbox.x0, word.bbox.y0);
                const pt2 = new cv.Point(word.bbox.x1, word.bbox.y1);
                cv.rectangle(mask, pt1, pt2, 255, -1);
            }

            // Inpaint the text regions
            const dst = new cv.Mat();
            cv.inpaint(src, mask, dst, 3, cv.INPAINT_TELEA);

            const outputCanvas = new OffscreenCanvas(canvas.width, canvas.height);
            cv.imshow(outputCanvas, dst);

            src.delete();
            mask.delete();
            dst.delete();

            resolve(outputCanvas);
        } catch (error) {
            console.error('Error in removeTextAndFillOpenCV:', error);
            reject(error);
        }
    });
}

// Remove text using JavaScript fallback
function removeTextAndFillJS(canvas, words) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let word of words) {
        const padding = 2;
        const x0 = Math.max(0, word.bbox.x0 - padding);
        const y0 = Math.max(0, word.bbox.y0 - padding);
        const x1 = Math.min(canvas.width, word.bbox.x1 + padding);
        const y1 = Math.min(canvas.height, word.bbox.y1 + padding);

        for (let y = y0; y < y1; y++) {
            for (let x = x0; x < x1; x++) {
                const index = (y * canvas.width + x) * 4;
                const surroundingPixels = getSurroundingPixels(data, x, y, canvas.width, canvas.height, 5);
                const [r, g, b] = averageColor(surroundingPixels);
                data[index] = r;
                data[index + 1] = g;
                data[index + 2] = b;
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

// Get surrounding pixels for a given point
function getSurroundingPixels(data, x, y, width, height, radius) {
    const pixels = [];
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const index = (ny * width + nx) * 4;
                pixels.push([data[index], data[index + 1], data[index + 2]]);
            }
        }
    }
    return pixels;
}

// Calculate average color of surrounding pixels
function averageColor(pixels) {
    const sum = pixels.reduce((acc, pixel) => [acc[0] + pixel[0], acc[1] + pixel[1], acc[2] + pixel[2]], [0, 0, 0]);
    return sum.map((v) => Math.round(v / pixels.length));
}