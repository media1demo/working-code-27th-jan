// self.onmessage = function(e) {
//     const { imageData, startX, startY, tolerance, fuzziness } = e.data;
//     const selectedRegion = magicWand(imageData, startX, startY, tolerance, fuzziness);
//     self.postMessage({ selectedRegion });
// };



self.onmessage = function(e) {
    const { imageData, startX, startY, tolerance } = e.data;

    console.log('Worker Input Parameters:', { startX, startY, tolerance });
    console.log('Image Data:', imageData);

    const increasedTolerance = tolerance * 1.5;
    const selectedRegion = magicWand(imageData, startX, startY, increasedTolerance);

    console.log('Selected Region:', selectedRegion);

    const newImageData = createTransparentImageData(imageData.width, imageData.height);
    copyImageData(imageData, newImageData);

    for (const pixelIndex of selectedRegion) {
        const i = pixelIndex * 4;
        newImageData.data[i] = 255;     // Red
        newImageData.data[i + 1] = 0;   // Green
        newImageData.data[i + 2] = 0;   // Blue
        newImageData.data[i + 3] = 255; // Alpha
    }

    self.postMessage({ segmentedImages: [newImageData], isComplete: true });
};

function magicWand(imageData, startX, startY, tolerance) {
    const width = imageData.width;
    const height = imageData.height;
    const data = new Uint8ClampedArray(imageData.data);

    const targetColor = getPixel(data, startX, startY, width);
    const visited = new Uint8Array(width * height);
    const selectedRegion = [];

    const queue = [{x: startX, y: startY}];
    visited[startY * width + startX] = 1;

    const toleranceSq = tolerance * tolerance * 3;

    while (queue.length > 0) {
        const {x, y} = queue.shift();
        const index = y * width + x;

        if (colorMatch(getPixel(data, x, y, width), targetColor, toleranceSq)) {
            selectedRegion.push(index);

            checkNeighbor(x + 1, y);
            checkNeighbor(x - 1, y);
            checkNeighbor(x, y + 1);
            checkNeighbor(x, y - 1);
        }
    }

    function checkNeighbor(x, y) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
            const index = y * width + x;
            if (!visited[index]) {
                visited[index] = 1;
                queue.push({x, y});
            }
        }
    }

    return selectedRegion;
}

function getPixel(data, x, y, width) {
    const index = (y * width + x) * 4;
    return [
        data[index],     // Red
        data[index + 1], // Green
        data[index + 2], // Blue
        data[index + 3]  // Alpha
    ];
}

function colorMatch(color1, color2, toleranceSq) {
    const dr = color1[0] - color2[0];
    const dg = color1[1] - color2[1];
    const db = color1[2] - color2[2];
    const distanceSq = dr * dr + dg * dg + db * db;
    return distanceSq <= toleranceSq;
}

function copyImageData(source, destination) {
    destination.data.set(source.data);
}

function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}