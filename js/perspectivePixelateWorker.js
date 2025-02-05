self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const pixelSize = Math.floor(value * 20) + 1; // 1 to 21
    
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = new ImageData(width, height);
    
    for (let y = 0; y < height; y += pixelSize) {
        for (let x = 0; x < width; x += pixelSize) {
            const sourceIndex = (y * width + x) * 4;
            const r = imageData.data[sourceIndex];
            const g = imageData.data[sourceIndex + 1];
            const b = imageData.data[sourceIndex + 2];
            const a = imageData.data[sourceIndex + 3];
            
            for (let py = 0; py < pixelSize && y + py < height; py++) {
                for (let px = 0; px < pixelSize && x + px < width; px++) {
                    const targetIndex = ((y + py) * width + (x + px)) * 4;
                    newImageData.data[targetIndex] = r;
                    newImageData.data[targetIndex + 1] = g;
                    newImageData.data[targetIndex + 2] = b;
                    newImageData.data[targetIndex + 3] = a;
                }
            }
        }
    }
    
    self.postMessage({ imageData: newImageData });
};