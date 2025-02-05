// function rgbToHsl(r, g, b) {
//     r /= 255, g /= 255, b /= 255;
//     const max = Math.max(r, g, b), min = Math.min(r, g, b);
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
//     h /= 360, s /= 100, l /= 100;
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

function applyColorUtilsEffect(imageData, selectedRegions, brightness, contrast) {
    const width = imageData.width;
    const height = imageData.height;
    
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );
    
    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            const idx = pixelIndex * 4;
            const r = newImageData.data[idx];
            const g = newImageData.data[idx + 1];
            const b = newImageData.data[idx + 2];
            const a = newImageData.data[idx + 3];
            
            // Apply brightness and contrast using colorutils
            const newR = colorutils.adjustBrightnessContrast(r, brightness, contrast);
            const newG = colorutils.adjustBrightnessContrast(g, brightness, contrast);
            const newB = colorutils.adjustBrightnessContrast(b, brightness, contrast);
            
            newImageData.data[idx] = newR;
            newImageData.data[idx + 1] = newG;
            newImageData.data[idx + 2] = newB;
            newImageData.data[idx + 3] = a; // Preserve alpha channel
        });
    });
    
    return newImageData;
}

// Example colorutils function
const colorutils = {
    adjustBrightnessContrast: function(value, brightness, contrast) {
        // Adjust brightness
        value = value + (brightness * 255 - 128);
        
        // Adjust contrast
        value = (value - 128) * contrast + 128;
        
        // Clamp the value between 0 and 255
        return Math.min(255, Math.max(0, value));
    }
};

self.onmessage = function(e) {
    const { imageData, selectedRegions, value, value2 } = e.data;
    
    try {
        const brightness = value || 0.5; // 0 to 1, where 0.5 is neutral
        const contrast = value2 || 1.0; // 1.0 is neutral
        
        let resultImageData;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applyColorUtilsEffect(imageData, selectedRegions, brightness, contrast);
        } else {
            // If no regions selected, apply to entire image
            resultImageData = applyColorUtilsEffect(imageData, 
                [[...Array(imageData.width * imageData.height).keys()]], 
                brightness, 
                contrast
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