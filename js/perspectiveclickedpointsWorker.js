// self.onmessage = function(e) {
//     const { imageData, value, clickedPoints } = e.data;
//     console.log("Worker received:", { rotation: value.rotation, points: clickedPoints.length });
    
//     const result = applyPerspectiveAroundPoints(imageData, value, clickedPoints);
//     self.postMessage({ imageData: result });
// };

// function applyPerspectiveAroundPoints(imageData, value, clickedPoints) {
//     const { width, height, data } = imageData;
//     const newData = new Uint8ClampedArray(data.length);

//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             let maxPerspective = 0;
//             let closestPoint = null;

//             clickedPoints.forEach(point => {
//                 const dx = x - point.x;
//                 const dy = y - point.y;
//                 const distance = Math.sqrt(dx * dx + dy * dy);
//                 const perspective = Math.exp(-distance * 0.005);
                
//                 if (perspective > maxPerspective) {
//                     maxPerspective = perspective;
//                     closestPoint = point;
//                 }
//             }); 

//             if (maxPerspective > 0) {
//                 const perspectiveX = value.perspectiveX * maxPerspective;
//                 const perspectiveY = value.perspectiveY * maxPerspective;

//                 const sourceX = Math.round(x + perspectiveX * (x - closestPoint.x) / width);
//                 const sourceY = Math.round(y + perspectiveY * (y - closestPoint.y) / height);

//                 if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
//                     const targetIndex = (y * width + x) * 4;
//                     const sourceIndex = (sourceY * width + sourceX) * 4;
//                     for (let i = 0; i < 4; i++) {
//                         newData[targetIndex + i] = data[sourceIndex + i];
//                     }
//                 }
//             } else {
//                 const index = (y * width + x) * 4;
//                 for (let i = 0; i < 4; i++) {
//                     newData[index + i] = data[index + i];
//                 }
//             }
//         }
//     }

//     return new ImageData(newData, width, height);
// }
// Constants for VR effect with perspective
const DEFAULT_MAX_HORIZONTAL_OFFSET = 50;
const DEFAULT_ITERATIONS = 120;
const DEFAULT_MOVE_STEP = 20;

// VR and perspective constants
const BARREL_DISTORTION = 0.2;
const CHROMATIC_ABERRATION = 2.0;
const PERSPECTIVE_STRENGTH = 0.8;

function applyPerspectiveDistortion(imageData, value, clickedPoints) {
    const { width, height, data } = imageData;
    const result = new ImageData(
        new Uint8ClampedArray(data.length),
        width,
        height
    );
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Calculate perspective influence from all points
            let maxEffect = 0;
            let nearestPoint = null;
            
            // Find strongest influence point
            clickedPoints.forEach(point => {
                const dx = x - point.x;
                const dy = y - point.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const effect = Math.exp(-distance * 0.005) * PERSPECTIVE_STRENGTH;
                
                if (effect > maxEffect) {
                    maxEffect = effect;
                    nearestPoint = point;
                }
            });
            
            if (maxEffect > 0 && nearestPoint) {
                // Apply perspective transformation
                const perspectiveX = value.perspectiveX * maxEffect;
                const perspectiveY = value.perspectiveY * maxEffect;
                
                // Calculate source position with perspective
                const sourceX = Math.round(x + perspectiveX * (x - nearestPoint.x) / width);
                const sourceY = Math.round(y + perspectiveY * (y - nearestPoint.y) / height);
                
                // Ensure source position is within bounds
                if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                    const targetIdx = (y * width + x) * 4;
                    const sourceIdx = (sourceY * width + sourceX) * 4;
                    
                    // Apply chromatic aberration
                    const aberrationX = Math.round(CHROMATIC_ABERRATION * maxEffect);
                    
                    // Red channel with offset
                    const rSourceX = Math.min(width - 1, sourceX + aberrationX);
                    const rSourceIdx = (sourceY * width + rSourceX) * 4;
                    result.data[targetIdx] = data[rSourceIdx];
                    
                    // Green channel
                    result.data[targetIdx + 1] = data[sourceIdx + 1];
                    
                    // Blue channel with opposite offset
                    const bSourceX = Math.max(0, sourceX - aberrationX);
                    const bSourceIdx = (sourceY * width + bSourceX) * 4;
                    result.data[targetIdx + 2] = data[bSourceIdx + 2];
                    
                    // Alpha channel
                    result.data[targetIdx + 3] = data[sourceIdx + 3];
                }
            } else {
                // Copy original pixel if no perspective effect
                const idx = (y * width + x) * 4;
                for (let i = 0; i < 4; i++) {
                    result.data[idx + i] = data[idx + i];
                }
            }
        }
    }
    
    return result;
}

self.onmessage = function(e) {
    const { imageData, clickedPoints, value } = e.data;
    
    try {
        const resultImageData = applyPerspectiveDistortion(imageData, value, clickedPoints);
        
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