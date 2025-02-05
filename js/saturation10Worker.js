// self.onmessage = function(e) {
//     const { imageData, selectedRegions } = e.data;
//     const width = imageData.width;
//     const height = imageData.height;
    
//     const totalIterations = 10;
//     let allSegmentedImages = [];
//     console.log(totalIterations);
  
//     for (let i = 0; i < totalIterations; i++) {
//         const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
        
//         const saturationAdjustment = (100 / totalIterations) * i;
    
//         applySaturationEffect(imageData, newImageData, saturationAdjustment, selectedRegions, width, height);
        
//         allSegmentedImages.push(newImageData);
        
//         if (i % 30 === 0) {
//             self.postMessage({
//                 progress: (i / totalIterations) * 100,
//                 segmentedImages: allSegmentedImages
//             });
//             allSegmentedImages = []; // Clear the array to save memory
//         }
//     }
    
//     self.postMessage({ segmentedImages: allSegmentedImages, isComplete: true });
//   };
  
//   function applySaturationEffect(sourceImageData, targetImageData, saturationAdjustment, selectedRegions, width, height) {
  
//     const selectedPixels = new Set(selectedRegions.flat());
  
//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             const index = (y * width + x) * 4;
            
//             // Only process pixels in the selected region
//             if (selectedPixels.has(y * width + x)) {
//                 const [r, g, b] = [
//                     sourceImageData.data[index],
//                     sourceImageData.data[index + 1],
//                     sourceImageData.data[index + 2]
//                 ];
                
//                 // Convert RGB to HSL
//                 let [h, s, l] = rgbToHsl(r, g, b);
                
//                 // Adjust the saturation
//                 s = (s + saturationAdjustment) % 100;
                
//                 // Convert back to RGB
//                 const [newR, newG, newB] = hslToRgb(h, s, l);
                
//                 targetImageData.data[index] = newR;
//                 targetImageData.data[index + 1] = newG;
//                 targetImageData.data[index + 2] = newB;
//                 targetImageData.data[index + 3] = sourceImageData.data[index + 3]; // Keep alpha unchanged
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
     
//   function rgbToHsl(r, g, b) {
//     r /= 255;
//     g /= 255;
//     b /= 255;
//     const max = Math.max(r, g, b);
//     const min = Math.min(r, g, b);
//     let h, s, l = (max + min) / 2;
  
//     if (max === min) {
//         h = s = 0; // achromatic
//     } else {
//         const d = max - min;
//         s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
//         switch (max) {
//             case r: h = (g - b) / d + (g < b ? 6 : 0); break;
//             case g: h = (b - r) / d + 2; break;
//             case b: h = (r - g) / d + 4; break;
//         }
//         h /= 6;
//     }
  
//     return [h * 360, s * 100, l * 100];
//   }
  
//   // Helper function to convert HSL to RGB
//   function hslToRgb(h, s, l) {
//     h /= 360;
//     s /= 100;
//     l /= 100;
//     let r, g, b;
  
//     if (s === 0) {
//         r = g = b = l; // achromatic
//     } else {
//         const hue2rgb = (p, q, t) => {
//             if (t < 0) t += 1;
//             if (t > 1) t -= 1;
//             if (t < 1/6) return p + (q - p) * 6 * t;
//             if (t < 1/2) return q;
//             if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
//             return p;
//         };
//         const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
//         const p = 2 * l - q;
//         r = hue2rgb(p, q, h + 1/3);
//         g = hue2rgb(p, q, h);
//         b = hue2rgb(p, q, h - 1/3);
//     }
  
//     return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
//   }

const DEFAULT_CYCLE_LENGTH = 0.5; // Cycle length for saturation animation
const DEFAULT_SATURATION_INTENSITY = 1.5; // Intensity of saturation change

let currentIteration = 0;

// Create a transparent ImageData object
function createTransparentImageData(width, height) {
    const buffer = new Uint8ClampedArray(width * height * 4);
    buffer.fill(0);
    return new ImageData(buffer, width, height);
}

// Calculate the bounds of a region
function getBounds(region, width) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    for (let i = 0; i < region.length; i++) {
        const x = region[i] % width;
        const y = Math.floor(region[i] / width);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    }

    return { minX, maxX, minY, maxY };
}

// Convert RGB to grayscale
function rgbToGrayscale(r, g, b) {
    return 0.2989 * r + 0.5870 * g + 0.1140 * b;
}

// Apply saturation effect to the image
function applySaturationEffect(imageData, selectedRegions, t) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);

    // Calculate the phase of the saturation cycle
    const phase = Math.sin(2 * Math.PI * t);

    // Calculate the saturation factor based on the phase
    const saturationFactor = 1 + (phase * DEFAULT_SATURATION_INTENSITY);

    // Apply the saturation effect to each selected region
    selectedRegions.forEach(region => {
        // Iterate over each pixel in the region
        for (let i = 0; i < region.length; i++) {
            const x = region[i] % width;
            const y = Math.floor(region[i] / width);
            const index = (y * width + x) * 4;

            // Get the original pixel values
            const r = imageData.data[index];
            const g = imageData.data[index + 1];
            const b = imageData.data[index + 2];
            const a = imageData.data[index + 3];

            // Convert the pixel to grayscale
            const grayscale = rgbToGrayscale(r, g, b);

            // Apply the saturation effect
            const newR = grayscale + saturationFactor * (r - grayscale);
            const newG = grayscale + saturationFactor * (g - grayscale);
            const newB = grayscale + saturationFactor * (b - grayscale);

            // Clamp the values to ensure they are within the valid range [0, 255]
            newImageData.data[index] = Math.min(255, Math.max(0, newR));
            newImageData.data[index + 1] = Math.min(255, Math.max(0, newG));
            newImageData.data[index + 2] = Math.min(255, Math.max(0, newB));
            newImageData.data[index + 3] = a; // Preserve the alpha channel
        }
    });

    return newImageData;
}

// Handle messages from the main thread
self.onmessage = function (e) {
    try {
        const {
            imageData,
            selectedRegions,
            value,
            reset,
            cycleLength = DEFAULT_CYCLE_LENGTH,
            saturationIntensity = DEFAULT_SATURATION_INTENSITY,
        } = e.data;

        // Reset the iteration counter if requested
        if (reset) {
            currentIteration = 0;
        }

        let resultImageData;
        let progress;

        // Apply effects if regions are selected
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applySaturationEffect(imageData, selectedRegions, value);
            currentIteration = (currentIteration + 1) % cycleLength;
            progress = currentIteration / cycleLength;
        } else {
            // Return the original image data if no regions are selected
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            progress = 1;
        }

        // Send the result back to the main thread
        self.postMessage(
            {
                segmentedImages: [resultImageData],
                isComplete: true,
                iteration: currentIteration,
                progress,
            },
            [resultImageData.data.buffer]
        );
    } catch (error) {
        // Handle errors and send them back to the main thread
        self.postMessage({
            error: `Saturation effect error: ${error.message}`,
            isComplete: true,
            stack: error.stack,
        });
    }
};