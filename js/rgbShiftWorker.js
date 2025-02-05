self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const [redShift, greenShift, blueShift] = value;
    const width = imageData.width;
    const height = imageData.height;

    const newImageData = new ImageData(width, height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const redX = Math.round(x + redShift) % width;
            const greenX = Math.round(x + greenShift) % width;
            const blueX = Math.round(x + blueShift) % width;

            const redIndex = (y * width + redX) * 4;
            const greenIndex = (y * width + greenX) * 4;
            const blueIndex = (y * width + blueX) * 4;
            const targetIndex = (y * width + x) * 4;

            newImageData.data[targetIndex] = imageData.data[redIndex];
            newImageData.data[targetIndex + 1] = imageData.data[greenIndex + 1];
            newImageData.data[targetIndex + 2] = imageData.data[blueIndex + 2];
            newImageData.data[targetIndex + 3] = imageData.data[targetIndex + 3];
        }
    }

    self.postMessage({ imageData: newImageData });
};