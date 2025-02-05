self.onmessage = function(e) {
    const { imageData, value, index } = e.data;
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        data[i] = r * 0.393 + g * 0.769 + b * 0.189;
        data[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
        data[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;

        // Adjust contrast
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * (1 + value) + 128));
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * (1 + value) + 128));
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * (1 + value) + 128));
    }

    self.postMessage({ imageData, index, value });
};