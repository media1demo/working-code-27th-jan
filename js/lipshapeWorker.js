// Animation constants
const DEFAULT_ITERATIONS = 20;
const DEFAULT_SCALE_FACTOR = 0.9;
const ANIMATION_PHASES = {
    OPENING: 'opening',
    CLOSING: 'closing'
};

// Animation state
let currentIteration = 0;
let currentPhase = ANIMATION_PHASES.OPENING;
let currentShapeIndex = 0;

// Mouth shapes with animation sequence
const mouthShapes = {
    'Neutral': { 
        openness: 0.2, 
        width: 1.0, 
        squeeze: 0, 
        cupidsBow: 0.2, 
        lowerLipFullness: 0.5,
        rotation: 0
    },
    'Smile': { 
        openness: 0.3, 
        width: 1.2, 
        squeeze: 0.1, 
        cupidsBow: 0.4, 
        lowerLipFullness: 0.6,
        rotation: 0.1
    },
    'Pucker': { 
        openness: 0.1, 
        width: 0.8, 
        squeeze: 0.3, 
        cupidsBow: 0.1, 
        lowerLipFullness: 0.7,
        rotation: -0.1
    },
    'WideOpen': { 
        openness: 1.0, 
        width: 1.1, 
        squeeze: -0.1, 
        cupidsBow: 0.3, 
        lowerLipFullness: 0.4,
        rotation: 0
    },
    'Frown': { 
        openness: 0.2, 
        width: 0.9, 
        squeeze: 0.2, 
        cupidsBow: 0.1, 
        lowerLipFullness: 0.5,
        rotation: -0.2
    },
    'Ah': { 
        openness: 1, 
        width: 1, 
        squeeze: 0, 
        cupidsBow: 0.2, 
        lowerLipFullness: 0.6,
        rotation: 0
    },
    'Oh': { 
        openness: 0.8, 
        width: 0.9, 
        squeeze: 0, 
        cupidsBow: 0.2, 
        lowerLipFullness: 0.7,
        rotation: 0
    },
    'EE': { 
        openness: 0.3, 
        width: 1.03, 
        squeeze: 0, 
        cupidsBow: 0.4, 
        lowerLipFullness: 0.4,
        rotation: 0.1
    },
    'BMP': { 
        openness: 0, 
        width: 0.9, 
        squeeze: 0.1, 
        cupidsBow: 0.1, 
        lowerLipFullness: 0.7,
        rotation: 0
    }
};

const shapeSequence = [
    'Neutral', 'Ah', 'Neutral', 'Oh', 'Neutral', 'EE', 'Neutral', 'WideOpen', 'Neutral', 'BMP'
];

// Helper functions
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

function interpolateMouthShape(progress) {
    const currentShape = mouthShapes[shapeSequence[currentShapeIndex]];
    const nextShapeIndex = (currentShapeIndex + 1) % shapeSequence.length;
    const nextShape = mouthShapes[shapeSequence[nextShapeIndex]];
    
    return {
        openness: currentShape.openness + (nextShape.openness - currentShape.openness) * progress,
        width: currentShape.width + (nextShape.width - currentShape.width) * progress,
        squeeze: currentShape.squeeze + (nextShape.squeeze - currentShape.squeeze) * progress,
        cupidsBow: currentShape.cupidsBow + (nextShape.cupidsBow - currentShape.cupidsBow) * progress,
        lowerLipFullness: currentShape.lowerLipFullness + (nextShape.lowerLipFullness - currentShape.lowerLipFullness) * progress,
        rotation: currentShape.rotation + (nextShape.rotation - currentShape.rotation) * progress
    };
}

function rotatePoint(x, y, centerX, centerY, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const nx = cos * (x - centerX) - sin * (y - centerY) + centerX;
    const ny = sin * (x - centerX) + cos * (y - centerY) + centerY;
    return { x: nx, y: ny };
}

function performLipSync(imageData, region, shape) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    copyImageData(imageData, newImageData);
    
    // Calculate region bounds
    let minY = height, maxY = 0, minX = width, maxX = 0;
    
    region.forEach(pixelIndex => {
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
    });
    
    const centerY = (minY + maxY) / 2;
    const centerX = (minX + maxX) / 2;
    const regionHeight = maxY - minY;
    const regionWidth = maxX - minX;
    const tempBuffer = new Uint8ClampedArray(width * height * 4);
    
    // Clear selected region
    region.forEach(pixelIndex => {
        const baseIndex = pixelIndex * 4;
        for (let c = 0; c < 4; c++) {
            newImageData.data[baseIndex + c] = 0;
        }
    });
    
    // Transform pixels
    region.forEach(pixelIndex => {
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        
        // Calculate transformations
        const verticalOffset = y - centerY;
        const horizontalOffset = x - centerX;
        
        // Rotate point
        const rotatedPoint = rotatePoint(x, y, centerX, centerY, shape.rotation);
        
        let newY = centerY + verticalOffset * shape.openness;
        let newX = centerX + horizontalOffset * shape.width;
        
        // Apply rotation
        const finalRotatedPoint = rotatePoint(newX, newY, centerX, centerY, shape.rotation);
        newX = finalRotatedPoint.x;
        newY = finalRotatedPoint.y;
        
        // Apply squeeze effect
        newX += shape.squeeze * Math.pow(horizontalOffset / regionWidth, 3) * regionWidth;
        
        // Apply Cupid's bow effect to upper lip
        if (y < centerY) {
            const bowEffect = Math.sin(Math.PI * (x - minX) / regionWidth);
            newY -= shape.cupidsBow * bowEffect * regionHeight * 0.2;
        }
        
        // Apply lower lip fullness
        if (y > centerY) {
            const fullnessEffect = Math.sin(Math.PI * (x - minX) / regionWidth);
            newY += shape.lowerLipFullness * fullnessEffect * regionHeight * 0.2;
        }
        
        // Ensure coordinates are within bounds
        newX = Math.max(0, Math.min(width - 1, newX));
        newY = Math.max(0, Math.min(height - 1, newY));
        
        const sourceIndex = (y * width + x) * 4;
        const targetIndex = (Math.floor(newY) * width + Math.floor(newX)) * 4;
        
        // Copy pixel data to temp buffer
        for (let c = 0; c < 4; c++) {
            tempBuffer[targetIndex + c] = imageData.data[sourceIndex + c];
        }
    });
    
    // Blend transformed pixels
    for (let i = 0; i < tempBuffer.length; i += 4) {
        if (tempBuffer[i + 3] > 0) {
            for (let c = 0; c < 4; c++) {
                newImageData.data[i + c] = tempBuffer[i + c];
            }
        }
    }
    
    return newImageData;
}

function animateSelectedRegions(imageData, selectedRegions, progress) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    copyImageData(imageData, newImageData);
    
    const shape = interpolateMouthShape(progress);
    
    selectedRegions.forEach(region => {
        const resultImageData = performLipSync(newImageData, region, shape);
        copyImageData(resultImageData, newImageData);
    });
    
    return newImageData;
}

// Worker message handler
self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;
    
    try {
        if (reset) {
            currentIteration = 0;
            currentPhase = ANIMATION_PHASES.OPENING;
            currentShapeIndex = 0;
        }
        
        let resultImageData;
        let progress;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            progress = currentIteration / (iterations / 2);
            
            if (progress >= 1) {
                currentShapeIndex = (currentShapeIndex + 1) % shapeSequence.length;
                currentIteration = 0;
                progress = 0;
            }
            
            resultImageData = animateSelectedRegions(imageData, selectedRegions, progress);
            currentIteration++;
        } else {
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            progress = undefined;
        }
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress,
            currentShape: shapeSequence[currentShapeIndex],
            nextShape: shapeSequence[(currentShapeIndex + 1) % shapeSequence.length]
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};