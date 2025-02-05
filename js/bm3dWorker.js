self.onmessage = function(e) {
    const { imageData } = e.data;
    
    // Default BM3D parameters
    const params = {
        sigma: 25,                        
        blockSize: 8,           
        slidingStep: 4,          // Step size for sliding window
        maxBlocks: 16,           // Maximum number of similar blocks
        searchWindow: 32,        // Size of search window
        hardThreshold: 2.7,      // Hard thresholding parameter
        transformationMode: '2D'  // 2D DCT transform
    };

    try {
        const result = bm3dDenoising(imageData, params);
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

function bm3dDenoising(imageData, params) {
    const { width, height } = imageData;
    const result = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
    const tmpResult = new ImageData(new Uint8ClampedArray(width * height * 4), width, height);
    
    // Step 1: Basic estimate
    basicEstimate(imageData, tmpResult, params);
console.log("1");    
    // Step 2: Final estimate
    finalEstimate(imageData, tmpResult, result, params);
    
    return result;
}

function basicEstimate(noisy, basic, params) {
    const { width, height } = noisy;
    const { blockSize, slidingStep, searchWindow, maxBlocks } = params;
    console.log("1");    
    
    for (let i = 0; i < width - blockSize; i += slidingStep) {
        for (let j = 0; j < height - blockSize; j += slidingStep) {
            // Get reference block
            const refBlock = getBlock(noisy, i, j, blockSize);
            
            // Find similar blocks
            const similarBlocks = findSimilarBlocks(noisy, i, j, refBlock, params);
            
            // 3D transform and filtering
            const filteredBlocks = hardThresholdFiltering(similarBlocks, params);
            
            // Aggregate blocks
            aggregateBlocks(basic, filteredBlocks, i, j, blockSize);
        }
    }
}

function finalEstimate(noisy, basic, final, params) {
    const { width, height } = noisy;
    const { blockSize, slidingStep, searchWindow, maxBlocks } = params;
    
    console.log("1");    
    
    
    for (let i = 0; i < width - blockSize; i += slidingStep) {
        for (let j = 0; j < height - blockSize; j += slidingStep) {
            // Get reference blocks from both noisy and basic estimate
            const refBlockNoisy = getBlock(noisy, i, j, blockSize);
            const refBlockBasic = getBlock(basic, i, j, blockSize);
            
            // Find similar blocks using basic estimate
            const similarBlocks = findSimilarBlocksWiener(noisy, basic, i, j, refBlockBasic, params);
            
            // Wiener filtering
            const filteredBlocks = wienerFiltering(similarBlocks, params);
            
            // Aggregate blocks
            aggregateBlocks(final, filteredBlocks, i, j, blockSize);
        }
    }
}

function getBlock(image, x, y, size) {
    const block = new Float32Array(size * size);
    let idx = 0;
    console.log("1");    
    
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const pixelIndex = ((y + j) * image.width + (x + i)) * 4;
            block[idx++] = image.data[pixelIndex];
        }
    }
    
    return block;
}

function findSimilarBlocks(image, refX, refY, refBlock, params) {
    const { blockSize, searchWindow, maxBlocks } = params;
    const similar = [];
    console.log("1");    
    
    for (let i = Math.max(0, refX - searchWindow); i <= Math.min(image.width - blockSize, refX + searchWindow); i++) {
        for (let j = Math.max(0, refY - searchWindow); j <= Math.min(image.height - blockSize, refY + searchWindow); j++) {
            if (i === refX && j === refY) continue;
            
            const block = getBlock(image, i, j, blockSize);
            const distance = calculateDistance(refBlock, block);
            
            similar.push({ block, distance, x: i, y: j });
        }
    }
    
    return similar
        .sort((a, b) => a.distance - b.distance)
        .slice(0, maxBlocks);
}

function calculateDistance(block1, block2) {
    console.log("1");    

    let sum = 0;
    for (let i = 0; i < block1.length; i++) {
        const diff = block1[i] - block2[i];
        sum += diff * diff;
    }
    return sum / block1.length;
}

function hardThresholdFiltering(similarBlocks, params) {
    const { sigma, hardThreshold } = params;
    const threshold = hardThreshold * sigma;
    console.log("1");    
    
    return similarBlocks.map(({ block }) => {
        const transformed = dct2D(block, params);
        
        // Hard thresholding
        for (let i = 0; i < transformed.length; i++) {
            if (Math.abs(transformed[i]) < threshold) {
                transformed[i] = 0;
            }
        }
        
        return idct2D(transformed, params);
    });
}

function wienerFiltering(similarBlocks, params) {
    const { sigma } = params;
    const sigmaSquared = sigma * sigma;

    console.log("1");    

    return similarBlocks.map(({ block }) => {
        const transformed = dct2D(block, params);
        const estimate = transformed.map(val => {
            const power = val * val;
            return (power / (power + sigmaSquared)) * val;
        });
        
        return idct2D(estimate, params);
    });
}

function dct2D(block, params) {
    const { blockSize } = params;
    const result = new Float32Array(blockSize * blockSize);
    console.log("1");    
    
    for (let u = 0; u < blockSize; u++) {
        for (let v = 0; v < blockSize; v++) {
            let sum = 0;
            for (let i = 0; i < blockSize; i++) {
                for (let j = 0; j < blockSize; j++) {
                    sum += block[i * blockSize + j] *
                          Math.cos((2 * i + 1) * u * Math.PI / (2 * blockSize)) *
                          Math.cos((2 * j + 1) * v * Math.PI / (2 * blockSize));
                }
            }
            result[u * blockSize + v] = sum;
        }
    }
    
    return result;
}

function idct2D(block, params) {
    const { blockSize } = params;
    const result = new Float32Array(blockSize * blockSize);
    console.log("1");    
    
    for (let i = 0; i < blockSize; i++) {
        for (let j = 0; j < blockSize; j++) {
            let sum = 0;
            for (let u = 0; u < blockSize; u++) {
                for (let v = 0; v < blockSize; v++) {
                    sum += block[u * blockSize + v] *
                          Math.cos((2 * i + 1) * u * Math.PI / (2 * blockSize)) *
                          Math.cos((2 * j + 1) * v * Math.PI / (2 * blockSize));
                }
            }
            result[i * blockSize + j] = sum;
        }
    }
    
    return result;
}

function aggregateBlocks(target, blocks, startX, startY, blockSize) {
    const weights = new Float32Array(blockSize * blockSize).fill(1);
    console.log("1");    
    
    blocks.forEach(block => {
        for (let i = 0; i < blockSize; i++) {
            for (let j = 0; j < blockSize; j++) {
                const pixelIndex = ((startY + j) * target.width + (startX + i)) * 4;
                const blockIndex = i * blockSize + j;
                
                target.data[pixelIndex] += block[blockIndex] * weights[blockIndex];
                target.data[pixelIndex + 1] = target.data[pixelIndex];
                target.data[pixelIndex + 2] = target.data[pixelIndex];
                target.data[pixelIndex + 3] = 255;
            }
        }
    });
}