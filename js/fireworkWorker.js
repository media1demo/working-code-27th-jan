const DEFAULT_EXPLOSION_INTENSITY = 0.5;
const DEFAULT_ITERATIONS = 120;

let currentIteration = 0;

function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4).fill(0),
        width,
        height
    );
}

function calculateSelectedRegionCenter(selectedRegions, width) {
    if (!selectedRegions?.length || !selectedRegions[0]?.length) {
        return null;
    }

    let totalX = 0;
    let totalY = 0;
    const pixelSet = new Set(selectedRegions[0]);

    pixelSet.forEach(pixelIndex => {
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        totalX += x;
        totalY += y;
    });

    const centerX = totalX / pixelSet.size;
    const centerY = totalY / pixelSet.size;

    return { centerX, centerY };
}

function moveRegionUpwards(imageData, selectedRegions, moveDistance) {
    const { width, height } = imageData;
    const newImageData = createTransparentImageData(width, height);

    // If no selected regions, move entire image
    const pixelSet = selectedRegions?.length && selectedRegions[0]?.length 
        ? new Set(selectedRegions[0]) 
        : null;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const pixelIndex = y * width + x;

            // Process all pixels if no specific region selected
            if (!pixelSet || pixelSet.has(pixelIndex)) {
                const newY = y - moveDistance;

                if (newY >= 0 && newY < height) {
                    const sourceIndex = (y * width + x) * 4;
                    const targetIndex = (newY * width + x) * 4;

                    newImageData.data[targetIndex] = imageData.data[sourceIndex];
                    newImageData.data[targetIndex + 1] = imageData.data[sourceIndex + 1];
                    newImageData.data[targetIndex + 2] = imageData.data[sourceIndex + 2];
                    newImageData.data[targetIndex + 3] = imageData.data[sourceIndex + 3];
                }
            }
        }
    }

    return newImageData;
}

// function applyExplosionEffect(imageData, selectedRegions, explosionValue) {
//     const { width, height } = imageData;
//     const newImageData = new ImageData(
//         new Uint8ClampedArray(imageData.data),
//         width,
//         height
//     );

//     // Calculate the center of the entire image or selected region
//     const center = selectedRegions?.length && selectedRegions[0]?.length
//         ? calculateSelectedRegionCenter(selectedRegions, width)
//         : { centerX: width / 2, centerY: height / 2 };

//     const { centerX, centerY } = center;

//     // Explosion parameters
//     const maxDisplacement = width * explosionValue;

//     // Determine which pixels to process
//     const pixelSet = selectedRegions?.length && selectedRegions[0]?.length 
//         ? new Set(selectedRegions[0]) 
//         : null;

//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             const pixelIndex = y * width + x;

//             // Process all pixels if no specific region selected
//             if (!pixelSet || pixelSet.has(pixelIndex)) {
//                 const dx = x - centerX;
//                 const dy = y - centerY;
//                 const distance = Math.sqrt(dx * dx + dy * dy);
//                 const angle = Math.atan2(dy, dx);

//                 const displacement = maxDisplacement *
//                     Math.pow(1 - distance / Math.max(width, height), 2);

//                 const newX = Math.floor(x + displacement * Math.cos(angle) * 2);
//                 const newY = Math.floor(y + displacement * Math.sin(angle) * 2);

//                 if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
//                     const sourceIndex = (y * width + x) * 4;
//                     const targetIndex = (newY * width + newX) * 4;

//                     const fadeFactor = Math.max(0,
//                         Math.exp(-distance / (Math.max(width, height) / 2))
//                     );

//                     newImageData.data[targetIndex] =
//                         Math.floor(imageData.data[sourceIndex] * (1 + Math.random() * 0.5));
//                     newImageData.data[targetIndex + 1] =
//                         Math.floor(imageData.data[sourceIndex + 1] * (1 + Math.random() * 0.5));
//                     newImageData.data[targetIndex + 2] =
//                         Math.floor(imageData.data[sourceIndex + 2] * (1 + Math.random() * 0.5));
//                     newImageData.data[targetIndex + 3] =
//                         Math.floor(imageData.data[sourceIndex + 3] * fadeFactor);
//                 }
//             }
//         }
//     }

//     return newImageData;
// }

function applyExplosionEffect(imageData, selectedRegions, explosionValue) {
    const { width, height } = imageData;
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );

    // Calculate the center of the selected region
    const center = calculateSelectedRegionCenter(selectedRegions, width);
    if (!center) {
        return newImageData; // No selected region, return original image
    }

    const { centerX, centerY } = center;

    // Explosion parameters
    const maxDisplacement = width * explosionValue;

    if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
        const pixelSet = new Set(selectedRegions[0]);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = y * width + x;

                // Process only pixels in the selected region
                if (pixelSet.has(pixelIndex)) {
                    // Calculate distance and angle from the center of the selected region
                    const dx = x - centerX;
                    const dy = y - centerY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx);

                    // Smooth radial displacement with more dramatic explosion
                    const displacement = maxDisplacement *
                        Math.pow(1 - distance / Math.max(width, height), 2);

                    // New pixel coordinates with wider spread
                    const newX = Math.floor(x + displacement * Math.cos(angle) * 2);
                    const newY = Math.floor(y + displacement * Math.sin(angle) * 2);

                    // Boundary check
                    if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                        const sourceIndex = (y * width + x) * 4;
                        const targetIndex = (newY * width + newX) * 4;

                        // More aggressive fade-out
                        const fadeFactor = Math.max(0,
                            Math.exp(-distance / (Math.max(width, height) / 2))
                        );

                        // Modify target pixel with fading and color variation
                        newImageData.data[targetIndex] =
                            Math.floor(imageData.data[sourceIndex] * (1 + Math.random() * 0.5));
                        newImageData.data[targetIndex + 1] =
                            Math.floor(imageData.data[sourceIndex + 1] * (1 + Math.random() * 0.5));
                        newImageData.data[targetIndex + 2] =
                            Math.floor(imageData.data[sourceIndex + 2] * (1 + Math.random() * 0.5));
                        newImageData.data[targetIndex + 3] =
                            Math.floor(imageData.data[sourceIndex + 3] * fadeFactor);
                    }
                }
            }
        }
    }

    return newImageData;
}

self.onmessage = function (e) {
    const {
        imageData,
        selectedRegions,
        value,
        value5: iterations = DEFAULT_ITERATIONS,
        reset
    } = e.data;

    try {
        if (reset) {
            currentIteration = 0;
        }

        // Move region upwards first
        const movedImageData = moveRegionUpwards(imageData, selectedRegions, currentIteration * 5);

        // Then apply explosion effect
        let resultImageData = applyExplosionEffect(movedImageData, selectedRegions, value);
        currentIteration = (currentIteration + 1) % iterations;
        const progress = currentIteration / iterations;

        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress
        }, [resultImageData.data.buffer]);
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};