self.onmessage = function(e) {
    const data = e.data;
    // console.log('Worker received message');

    const imageData = data.imageData;
    const selectedRegions = data.selectedRegions;
    const baseImageCount = data.imageCount || 5;
    const totalImageCount = baseImageCount ; // 5 * 64 = 320
    const baseValue1 = data.value1 || 180; // Max rotation angle in degrees

    const segmentedImages = [];
    const backgroundColor = getAverageColor(imageData, selectedRegions);
    // console.log('Background color:', backgroundColor);

    for (let i = 0; i < totalImageCount; i++) {
        // console.log(`Processing image ${i + 1} of ${totalImageCount}`);

        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );
        // console.log('Total segmented images created:', segmentedImages.length);

        const rotationAngle = (Math.random() - 0.5) * 2 * baseValue1;
        const rotationRadians = rotationAngle * Math.PI / 180;

        // Calculate the center of the image
        const centerX = imageData.width / 2;
        const centerY = imageData.height / 2;

        // for (let y = 0; y < imageData.height; y++) {
        //     for (let x = 0; x < imageData.width; x++) {
        //         const index = (y * imageData.width + x) * 4;
        //         newImageData.data[index] = backgroundColor[0];
        //         newImageData.data[index + 1] = backgroundColor[1];
        //         newImageData.data[index + 2] = backgroundColor[2];
        //         newImageData.data[index + 3] = 255; // Full opacity
        //     }
        // }

        for (const region of selectedRegions) {
            for (const pixelIndex of region) {
                const x = pixelIndex % imageData.width;
                const y = Math.floor(pixelIndex / imageData.width);
                
                // Translate to origin
                const transX = x - centerX;
                const transY = y - centerY;

                const rotatedX = Math.round(transX * Math.cos(rotationRadians) - transY * Math.sin(rotationRadians) + centerX);
                const rotatedY = Math.round(transX * Math.sin(rotationRadians) + transY * Math.cos(rotationRadians) + centerY);

                if (rotatedX >= 0 && rotatedX < imageData.width && rotatedY >= 0 && rotatedY < imageData.height) {
                    const oldIndex = (y * imageData.width + x) * 4;
                    const newIndex = (rotatedY * imageData.width + rotatedX) * 4;

                    for (let c = 0; c < 4; c++) {
                        newImageData.data[newIndex + c] = imageData.data[oldIndex + c];
                    }
                }
            }
        }

        segmentedImages.push(newImageData);
    }

    // console.log('segmentedImages :>> ', segmentedImages);
    self.postMessage({ segmentedImages: segmentedImages });
    // console.log('Worker finished processing');

};


function getRandomValue(baseValue, index, seed) {
    // Use a seeded random number generator for reproducibility
    const random = seededRandom(index * 5 + seed);
    
    // Generate a random value between -baseValue and baseValue
    return (random() - 0.5) * 2 * baseValue;
}

function seededRandom(seed) {
    const m = 2 ** 35 - 31;
    const a = 185852;
    let s = seed % m;
    return function() {
        return (s = s * a % m) / m;
    };
}

function getAverageColor(imageData, selectedRegions) {
    // console.log('Calculating average color');

    let r = 0, g = 0, b = 0, count = 0;
    const borderPixels = new Set();

    // Get border pixels
    for (const region of selectedRegions) {
        for (const pixelIndex of region) {
            const x = pixelIndex % imageData.width;
            const y = Math.floor(pixelIndex / imageData.width);
            
            // Check if it's a border pixel
            if (x === 0 || x === imageData.width - 1 || y === 0 || y === imageData.height - 1 ||
                !region.includes((y-1) * imageData.width + x) ||
                !region.includes((y+1) * imageData.width + x) ||
                !region.includes(y * imageData.width + x - 1) ||
                !region.includes(y * imageData.width + x + 1)) {
                borderPixels.add(pixelIndex);
            }
        }
    }

    for (const pixelIndex of borderPixels) {
        const i = pixelIndex * 4;
        r += imageData.data[i];
        g += imageData.data[i + 1];
        b += imageData.data[i + 2];
        count++;
    }
    // console.log('Average color:', [r, g, b]);

    if (count > 0) {
        return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
    } else {
        return [0, 0, 0]; // Default to black if no border pixels
    }
}


function getRandomValue(baseValue, index, seed) {
    // Use a seeded random number generator for reproducibility
    const random = seededRandom(index * 5 + seed);
    
    // Generate a random value between -baseValue and baseValue
    return (random() - 0.5) * 2 * baseValue;
}

function seededRandom(seed) {
    const m = 2 ** 35 - 31;
    const a = 185852;
    let s = seed % m;
    return function() {
        return (s = s * a % m) / m;
    };
}

function getAverageColor(imageData, selectedRegions) {
    let r = 0, g = 0, b = 0, count = 0;
    const borderPixels = new Set();

    // Get border pixels
    for (const region of selectedRegions) {
        for (const pixelIndex of region) {
            const x = pixelIndex % imageData.width;
            const y = Math.floor(pixelIndex / imageData.width);
            
            // Check if it's a border pixel
            if (x === 0 || x === imageData.width - 1 || y === 0 || y === imageData.height - 1 ||
                !region.includes((y-1) * imageData.width + x) ||
                !region.includes((y+1) * imageData.width + x) ||
                !region.includes(y * imageData.width + x - 1) ||
                !region.includes(y * imageData.width + x + 1)) {
                borderPixels.add(pixelIndex);
            }
        }
    }

    for (const pixelIndex of borderPixels) {
        const i = pixelIndex * 4;
        r += imageData.data[i];
        g += imageData.data[i + 1];
        b += imageData.data[i + 2];
        count++;
    }

    if (count > 0) {
        return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
    } else {
        return [0, 0, 0]; // Default to black if no border pixels
    }
}