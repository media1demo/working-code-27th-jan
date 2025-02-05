self.onmessage = function(e) {
    const { imageData, selectedRegions, imageCount, maxBrightness, value1, value2, value3, value4, value5, clickedPoints, lines } = e.data;
    
    const segmentedImages = [];
    
    function applyFaceMovement(imgData, strength) {
        const newImageData = new ImageData(new Uint8ClampedArray(imgData.data), imgData.width, imgData.height);
        
        for (let y = 0; y < imgData.height; y++) {
            for (let x = 0; x < imgData.width; x++) {
                const sourceX = Math.floor(x + Math.sin(y / 10) * strength);
                if (sourceX >= 0 && sourceX < imgData.width) {
                    const targetIndex = (y * imgData.width + x) * 4;
                    const sourceIndex = (y * imgData.width + sourceX) * 4;
                    for (let i = 0; i < 4; i++) {
                        newImageData.data[targetIndex + i] = imgData.data[sourceIndex + i];
                    }
                }
            }
        }
        
        return newImageData;
    }

    for (let i = 0; i < imageCount; i++) {
        const strength = (i / (imageCount - 1)) * 10; // Adjust range as needed
        const modifiedImage = applyFaceMovement(imageData, strength);
        segmentedImages.push(modifiedImage);
        
        if (i % 10 === 0 || i === imageCount - 1) {
            self.postMessage({
                segmentedImages: [modifiedImage],
                isComplete: i === imageCount - 1
            });
        }
    }
};