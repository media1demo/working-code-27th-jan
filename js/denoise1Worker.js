function applyBilateralFilter(imageData, selectedRegions, strength) {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data);
    
    const spatialSigma = 3 * strength;
    const rangeSigma = 50 * strength;
    const kernelSize = Math.ceil(3 * spatialSigma);
    
    function gaussianWeight(x, sigma) {
        return Math.exp(-(x * x) / (2 * sigma * sigma));
    }
    
    for (const region of selectedRegions) {
        for (const pixelIndex of region) {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            let weightSum = 0;
            let valueSum = 0;
            
            for (let dy = -kernelSize; dy <= kernelSize; dy++) {
                for (let dx = -kernelSize; dx <= kernelSize; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const neighborIndex = (ny * width + nx) * 4;
                        const centerIndex = pixelIndex * 4;
                        
                        const spatialDist = Math.sqrt(dx * dx + dy * dy);
                        const colorDist = Math.abs(data[centerIndex] - data[neighborIndex]);
                        
                        const weight = gaussianWeight(spatialDist, spatialSigma) *
                                     gaussianWeight(colorDist, rangeSigma);
                        
                        weightSum += weight;
                        valueSum += weight * data[neighborIndex];
                    }
                }
            }
            
            const outputValue = Math.round(valueSum / weightSum);
            const index = pixelIndex * 4;
            output[index] = output[index + 1] = output[index + 2] = outputValue;
        }
    }
    
    return new ImageData(output, width, height);
}

self.onmessage = function(e) {
    const { imageData, selectedRegions, value } = e.data;
    
    try {
        const strength = value || 0.5;
        let resultImageData;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applyBilateralFilter(imageData, selectedRegions, strength);
        } else {
            resultImageData = applyBilateralFilter(
                imageData,
                [[...Array(imageData.width * imageData.height).keys()]],
                strength
            );
        }
        
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