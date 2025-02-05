self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        initialImageCount = 10 // Default number of initial images
    } = e.data;

    try {
        console.log('initialImageCount :>> ', initialImageCount);
        const totalImageCount = initialImageCount * 64;

        const mouthShapes = {
            'Neutral': { openness: 0.2, width: 1.0, squeeze: 0, cupidsBow: 0.2, lowerLipFullness: 0.5 },
            'Smile': { openness: 0.3, width: 1.2, squeeze: 0.1, cupidsBow: 0.4, lowerLipFullness: 0.6 },
            'Pucker': { openness: 0.1, width: 0.8, squeeze: 0.3, cupidsBow: 0.1, lowerLipFullness: 0.7 },
            'WideOpen': { openness: 1.0, width: 1.1, squeeze: -0.1, cupidsBow: 0.3, lowerLipFullness: 0.4 },
            'Frown': { openness: 0.2, width: 0.9, squeeze: 0.2, cupidsBow: 0.1, lowerLipFullness: 0.5 },
            'AE': { openness: 0.7, width: 1.01, squeeze: 0, cupidsBow: 0.3, lowerLipFullness: 0.5 },
            'Ah': { openness: 1, width: 1, squeeze: 0, cupidsBow: 0.2, lowerLipFullness: 0.6 },
            'BMP': { openness: 0, width: 0.9, squeeze: 0.1, cupidsBow: 0.1, lowerLipFullness: 0.7 },
            'ChJ': { openness: 0.3, width: 1.02, squeeze: 0, cupidsBow: 0.3, lowerLipFullness: 0.5 },
            'EE': { openness: 0.3, width: 1.03, squeeze: 0, cupidsBow: 0.4, lowerLipFullness: 0.4 },
            'Er': { openness: 0.4, width: 1, squeeze: 0.1, cupidsBow: 0.2, lowerLipFullness: 0.5 },
            'FV': { openness: 0.2, width: 1.01, squeeze: 0.2, cupidsBow: 0.3, lowerLipFullness: 0.6 },
            'Ih': { openness: 0.4, width: 1.02, squeeze: 0, cupidsBow: 0.3, lowerLipFullness: 0.5 },
            'KGHNG': { openness: 0.5, width: 1, squeeze: 0.1, cupidsBow: 0.2, lowerLipFullness: 0.5 },
            'Oh': { openness: 0.8, width: 0.9, squeeze: 0, cupidsBow: 0.2, lowerLipFullness: 0.7 },
            'R': { openness: 0.4, width: 1.01, squeeze: 0.1, cupidsBow: 0.3, lowerLipFullness: 0.5 },
            'SZ': { openness: 0.2, width: 1.02, squeeze: 0, cupidsBow: 0.3, lowerLipFullness: 0.5 },
            'TLDN': { openness: 0.3, width: 1.01, squeeze: 0.1, cupidsBow: 0.3, lowerLipFullness: 0.5 },
            'Th': { openness: 0.2, width: 1.01, squeeze: 0.1, cupidsBow: 0.3, lowerLipFullness: 0.6 },
            'WOO': { openness: 0.3, width: 0.8, squeeze: 0.2, cupidsBow: 0.1, lowerLipFullness: 0.7 }
        };

        const phonemes = Object.keys(mouthShapes);
        const segmentedImages = [];
        let batchNumber = 1;
        let batchPhonemes = [];

        for (let i = 0; i < totalImageCount; i++) {
            const phoneme = phonemes[i % phonemes.length];
            batchPhonemes.push(phoneme);

            const lipSyncFrame = performLipSync(imageData, selectedRegions, mouthShapes[phoneme]);
            segmentedImages.push(lipSyncFrame);

            // Send images in batches of 10
            if ((i + 1) % 10 === 0 || i === totalImageCount - 1) {
                console.log(`Batch ${batchNumber} phonemes:`, batchPhonemes);

                self.postMessage({
                    segmentedImages: segmentedImages,
                    isComplete: i === totalImageCount - 1
                });
                
                segmentedImages.length = 0; // Clear the array after sending
                batchPhonemes = []; // Clear the batch phonemes
                batchNumber++;
            }
        }

    } catch (error) {
        console.error('Error in lip sync processing:', error);
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};

function performLipSync(imageData, selectedRegions, shape) {
    const lipRegion = [...new Set(selectedRegions.flat())];
    let minY = Infinity, maxY = -Infinity, minX = Infinity, maxX = -Infinity;

    for (let pixelIndex of lipRegion) {
        const x = pixelIndex % imageData.width;
        const y = Math.floor(pixelIndex / imageData.width);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
    }

    const lipCenterY = (minY + maxY) / 2;
    const lipCenterX = (minX + maxX) / 2;
    const lipHeight = maxY - minY;
    const lipWidth = maxX - minX;

    // Create a new transparent image data
    let frameData = new Uint8ClampedArray(imageData.width * imageData.height * 4);
    frameData.fill(0); // Make all pixels transparent

    for (let pixelIndex of lipRegion) {
        const x = pixelIndex % imageData.width;
        const y = Math.floor(pixelIndex / imageData.width);
        let newY = y;
        let newX = x;

        // Apply transformations based on the mouth shape
        if (y >= lipCenterY) {
            newY += (y - lipCenterY) * (shape.openness - 1) * (1 + (y - lipCenterY) / lipHeight);
        } else {
            newY -= (lipCenterY - y) * (shape.openness - 1) * (1 + (lipCenterY - y) / lipHeight);
        }

        const horizontalFactor = Math.pow((x - lipCenterX) / (lipWidth / 2), 3);
        newX = lipCenterX + (x - lipCenterX) * shape.width;
        newX += horizontalFactor * lipWidth * shape.squeeze * (y >= lipCenterY ? -0.8 : 0.5);

        if (y < lipCenterY) {
            const bowFactor = Math.sin((x - minX) / lipWidth * Math.PI);
            newY -= bowFactor * shape.cupidsBow * lipHeight / 5;
        }

        if (y > lipCenterY) {
            const fullnessFactor = Math.sin((x - minX) / lipWidth * Math.PI);
            newY += fullnessFactor * shape.lowerLipFullness * lipHeight / 5;
        }

        newX = Math.max(0, Math.min(imageData.width - 1, Math.round(newX)));
        newY = Math.max(0, Math.min(imageData.height - 1, Math.round(newY)));

        const oldIndex = pixelIndex * 4;
        const newIndex = (newY * imageData.width + newX) * 4;

        // Copy only the lip pixels to the new image data
        frameData[newIndex] = imageData.data[oldIndex];
        frameData[newIndex + 1] = imageData.data[oldIndex + 1];
        frameData[newIndex + 2] = imageData.data[oldIndex + 2];
        frameData[newIndex + 3] = imageData.data[oldIndex + 3];
    }

    return new ImageData(frameData, imageData.width, imageData.height);
}