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

//     const segmentedImages = [];

//     const hueSteps = 8; // Increase the number of hue variations
//     const additionalVariations = 8; // To achieve 64x, we need 8 variations per hue shift

//     for (let i = 0; i < imageCount; i++) {
//         for (let hueVariation = 0; hueVariation < hueSteps; hueVariation++) {
//             const hueShift = ((i * hueSteps + hueVariation) / ((imageCount * hueSteps) - 1)) * 360;

//             for (let variation = 0; variation < additionalVariations; variation++) {
//                 const newImageData = new ImageData(
//                     new Uint8ClampedArray(imageData.data),
//                     imageData.width,
//                     imageData.height
//                 );

//                 for (const region of selectedRegions) {
//                     for (const pixelIndex of region) {
//                         const x = pixelIndex % imageData.width;
//                         const y = Math.floor(pixelIndex / imageData.width);
//                         const index = (y * imageData.width + x) * 4;

//                         let [h, s, l] = rgbToHsl(
//                             newImageData.data[index],
//                             newImageData.data[index + 1],
//                             newImageData.data[index + 2]
//                         );

//                         // More aggressive lightening for dark pixels
//                         if (l < 0.2) {
//                             l = Math.min(1, l + 0.4);
//                         } else if (l < 0.5) {
//                             l = Math.min(1, l + 0.3);
//                         }

//                         // More pronounced saturation increase
//                         s = Math.min(1, s * 2);

//                         // Apply hue shift
//                         const newHue = (h + hueShift) % 360;
                        
//                         const [r, g, b] = hslToRgb(newHue, s, l);

//                         newImageData.data[index] = r;
//                         newImageData.data[index + 1] = g;
//                         newImageData.data[index + 2] = b;
//                     }
//                 }
//                 applyAdditionalEffects(newImageData, value1 + variation, value2 + variation, value3, value4, value5);
//                 segmentedImages.push(newImageData);
//             }
//         }
//     }

//     self.postMessage({ segmentedImages: segmentedImages });
// };




self.onmessage = function(e) {
    const { imageData, selectedRegions, value1, value2, value3, value4, value5 } = e.data;
    const width = imageData.width;
    const height = imageData.height;
    
    const totalIterations = 10;
    let allSegmentedImages = [];
    console.log(totalIterations);

    for (let i = 0; i < totalIterations; i++) {
        const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
        
        // Calculate brightness adjustment based on the current iteration
        const maxBrightnessAdjustment = 50; // Maximum brightness adjustment
        const brightnessAdjustment = maxBrightnessAdjustment * Math.sin((i / totalIterations) * Math.PI * 2);

        if (i === 0) {
            console.log(`Initial brightness adjustment: ${brightnessAdjustment}`);
        }
        if (i === totalIterations - 1) {
            console.log(`Final brightness adjustment: ${brightnessAdjustment}`);
        }

        // applyBrightnessEffect(newImageData, brightnessAdjustment, selectedRegions, width, height);
        applyAdditionalEffects(newImageData, value1, value2, value3, value4, value5);

        allSegmentedImages.push(newImageData);
        
        if (i % 30 === 0) {
            self.postMessage({
                progress: (i / totalIterations) * 100,
                segmentedImages: allSegmentedImages
            });
            allSegmentedImages = []; // Clear the array to save memory
        }
    }
    
    // Send the final batch of processed images back to the main thread
    self.postMessage({ segmentedImages: allSegmentedImages, isComplete: true });
};



function applyAdditionalEffects(imageData, value1, value2, value3, value4, value5) {
    const saturationAdjustment = value1 / 100;

    for (let i = 0; i < imageData.data.length; i += 4) {
        const [h, s, l] = rgbToHsl(
            imageData.data[i],
            imageData.data[i + 1],
            imageData.data[i + 2]
        );

        const newSaturation = Math.min(1, Math.max(0, s * (1 + saturationAdjustment)));
        const [r, g, b] = hslToRgb(h, newSaturation, l);

        imageData.data[i] = r;
        imageData.data[i + 1] = g;
        imageData.data[i + 2] = b;
    }
}

// Helper functions for color conversion
function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h * 360, s, l];
}

function hslToRgb(h, s, l) {
    h /= 360;
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
