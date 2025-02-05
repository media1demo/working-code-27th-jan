self.onmessage = function(e) {
    const { imageData, value, index } = e.data;
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const [strength, radius] = value;
    const centerX = width / 2;
    const centerY = height / 2;

    const tempData = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < radius) {
                const percent = (radius - distance) / radius;
                const bulge = distance * (1 - percent * strength);
                const theta = Math.atan2(dy, dx);
                const srcX = Math.round(centerX + bulge * Math.cos(theta));
                const srcY = Math.round(centerY + bulge * Math.sin(theta));

                if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
                    const dstIndex = (y * width + x) * 4;
                    const srcIndex = (srcY * width + srcX) * 4;
                    data[dstIndex] = tempData[srcIndex];
                    data[dstIndex + 1] = tempData[srcIndex + 1];
                    data[dstIndex + 2] = tempData[srcIndex + 2];
                    data[dstIndex + 3] = tempData[srcIndex + 3];
                }
            }
        }
    }

    self.postMessage({ imageData, index, value });
};