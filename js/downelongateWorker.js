self.onmessage = function(e) {
    const { imageData, mode = 'stretch' } = e.data;
    
    try {
        let resultImageData;
        
        switch(mode) {
            case 'stretch':
                resultImageData = stretchImage(imageData);
                break;
            case 'shift':
                resultImageData = shiftImage(imageData);
                break;
            default:
                throw new Error('Invalid mode');
        }
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true
        }, [resultImageData.data.buffer]);
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};

function stretchImage(imageData) {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    
    const stretchFactor = 1.2;
    const midPoint = imageData.height / 2;
    
    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');
    
    // Top half remains unchanged
    tempCtx.drawImage(canvas, 0, 0, imageData.width, midPoint, 0, 0, imageData.width, midPoint);
    
    // Bottom half stretched
    tempCtx.drawImage(
        canvas, 
        0, midPoint, imageData.width, midPoint, 
        0, midPoint, imageData.width, midPoint * stretchFactor
    );
    
    return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
}

function shiftImage(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = new ImageData(width, height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const sourceIndex = (y * width + x) * 4;
            const destIndex = (y * width + ((x + 20) % width)) * 4;
            
            for (let c = 0; c < 4; c++) {
                newImageData.data[destIndex + c] = imageData.data[sourceIndex + c];
            }
        }
    }
    
    return newImageData;
}