self.onmessage = function(e) {
    const { imageData, selectedRegions, imageCount: initialImageCount } = e.data;
    
    const totalImageCount = initialImageCount * 4;
    const mouthShapes = {
        'Closed': { openness: -0.2, width: 0.9 },
        'Open': { openness: 0.2, width: 1.1 },
    };

    const lipRegion = new Set(selectedRegions);
    const lipCenterY = Math.floor(imageData.height * 0.75);
    const lipCenterX = Math.floor(imageData.width / 2);
    const lipHeight = Math.floor(imageData.height / 2);
    const lipWidth = imageData.width;

    function performLipSync(shape) {
        const frameData = new Uint8ClampedArray(imageData.data);
    
        for (let y = lipCenterY - lipHeight / 2; y < lipCenterY + lipHeight / 2; y++) {
            for (let x = 0; x < imageData.width; x++) {
                const pixelIndex = y * imageData.width + x;
                if (!lipRegion.has(pixelIndex)) continue;
    
                let newY = y + shape.openness * (y - lipCenterY);
                let newX = lipCenterX + (x - lipCenterX) * shape.width;
    
                newY = Math.max(0, Math.min(imageData.height - 1, Math.round(newY)));
                newX = Math.max(0, Math.min(imageData.width - 1, Math.round(newX)));
    
                const sourceIdx = (y * imageData.width + x) * 4;
                const targetIdx = (newY * imageData.width + newX) * 4;
    
                for (let c = 0; c < 4; c++) {
                    frameData[targetIdx + c] = imageData.data[sourceIdx + c];
                }
            }
        }
    
        return new ImageData(frameData, imageData.width, imageData.height);
    }

    const shapes = ['Closed', 'Open'];
    const segmentedImages = [];

    for (let i = 0; i < totalImageCount; i++) {
        const t = (i % shapes.length) / (shapes.length - 1);
        const interpolatedShape = {
            openness: mouthShapes['Closed'].openness * (1 - t) + mouthShapes['Open'].openness * t,
            width: mouthShapes['Closed'].width * (1 - t) + mouthShapes['Open'].width * t,
        };

        const lipSyncFrame = performLipSync(interpolatedShape);
        segmentedImages.push(lipSyncFrame);

        if ((i + 1) % 4 === 0 || i === totalImageCount - 1) {
            self.postMessage({
                segmentedImages: segmentedImages,
                isComplete: i === totalImageCount - 1
            });
            segmentedImages.length = 0;
        }
    }
};