self.onmessage = function(e) {
    const {
        imageData,
        selectedRegions,
        colors,
    } = e.data;

    const segmentedImages = [];

    colors.forEach(color => {
        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );

        for (const region of selectedRegions) {
            for (const pixelIndex of region) {
                const x = pixelIndex % imageData.width;
                const y = Math.floor(pixelIndex / imageData.width);
                const index = (y * imageData.width + x) * 4;

                let [r, g, b, a] = [
                    newImageData.data[index],
                    newImageData.data[index + 1],
                    newImageData.data[index + 2],
                    newImageData.data[index + 3]
                ];

                const [newR, newG, newB] = blendColor([r, g, b], color);

                newImageData.data[index] = newR;
                newImageData.data[index + 1] = newG;
                newImageData.data[index + 2] = newB;
                newImageData.data[index + 3] = a;
            }
        }

        segmentedImages.push(newImageData);
    });

    self.postMessage({ segmentedImages: segmentedImages });
};

// Function to blend the original color with a new color
function blendColor(original, newColor, blendMode = 'linearBurn', opacity = 0.75) {
    const [r1, g1, b1] = original;
    const [r2, g2, b2] = newColor;

    let r, g, b;

    switch (blendMode) {
        case 'linearBurn':
            r = Math.max(0, r1 + r2 - 255);
            g = Math.max(0, g1 + g2 - 255);
            b = Math.max(0, b1 + b2 - 255);
            break;
        default:
            r = r1;
            g = g1;
            b = b1;
            break;
    }

    // Apply opacity
    r = Math.round(r * opacity + r1 * (1 - opacity));
    g = Math.round(g * opacity + g1 * (1 - opacity));
    b = Math.round(b * opacity + b1 * (1 - opacity));

    return [r, g, b];
}
