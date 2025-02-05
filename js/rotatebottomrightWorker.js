class ImageRotationWorker {
    constructor() {
        this.currentIteration = 0;
        this.DEFAULT_ROTATION_ANGLE = 45;
        this.DEFAULT_ITERATIONS = 120;
        this.DEFAULT_ROTATION_STEP = 2;
    }

    createEmptyImageData(width, height) {
        return new ImageData(
            new Uint8ClampedArray(width * height * 4),
            width,
            height
        );
    }

    rotatePixel(x, y, width, height, angle) {
        const centerX = width - 1;
        const centerY = height - 1;
        const radians = (angle * Math.PI) / 180;

        const relativeX = x - centerX;
        const relativeY = y - centerY;

        const rotatedX = relativeX * Math.cos(radians) - relativeY * Math.sin(radians);
        const rotatedY = relativeX * Math.sin(radians) + relativeY * Math.cos(radians);

        return {
            newX: Math.round(rotatedX + centerX),
            newY: Math.round(rotatedY + centerY)
        };
    }

    rotateFullImage(imageData, angle) {
        const { width, height, data } = imageData;
        const result = this.createEmptyImageData(width, height);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const { newX, newY } = this.rotatePixel(x, y, width, height, angle);

                if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                    const sourceIndex = (y * width + x) * 4;
                    const destIndex = (newY * width + newX) * 4;

                    result.data.set(data.slice(sourceIndex, sourceIndex + 4), destIndex);
                }
            }
        }

        return result;
    }

    rotateSelectedRegions(imageData, selectedRegions, maxRotationAngle) {
        const { width, height } = imageData;
        const result = this.createEmptyImageData(width, height);
        result.data.set(imageData.data);

        selectedRegions.forEach(region => {
            const rotationAngle = Math.random() * maxRotationAngle;
            const tempBuffer = new Uint8ClampedArray(width * height * 4);

            // Clear selected region
            region.forEach(pixelIndex => {
                const baseIndex = pixelIndex * 4;
                result.data.fill(0, baseIndex, baseIndex + 4);
            });

            // Rotate pixels
            region.forEach(pixelIndex => {
                const x = pixelIndex % width;
                const y = Math.floor(pixelIndex / width);
                const { newX, newY } = this.rotatePixel(x, y, width, height, rotationAngle);

                if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                    const sourceIndex = (y * width + x) * 4;
                    const targetIndex = (newY * width + newX) * 4;

                    tempBuffer.set(imageData.data.slice(sourceIndex, sourceIndex + 4), targetIndex);
                }
            });

            // Blend rotated pixels
            for (let i = 0; i < tempBuffer.length; i += 4) {
                if (tempBuffer[i + 3] > 0) {
                    result.data.set(tempBuffer.slice(i, i + 4), i);
                }
            }
        });

        return result;
    }

    processRotation(imageData, selectedRegions, angle, maxRotationAngle, iterations) {
        let resultImageData;
        let progress;

        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = this.rotateSelectedRegions(imageData, selectedRegions, maxRotationAngle);
            this.currentIteration = (this.currentIteration + 1) % iterations;
            progress = this.currentIteration / iterations;
        } else {
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            const totalRotation = this.DEFAULT_ROTATION_STEP * (this.currentIteration + 1);
            resultImageData = this.rotateFullImage(resultImageData, totalRotation);
            this.currentIteration++;
            progress = undefined;
        }

        return { resultImageData, progress };
    }
}

const rotationWorker = new ImageRotationWorker();

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value, 
        value2: maxRotationAngle = rotationWorker.DEFAULT_ROTATION_ANGLE,
        value5: iterations = rotationWorker.DEFAULT_ITERATIONS,
        reset 
    } = e.data;
    
    try {
        if (reset) {
            rotationWorker.currentIteration = 0;
        }
        
        const { resultImageData, progress } = rotationWorker.processRotation(
            imageData, 
            selectedRegions, 
            value, 
            maxRotationAngle, 
            iterations
        );
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: rotationWorker.currentIteration,
            progress
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};