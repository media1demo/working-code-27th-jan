// self.onmessage = function(e) {
//     const { imageData, value, selectedRegions } = e.data;
//     const width = imageData.width;
//     const height = imageData.height;
    
//     // Create new ImageData for the result
//     const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
    
//     // Process the image
//     applyHueEffect(imageData, newImageData, value, selectedRegions, width, height);
    
//     // Keep the original response format but wrap newImageData in segmentedImages array
//     self.postMessage({
//         segmentedImages: [newImageData],
//         isComplete: true
//     });
// };

// function applyHueEffect(sourceImageData, targetImageData, hueAdjustment, selectedRegions, width, height) {
//     const selectedPixels = new Set(selectedRegions.flat());

//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             const index = (y * width + x) * 4;
            
//             if (selectedPixels.has(y * width + x)) {
//                 const [r, g, b] = [
//                     sourceImageData.data[index],
//                     sourceImageData.data[index + 1],
//                     sourceImageData.data[index + 2]
//                 ];
                
//                 let [h, s, l] = rgbToHsl(r, g, b);
//                 h = (h + hueAdjustment) % 360;
//                 const [newR, newG, newB] = hslToRgb(h, s, l);
                
//                 targetImageData.data[index] = newR;
//                 targetImageData.data[index + 1] = newG;
//                 targetImageData.data[index + 2] = newB;
//                 targetImageData.data[index + 3] = sourceImageData.data[index + 3];
//             } else {
//                 targetImageData.data[index] = sourceImageData.data[index];
//                 targetImageData.data[index + 1] = sourceImageData.data[index + 1];
//                 targetImageData.data[index + 2] = sourceImageData.data[index + 2];
//                 targetImageData.data[index + 3] = sourceImageData.data[index + 3];
//             }
//         }
//     }
// }

// function rgbToHsl(r, g, b) {
//     r /= 255;
//     g /= 255;
//     b /= 255;
//     const max = Math.max(r, g, b);
//     const min = Math.min(r, g, b);
//     let h, s, l = (max + min) / 2;

//     if (max === min) {
//         h = s = 0;
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
// }

// function hslToRgb(h, s, l) {
//     h /= 360;
//     s /= 100;
//     l /= 100;
//     let r, g, b;

//     if (s === 0) {
//         r = g = b = l;
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
// }




self.onmessage = (e) => {
    const { imageData, selectedRegions } = e.data;
    console.log(imageData);
    selectedRegions.forEach(region => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        
        region.forEach(pixelIndex => {
            imageData.data[pixelIndex * 4] = r;
            imageData.data[pixelIndex * 4 + 1] = g;
            imageData.data[pixelIndex * 4 + 2] = b;
            imageData.data[pixelIndex * 4 + 3] = 255;
        });
    });
    
    self.postMessage({
        segmentedImages: [imageData],
        isComplete: true
    });
};