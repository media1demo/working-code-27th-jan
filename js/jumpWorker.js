// // // jumpWorker.js

// // self.onmessage = function(e) {
// //     const { imageData, value, clickedPoints } = e.data;
// //     const jumpedImageData = applyJumpEffect(imageData, value, clickedPoints);
// //     self.postMessage({ imageData: jumpedImageData });
// // };

// // function applyJumpEffect(imageData, progress, clickedPoints) {
// //     const canvas = new OffscreenCanvas(imageData.width, imageData.height);
// //     const ctx = canvas.getContext('2d');
// //     ctx.putImageData(imageData, 0, 0);

// //     const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
// //     const tempCtx = tempCanvas.getContext('2d');

// //     // Calculate jump height
// //     const maxJumpHeight = 50; // Adjust this value to change the maximum jump height
// //     const jumpHeight = Math.sin(progress * Math.PI) * maxJumpHeight;

// //     // Apply jump effect
// //     tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
// //     tempCtx.drawImage(canvas, 0, -jumpHeight);

// //     // If there are clicked points, we'll make those parts of the image jump higher
// //     if (clickedPoints && clickedPoints.length > 0) {
// //         const radius = 30; // Radius around clicked points to affect
// //         clickedPoints.forEach(point => {
// //             const extraJump = 20; // Extra jump height for clicked areas
// //             tempCtx.save();
// //             tempCtx.beginPath();
// //             tempCtx.arc(point.x, point.y, radius, 0, Math.PI * 2);
// //             tempCtx.clip();
// //             tempCtx.drawImage(canvas, 0, -(jumpHeight + extraJump));
// //             tempCtx.restore();
// //         });
// //     }

// //     return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
// // }

// self.onmessage = function(e) {
//     const { imageData, progress, clickedPoints } = e.data;

//     console.log("Applying jump effect");

//     function applyJumpEffect(imageData, progress, clickedPoints) {
//         const canvas = new OffscreenCanvas(imageData.width, imageData.height);
//         const ctx = canvas.getContext('2d');
//         ctx.putImageData(imageData, 0, 0);

//         const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
//         const tempCtx = tempCanvas.getContext('2d');

//         // Calculate jump height
//         const maxJumpHeight = 50; // Adjust this value to change the maximum jump height
//         const jumpHeight = Math.sin(progress * Math.PI) * maxJumpHeight;

//         // Apply jump effect
//         tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
//         tempCtx.drawImage(canvas, 0, -jumpHeight);

//         // If there are clicked points, make those parts of the image jump higher
//         if (clickedPoints && clickedPoints.length > 0) {
//             const radius = 30; // Radius around clicked points to affect
//             const extraJump = 20; // Extra jump height for clicked areas
//             clickedPoints.forEach(point => {
//                 tempCtx.save();
//                 tempCtx.beginPath();
//                 tempCtx.arc(point.x, point.y, radius, 0, Math.PI * 2);
//                 tempCtx.clip();
//                 tempCtx.drawImage(canvas, 0, -(jumpHeight + extraJump));
//                 tempCtx.restore();
//             });
//         }

//         return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
//     }

//     try {
//         // Apply jump effect
//         const jumpedImage = applyJumpEffect(imageData, progress, clickedPoints);
//         console.log("Jump effect completed");

//         // Return the result
//         self.postMessage({
//             segmentedImages: [jumpedImage],
//             isComplete: true
//         });

//     } catch (error) {
//         console.error("Error occurred:", error);
//         self.postMessage({
//             error: error.message,
//             isComplete: true
//         });
//     }
// };


// Constants
const DEFAULT_MAX_VERTICAL_OFFSET = 50;
const DEFAULT_ITERATIONS = 120;
const DEFAULT_MOVE_STEP = 20;

let currentIteration = 0;

// Helper function to create new ImageData with transparent background
function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

// Helper function to copy image data
function copyImageData(source, destination) {
    destination.data.set(source.data);
}

// Function to move entire region up
function moveRegionUp(imageData, totalMove) {
    const width = imageData.width;
    const height = imageData.height;
    const tempBuffer = new Uint8ClampedArray(imageData.data);
    
    // Clear destination area
    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = 0;     // R
        imageData.data[i + 1] = 0; // G
        imageData.data[i + 2] = 0; // B
        imageData.data[i + 3] = 0; // A
    }
    
    // Move pixels to new position
    for (let y = 0; y < height; y++) {
        const newY = Math.max(y - totalMove, 0); // Move upwards
        if (newY !== y) {
            for (let x = 0; x < width; x++) {
                const sourceIdx = (y * width + x) * 4;
                const destIdx = (newY * width + x) * 4;
                
                // Copy pixel data
                for (let c = 0; c < 4; c++) {
                    imageData.data[destIdx + c] = tempBuffer[sourceIdx + c];
                }
            }
        }
    }
}

// Function to move selected regions upwards
function moveSelectedRegions(imageData, selectedRegions, maxVerticalOffset) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    copyImageData(imageData, newImageData);
    
    selectedRegions.forEach(region => {
        const verticalOffset = Math.random() * maxVerticalOffset;
        const tempBuffer = new Uint8ClampedArray(width * height * 4);
        
        // Clear selected region
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            for (let c = 0; c < 4; c++) {
                newImageData.data[baseIndex + c] = 0;
            }
        });
        
        // Move pixels upwards
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            const newY = Math.max(0, y - verticalOffset); // Move upwards
            
            if (newY >= 0 && newY < height) {
                const sourceIndex = (y * width + x) * 4;
                const targetIndex = (Math.floor(newY) * width + x) * 4;
                
                for (let c = 0; c < 4; c++) {
                    tempBuffer[targetIndex + c] = imageData.data[sourceIndex + c];
                }
            }
        });
        
        // Blend moved pixels
        for (let i = 0; i < tempBuffer.length; i += 4) {
            if (tempBuffer[i + 3] > 0) {
                for (let c = 0; c < 4; c++) {
                    newImageData.data[i + c] = tempBuffer[i + c];
                }
            }
        }
    });
    
    return newImageData;
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value, 
        value2: maxVerticalOffset = DEFAULT_MAX_VERTICAL_OFFSET,
        value5: iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;
    
    try {
        // Reset counter if requested
        if (reset) {
            currentIteration = 0;
        }
        
        let resultImageData;
        let progress;
        
        // Handle different modes based on whether regions are selected
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Selected regions mode
            resultImageData = moveSelectedRegions(imageData, selectedRegions, maxVerticalOffset);
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // Full image mode
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            const totalMove = DEFAULT_MOVE_STEP * (currentIteration + 1);
            moveRegionUp(resultImageData, totalMove); // Move upwards
            currentIteration++;
            progress = undefined;
        }
        
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