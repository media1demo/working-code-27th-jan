async function createImageDataFromBlob(blob, width, height) {
    const bitmap = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);
    return ctx.getImageData(0, 0, width, height);
}

async function replacePicsumEffect(imageData, selectedRegions) {
    const width = imageData.width;
    const height = imageData.height;
    
    const response = await fetch(`https://picsum.photos/${width}/${height}`);
    const blob = await response.blob();
    const picsumImageData = await createImageDataFromBlob(blob, width, height);
    
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );
    
    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            const idx = pixelIndex * 4;
            for (let c = 0; c < 4; c++) {
                newImageData.data[idx + c] = picsumImageData.data[idx + c];
            }
        });
    });
    
    return newImageData;
}

self.onmessage = async function(e) {
    const { imageData, selectedRegions } = e.data;
    
    try {
        let resultImageData;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = await replacePicsumEffect(imageData, selectedRegions);
        } else {
            resultImageData = await replacePicsumEffect(
                imageData,
                [[...Array(imageData.width * imageData.height).keys()]]
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