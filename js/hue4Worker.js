self.onmessage = function(e) {
    const {
        imageData,
        selectedRegions,
        imageCount,
        maxBrightness,
        value1,
        value2,
        value3,
        value4,
        value5,
        clickedPoints,
        lines
    } = e.data;

    const segmentedImages = [];

    // Define the number of variations and hue steps
    const hueSteps = 8; // Number of hue variations
    const additionalVariations = 8; // Number of region-based variations

    for (let i = 0; i < imageCount; i++) {
        for (let hueVariation = 0; hueVariation < hueSteps; hueVariation++) {
            const hueShift = ((i * hueSteps + hueVariation) / ((imageCount * hueSteps) - 1)) * 360;

            for (let variation = 0; variation < additionalVariations; variation++) {
                const newImageData = new ImageData(
                    new Uint8ClampedArray(imageData.data),
                    imageData.width,
                    imageData.height
                );

                // Adjust region selection for each variation
                const adjustedRegions = adjustRegions(selectedRegions, variation, imageData.width, imageData.height);

                for (const region of adjustedRegions) {
                    for (const pixelIndex of region) {
                        const x = pixelIndex % imageData.width;
                        const y = Math.floor(pixelIndex / imageData.width);
                        const index = (y * imageData.width + x) * 4;

                        let [h, s, l] = rgbToHsl(
                            newImageData.data[index],
                            newImageData.data[index + 1],
                            newImageData.data[index + 2]
                        );

                        // Apply hue shift
                        const newHue = (h + hueShift) % 360;

                        const [r, g, b] = hslToRgb(newHue, s, l);

                        newImageData.data[index] = r;
                        newImageData.data[index + 1] = g;
                        newImageData.data[index + 2] = b;
                    }
                }

                segmentedImages.push(newImageData);
            }
        }
    }

    self.postMessage({ segmentedImages: segmentedImages });
};

// Function to adjust regions for each variation
function adjustRegions(selectedRegions, variation, width, height) {
    // Define the shift amount
    const shiftAmount = variation * 2; // Example shift, adjust as needed

    // Create a new array to hold the adjusted regions
    const adjustedRegions = selectedRegions.map(region => {
        return region.map(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);

            // Shift position slightly for variation
            let newX = x + (shiftAmount % width);
            let newY = y + (shiftAmount % height);

            // Ensure new positions are within bounds
            newX = Math.max(0, Math.min(width - 1, newX));
            newY = Math.max(0, Math.min(height - 1, newY));

            return newY * width + newX;
        });
    });

    return adjustedRegions;
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
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
