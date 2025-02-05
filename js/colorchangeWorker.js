
self.onmessage = (e) => {
    const { imageData, selectedRegions } = e.data;
    console.log(imageData);
    selectedRegions.forEach(region => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        
        region.forEach(pixelIndex => {
            imageData.data[pixelIndex * 4] = r;
            imageData.data[pixelIndex * 4 + 1] = g;
            imageData.data[pixelIndex * 4 + 2] = b;
            imageData.data[pixelIndex * 4 + 3] = 255;
        });
    });
    
    self.postMessage({
        segmentedImages: [imageData],
        isComplete: true
    });
};