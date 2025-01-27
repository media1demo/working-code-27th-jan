self.onmessage = function (e) {

    const {
        type,
        imageData,
        width,
        height,
        bodyPartImages,
        extremePoints,
        averages,
        timestamp,
        partNames,
        numberOfVariations,
        rotationAngles,
        imageArray
    } = e.data;
console.log(extremePoints);
console.log(averages);
    // Function to generate a random rotation angle
    function generateRandomRotationAngle() {
        return Math.random() * 360; // Rotation angle between 0 and 360 degrees
    }

    // Function to rotate an image segment
    function rotateSegment(segmentData, width, height, angle, center) {
        return new Promise((resolve) => {
            const radians = (angle * Math.PI) / 180;
            const cos = Math.cos(radians);
            const sin = Math.sin(radians);
            const rotatedData = new Uint8ClampedArray(width * height * 4);

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const dx = x - center.x;
                    const dy = y - center.y;

                    const srcX = Math.round(center.x + (dx * cos - dy * sin));
                    const srcY = Math.round(center.y + (dx * sin + dy * cos));

                    if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
                        const targetIdx = (y * width + x) * 4;
                        const srcIdx = (srcY * width + srcX) * 4;

                        if (segmentData[srcIdx + 3] > 0) {
                            rotatedData[targetIdx] = segmentData[srcIdx];
                            rotatedData[targetIdx + 1] = segmentData[srcIdx + 1];
                            rotatedData[targetIdx + 2] = segmentData[srcIdx + 2];
                            rotatedData[targetIdx + 3] = segmentData[srcIdx + 3];
                        }
                    }
                }
            }
            resolve(rotatedData);
        });
    }
    
    async function combineImages(bodyPartImages, width, height, index) {
        const combinedImageData = new Uint8ClampedArray(width * height * 4);
    
        // Overlay all body parts
        for (const partName in bodyPartImages) {
            const partImages = bodyPartImages[partName];
    
            for (let i = 0; i < partImages.length; i++) {
                let imageData = partImages[i].imageData;
    
                // Specifically handle right_foot rotation with a new random angle each time
                if (partName === 'right_foot') {
                    console.log('Right Foot Extreme Points:', extremePoints.rightFoot);
                    console.log('Right Foot Image Details:', {
                        width: partImages[i].width,
                        height: partImages[i].height,
                    });
                    
                    const randomRotationAngle = generateRandomRotationAngle();
                    imageData = await rotateSegment(
                        partImages[i].imageData,
                        width,
                        height,
                        randomRotationAngle,
                        extremePoints.rightFoot.top // Rotation point
                    );
                }
    
                // Overlay the image data
                for (let j = 0; j < imageData.length; j += 4) {
                    if (imageData[j + 3] > 0) {
                        combinedImageData[j] = imageData[j];
                        combinedImageData[j + 1] = imageData[j + 1];
                        combinedImageData[j + 2] = imageData[j + 2];
                        combinedImageData[j + 3] = imageData[j + 3];
                    }
                }
            }
        }
    
        return combinedImageData;
    }
    
    async function processVariations() {
        const processedVariations = [];

        for (let index = 0; index < numberOfVariations; index++) {
            // Combine all images on top of each other
            const combinedImageData = await combineImages(bodyPartImages, width, height, index);

            // Create a Blob from the combined image data
            const combinedBlob = await createImageFromData(combinedImageData, width, height);
            const combinedImageUrl = URL.createObjectURL(combinedBlob);

            // Add the combined image to the processed variations
            processedVariations.push({
                imageData: combinedImageData,
                width,
                height,
                imageUrl: combinedImageUrl,
                timestamp,
                partNames
            });
        }

        // Send the processed variations back to the main thread
        self.postMessage({
            type: 'processedVariations',
            variations: processedVariations,
            timestamp,
            partNames
        });
    }

    // Function to create an image from ImageData
    function createImageFromData(imageData, width, height) {
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.putImageData(new ImageData(imageData, width, height), 0, 0);
        return canvas.convertToBlob();
    }

    // Start processing the variations
    processVariations().catch(error => {
        self.postMessage({
            type: 'error',
            error: error.message,
            timestamp
        });
    });
};