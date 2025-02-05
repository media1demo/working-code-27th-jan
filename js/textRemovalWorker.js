// Queue to store pending operations while OpenCV loads
let operationQueue = [];
let cvReady = false;

console.log('Worker starting...');

// Load OpenCV from CDN
try {
    console.log('Loading OpenCV from CDN...');
    importScripts('https://docs.opencv.org/4.8.0/opencv.js');
    console.log('OpenCV script loaded, waiting for initialization...');
} catch (error) {
    console.error('Failed to load OpenCV:', error);
    self.postMessage({
        error: 'Failed to load OpenCV: ' + error.message,
        isComplete: true
    });
}

// Set up the module ready callback
self.Module = {
    onRuntimeInitialized: async function() {
        console.log('OpenCV runtime initialized!');
        cvReady = true;
        
        // Process any queued operations
        console.log(`Processing ${operationQueue.length} queued operations`);
        while (operationQueue.length > 0) {
            const operation = operationQueue.shift();
            await processImage(operation);
        }
    }
};

async function processImage(data) {
    try {
        const { 
            imageData, 
            selectedRegions, 
            value, 
            value2: maxVerticalOffset = DEFAULT_MAX_VERTICAL_OFFSET,
            value5: iterations = DEFAULT_ITERATIONS,
            reset 
        } = data;

        // Create a canvas and draw the ImageData
        const canvas = new OffscreenCanvas(imageData.width, imageData.height);
        const ctx = canvas.getContext('2d');
        ctx.putImageData(imageData, 0, 0);

        // Convert to OpenCV format
        const src = cv.imread(canvas);
        const mask = new cv.Mat(src.rows, src.cols, cv.CV_8UC1, new cv.Scalar(0));
        
        // Create mask from selected regions
        if (selectedRegions && selectedRegions.length > 0) {
            selectedRegions.forEach(region => {
                region.forEach(pixelIndex => {
                    const x = pixelIndex % imageData.width;
                    const y = Math.floor(pixelIndex / imageData.width);
                    const pt = new cv.Point(x, y);
                    cv.circle(mask, pt, 2, new cv.Scalar(255), -1);
                });
            });
        }

        // Apply inpainting
        const dst = new cv.Mat();
        cv.inpaint(src, mask, dst, 3, cv.INPAINT_TELEA);

        // Convert result back to ImageData
        cv.imshow(canvas, dst);
        const resultImageData = ctx.getImageData(0, 0, imageData.width, imageData.height);

        // Clean up OpenCV objects
        src.delete();
        mask.delete();
        dst.delete();

        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress: currentIteration / iterations
        });

    } catch (error) {
        console.error('Error in processImage:', error);
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
}

let currentIteration = 0;
const DEFAULT_MAX_VERTICAL_OFFSET = 50;
const DEFAULT_ITERATIONS = 120;

self.onmessage = function(e) {
    if (!cvReady) {
        console.log('OpenCV not ready, queueing operation');
        operationQueue.push(e.data);
        return;
    }
    
    if (e.data.reset) {
        currentIteration = 0;
    }

    processImage(e.data);
};