
self.onmessage = function(e) {
    const { imageData, selectedRegions } = e.data;
    const width = imageData.width;
    const height = imageData.height;
    
    const totalIterations = 10;
    let allSegmentedImages = [];

    for (let i = 0; i < totalIterations; i++) {
        const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
        
        const horizontalOffset = Math.floor((width / totalIterations) * i);
        const verticalOffset = Math.floor((height / totalIterations) * i);
        
        applyDiagonalEffectUpLeft(imageData, newImageData, selectedRegions, width, height, horizontalOffset, verticalOffset);
        
        allSegmentedImages.push(newImageData);
        
        if (i % 30 === 0) {
            self.postMessage({
                progress: (i / totalIterations) * 100,
                segmentedImages: allSegmentedImages
            });
            allSegmentedImages = []; // Clear the array to save memory
        }
    }
    
    self.postMessage({ segmentedImages: allSegmentedImages, isComplete: true });
};

function applyDiagonalEffectUpLeft(sourceImageData, targetImageData, selectedRegions, width, height, horizontalOffset, verticalOffset) {
    const selectedPixels = new Set(selectedRegions.flat());

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const sourceIndex = (y * width + x) * 4;
            const pixelPosition = y * width + x;
            
            if (selectedPixels.has(pixelPosition)) {
                const newX = (x - horizontalOffset + width) % width;
                const newY = (y - verticalOffset + height) % height;
                const targetIndex = (newY * width + newX) * 4;
                
                targetImageData.data[targetIndex] = sourceImageData.data[sourceIndex];
                targetImageData.data[targetIndex + 1] = sourceImageData.data[sourceIndex + 1];
                targetImageData.data[targetIndex + 2] = sourceImageData.data[sourceIndex + 2];
                targetImageData.data[targetIndex + 3] = sourceImageData.data[sourceIndex + 3];
            } else {
                targetImageData.data[sourceIndex] = sourceImageData.data[sourceIndex];
                targetImageData.data[sourceIndex + 1] = sourceImageData.data[sourceIndex + 1];
                targetImageData.data[sourceIndex + 2] = sourceImageData.data[sourceIndex + 2];
                targetImageData.data[sourceIndex + 3] = sourceImageData.data[sourceIndex + 3];
            }
        }
    }
}
