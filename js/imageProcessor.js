function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
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

    return [h * 360, s, l];
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
        r = hue2rgb(p, q, h / 360 + 1/3);
        g = hue2rgb(p, q, h / 360);
        b = hue2rgb(p, q, h / 360 - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function applyContrast(value, contrast) {
    return Math.min(255, Math.max(0, Math.round((value - 128) * contrast + 128)));
}

self.onmessage = function(e) {
    const { imageData, brightness, hueShift, saturationFactor, contrastFactor, index } = e.data;
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        // Apply brightness
        let r = data[i] + brightness;
        let g = data[i + 1] + brightness;
        let b = data[i + 2] + brightness;

        // Apply hue and saturation
        let hsl = rgbToHsl(r, g, b);
        hsl[0] = (hsl[0] + hueShift) % 360;
        hsl[1] = Math.min(1, hsl[1] * saturationFactor);
        let rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);

        // Apply contrast
        r = applyContrast(rgb[0], contrastFactor);
        g = applyContrast(rgb[1], contrastFactor);
        b = applyContrast(rgb[2], contrastFactor);

        // Set final pixel values
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
    }

    self.postMessage({ imageData, index, brightness, hueShift, saturationFactor, contrastFactor });
};