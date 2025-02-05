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
//         value6,
//         value7,
//         value8,
//         clickedPoints,
//         lines
//     } = e.data;

//     const segmentedImages = [];
//     const variationsPerOrientation = 25; // New variable to control the number of variations

//     const orientations = [
//         { name: "Center", getValue: () => ({ x: value1 / 100, y: value1 / 100 }), value: value1 },
//         { name: "Top", getValue: () => ({ x: value2 / 100, y: 0.2 }), value: value2 },
//         { name: "Bottom", getValue: () => ({ x: value3 / 100, y: 0.8 }), value: value3 },
//         { name: "Left", getValue: () => ({ x: 0.2, y: value4 / 100 }), value: value4 },
//         { name: "Right", getValue: () => ({ x: 0.8, y: value5 / 100 }), value: value5 },
//         { name: "TopLeft", getValue: () => ({ x: value6 / 100, y: value6 / 100 }), value: value6 },
//         { name: "TopRight", getValue: () => ({ x: 1 - value7 / 100, y: value7 / 100 }), value: value7 },
//         { name: "BottomLeft", getValue: () => ({ x: value8 / 100, y: 1 - value8 / 100 }), value: value8 }
//     ];

//         // number_of_variation = 40;
//         // imageCount = number_of_variation * imageCount
//         // for (let i = 0; i < imageCount; i++) {

//         for (let i = 0; i < variationsPerOrientation; i++) {

//         for (let j = 0; j < orientations.length; j++) {
//             const newImageData = new ImageData(
//                 new Uint8ClampedArray(imageData.data),
//                 imageData.width,
//                 imageData.height
//             );

//             // applyColorAdjustments(newImageData, selectedRegions, i, imageCount);
//             applyColorAdjustments(newImageData, selectedRegions, i, variationsPerOrientation);

//             const orientation = orientations[j];
//             const { x, y } = orientation.getValue();

//             // const centerX = orientation.centerX * imageData.width;
//             // const centerY = orientation.centerY * imageData.height;

//             // const centerX = x === 0 ? Math.random() : x * imageData.width;
//             // const centerY = y === 0 ? Math.random() : y * imageData.height;
            
//             // const orientation = orientations[j];
//             // const { x, y } = orientation.getValue();
//             const centerX = x === 0 ? Math.random() * imageData.width : x * imageData.width;
//             const centerY = y === 0 ? Math.random() * imageData.height : y * imageData.height;
//             // const radius = Math.min(imageData.width, imageData.height) * 0.3;
//             // const strength = ((orientation.value / 100) * 2 - 1) * (i + 1) / imageCount;
//             const radius = Math.min(imageData.width, imageData.height) * 0.3;
//             const strength = ((orientation.value / 100) * 2 - 1) * (i + 1) / imageCount;
//             // Apply bulge/pinch effect
            
//             applyBulgePinch(newImageData, centerX, centerY, radius, strength, selectedRegions);
//             // Apply additional effects
            
//             applyAdditionalEffects(newImageData, value1, value2, value3, value4, value5, selectedRegions);
//             segmentedImages.push(newImageData);
//         }
//     }

//     // console.log('segmentedImages.length :>> ', segmentedImages.length);
//     self.postMessage({ segmentedImages: segmentedImages });
// };

// function applyColorAdjustments(imageData, selectedRegions, index, totalCount) {
   
// }

// function applyBulgePinch(imageData, centerX, centerY, radius, strength, selectedRegions) {
//     const { width, height } = imageData;
//     const tempData = new Uint8ClampedArray(imageData.data);

//     for (const region of selectedRegions) {
//         for (const pixelIndex of region) {
//             const x = pixelIndex % width;
//             const y = Math.floor(pixelIndex / width);

//             const dx = x - centerX;
//             const dy = y - centerY;
//             const distance = Math.sqrt(dx * dx + dy * dy);

//             if (distance < radius) {
//                 const amount = (radius - distance) / radius * strength;
//                 const newX = x + dx * amount;
//                 const newY = y + dy * amount;

//                 if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
//                     const srcIndex = pixelIndex * 4;
//                     const destIndex = (Math.floor(newY) * width + Math.floor(newX)) * 4;

//                     imageData.data[destIndex] = tempData[srcIndex];
//                     imageData.data[destIndex + 1] = tempData[srcIndex + 1];
//                     imageData.data[destIndex + 2] = tempData[srcIndex + 2];
//                     imageData.data[destIndex + 3] = tempData[srcIndex + 3];
//                 }
//             }
//         }
//     }
// }

// function applyAdditionalEffects(imageData, value1, value2, value3, value4, value5, selectedRegions) {
//     const saturationAdjustment = value1 / 100; // Assuming value1 is a percentage

//     for (const region of selectedRegions) {
//         for (const pixelIndex of region) {
//             const index = pixelIndex * 4;
//             const [h, s, l] = rgbToHsl(
//                 imageData.data[index],
//                 imageData.data[index + 1],
//                 imageData.data[index + 2]
//             );

//             const newSaturation = Math.min(1, Math.max(0, s * (1 + saturationAdjustment)));
//             const [r, g, b] = hslToRgb(h, newSaturation, l);

//             imageData.data[index] = r;
//             imageData.data[index + 1] = g;
//             imageData.data[index + 2] = b;
//         }
//     }

//     // You can add more effects using the other values (value2, value3, etc.)
// }

// function rgbToHsl(r, g, b) {
//     r /= 255, g /= 255, b /= 255;
//     const max = Math.max(r, g, b), min = Math.min(r, g, b);
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

//     return [h * 360, s, l];
// }

// function hslToRgb(h, s, l) {
//     h /= 360;
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
// }
function applyWarpEffect(imageData, selectedRegions, strength, radius) {
    const width = imageData.width;
    const height = imageData.height;
    
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );
    
    selectedRegions.forEach(region => {
        // Calculate region bounds
        let minX = width, minY = height, maxX = 0, maxY = 0;
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        });
        
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const regionWidth = maxX - minX + 1;
        const regionHeight = maxY - minY + 1;
        const effectRadius = radius || Math.max(regionWidth, regionHeight) / 2;
        
        // Create displacement map
        const displacementMap = new Float32Array(width * height * 2);
        const effectStrength = (strength - 0.5) * 2; // Convert 0-1 to -1 to 1
        
        // Calculate displacement vectors
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const index = (y * width + x) * 2;
                
                if (distance < effectRadius) {
                    // Calculate displacement based on spiral pattern
                    const angle = Math.atan2(dy, dx);
                    const factor = 1 - (distance / effectRadius);
                    const spiral = angle + (factor * Math.PI * effectStrength);
                    
                    displacementMap[index] = Math.cos(spiral) * distance * factor * effectStrength;
                    displacementMap[index + 1] = Math.sin(spiral) * distance * factor * effectStrength;
                }
            }
        }
        
        // Apply displacement map with bilinear interpolation
        const tempBuffer = new Uint8ClampedArray(imageData.data);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 2;
                const dx = displacementMap[index];
                const dy = displacementMap[index + 1];
                
                if (dx !== 0 || dy !== 0) {
                    const sourceX = x + dx;
                    const sourceY = y + dy;
                    
                    // Skip if outside bounds
                    if (sourceX < 0 || sourceX >= width - 1 || sourceY < 0 || sourceY >= height - 1) {
                        continue;
                    }
                    
                    // Bilinear interpolation
                    const x1 = Math.floor(sourceX);
                    const y1 = Math.floor(sourceY);
                    const x2 = x1 + 1;
                    const y2 = y1 + 1;
                    
                    const fx = sourceX - x1;
                    const fy = sourceY - y1;
                    
                    const targetIndex = (y * width + x) * 4;
                    const i11 = (y1 * width + x1) * 4;
                    const i12 = (y2 * width + x1) * 4;
                    const i21 = (y1 * width + x2) * 4;
                    const i22 = (y2 * width + x2) * 4;
                    
                    for (let c = 0; c < 4; c++) {
                        const value =
                            tempBuffer[i11 + c] * (1 - fx) * (1 - fy) +
                            tempBuffer[i21 + c] * fx * (1 - fy) +
                            tempBuffer[i12 + c] * (1 - fx) * fy +
                            tempBuffer[i22 + c] * fx * fy;
                        
                        newImageData.data[targetIndex + c] = value;
                    }
                }
            }
        }
    });
    
    return newImageData;
}

self.onmessage = function(e) {
    const { imageData, selectedRegions, value, value2 } = e.data;
    
    try {
        const strength = value || 0.5; // 0 to 1, where 0.5 is neutral
        const radius = value2 || null; // Optional radius override
        
        let resultImageData;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applyWarpEffect(imageData, selectedRegions, strength, radius);
        } else {
            // If no regions selected, apply to entire image
            resultImageData = applyWarpEffect(imageData, 
                [[...Array(imageData.width * imageData.height).keys()]], 
                strength, 
                radius || Math.min(imageData.width, imageData.height) / 4
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