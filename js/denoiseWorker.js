self.onmessage = function(e) {
    const { imageData, value, index } = e.data;
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const tempData = new Uint8ClampedArray(data);

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            for (let c = 0; c < 3; c++) {
                let sum = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        sum += tempData[((y + dy) * width + (x + dx)) * 4 + c];
                    }
                }
                const i = (y * width + x) * 4 + c;
                data[i] = tempData[i] * (1 - value) + (sum / 9) * value;
            }
        }
    }

    self.postMessage({ imageData, index, value });
};