const DEFAULT_ITERATIONS = 120;

const ANIMATION_PHASES = {
    OPENING: 'opening',
    CLOSING: 'closing'
};

let currentIteration = 0;
let currentPhase = ANIMATION_PHASES.OPENING;

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

// Lip-sync logic
const mouthShapes = {
    'FullyClosed': { openness: -1.0, width: 0.8, squeeze: 0.3, cupidsBow: 0.05, lowerLipFullness: 0.4 },
    'SlightlyOpen': { openness: 0.2, width: 1.0, squeeze: 0.1, cupidsBow: 0.2, lowerLipFullness: 0.5 },
    'MediumOpen': { openness: 0.5, width: 1.1, squeeze: 0, cupidsBow: 0.3, lowerLipFullness: 0.6 },
    'WideOpen': { openness: 1.0, width: 1.2, squeeze: -0.1, cupidsBow: 0.4, lowerLipFullness: 0.7 },
};

function performLipSync(imageData, lipRegion, shape) {
    const frameData = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;

    let [minY, maxY, minX, maxX] = [Infinity, -Infinity, Infinity, -Infinity];
    for (let pixelIndex of lipRegion) {
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
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

    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            const pixelIndex = y * width + x;
            if (!lipRegion.has(pixelIndex)) continue;

            const idx = pixelIndex * 4;
            const r = imageData.data[idx];
            const g = imageData.data[idx + 1];
            const b = imageData.data[idx + 2];
            if ((r > 240 && g > 240 && b > 240) || (r < 15 && g < 15 && b < 15)) {
                continue; // Skip white and black pixels
            }

            let [newY, newX] = [y, x];

            const isUpperLip = y < lipCenterY;
            const lipFactor = isUpperLip ? 0.7 : 1.0; // Upper lip moves less

            // Vertical transformation
            const verticalOffset = (y - lipCenterY) / lipHeight;
            newY += Math.max(-lipHeight * 0.5, Math.min(lipHeight * 0.5, verticalOffset * shape.openness * lipHeight * lipFactor));

            // Horizontal transformation
            const horizontalOffset = (x - lipCenterX) / lipWidthHalf;
            newX = lipCenterX + horizontalOffset * shape.width * lipWidthHalf;

            // Squeeze effect
            newX += (lipCenterX - newX) * shape.squeeze;

            // Ensure we stay within bounds
            newY = Math.max(minY, Math.min(maxY, newY));
            newX = Math.max(minX, Math.min(maxX, newX));

            // Bilinear interpolation
            const [x1, y1] = [Math.floor(newX), Math.floor(newY)];
            const [wx, wy] = [newX - x1, newY - y1];

            const x2 = Math.min(x1 + 1, width - 1);
            const y2 = Math.min(y1 + 1, height - 1);

            const [w1, w2, w3, w4] = [(1 - wx) * (1 - wy), wx * (1 - wy), (1 - wx) * wy, wx * wy];

            const idx1 = (y * width + x) * 4;
            for (let c = 0; c < 4; c++) {
                const [c1, c2, c3, c4] = [
                    imageData.data[(y1 * width + x1) * 4 + c],
                    imageData.data[(y1 * width + x2) * 4 + c],
                    imageData.data[(y2 * width + x1) * 4 + c],
                    imageData.data[(y2 * width + x2) * 4 + c]
                ];
                frameData[idx1 + c] = w1 * c1 + w2 * c2 + w3 * c3 + w4 * c4;
            }
        }
    }

    return new ImageData(frameData, width, height);
}

function interpolateShapes(shape1, shape2, t) {
    const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // Ease in-out quadratic
    return {
        openness: shape1.openness * (1 - easeT) + shape2.openness * easeT,
        width: shape1.width * (1 - easeT) + shape2.width * easeT,
        squeeze: shape1.squeeze * (1 - easeT) + shape2.squeeze * easeT,
        cupidsBow: shape1.cupidsBow * (1 - easeT) + shape2.cupidsBow * easeT,
        lowerLipFullness: shape1.lowerLipFullness * (1 - easeT) + shape2.lowerLipFullness * easeT
    };
}

function animateSelectedRegions(imageData, selectedRegions, progress) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    copyImageData(imageData, newImageData);

    const lipRegion = new Set(selectedRegions.flat());

    // Calculate the current and next mouth shapes based on the progress
    const phonemes = Object.keys(mouthShapes);
    const phonemeIndex = Math.floor(progress * phonemes.length) % phonemes.length;
    const nextPhonemeIndex = (phonemeIndex + 1) % phonemes.length;

    const currentPhoneme = phonemes[phonemeIndex];
    const nextPhoneme = phonemes[nextPhonemeIndex];

    // Interpolate between the current and next mouth shapes
    const t = (progress * phonemes.length) % 1;
    const interpolatedShape = interpolateShapes(mouthShapes[currentPhoneme], mouthShapes[nextPhoneme], t);

    // Perform lip-sync on the selected regions
    const resultImageData = performLipSync(newImageData, lipRegion, interpolatedShape);
    copyImageData(resultImageData, newImageData);

    return newImageData;
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;

    try {
        // Reset animation if requested
        if (reset) {
            currentIteration = 0;
            currentPhase = ANIMATION_PHASES.OPENING;
        }

        let resultImageData;
        let progress;

        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Calculate progress within current phase
            progress = currentIteration / (iterations / 2);

            // Handle phase transition
            if (progress >= 1) {
                currentPhase = currentPhase === ANIMATION_PHASES.OPENING 
                    ? ANIMATION_PHASES.CLOSING 
                    : ANIMATION_PHASES.OPENING;
                currentIteration = 0;
                progress = 0;
            }

            // Animate selected regions
            resultImageData = animateSelectedRegions(imageData, selectedRegions, progress);
            currentIteration++;
        } else {
            // If no regions selected, return original image
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
            phase: currentPhase
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};