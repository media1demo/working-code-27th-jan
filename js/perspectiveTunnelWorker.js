// self.onmessage = function(e) {
//     const { imageData, value } = e.data;
//     const tunnelStrength = value * 0.5; // Adjust this multiplier to control the effect strength

//     const width = imageData.width;
//     const height = imageData.height;
//     const centerX = width / 2;
//     const centerY = height / 2;

//     const newImageData = new ImageData(width, height);

//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             const dx = x - centerX;
//             const dy = y - centerY;

//             const distance = Math.sqrt(dx * dx + dy * dy);
//             const angle = Math.atan2(dy, dx);
//             const r = distance / (1 + tunnelStrength * (distance / Math.max(width, height)));

//             const sourceX = Math.round(centerX + r * Math.cos(angle));
//             const sourceY = Math.round(centerY + r * Math.sin(angle));

//             if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
//                 const oldIndex = (sourceY * width + sourceX) * 4;
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


const DEFAULT_ITERATIONS = 120;
let currentIteration = 0;

function tunnelEffect(imageData, value) {
    const tunnelStrength = value * 0.5;
    const width = imageData.width;
    const height = imageData.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    const newImageData = new ImageData(new Uint8ClampedArray(imageData.data.length), width, height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            const r = distance / (1 + tunnelStrength * (distance / Math.max(width, height)));
            
            const sourceX = Math.round(centerX + r * Math.cos(angle));
            const sourceY = Math.round(centerY + r * Math.sin(angle));
            
            if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                const sourceIndex = (sourceY * width + sourceX) * 4;
                const targetIndex = (y * width + x) * 4;
                
                // Copy all channels (R,G,B,A)
                newImageData.data[targetIndex] = imageData.data[sourceIndex];
                newImageData.data[targetIndex + 1] = imageData.data[sourceIndex + 1];
                newImageData.data[targetIndex + 2] = imageData.data[sourceIndex + 2];
                newImageData.data[targetIndex + 3] = imageData.data[sourceIndex + 3];
            }
        }
    }
    
    return newImageData;
}

self.onmessage = function(e) {
    const { imageData, value = 0.5, value5: iterations = DEFAULT_ITERATIONS, reset } = e.data;
    
    try {
        if (reset) currentIteration = 0;
        
        const resultImageData = tunnelEffect(imageData, value);
        currentIteration = (currentIteration + 1) % iterations;
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress: currentIteration / iterations
        }, [resultImageData.data.buffer]);
    } catch (error) {
        self.postMessage({ 
            error: error.message, 
            isComplete: true 
        });
    }
};