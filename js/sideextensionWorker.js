

// self.onmessage = function(e) {
//     const { imageData, value } = e.data;
//     const foldAngle = value * 90; 
//     const width = imageData.width;
//     const height = imageData.height;
//     const centerX = width / 2;
    
//     const newImageData = new ImageData(width, height);
    
//     const foldRadians = foldAngle * Math.PI / 180;
//     const foldPosition = Math.round(width / 2);
    
//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             let sourceX;
            
//             if (x < foldPosition) {
//                 sourceX = x;
//             } else {
//                 const dx = x - foldPosition;
//                 const foldedX = dx * Math.cos(foldRadians);
//                 const foldedY = dx * Math.sin(foldRadians);
                
//                 sourceX = Math.round(foldPosition + foldedX);
                
//                 if (foldedY > y) {
//                     continue; // Skip this pixel as it's "behind" the fold
//                 }
//             }
            
//             if (sourceX >= 0 && sourceX < width) {
//                 const oldIndex = (y * width + sourceX) * 4;
//                 const newIndex = (y * width + x) * 4;
                
//                 newImageData.data[newIndex] = imageData.data[oldIndex];
//                 newImageData.data[newIndex + 1] = imageData.data[oldIndex + 1];
//                 newImageData.data[newIndex + 2] = imageData.data[oldIndex + 2];
//                 newImageData.data[newIndex + 3] = imageData.data[oldIndex + 3];
//             }
//         }
//     }
    
//     self.postMessage({ imageData: newImageData });
// };

// Constants
const DEFAULT_ITERATIONS = 120;
let currentIteration = 0;

function applyPageFold(imageData, value) {
    const foldAngle = value * 90;
    const width = imageData.width;
    const height = imageData.height;
    const foldRadians = foldAngle * Math.PI / 180;
    const foldPosition = Math.round(width / 2);
    
    const newImageData = new ImageData(width, height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sourceX;
            
            if (x < foldPosition) {
                sourceX = x;
            } else {
                const dx = x - foldPosition;
                const foldedX = dx * Math.cos(foldRadians);
                const foldedY = dx * Math.sin(foldRadians);
                
                sourceX = Math.round(foldPosition + foldedX);
                
                if (foldedY > y) {
                    continue;
                }
            }
            
            if (sourceX >= 0 && sourceX < width) {
                const oldIndex = (y * width + sourceX) * 4;
                const newIndex = (y * width + x) * 4;
                
                newImageData.data[newIndex] = imageData.data[oldIndex];
                newImageData.data[newIndex + 1] = imageData.data[oldIndex + 1];
                newImageData.data[newIndex + 2] = imageData.data[oldIndex + 2];
                newImageData.data[newIndex + 3] = imageData.data[oldIndex + 3];
            }
        }
    }
    
    return newImageData;
}

self.onmessage = function(e) {
    const { 
        imageData, 
        value = 0.5,
        value5: iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;
    
    try {
        if (reset) {
            currentIteration = 0;
        }

        const resultImageData = applyPageFold(imageData, value);
        
        currentIteration = (currentIteration + 1) % iterations;
        const progress = currentIteration / iterations;

        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};