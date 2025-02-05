const DEFAULT_ITERATIONS = 120;
const WAVE_CONFIGS = {
    center: {
        amplitude: 20,
        frequency: 0.02,
        speed: 0.08
    },
    edges: {
        amplitude: 15,
        frequency: 0.04,
        speed: 0.05
    }
};

let currentIteration = 0;

function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

function copyImageData(source, destination) {
    destination.data.set(source.data);
}

function calculateWaveOffset(x, y, width, height, orientation, time, values) {
    const { getValue } = orientation;
    const { x: centerX, y: centerY } = getValue();
    
    const dx = x - (centerX * width);
    const dy = y - (centerY * height);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const primaryWave = WAVE_CONFIGS.center.amplitude * 
        Math.sin(WAVE_CONFIGS.center.frequency * distance + time * WAVE_CONFIGS.center.speed);
    
    const secondaryWave = WAVE_CONFIGS.edges.amplitude * 
        Math.sin(WAVE_CONFIGS.edges.frequency * (x + y) + time * WAVE_CONFIGS.edges.speed);
    
    const orientationStrength = orientation.value / 100;
    
    return (primaryWave + secondaryWave) * orientationStrength;
}

function applyWaveEffect(imageData, selectedRegions, orientation, time, values) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    copyImageData(imageData, newImageData);
    
    selectedRegions.forEach(region => {
        const tempBuffer = new Uint8ClampedArray(imageData.data);
        
        // Apply wave transformation without clearing the region
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            const waveOffset = calculateWaveOffset(x, y, width, height, orientation, time, values);
            const newY = Math.min(height - 1, Math.max(0, y + waveOffset));
            
            if (newY >= 0 && newY < height) {
                const sourceIndex = (y * width + x) * 4;
                const targetIndex = (Math.floor(newY) * width + x) * 4;
                
                // Copy pixels with color adjustments
                for (let c = 0; c < 4; c++) {
                    let color = imageData.data[sourceIndex + c];
                    if (c < 3) {
                        const saturationAdjustment = values.value1 / 100;
                        color = Math.min(255, Math.max(0, color * (1 + saturationAdjustment)));
                    }
                    newImageData.data[targetIndex + c] = color;
                }
            }
        });
    });
    
    return newImageData;
}

self.onmessage = function(e) {
    const {
        imageData,
        selectedRegions,
        imageCount = 1,
        value1,
        value2,
        value3,
        value4,
        value5,
        value6,
        value7,
        value8,
        reset
    } = e.data;
    
    try {
        if (reset) {
            currentIteration = 0;
        }
        
        const orientations = [
            { name: "Center", getValue: () => ({ x: value1 / 100, y: value1 / 100 }), value: value1 },
            { name: "Top", getValue: () => ({ x: value2 / 100, y: 0.2 }), value: value2 },
            { name: "Bottom", getValue: () => ({ x: value3 / 100, y: 0.8 }), value: value3 },
            { name: "Left", getValue: () => ({ x: 0.2, y: value4 / 100 }), value: value4 },
            { name: "Right", getValue: () => ({ x: 0.8, y: value5 / 100 }), value: value5 },
            { name: "TopLeft", getValue: () => ({ x: value6 / 100, y: value6 / 100 }), value: value6 },
            { name: "TopRight", getValue: () => ({ x: 1 - value7 / 100, y: value7 / 100 }), value: value7 },
            { name: "BottomLeft", getValue: () => ({ x: value8 / 100, y: 1 - value8 / 100 }), value: value8 }
        ];
        
        const segmentedImages = [];
        const time = (currentIteration * Math.PI) / 30;
        const values = { value1, value2, value3, value4, value5 };
        
        for (let i = 0; i < imageCount; i++) {
            // Start with original image if no regions are selected
            if (!selectedRegions?.length || !selectedRegions[0]?.length) {
                segmentedImages.push(new ImageData(
                    new Uint8ClampedArray(imageData.data),
                    imageData.width,
                    imageData.height
                ));
                continue;
            }
            
            // Apply wave effects for each orientation
            for (const orientation of orientations) {
                const resultImageData = applyWaveEffect(
                    imageData,
                    selectedRegions,
                    orientation,
                    time + (i * Math.PI / 4),
                    values
                );
                segmentedImages.push(resultImageData);
            }
        }
        
        currentIteration = (currentIteration + 1) % DEFAULT_ITERATIONS;
        
        self.postMessage({
            segmentedImages : [segmentedImages],
            isComplete: true,
            iteration: currentIteration,
            progress: currentIteration / DEFAULT_ITERATIONS
        });
        
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};