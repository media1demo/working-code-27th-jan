self.onmessage = function(e) {
    const { imageData, selectedRegions, imageCount: initialImageCount } = e.data;
    
    const totalImageCount = initialImageCount * 64 * 16;
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

    const lipRegion = new Set(selectedRegions.flat());
    let [minY, maxY, minX, maxX] = [Infinity, -Infinity, Infinity, -Infinity];
    
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

    const lipWidthHalf = lipWidth / 2;
    const lipHeightFifth = lipHeight / 5;

    function performLipSync(shape) {
        const frameData = new Uint8ClampedArray(imageData.data);
    
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const pixelIndex = y * imageData.width + x;
                if (!lipRegion.has(pixelIndex)) continue;
                    
                let [newY, newX] = [y, x];
    
                // Vertical adjustment (openness) remains the same
                const verticalOffset = (y - lipCenterY) / lipHeight;
                newY += verticalOffset * shape.openness * lipHeight * 0.5;
    
                // Modified horizontal adjustment
                const horizontalOffset = (x - lipCenterX) / lipWidthHalf;
                const widthChange = shape.width - 1;
                newX = lipCenterX + horizontalOffset * lipWidthHalf * (1 + widthChange);
           
            }
        }
    
        return new ImageData(frameData, imageData.width, imageData.height);
    }
    

    const phonemes = Object.keys(mouthShapes);
    const segmentedImages = [];
    const parameters = [
        'openness',
         'squeeze', 
         'cupidsBow',
          'lowerLipFullness'
        ];
 
    for (let i = 0; i < totalImageCount; i++) {
        const phoneme = phonemes[i % phonemes.length];
        const baseShape = { ...mouthShapes[phoneme] };
        
        const paramIndex = Math.floor(i / (50 * initialImageCount));
        const iterationWithinParam = (i % (50 * initialImageCount)) / initialImageCount;
        
        const param = parameters[paramIndex];
        baseShape[param] = iterationWithinParam;

        const lipSyncFrame = performLipSync(baseShape);
        segmentedImages.push(lipSyncFrame);

        if ((i + 1) % 20 === 0 || i === totalImageCount - 1) {
            self.postMessage({
                segmentedImages: segmentedImages,
                isComplete: i === totalImageCount - 1
            });
            segmentedImages.length = 0; // Clear the array after sending
        }
    }
};