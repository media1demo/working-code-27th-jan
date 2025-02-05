self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const width = imageData.width;
    const height = imageData.height;

    const newImageData = new ImageData(width, height);

    // Calculate the shift amount (0 to 1 full image width)
    const shift = Math.floor(value * width);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const newX = (x + shift) % width;
            const sourceIndex = (y * width + x) * 4;
            const targetIndex = (y * width + newX) * 4;

            for (let i = 0; i < 4; i++) {
                newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
            }
        }
    }

    self.postMessage({ imageData: newImageData });
};