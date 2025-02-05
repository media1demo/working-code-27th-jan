self.onmessage = function(e) {
    const {
        imageData,
        selectedRegions,
        imageCount,
        value1,
        value2,
        value3,
        value4,
        value5
    } = e.data;

    const segmentedImages = [];
    const blurRadius = 8;
    
    for (let i = 0; i < imageCount; i++) {
        for (let variation = 0; variation < 8; variation++) {
            const newImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );

            // Apply Gaussian blur to selected regions
            for (const region of selectedRegions) {
                applyGaussianBlurToRegion(newImageData, region, blurRadius);
            }

            // Apply additional effects
            applyAdditionalEffects(newImageData, value1, value2, value3, value4, value5);

            segmentedImages.push(newImageData);
        }
    }

    self.postMessage({ segmentedImages, isComplete: true });
};

function applyGaussianBlurToRegion(imageData, region, radius) {
    const { width, height, data } = imageData;
    const kernel1D = createGaussianKernel1D(radius);
    const floatData = new Float32Array(data);

    // Find bounding box of the region
    let minX = width, minY = height, maxX = 0, maxY = 0;
    for (const pixelIndex of region) {
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
    }

    // Horizontal pass within the bounding box
    for (let channel = 0; channel < 4; channel++) {
        for (let row = minY; row <= maxY; row++) {
            for (let col = minX; col <= maxX; col++) {
                let sum = 0;
                for (let kx = -radius; kx <= radius; kx++) {
                    const px = col + kx;
                    if (px >= 0 && px < width) {
                        const index = (row * width + px) * 4 + channel;
                        sum += floatData[index] * kernel1D[kx + radius];
                    }
                }
                floatData[(row * width + col) * 4 + channel] = sum;
            }
        }
    }

    // Vertical pass within the bounding box
    for (let channel = 0; channel < 4; channel++) {
        for (let col = minX; col <= maxX; col++) {
            for (let row = minY; row <= maxY; row++) {
                let sum = 0;
                for (let ky = -radius; ky <= radius; ky++) {
                    const py = row + ky;
                    if (py >= 0 && py < height) {
                        const index = (py * width + col) * 4 + channel;
                        sum += floatData[index] * kernel1D[ky + radius];
                    }
                }
                floatData[(row * width + col) * 4 + channel] = sum;
            }
        }
    }

    // Copy the floatData back to imageData.data
    for (let i = 0; i < floatData.length; i++) {
        imageData.data[i] = floatData[i];
    }
}

function createGaussianKernel1D(radius) {
    const sigma = radius / 3;
    const kernelSize = 2 * radius + 1;
    const kernel = new Float32Array(kernelSize);
    let sum = 0;
    for (let x = -radius; x <= radius; x++) {
        kernel[x + radius] = Math.exp(-(x * x) / (2 * sigma * sigma));
        sum += kernel[x + radius];
    }
    for (let i = 0; i < kernelSize; i++) {
        kernel[i] /= sum;
    }
    return kernel;
}

function applyAdditionalEffects(imageData, value1, value2, value3, value4, value5) {
    const saturationAdjustment = value1 / 100;

    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const [h, s, l] = rgbToHsl(r, g, b);

        const newSaturation = Math.min(1, Math.max(0, s * (1 + saturationAdjustment)));
        const [newR, newG, newB] = hslToRgb(h, newSaturation, l);

        imageData.data[i] = newR;
        imageData.data[i + 1] = newG;
        imageData.data[i + 2] = newB;
    }
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    if (max === min) {
        return [0, 0, l];
    }

    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    const h = (() => {
        switch (max) {
            case r: return (g - b) / d + (g < b ? 6 : 0);
            case g: return (b - r) / d + 2;
            case b: return (r - g) / d + 4;
        }
    })() * 60;

    return [h, s, l];
}

function hslToRgb(h, s, l) {
    h /= 360;
    s = Math.max(0, Math.min(1, s));
    l = Math.max(0, Math.min(1, l));

    if (s === 0) {
        return [l * 255, l * 255, l * 255];
    }

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

    const r = hue2rgb(p, q, h + 1 / 3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1 / 3);

    return [r * 255, g * 255, b * 255];
}