// self.onmessage = function(e) {
//     const { 
//         imageData, 
//         selectedRegions, 
//         imageCount, 
//         maxBrightness, 
//         value1, 
//         value2, 
//         value3, 
//         value4, 
//         value5, 
//         clickedPoints, 
//         lines 
//     } = e.data;

//     const segmentedImages = generateBrightnessVariations(
//         imageData, 
//         selectedRegions, 
//         imageCount, 
//         maxBrightness, 
//         value1, 
//         value2, 
//         value3, 
//         value4, 
//         value5, 
//         clickedPoints, 
//         lines
//     );

//     self.postMessage({ segmentedImages });
// };

// function generateBrightnessVariations(
//     imageData, 
//     selectedRegions, 
//     imageCount, 
//     maxBrightness, 
//     value1, 
//     value2, 
//     value3, 
//     value4, 
//     value5, 
//     clickedPoints, 
//     lines
// ) {
//     const segmentedImages = [];
//     const step = (maxBrightness * 2) / (imageCount - 1);

//     for (let i = 0; i < imageCount; i++) {
//         const brightness = -maxBrightness + (step * i);
//         const adjustedImageData = adjustImageBrightness(
//             imageData, 
//             selectedRegions, 
//             brightness, 
//             value1, 
//             value2, 
//             value3, 
//             value4, 
//             value5, 
//             clickedPoints, 
//             lines
//         );
//         segmentedImages.push(adjustedImageData);
//     }

//     return segmentedImages;
// }


// function adjustImageBrightness(
//     imageData, 
//     selectedRegions, 
//     brightness, 
//     value1, 
//     value2, 
//     value3, 
//     value4, 
//     value5, 
//     clickedPoints, 
//     lines
// ) {
//     const adjustedData = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);

//     const selectedPixels = new Set(selectedRegions.flat());

//     for (let i = 0; i < adjustedData.data.length; i += 4) {
//         const pixelIndex = i / 4;
//         if (selectedPixels.has(pixelIndex)) {
//             for (let j = 0; j < 3; j++) {
//                 adjustedData.data[i + j] = clamp(imageData.data[i + j] + brightness);
//             }
//         } else {
//             // For pixels not in the selected region, keep the original color
//             adjustedData.data[i] = imageData.data[i];
//             adjustedData.data[i + 1] = imageData.data[i + 1];
//             adjustedData.data[i + 2] = imageData.data[i + 2];
//         }
//         adjustedData.data[i + 3] = imageData.data[i + 3]; // Keep original alpha
//     }

//     return adjustedData;
// }

// function clamp(value) {
//     return Math.max(0, Math.min(255, Math.round(value)));
// }


const DEFAULT_BRIGHTNESS_RANGE = 50; // Maximum brightness adjustment (+/-)
const DEFAULT_ITERATIONS = 120;

let currentIteration = 0;

function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

function copyImageData(source, destination) {
    destination.data.set(source.data);
}

function adjustBrightness(imageData, brightnessFactor) {
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        // Skip if pixel is transparent
        if (data[i + 3] === 0) continue;
        
        // Adjust RGB values
        for (let c = 0; c < 3; c++) {
            const newValue = data[i + c] + brightnessFactor;
            data[i + c] = Math.min(255, Math.max(0, newValue));
        }
        // Alpha channel remains unchanged
    }
}

function adjustSelectedRegionsBrightness(imageData, selectedRegions, brightnessRange) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    copyImageData(imageData, newImageData);
    
    selectedRegions.forEach(region => {
        // Random brightness adjustment within the specified range
        const brightnessFactor = (Math.random() * 2 - 1) * brightnessRange;
        
        // Adjust brightness only for selected pixels
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            
            // Copy original pixel values
            for (let c = 0; c < 4; c++) {
                if (c < 3) { // RGB channels
                    const newValue = newImageData.data[baseIndex + c] + brightnessFactor;
                    newImageData.data[baseIndex + c] = Math.min(255, Math.max(0, newValue));
                }
                // Alpha channel remains unchanged
            }
        });
    });
    
    return newImageData;
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value, 
        value2: brightnessRange = DEFAULT_BRIGHTNESS_RANGE,
        value5: iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;
    
    try {
        if (reset) {
            currentIteration = 0;
        }
        
        let resultImageData;
        let progress;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = adjustSelectedRegionsBrightness(imageData, selectedRegions, brightnessRange);
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            // Global brightness adjustment
            const brightnessFactor = Math.sin(currentIteration / iterations * Math.PI * 2) * brightnessRange;
            adjustBrightness(resultImageData, brightnessFactor);
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