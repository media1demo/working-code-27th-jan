self.onmessage = function(e) {
    const { imageData, selectedRegions } = e.data;
    const width = imageData.width;
    const height = imageData.height;
    
    const totalIterations = 10;
    let allSegmentedImages = [];
    console.log(totalIterations);

    for (let i = 0; i < totalIterations; i++) {
        // First apply the block dissolve effect
        const dissolvedImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
        applyBlockDissolveEffect(dissolvedImageData, selectedRegions, width, height, i, totalIterations);
        
        // Then apply the hue adjustment effect
        const hueAdjustedImageData = new ImageData(new Uint8ClampedArray(dissolvedImageData.data), width, height);
        const hueAdjustment = (360 / totalIterations) * i;
        // applyHueAdjustment(hueAdjustedImageData, hueAdjustment);
        
        allSegmentedImages.push(hueAdjustedImageData);
        
        if (i % 30 === 0) {
            self.postMessage({
                progress: (i / totalIterations) * 100,
                segmentedImages: allSegmentedImages
            });
            allSegmentedImages = []; // Clear the array to save memory
        }
    }
    
    self.postMessage({ segmentedImages: allSegmentedImages, isComplete: true });
};

function applyBlockDissolveEffect(imageData, selectedRegions, width, height, iteration, totalIterations) {
    const selectedPixels = new Set(selectedRegions.flat());
    const blockSize = 5; // Adjust block size as needed
    const dissolveThreshold = iteration / (totalIterations - 1);

    for (let y = 0; y < height; y += blockSize) {
        for (let x = 0; x < width; x += blockSize) {
            let blockSelected = false;
            for (let by = 0; by < blockSize && y + by < height; by++) {
                for (let bx = 0; bx < blockSize && x + bx < width; bx++) {
                    if (selectedPixels.has((y + by) * width + (x + bx))) {
                        blockSelected = true;
                        break;
                    }
                }
                if (blockSelected) break;
            }

            if (blockSelected && Math.random() < dissolveThreshold) {
                const angleOffset = (x / width + y / height + iteration / totalIterations) * Math.PI * 2;
                const xOffset = Math.cos(angleOffset) * blockSize * 2;
                const yOffset = Math.sin(angleOffset) * blockSize * 2;

                for (let by = 0; by < blockSize && y + by < height; by++) {
                    for (let bx = 0; bx < blockSize && x + bx < width; bx++) {
                        const sourceX = Math.floor((x + bx + xOffset + width) % width);
                        const sourceY = Math.floor((y + by + yOffset + height) % height);
                        const sourceIndex = (sourceY * width + sourceX) * 4;
                        const targetIndex = ((y + by) * width + (x + bx)) * 4;

                        for (let j = 0; j < 4; j++) {
                            imageData.data[targetIndex + j] = imageData.data[sourceIndex + j];
                        }
                    }
                }
            }
        }
    }
}

function applyHueAdjustment(imageData, hueAdjustment) {
    for (let i = 0; i < imageData.data.length; i += 4) {
        const [r, g, b] = [imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]];
        let [h, s, l] = rgbToHsl(r, g, b);
        
        // Adjust the hue
        h = (h + hueAdjustment) % 360;
        
        const [newR, newG, newB] = hslToRgb(h, s, l);
        
        imageData.data[i] = newR;
        imageData.data[i + 1] = newG;
        imageData.data[i + 2] = newB;
    }
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
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

    return [h * 360, s * 100, l * 100];
}

function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
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