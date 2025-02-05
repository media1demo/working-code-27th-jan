class ImageTransformer {
    constructor(imageData, selectedRegions, params) {
        this.imageData = imageData;
        this.selectedRegions = selectedRegions;
        this.params = params;
        this.segmentedImages = [];
    }

    transform() {
        const { iterations, maxHorizontalOffset, maxVerticalOffset, rotationAngle, scaleFactor } = this.params;
        
        for (let i = 0; i < iterations; i++) {
            const progress = i / (iterations - 1);
            const newImageData = this.createNewImageData();

            this.selectedRegions.forEach((region, index) => {
                const center = this.calculateCenter(region);
                const transformation = this.calculateTransformation(progress, index);
                this.applyTransformation(newImageData, region, center, transformation);
            });

            this.segmentedImages.push(newImageData);
            this.reportProgress(i, iterations);
        }

        return this.segmentedImages;
    }

    createNewImageData() {
        return new ImageData(
            new Uint8ClampedArray(this.imageData.width * this.imageData.height * 4),
            this.imageData.width,
            this.imageData.height
        );
    }

    calculateCenter(region) {
        const x = region.reduce((sum, p) => sum + (p % this.imageData.width), 0) / region.length;
        const y = region.reduce((sum, p) => sum + Math.floor(p / this.imageData.width), 0) / region.length;
        return { x, y };
    }

    calculateTransformation(progress, index) {
        const { maxHorizontalOffset, maxVerticalOffset, rotationAngle, scaleFactor } = this.params;
        return {
            dx: Math.cos(progress * Math.PI * 3) * maxHorizontalOffset,
            dy: Math.sin(progress * Math.PI * 3) * maxVerticalOffset * (index % 2 ? 1 : -1),
            rotation: Math.cos(progress * Math.PI * 2) * rotationAngle,
            scale: 1 + Math.cos(progress * Math.PI * 3) * scaleFactor
        };
    }

    applyTransformation(newImageData, region, center, { dx, dy, rotation, scale }) {
        const cosAngle = Math.cos(rotation * Math.PI / 180);
        const sinAngle = Math.sin(rotation * Math.PI / 180);

        region.forEach(pixelIndex => {
            const { x, y } = this.getPixelCoordinates(pixelIndex, center);
            const { newX, newY } = this.transformCoordinates(x, y, center, dx, dy, cosAngle, sinAngle, scale);

            if (this.isWithinBounds(newX, newY)) {
                this.interpolateAndSetPixel(newImageData, pixelIndex, newX, newY);
            }
        });
    }

    getPixelCoordinates(pixelIndex, center) {
        const x = pixelIndex % this.imageData.width - center.x;
        const y = Math.floor(pixelIndex / this.imageData.width) - center.y;
        return { x, y };
    }

    transformCoordinates(x, y, center, dx, dy, cosAngle, sinAngle, scale) {
        const scaledX = x * scale;
        const scaledY = y * scale;
        const rotatedX = scaledX * cosAngle - scaledY * sinAngle;
        const rotatedY = scaledX * sinAngle + scaledY * cosAngle;
        const newX = rotatedX + center.x + dx;
        const newY = rotatedY + center.y + dy;
        return { newX, newY };
    }

    isWithinBounds(x, y) {
        return x >= 0 && x < this.imageData.width - 1 && y >= 0 && y < this.imageData.height - 1;
    }

    interpolateAndSetPixel(newImageData, pixelIndex, newX, newY) {
        const x1 = Math.floor(newX);
        const y1 = Math.floor(newY);
        const x2 = x1 + 1;
        const y2 = y1 + 1;
        const fx = newX - x1;
        const fy = newY - y1;

        const oldIndex = pixelIndex * 4;
        const newIndex = (Math.floor(newY) * this.imageData.width + Math.floor(newX)) * 4;

        for (let c = 0; c < 4; c++) {
            const p11 = this.imageData.data[(y1 * this.imageData.width + x1) * 4 + c];
            const p21 = this.imageData.data[(y1 * this.imageData.width + x2) * 4 + c];
            const p12 = this.imageData.data[(y2 * this.imageData.width + x1) * 4 + c];
            const p22 = this.imageData.data[(y2 * this.imageData.width + x2) * 4 + c];

            const interpolatedValue =
                p11 * (1 - fx) * (1 - fy) +
                p21 * fx * (1 - fy) +
                p12 * (1 - fx) * fy +
                p22 * fx * fy;

            newImageData.data[newIndex + c] = Math.round(interpolatedValue);
        }
    }

    reportProgress(currentIteration, totalIterations) {
        if (currentIteration % 10 === 0) {
            self.postMessage({
                progress: (currentIteration + 1) / totalIterations,
                isComplete: false
            });
        }
    }
}

self.onmessage = function(e) {
    const { imageData, selectedRegions, value1, value2, value3, value4, value5 } = e.data;
    
    const params = {
        maxHorizontalOffset: value1 || 15,
        maxVerticalOffset: value2 || 8,
        rotationAngle: value3 || 10,
        scaleFactor: value4 || 0.15,
        iterations: value5 || 120
    };

    const transformer = new ImageTransformer(imageData, selectedRegions, params);
    const segmentedImages = transformer.transform();

    console.log('segmentedImages.length :>> ', segmentedImages.length);

    self.postMessage({
        segmentedImages: segmentedImages,
        isComplete: true
    });
};