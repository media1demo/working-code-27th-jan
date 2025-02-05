self.onmessage = function(e) {
    const { imageData, selectedRegions } = e.data;
    const width = imageData.width;
    const height = imageData.height;
    
    const totalIterations = 10;
    let allSegmentedImages = [];
    console.log(totalIterations);

    for (let i = 0; i < totalIterations; i++) {
        // First apply the block dissolve effect
        const dissolvedImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
        applyAdditionalEffects(dissolvedImageData, selectedRegions, width, height, i, totalIterations);
        
        // Then apply the hue adjustment effect
        const hueAdjustedImageData = new ImageData(new Uint8ClampedArray(dissolvedImageData.data), width, height);
        const hueAdjustment = (360 / totalIterations) * i;
        // applyHueAdjustment(hueAdjustedImageData, hueAdjustment);
        
        allSegmentedImages.push(hueAdjustedImageData);
        
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


function applyAdditionalEffects(imageData, value2, value3, value4, value5) {

    const redAdjustment = value2 / 100; // Assuming value2 is a percentage

    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] * (1 + redAdjustment)));
    }

}