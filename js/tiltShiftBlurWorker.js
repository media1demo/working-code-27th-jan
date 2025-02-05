// Constants
const DEFAULT_BLUR_RADIUS = 10;
const DEFAULT_FOCUS_POSITION = 0.5;
const DEFAULT_FOCUS_RANGE = 0.2;

// Helper function to get gaussian kernel
function getGaussianKernel(radius) {
    const kernel = [];
    const sigma = radius / 3;
    let sum = 0;
    
    for (let i = -radius; i <= radius; i++) {
        const exp = Math.exp(-(i * i) / (2 * sigma * sigma));
        kernel.push(exp);
        sum += exp;
    }
    
    // Normalize kernel
    return kernel.map(value => value / sum);
}

// Helper to create new ImageData with same dimensions
function createNewImageData(original) {
    return new ImageData(
        new Uint8ClampedArray(original.data.length),
        original.width,
        original.height
    );
}

// Apply horizontal gaussian blur
function horizontalBlur(imageData, kernel, radius) {
    const { width, height, data } = imageData;
    const output = createNewImageData(imageData);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0;
            
            for (let i = -radius; i <= radius; i++) {
                const pixelX = Math.min(Math.max(x + i, 0), width - 1);
                const idx = (y * width + pixelX) * 4;
                const weight = kernel[i + radius];
                
                r += data[idx] * weight;
                g += data[idx + 1] * weight;
                b += data[idx + 2] * weight;
                a += data[idx + 3] * weight;
            }
            
            const outIdx = (y * width + x) * 4;
            output.data[outIdx] = r;
            output.data[outIdx + 1] = g;
            output.data[outIdx + 2] = b;
            output.data[outIdx + 3] = a;
        }
    }
    
    return output;
}

// Apply vertical gaussian blur
function verticalBlur(imageData, kernel, radius) {
    const { width, height, data } = imageData;
    const output = createNewImageData(imageData);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0;
            
            for (let i = -radius; i <= radius; i++) {
                const pixelY = Math.min(Math.max(y + i, 0), height - 1);
                const idx = (pixelY * width + x) * 4;
                const weight = kernel[i + radius];
                
                r += data[idx] * weight;
                g += data[idx + 1] * weight;
                b += data[idx + 2] * weight;
                a += data[idx + 3] * weight;
            }
            
            const outIdx = (y * width + x) * 4;
            output.data[outIdx] = r;
            output.data[outIdx + 1] = g;
            output.data[outIdx + 2] = b;
            output.data[outIdx + 3] = a;
        }
    }
    
    return output;
}

// Apply gaussian blur
function applyGaussianBlur(imageData, radius) {
    const kernel = getGaussianKernel(radius);
    const horizontal = horizontalBlur(imageData, kernel, radius);
    return verticalBlur(horizontal, kernel, radius);
}

// Calculate blur amount based on position
function getBlurAmount(y, height, focusPosition, focusRange, maxBlur) {
    const normalizedY = y / height;
    const focusCenter = focusPosition;
    const focusStart = focusCenter - focusRange / 2;
    const focusEnd = focusCenter + focusRange / 2;
    
    if (normalizedY < focusStart) {
        return maxBlur * (1 - normalizedY / focusStart);
    } else if (normalizedY > focusEnd) {
        return maxBlur * ((normalizedY - focusEnd) / (1 - focusEnd));
    }
    return 0;
}

// Apply tilt-shift effect
function applyTiltShift(imageData, maxBlur, focusPosition, focusRange) {
    const { width, height } = imageData;
    const output = createNewImageData(imageData);
    output.data.set(imageData.data);
    
    for (let y = 0; y < height; y++) {
        const blurAmount = getBlurAmount(y, height, focusPosition, focusRange, maxBlur);
        
        if (blurAmount > 0) {
            const radius = Math.ceil(blurAmount);
            const rowStart = y * width * 4;
            const rowEnd = (y + 1) * width * 4;
            
            const blurredRow = applyGaussianBlur(
                new ImageData(
                    imageData.data.slice(rowStart, rowEnd),
                    width,
                    1
                ),
                radius
            );
            
            output.data.set(blurredRow.data, rowStart);
        }
    }
    
    return output;
}

self.onmessage = function(e) {
    const {
        imageData,
        value: blurRadius = DEFAULT_BLUR_RADIUS,
        value2: focusPosition = DEFAULT_FOCUS_POSITION,
        value3: focusRange = DEFAULT_FOCUS_RANGE
    } = e.data;
    
    try {
        const resultImageData = applyTiltShift(
            imageData,
            blurRadius,
            focusPosition,
            focusRange
        );
        
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