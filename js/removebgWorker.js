// Constants
const DEFAULT_THRESHOLD = 30;
const GRADIENT_STRENGTH = 50;

// Helper function to calculate color distance
function colorDistance(r1, g1, b1, r2, g2, b2) {
    return Math.sqrt(
        Math.pow(r1 - r2, 2) +
        Math.pow(g1 - g2, 2) +
        Math.pow(b1 - b2, 2)
    );
}

// Background removal function with gradient support
function removeBackground(imageData, baseThreshold, progress = 1) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    
    // Sample background colors from corners
    const bgColors = [
        {r: data[0], g: data[1], b: data[2]},                     // Top-left
        {r: data[(width-1)*4], g: data[(width-1)*4+1], b: data[(width-1)*4+2]},  // Top-right
        {r: data[(height-1)*width*4], g: data[(height-1)*width*4+1], b: data[(height-1)*width*4+2]},  // Bottom-left
        {r: data[(height*width-1)*4], g: data[(height*width-1)*4+1], b: data[(height*width-1)*4+2]}   // Bottom-right
    ];
    
    const removeUpTo = Math.floor(width * progress);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < removeUpTo; x++) {
            const i = (y * width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Apply gradient threshold
            const gradientFactor = x / width;
            const threshold = baseThreshold + (gradientFactor * GRADIENT_STRENGTH);
            
            // Check against all background colors
            if (bgColors.some(bgColor => 
                colorDistance(r, g, b, bgColor.r, bgColor.g, bgColor.b) < threshold)) {
                data[i + 3] = 0;
            }
        }
    }
    
    return imageData;
}

self.onmessage = function(e) {
    const { 
        imageData,
        value: threshold = DEFAULT_THRESHOLD,
        progress = 1
    } = e.data;
    
    try {
        // Create a copy of the image data to avoid modifying the original
        const resultImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );
        
        // Process the image
        const processedImage = removeBackground(resultImageData, threshold, progress);
        
        self.postMessage({
            segmentedImages: [processedImage],
            isComplete: true,
            progress
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};