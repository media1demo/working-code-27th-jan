// self.onmessage = function(e) {
//     const { imageData, value } = e.data;
//     const tileSize = Math.floor(value * 20) + 1; // 1 to 21
    
//     const width = imageData.width;
//     const height = imageData.height;
//     const newImageData = new ImageData(width, height);
    
//     for (let y = 0; y < height; y += tileSize) {
//         for (let x = 0; x < width; x += tileSize) {
//             let r = 0, g = 0, b = 0, a = 0, count = 0;
            
//             for (let ty = 0; ty < tileSize && y + ty < height; ty++) {
//                 for (let tx = 0; tx < tileSize && x + tx < width; tx++) {
//                     const sourceIndex = ((y + ty) * width + (x + tx)) * 4;
//                     r += imageData.data[sourceIndex];
//                     g += imageData.data[sourceIndex + 1];
//                     b += imageData.data[sourceIndex + 2];
//                     a += imageData.data[sourceIndex + 3];
//                     count++;
//                 }
//             }
            
//             r = Math.floor(r / count);
//             g = Math.floor(g / count);
//             b = Math.floor(b / count);
//             a = Math.floor(a / count);
            
//             for (let ty = 0; ty < tileSize && y + ty < height; ty++) {
//                 for (let tx = 0; tx < tileSize && x + tx < width; tx++) {
//                     const targetIndex = ((y + ty) * width + (x + tx)) * 4;
//                     newImageData.data[targetIndex] = r;
//                     newImageData.data[targetIndex + 1] = g;
//                     newImageData.data[targetIndex + 2] = b;
//                     newImageData.data[targetIndex + 3] = a;
//                 }
//             }
//         }
//     }
    
//     self.postMessage({ imageData: newImageData });
// };

// Worker script: imageWorker.js

const DEFAULT_ITERATIONS = 120;
let currentIteration = 0;

function applyTileEffect(imageData, value) {
    const tileSize = Math.floor(value * 20) + 1; // 1 to 21
    
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = new ImageData(width, height);
    
    for (let y = 0; y < height; y += tileSize) {
        for (let x = 0; x < width; x += tileSize) {
            let r = 0, g = 0, b = 0, a = 0, count = 0;
            
            for (let ty = 0; ty < tileSize && y + ty < height; ty++) {
                for (let tx = 0; tx < tileSize && x + tx < width; tx++) {
                    const sourceIndex = ((y + ty) * width + (x + tx)) * 4;
                    r += imageData.data[sourceIndex];
                    g += imageData.data[sourceIndex + 1];
                    b += imageData.data[sourceIndex + 2];
                    a += imageData.data[sourceIndex + 3];
                    count++;
                }
            }
            
            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);
            a = Math.floor(a / count);
            
            for (let ty = 0; ty < tileSize && y + ty < height; ty++) {
                for (let tx = 0; tx < tileSize && x + tx < width; tx++) {
                    const targetIndex = ((y + ty) * width + (x + tx)) * 4;
                    newImageData.data[targetIndex] = r;
                    newImageData.data[targetIndex + 1] = g;
                    newImageData.data[targetIndex + 2] = b;
                    newImageData.data[targetIndex + 3] = a;
                }
            }
        }
    }
    
    return newImageData;
}

self.onmessage = function (e) {
    const { imageData, value = 0.5, value5: iterations = DEFAULT_ITERATIONS, reset } = e.data;
    
    try {
        if (reset) currentIteration = 0;
        const resultImageData = applyTileEffect(imageData, value);
        currentIteration = (currentIteration + 1) % iterations;
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress: currentIteration / iterations,
        });
    } catch (error) {
        self.postMessage({ error: error.message, isComplete: true });
    }
};