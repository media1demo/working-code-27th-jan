self.onmessage = function(e) {
    const { effect, imageData, value, index } = e.data;
    
    switch(effect) {
        case 'brightness':
            applyBrightness(imageData.data, value);
            break;
        case 'hue':
            applyHue(imageData.data, value);
            break;
        case 'saturation':
            applySaturation(imageData.data, value);
            break;
        case 'vintage':
            applyVintage(imageData.data, value);
            break;
        case 'ink':
            applyInk(imageData.data, value);
            break;
        case 'vibrance':
            applyVibrance(imageData.data, value);
            break;
        case 'denoise':
            applyDenoise(imageData.data, imageData.width, imageData.height, value);
            break;
        case 'hexagonalPixelate':
            applyHexagonalPixelate(imageData.data, imageData.width, imageData.height, value);
            break;
        case 'invert':
            applyInvert(imageData.data, value);
            break;
        case 'perspective':
            applyPerspective(imageData.data, imageData.width, imageData.height, value);
            break;
        case 'bulgePinch':
            applyBulgePinch(imageData.data, imageData.width, imageData.height, value);
            break;
        case 'swirl':
            applySwirl(imageData.data, imageData.width, imageData.height, value);
            break;
        case 'lensBlur':
            applyLensBlur(imageData.data, imageData.width, imageData.height, value);
            break;
        case 'tiltShiftBlur':
            applyTiltShiftBlur(imageData.data, imageData.width, imageData.height, value);
            break;
        case 'triangularBlur':
            applyTriangularBlur(imageData.data, imageData.width, imageData.height, value);
            break;
        case 'zoomBlur':
            applyZoomBlur(imageData.data, imageData.width, imageData.height, value);
            break;
        case 'edgeWork':
            applyEdgeWork(imageData.data, imageData.width, imageData.height, value);
            break;
        case 'dotScreen':
            applyDotScreen(imageData.data, imageData.width, imageData.height, value);
            break;
        case 'colorHalftone':
            applyColorHalftone(imageData.data, imageData.width, imageData.height, value);
            break;
    }

    self.postMessage({ imageData, index, value });
};

function applyBrightness(data, value) {
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, data[i] + value));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + value));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + value));
    }
}

function applyHue(data, value) {
    for (let i = 0; i < data.length; i += 4) {
        const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
        const newHue = (h + value / 360) % 1;
        const [r, g, b] = hslToRgb(newHue, s, l);
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
    }
}

function applySaturation(data, value) {
    for (let i = 0; i < data.length; i += 4) {
        const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
        const newSaturation = Math.max(0, Math.min(1, s * value));
        const [r, g, b] = hslToRgb(h, newSaturation, l);
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
    }
}

function applyVintage(data, value) {
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        data[i] = Math.min(255, (r * (1 - 0.607 * value) + g * (0.769 * value) + b * (0.189 * value)));
        data[i + 1] = Math.min(255, (r * 0.349 * value + g * (1 - 0.314 * value) + b * 0.168 * value));
        data[i + 2] = Math.min(255, (r * 0.272 * value + g * 0.534 * value + b * (1 - 0.869 * value)));
    }
}
function applyInk(data, value) {
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const intensity = (r + g + b) / 3;
        const newIntensity = 255 * Math.pow(intensity / 255, 1 / value);
        data[i] = data[i + 1] = data[i + 2] = newIntensity;
    }
}

function applyVibrance(data, value) {
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const max = Math.max(r, g, b);
        const avg = (r + g + b) / 3;
        const amt = Math.abs(max - avg) * 2 / 255 * value;
        data[i] = r + (r - avg) * amt;
        data[i + 1] = g + (g - avg) * amt;
        data[i + 2] = b + (b - avg) * amt;
    }
}

function applyDenoise(data, width, height, value) {
    const tempData = new Uint8ClampedArray(data);
    const radius = Math.floor(value);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, count = 0;
            
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const nx = Math.min(Math.max(x + dx, 0), width - 1);
                    const ny = Math.min(Math.max(y + dy, 0), height - 1);
                    const i = (ny * width + nx) * 4;
                    r += tempData[i];
                    g += tempData[i + 1];
                    b += tempData[i + 2];
                    count++;
                }
            }
            
            const i = (y * width + x) * 4;
            data[i] = r / count;
            data[i + 1] = g / count;
            data[i + 2] = b / count;
        }
    }
}

function applyHexagonalPixelate(data, width, height, cellSize) {
    const tempData = new Uint8ClampedArray(data);
    const hexHeight = cellSize * Math.sqrt(3);
    const sideLength = cellSize / 2;
    const hexagonVerticalRadius = hexHeight / 2;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const hexY = Math.floor(y / hexHeight);
            const hexX = Math.floor(x / (cellSize * 3 / 2));
            const isOddRow = hexY & 1;

            let pointY = y - hexY * hexHeight;
            let pointX = x - hexX * cellSize * 3 / 2;

            if (isOddRow) {
                pointX -= cellSize * 3 / 4;
            }

            if (Math.abs(pointY - hexagonVerticalRadius) * 3 / 2 < (sideLength - Math.abs(pointX - sideLength))) {
                const centerX = hexX * cellSize * 3 / 2 + (isOddRow ? cellSize * 3 / 4 : 0);
                const centerY = hexY * hexHeight + hexagonVerticalRadius;

                const sampleX = Math.floor(centerX);
                const sampleY = Math.floor(centerY);

                if (sampleX >= 0 && sampleX < width && sampleY >= 0 && sampleY < height) {
                    const sampleIndex = (sampleY * width + sampleX) * 4;
                    const currentIndex = (y * width + x) * 4;

                    data[currentIndex] = tempData[sampleIndex];
                    data[currentIndex + 1] = tempData[sampleIndex + 1];
                    data[currentIndex + 2] = tempData[sampleIndex + 2];
                }
            }
        }
    }
}

function applyInvert(data, value) {
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
    }
}

function applyPerspective(data, width, height, [topLeft, topRight, bottomLeft, bottomRight]) {
    const tempData = new Uint8ClampedArray(data);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const u = x / (width - 1);
            const v = y / (height - 1);
            
            const tx = lerp(lerp(topLeft, topRight, u), lerp(bottomLeft, bottomRight, u), v);
            const ty = lerp(lerp(0, 0, u), lerp(1, 1, u), v);
            
            const sx = Math.floor(tx * (width - 1));
            const sy = Math.floor(ty * (height - 1));
            
            if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
                const srcIndex = (sy * width + sx) * 4;
                const dstIndex = (y * width + x) * 4;
                
                data[dstIndex] = tempData[srcIndex];
                data[dstIndex + 1] = tempData[srcIndex + 1];
                data[dstIndex + 2] = tempData[srcIndex + 2];
                data[dstIndex + 3] = tempData[srcIndex + 3];
            }
        }
    }
}

function applyBulgePinch(data, width, height, [centerX, centerY, radius, strength]) {
    const tempData = new Uint8ClampedArray(data);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX * width;
            const dy = y - centerY * height;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < radius) {
                const percent = (radius - distance) / radius;
                const bulge = distance * (1 - percent * strength);
                const angle = Math.atan2(dy, dx);
                
                const sourceX = Math.round(centerX * width + bulge * Math.cos(angle));
                const sourceY = Math.round(centerY * height + bulge * Math.sin(angle));
                
                if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                    const srcIndex = (sourceY * width + sourceX) * 4;
                    const dstIndex = (y * width + x) * 4;
                    
                    data[dstIndex] = tempData[srcIndex];
                    data[dstIndex + 1] = tempData[srcIndex + 1];
                    data[dstIndex + 2] = tempData[srcIndex + 2];
                    data[dstIndex + 3] = tempData[srcIndex + 3];
                }
            }
        }
    }
}

function applySwirl(data, width, height, [centerX, centerY, radius, angle]) {
    const tempData = new Uint8ClampedArray(data);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX * width;
            const dy = y - centerY * height;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < radius) {
                const percent = (radius - distance) / radius;
                const theta = percent * percent * angle;
                const sin = Math.sin(theta);
                const cos = Math.cos(theta);
                
                const sourceX = Math.round(centerX * width + dx * cos - dy * sin);
                const sourceY = Math.round(centerY * height + dx * sin + dy * cos);
                
                if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                    const srcIndex = (sourceY * width + sourceX) * 4;
                    const dstIndex = (y * width + x) * 4;
                    
                    data[dstIndex] = tempData[srcIndex];
                    data[dstIndex + 1] = tempData[srcIndex + 1];
                    data[dstIndex + 2] = tempData[srcIndex + 2];
                    data[dstIndex + 3] = tempData[srcIndex + 3];
                }
            }
        }
    }
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function applyTriangularBlur(data, width, height, radius) {
    const tempData = new Uint8ClampedArray(data);
    const size = width * height;

    for (let i = 0; i < size; i++) {
        let r = 0, g = 0, b = 0, a = 0, weight = 0;
        for (let j = Math.max(0, i - radius); j < Math.min(size, i + radius + 1); j++) {
            const w = radius - Math.abs(i - j) + 1;
            r += tempData[j * 4] * w;
            g += tempData[j * 4 + 1] * w;
            b += tempData[j * 4 + 2] * w;
            a += tempData[j * 4 + 3] * w;
            weight += w;
        }
        data[i * 4] = r / weight;
        data[i * 4 + 1] = g / weight;
        data[i * 4 + 2] = b / weight;
        data[i * 4 + 3] = a / weight;
    }
}

function applyLensBlur(data, width, height, radius) {
    const tempData = new Uint8ClampedArray(data);
    const size = width * height;
    const kernel = new Array(radius * 2 + 1).fill(0).map((_, i) => i <= radius ? i + 1 : 2 * radius - i + 1);
    const kernelSum = kernel.reduce((a, b) => a + b, 0);

    for (let i = 0; i < size; i++) {
        let r = 0, g = 0, b = 0, a = 0;
        for (let j = -radius; j <= radius; j++) {
            const pixelIndex = Math.min(Math.max(i + j, 0), size - 1) * 4;
            const weight = kernel[j + radius];
            r += tempData[pixelIndex] * weight;
            g += tempData[pixelIndex + 1] * weight;
            b += tempData[pixelIndex + 2] * weight;
            a += tempData[pixelIndex + 3] * weight;
        }
        data[i * 4] = r / kernelSum;
        data[i * 4 + 1] = g / kernelSum;
        data[i * 4 + 2] = b / kernelSum;
        data[i * 4 + 3] = a / kernelSum;
    }
}

function applyZoomBlur(data, width, height, [strength, centerX, centerY]) {
    const tempData = new Uint8ClampedArray(data);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = (x - centerX * width) / width;
            const dy = (y - centerY * height) / height;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const pixelIndex = (y * width + x) * 4;

            let r = 0, g = 0, b = 0, a = 0, samples = 0;
            for (let i = 0; i < strength; i++) {
                const scale = 1 - (i / strength) * distance;
                const sampleX = Math.round(x * scale + centerX * width * (1 - scale));
                const sampleY = Math.round(y * scale + centerY * height * (1 - scale));
                if (sampleX >= 0 && sampleX < width && sampleY >= 0 && sampleY < height) {
                    const sampleIndex = (sampleY * width + sampleX) * 4;
                    r += tempData[sampleIndex];
                    g += tempData[sampleIndex + 1];
                    b += tempData[sampleIndex + 2];
                    a += tempData[sampleIndex + 3];
                    samples++;
                }
            }

            data[pixelIndex] = r / samples;
            data[pixelIndex + 1] = g / samples;
            data[pixelIndex + 2] = b / samples;
            data[pixelIndex + 3] = a / samples;
        }
    }
}
function applyTiltShiftBlur(data, width, height, [startY, endY]) {
    const tempData = new Uint8ClampedArray(data);
    const blurRadius = 10;
    const fadeDistance = height * 0.1;

    for (let y = 0; y < height; y++) {
        let blurAmount;
        if (y < startY * height) {
            blurAmount = Math.min(1, (startY * height - y) / fadeDistance);
        } else if (y > endY * height) {
            blurAmount = Math.min(1, (y - endY * height) / fadeDistance);
        } else {
            blurAmount = 0;
        }

        if (blurAmount > 0) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, a = 0, count = 0;
                const currentIndex = (y * width + x) * 4;

                for (let oy = -blurRadius; oy <= blurRadius; oy++) {
                    for (let ox = -blurRadius; ox <= blurRadius; ox++) {
                        const sampleY = Math.min(height - 1, Math.max(0, y + oy));
                        const sampleX = Math.min(width - 1, Math.max(0, x + ox));
                        const sampleIndex = (sampleY * width + sampleX) * 4;

                        r += tempData[sampleIndex];
                        g += tempData[sampleIndex + 1];
                        b += tempData[sampleIndex + 2];
                        a += tempData[sampleIndex + 3];
                        count++;
                    }
                }

                data[currentIndex] = r / count * blurAmount + tempData[currentIndex] * (1 - blurAmount);
                data[currentIndex + 1] = g / count * blurAmount + tempData[currentIndex + 1] * (1 - blurAmount);
                data[currentIndex + 2] = b / count * blurAmount + tempData[currentIndex + 2] * (1 - blurAmount);
                data[currentIndex + 3] = a / count * blurAmount + tempData[currentIndex + 3] * (1 - blurAmount);
            }
        }
    }
}

function applyEdgeWork(data, width, height, radius) {
    const tempData = new Uint8ClampedArray(data);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let minIntensity = 255;
            let maxIntensity = 0;

            for (let ky = -radius; ky <= radius; ky++) {
                for (let kx = -radius; kx <= radius; kx++) {
                    const px = Math.min(width - 1, Math.max(0, x + kx));
                    const py = Math.min(height - 1, Math.max(0, y + ky));
                    const index = (py * width + px) * 4;
                    const intensity = (tempData[index] + tempData[index + 1] + tempData[index + 2]) / 3;
                    minIntensity = Math.min(minIntensity, intensity);
                    maxIntensity = Math.max(maxIntensity, intensity);
                }
            }

            const currentIndex = (y * width + x) * 4;
            const edgeIntensity = maxIntensity - minIntensity;
            data[currentIndex] = data[currentIndex + 1] = data[currentIndex + 2] = edgeIntensity;
        }
    }
}

function applyDotScreen(data, width, height, angle) {
    const tempData = new Uint8ClampedArray(data);
    const s = Math.sin(angle);
    const c = Math.cos(angle);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const sx = x * c - y * s;
            const sy = x * s + y * c;
            const i = (Math.sin(sx * 0.75) + Math.sin(sy * 0.75)) * 127 + 128;
            const index = (y * width + x) * 4;
            const average = (tempData[index] + tempData[index + 1] + tempData[index + 2]) / 3;
            data[index] = data[index + 1] = data[index + 2] = average < i ? 0 : 255;
        }
    }
}

function applyColorHalftone(data, width, height, angle) {
    const tempData = new Uint8ClampedArray(data);
    const dotSize = 5;
    const s = Math.sin(angle);
    const c = Math.cos(angle);

    for (let y = 0; y < height; y += dotSize) {
        for (let x = 0; x < width; x += dotSize) {
            let r = 0, g = 0, b = 0;
            let count = 0;

            for (let dy = 0; dy < dotSize; dy++) {
                for (let dx = 0; dx < dotSize; dx++) {
                    if (x + dx < width && y + dy < height) {
                        const index = ((y + dy) * width + (x + dx)) * 4;
                        r += tempData[index];
                        g += tempData[index + 1];
                        b += tempData[index + 2];
                        count++;
                    }
                }
            }

            r /= count;
            g /= count;
            b /= count;

            for (let dy = 0; dy < dotSize; dy++) {
                for (let dx = 0; dx < dotSize; dx++) {
                    if (x + dx < width && y + dy < height) {
                        const sx = (x + dx) * c - (y + dy) * s;
                        const sy = (x + dx) * s + (y + dy) * c;
                        const index = ((y + dy) * width + (x + dx)) * 4;

                        const cmyk = rgbToCmyk(r, g, b);
                        const k = Math.sin(sx * 0.75) * Math.sin(sy * 0.75) * 127 + 128;
                        const c = Math.sin((sx + 0.33) * 0.75) * Math.sin(sy * 0.75) * 127 + 128;
                        const m = Math.sin(sx * 0.75) * Math.sin((sy + 0.33) * 0.75) * 127 + 128;
                        const y = Math.sin((sx - 0.33) * 0.75) * Math.sin(sy * 0.75) * 127 + 128;

                        data[index] = cmyk.c < c ? 0 : 255;
                        data[index + 1] = cmyk.m < m ? 0 : 255;
                        data[index + 2] = cmyk.y < y ? 0 : 255;
                    }
                }
            }
        }
    }
}

function rgbToCmyk(r, g, b) {
    const k = Math.min(1 - r / 255, 1 - g / 255, 1 - b / 255);
    const c = (1 - r / 255 - k) / (1 - k);
    const m = (1 - g / 255 - k) / (1 - k);
    const y = (1 - b / 255 - k) / (1 - k);
    return { c: c * 255, m: m * 255, y: y * 255, k: k * 255 };
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
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

    return [h, s, l];
}

function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
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