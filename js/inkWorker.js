self.onmessage = function(e) {
    const { imageData, value, index } = e.data;
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const threshold = 128 + value * 32;
        const color = brightness > threshold ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = color;
    }

    self.postMessage({ imageData, index, value });
};