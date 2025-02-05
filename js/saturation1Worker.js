self.onmessage = function(e) {
    const {
        imageData,
        selectedRegions,
        imageCount,
        maxBrightness, // This will be repurposed as maxSaturationChange
        value1,
        value2,
        value3,
        value4,
        value5,
        clickedPoints,
        lines
    } = e.data;

    const segmentedImages = [];

    for (let i = 0; i < imageCount; i++) {
        // Create a copy of the original image data
        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );

        // Calculate saturation adjustment for this image
        // We'll go from -100% to +100% saturation change
        const saturationAdjustment = -1 + (2 * i / (imageCount - 1));

        // Apply saturation adjustment to selected regions
        for (const region of selectedRegions) {
            for (const pixelIndex of region) {
                const x = pixelIndex % imageData.width;
                const y = Math.floor(pixelIndex / imageData.width);
                const index = (y * imageData.width + x) * 4;

                const [h, s, l] = rgbToHsl(
                    newImageData.data[index],
                    newImageData.data[index + 1],
                    newImageData.data[index + 2]
                );

                // Adjust saturation
                let newSaturation = s * (1 + saturationAdjustment);
                newSaturation = Math.min(1, Math.max(0, newSaturation)); // Clamp between 0 and 1

                const [r, g, b] = hslToRgb(h, newSaturation, l);

                newImageData.data[index] = r;
                newImageData.data[index + 1] = g;
                newImageData.data[index + 2] = b;
            }
        }

        // Apply additional effects based on value1, value2, etc.
        applyAdditionalEffects(newImageData, value1, value2, value3, value4, value5);

        segmentedImages.push(newImageData);
    }

    // Send the processed images back to the main script
    self.postMessage({ segmentedImages: segmentedImages });
};

function applyAdditionalEffects(imageData, value1, value2, value3, value4, value5) {
    // This function can be customized to apply additional effects based on the input values
    // For example, you could use these values to adjust brightness, contrast, etc.
    
    const brightnessAdjustment = value1 / 100; // Assuming value1 is a percentage

    for (let i = 0; i < imageData.data.length; i += 4) {
        const [h, s, l] = rgbToHsl(
            imageData.data[i],
            imageData.data[i + 1],
            imageData.data[i + 2]
        );

        const newLightness = Math.min(1, Math.max(0, l * (1 + brightnessAdjustment)));
        const [r, g, b] = hslToRgb(h, s, newLightness);

        imageData.data[i] = r;
        imageData.data[i + 1] = g;
        imageData.data[i + 2] = b;
    }

    // You can add more effects using the other values (value2, value3, etc.)
}

// Helper functions for color conversion (same as in hue1Worker.js)
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