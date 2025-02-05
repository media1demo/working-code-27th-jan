// self.onmessage = function(e) {
//     const { imageData, value } = e.data;
//     const rotatedImageData = rotateImage(imageData, value, 'topRight');
//     self.postMessage({ imageData: rotatedImageData });
// };

// function rotateImage(imageData, angle, corner) {
//     const canvas = new OffscreenCanvas(imageData.width, imageData.height);
//     const ctx = canvas.getContext('2d');
//     ctx.putImageData(imageData, 0, 0);

//     const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
//     const tempCtx = tempCanvas.getContext('2d');

//     tempCtx.translate(imageData.width, 0);
//     tempCtx.rotate(angle * Math.PI / 180);
//     tempCtx.translate(-imageData.width, 0);

//     tempCtx.drawImage(canvas, 0, 0);

//     return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
// }

// Constants
const DEFAULT_ANGLE = 45;
const CORNERS = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];

function rotateImage(imageData, angle, corner) {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    
    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');
    
    // Set rotation point based on corner
    let translateX = 0;
    let translateY = 0;
    
    switch(corner) {
        case 'topLeft':
            translateX = 0;
            translateY = 0;
            break;
        case 'topRight':
            translateX = imageData.width;
            translateY = 0;
            break;
        case 'bottomLeft':
            translateX = 0;
            translateY = imageData.height;
            break;
        case 'bottomRight':
            translateX = imageData.width;
            translateY = imageData.height;
            break;
    }
    
    tempCtx.translate(translateX, translateY);
    tempCtx.rotate(angle * Math.PI / 180);
    tempCtx.translate(-translateX, -translateY);
    
    tempCtx.drawImage(canvas, 0, 0);
    return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
}

self.onmessage = function(e) {
    const { 
        imageData, 
        value: angle = DEFAULT_ANGLE,
        corner = 'topRight',
        reset 
    } = e.data;
    
    try {
        const resultImageData = rotateImage(imageData, angle, corner);
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            corner
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};