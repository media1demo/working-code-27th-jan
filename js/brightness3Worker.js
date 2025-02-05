self.onmessage = function(e) {
    const {
        imageData,
        selectedRegions,
        imageCount,
        maxBrightness,
        value1,
        value2,
        value3,
        value4,
        value5,
        value6,
        value7,
        value8,
        clickedPoints,
        lines
    } = e.data;

    const segmentedImages = [];

    const orientations = [
        { name: "Center", centerX: 0.5, centerY: 0.5, value: value1 },
        { name: "Top", centerX: 0.5, centerY: 0.2, value: value2 },
        { name: "Bottom", centerX: 0.5, centerY: 0.8, value: value3 },
        { name: "Left", centerX: 0.2, centerY: 0.5, value: value4 },
        { name: "Right", centerX: 0.8, centerY: 0.5, value: value5 },
        { name: "TopLeft", centerX: 0.2, centerY: 0.2, value: value6 },
        { name: "TopRight", centerX: 0.8, centerY: 0.2, value: value7 },
        { name: "BottomLeft", centerX: 0.2, centerY: 0.8, value: value8 }
    ];

    const brightnessLevels = [-0.875, -0.625, -0.375, -0.125, 0.125, 0.375, 0.625, 0.875];

    console.log("Total permutations: ", orientations.length * brightnessLevels.length);

    let permutationCount = 0;

    for (let i = 0; i < orientations.length; i++) {
        for (let j = 0; j < brightnessLevels.length; j++) {
            permutationCount++;

            const newImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );

            const orientation = orientations[i];
            const centerX = orientation.centerX * imageData.width;
            const centerY = orientation.centerY * imageData.height;
            const radius = Math.min(imageData.width, imageData.height) * 0.3;
            const brightnessStrength = brightnessLevels[j];

            console.log(`Permutation ${permutationCount}:`);
            console.log(`  Orientation: ${orientation.name}`);
            console.log(`  Brightness Strength: ${brightnessStrength.toFixed(3)}`);

            applyBrightness(newImageData, centerX, centerY, radius, brightnessStrength, selectedRegions);

            segmentedImages.push(newImageData);
        }
    }

    console.log("Total images generated:", segmentedImages.length);

    self.postMessage({ segmentedImages: segmentedImages });
};

function applyBrightness(imageData, centerX, centerY, radius, brightnessStrength, selectedRegions) {
    const { width, height } = imageData;

    for (const region of selectedRegions) {
        for (const pixelIndex of region) {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);

            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < radius) {
                const amount = (radius - distance) / radius * brightnessStrength;
                const index = pixelIndex * 4;

                for (let i = 0; i < 3; i++) {
                    let value = imageData.data[index + i];
                    value += 255 * amount;
                    imageData.data[index + i] = Math.min(255, Math.max(0, value));
                }
            }
        }
    }
}
