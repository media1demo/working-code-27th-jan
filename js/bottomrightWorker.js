// self.onmessage = function(e) {
//     const { imageData, value } = e.data;
//     const width = imageData.width;
//     const height = imageData.height;

//     const newImageData = new ImageData(width, height);

//     newImageData.data.set(imageData.data);

//     const halfWidth = Math.floor(width / 2);
//     const halfHeight = Math.floor(height / 2);

//     const shiftX = Math.floor(value * halfWidth);
//     const shiftY = Math.floor(value * halfHeight);

//     for (let y = halfHeight; y < height; y++) {
//         for (let x = halfWidth; x < width; x++) {
//             const newX = halfWidth + ((x - halfWidth + shiftX) % halfWidth);
//             const newY = halfHeight + ((y - halfHeight + shiftY) % halfHeight);

//             const sourceIndex = (y * width + x) * 4;
//             const targetIndex = (newY * width + newX) * 4;

//             for (let i = 0; i < 4; i++) {
//                 newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
//             }
//         }
//     }

//     self.postMessage({ imageData: newImageData });
// };

let currentIteration = 0;
const DEFAULT_MOVE_STEP = 20;

function moveRegionDownRight(imageData, totalMove) {
    const width = imageData.width;
    const height = imageData.height;
    const tempBuffer = new Uint8ClampedArray(imageData.data);
    
    for (let i = 0; i < imageData.data.length; i += 4) {
        for (let c = 0; c < 4; c++) {
            imageData.data[i + c] = 0;
        }
    }
    
    // Move pixels down and right
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const newY = Math.min(y + totalMove, height - 1);
            const newX = Math.min(x + totalMove, width - 1);
            
            if (newY !== y || newX !== x) {
                const sourceIdx = (y * width + x) * 4;
                const destIdx = (newY * width + newX) * 4;
                
                for (let c = 0; c < 4; c++) {
                    imageData.data[destIdx + c] = tempBuffer[sourceIdx + c];
                }
            }
        }
    }
}

self.onmessage = function(e) {
    const { imageData, reset } = e.data;
    
    try {
        if (reset) currentIteration = 0;
        
        const resultImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );
        
        const totalMove = DEFAULT_MOVE_STEP * (currentIteration + 1);
        moveRegionDownRight(resultImageData, totalMove);
        currentIteration++;
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};