
// self.onmessage = function(e) {
//     const { imageData, selectedRegions } = e.data;
//     const width = imageData.width;
//     const height = imageData.height;
    
//     const totalIterations = 10;
//     let allSegmentedImages = [];
//     console.log(totalIterations);

//     for (let i = 0; i < totalIterations; i++) {
//         const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
        
//         // Calculate scaling factor based on the current iteration
//         const scaleFactor = 1 - (i / totalIterations) * 0.5;
        
//         if (i === 0) {
//             console.log(`Initial scale factor: ${scaleFactor}`);
//         }
//         if (i === totalIterations - 1) {
//             console.log(`Final scale factor: ${scaleFactor}`);
//         }
        
//         applyDrosteEffect(imageData, newImageData, scaleFactor, selectedRegions, width, height);
        
//         allSegmentedImages.push(newImageData);
        
//         if (i % 30 === 0) {
//             self.postMessage({
//                 progress: (i / totalIterations) * 100,
//                 segmentedImages: allSegmentedImages
//             });
//             allSegmentedImages = []; // Clear the array to save memory
//         }
//     }
    
//     // Send the final batch of processed images back to the main thread
//     self.postMessage({ segmentedImages: allSegmentedImages, isComplete: true });
// };

// function applyDrosteEffect(sourceImageData, targetImageData, scaleFactor, selectedRegions, width, height) {
//     // Create a Set for faster lookup of selected pixels
//     const selectedPixels = new Set(selectedRegions.flat());

//     const centerX = width / 2;
//     const centerY = height / 2;

//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             const index = (y * width + x) * 4;
            
//             // Only process pixels in the selected region
//             if (selectedPixels.has(y * width + x)) {
//                 // Calculate the position relative to the center
//                 const relX = x - centerX;
//                 const relY = y - centerY;

//                 // Scale the position
//                 const scaledX = relX / scaleFactor;
//                 const scaledY = relY / scaleFactor;

//                 // Wrap the scaled position back to image coordinates
//                 const sourceX = Math.round((scaledX + centerX + width) % width);
//                 const sourceY = Math.round((scaledY + centerY + height) % height);

//                 // Get the color from the source position
//                 const sourceIndex = (sourceY * width + sourceX) * 4;
//                 targetImageData.data[index] = sourceImageData.data[sourceIndex];
//                 targetImageData.data[index + 1] = sourceImageData.data[sourceIndex + 1];
//                 targetImageData.data[index + 2] = sourceImageData.data[sourceIndex + 2];
//                 targetImageData.data[index + 3] = sourceImageData.data[sourceIndex + 3];
//             } else {
//                 // For unselected regions, copy the original pixel
//                 targetImageData.data[index] = sourceImageData.data[index];
//                 targetImageData.data[index + 1] = sourceImageData.data[index + 1];
//                 targetImageData.data[index + 2] = sourceImageData.data[index + 2];
//                 targetImageData.data[index + 3] = sourceImageData.data[index + 3];
//             }
//         }
//     }
// }

function applyDrosteEffect(imageData, selectedRegions, iterations = 3, scale = 0.5) {
    const width = imageData.width;
    const height = imageData.height;
    
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );
    
    // Center coordinates
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Calculate maximum radius based on image dimensions
    const maxRadius = Math.min(width, height) / 2;
    
    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Convert to polar coordinates relative to center
            let dx = x - centerX;
            let dy = y - centerY;
            let radius = Math.sqrt(dx * dx + dy * dy);
            let angle = Math.atan2(dy, dx);
            
            // Normalize angle to [0, 2π]
            if (angle < 0) angle += 2 * Math.PI;
            
            // Apply logarithmic spiral transformation
            let logRadius = Math.log(radius / maxRadius) / Math.log(scale);
            let scaledRadius = radius;
            let scaledAngle = angle;
            
            // Get the fractional part for recursion
            let fractionalPart = logRadius - Math.floor(logRadius);
            scaledRadius = maxRadius * Math.pow(scale, fractionalPart);
            scaledAngle = angle + 2 * Math.PI * Math.floor(logRadius);
            
            // Convert back to Cartesian coordinates
            let newX = Math.round(centerX + scaledRadius * Math.cos(scaledAngle));
            let newY = Math.round(centerY + scaledRadius * Math.sin(scaledAngle));
            
            // Ensure coordinates are within bounds
            newX = Math.max(0, Math.min(width - 1, newX));
            newY = Math.max(0, Math.min(height - 1, newY));
            
            // Get source pixel index
            const sourceIdx = (newY * width + newX) * 4;
            const targetIdx = pixelIndex * 4;
            
            // Copy pixel data
            newImageData.data[targetIdx] = imageData.data[sourceIdx];
            newImageData.data[targetIdx + 1] = imageData.data[sourceIdx + 1];
            newImageData.data[targetIdx + 2] = imageData.data[sourceIdx + 2];
            newImageData.data[targetIdx + 3] = imageData.data[sourceIdx + 3];
        });
    });
    
    return newImageData;
}

self.onmessage = function(e) {
    const { imageData, selectedRegions, value, value2 } = e.data;
    
    try {
        const iterations = value || 3; // Default iterations
        const scale = value2 || 0.5;  // Default scale factor
        
        let resultImageData;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applyDrosteEffect(
                imageData,
                selectedRegions,
                iterations,
                scale
            );
        } else {
            // If no regions selected, apply to entire image
            resultImageData = applyDrosteEffect(
                imageData,
                [[...Array(imageData.width * imageData.height).keys()]],
                iterations,
                scale
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