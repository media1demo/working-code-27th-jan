self.onmessage = function(e) {
    const { imageData, value = 20 } = e.data;
    
    // Constants for cartoon effect
    const EDGE_THRESHOLD = value * 100;
    const COLOR_LEVELS = 1;

    console.log("1");    

    function createImageBuffer(width, height) {
        return new ImageData(
            new Uint8ClampedArray(width * height * 4),
            width,
            height
        );
    }
    
    function applySobelOperator(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const output = createImageBuffer(width, height);
        
        // Sobel kernels for edge detection
        const kernelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        const kernelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let pixelX = 0;
                let pixelY = 0;

                // Apply kernels
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4;
                        const kernelIdx = (ky + 1) * 3 + (kx + 1);
                        
                        // Convert to grayscale and apply kernel
                        const gray = (imageData.data[idx] + imageData.data[idx + 1] + imageData.data[idx + 2]) / 3;
                        pixelX += gray * kernelX[kernelIdx];
                        pixelY += gray * kernelY[kernelIdx];
                    }
                }
                
                // Calculate edge magnitude
                const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
                const idx = (y * width + x) * 4;
                
                // Apply threshold for edge detection
                const isEdge = magnitude > EDGE_THRESHOLD;
                output.data[idx] = isEdge ? 0 : 255;     // R
                output.data[idx + 1] = isEdge ? 0 : 255; // G
                output.data[idx + 2] = isEdge ? 0 : 255; // B
                output.data[idx + 3] = 255;              // A
            }
        }
        
        return output;
    }
    
    function quantizeColors(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const output = createImageBuffer(width, height);
        
        for (let i = 0; i < imageData.data.length; i += 4) {
            // Quantize each color channel
            for (let c = 0; c < 3; c++) {
                const value = imageData.data[i + c];
                const quantized = Math.round(value / (255 / COLOR_LEVELS)) * (255 / COLOR_LEVELS);
                output.data[i + c] = quantized;
            }
            output.data[i + 3] = imageData.data[i + 3]; // Keep original alpha
        }
        
        return output;
    }
    
    function applyBilateralFilter(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const output = createImageBuffer(width, height);
        const radius = 2;
        const sigmaSpace = 2.0;
        const sigmaColor = 30.0;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let sumR = 0, sumG = 0, sumB = 0, sumWeights = 0;
                const centerIdx = (y * width + x) * 4;
                const centerR = imageData.data[centerIdx];
                const centerG = imageData.data[centerIdx + 1];
                const centerB = imageData.data[centerIdx + 2];
                
                for (let ky = -radius; ky <= radius; ky++) {
                    for (let kx = -radius; kx <= radius; kx++) {
                        const ny = y + ky;
                        const nx = x + kx;
                        
                        if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                            const idx = (ny * width + nx) * 4;
                            
                            // Calculate space weight
                            const spaceWeight = Math.exp(-(kx * kx + ky * ky) / (2 * sigmaSpace * sigmaSpace));
                            
                            // Calculate color weight
                            const dr = centerR - imageData.data[idx];
                            const dg = centerG - imageData.data[idx + 1];
                            const db = centerB - imageData.data[idx + 2];
                            const colorWeight = Math.exp(-(dr * dr + dg * dg + db * db) / (2 * sigmaColor * sigmaColor));
                            
                            const weight = spaceWeight * colorWeight;
                            sumR += imageData.data[idx] * weight;
                            sumG += imageData.data[idx + 1] * weight;
                            sumB += imageData.data[idx + 2] * weight;
                            sumWeights += weight;
                        }
                    }
                }
                
                // Write filtered pixel
                output.data[centerIdx] = Math.round(sumR / sumWeights);
                output.data[centerIdx + 1] = Math.round(sumG / sumWeights);
                output.data[centerIdx + 2] = Math.round(sumB / sumWeights);
                output.data[centerIdx + 3] = imageData.data[centerIdx + 3];
            }
        }
        
        return output;
    }
    
    try {
        // Step 1: Apply bilateral filter for smoothing while preserving edges
        const smoothed = applyBilateralFilter(imageData);
        
        // Step 2: Quantize colors for cartoon-like effect
        const quantized = quantizeColors(smoothed);
        
        // Step 3: Detect edges
        const edges = applySobelOperator(imageData);
        
        // Step 4: Combine edges with quantized image
        const result = createImageBuffer(imageData.width, imageData.height);
        for (let i = 0; i < result.data.length; i += 4) {
            // If it's an edge pixel, make it black, otherwise use the quantized color
            if (edges.data[i] === 0) {
                result.data[i] = 0;
                result.data[i + 1] = 0;
                result.data[i + 2] = 0;
            } else {
                result.data[i] = quantized.data[i];
                result.data[i + 1] = quantized.data[i + 1];
                result.data[i + 2] = quantized.data[i + 2];
            }
            result.data[i + 3] = 255;
        }
        console.log(result);
        self.postMessage({
            segmentedImages: [result],
            isComplete: true
        });
        
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};