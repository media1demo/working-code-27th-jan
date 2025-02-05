self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const width = imageData.width;
    const height = imageData.height;

    const newImageData = new ImageData(width, height);

    // Calculate the shift amount (0 to 1 full image height)
    const shift = Math.floor(value * height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const newY = (y + shift) % height;
            const sourceIndex = (y * width + x) * 4;
            const targetIndex = (newY * width + x) * 4;

            for (let i = 0; i < 4; i++) {
                newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
            }
        }
    }

    self.postMessage({ imageData: newImageData });
};