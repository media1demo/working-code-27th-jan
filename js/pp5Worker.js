// self.onmessage = function(e) {
//     const { imageData, selectedRegions, imageCount, value1, value2, value3, value4, value5 } = e.data;
    
//     const lipRegion = selectedRegions[0];
    
//     let segmentedImages = [];
    
//     const mouthShapes = [
//         { openness: 0.1, width: 1.0, height: 1.0 },  // Normal
//         { openness: 0.7, width: 1.2, height: 0.8 },  // A,E,I
//         { openness: 0.1, width: 0.9, height: 1.1 },  // B,M,P
//         { openness: 0.4, width: 1.1, height: 0.9 },  // C,D,G,K,N,S,T,X,Y,Z
//         { openness: 0.3, width: 1.0, height: 1.0 },  // F,V
//         { openness: 0.6, width: 0.7, height: 0.7 },  // O
//         { openness: 0.4, width: 0.8, height: 0.9 },  // U
//         { openness: 0.5, width: 0.9, height: 1.1 },  // R
//         { openness: 0.3, width: 1.3, height: 0.8 },  // Smile
//         { openness: 0.1, width: 0.6, height: 1.2 }   // Kiss
//     ];

//     for (let i = 0; i < imageCount; i++) {

//         let modifiedImageData = new ImageData(
//             new Uint8ClampedArray(imageData.data),
//             imageData.width,
//             imageData.height
//         );
        
//         // Choose a random mouth shape
//         const shapeIndex = Math.floor(Math.random() * mouthShapes.length);
//         const shape = mouthShapes[shapeIndex];
        
//         // Modify the lip region for this frame
//         lipSync(modifiedImageData, lipRegion, shape, value1, value2, value3);
        
//         // Add the modified image to the array
//         segmentedImages.push(modifiedImageData);
//     }
    
//     // Send the processed images back to the main thread
//     self.postMessage({
//         segmentedImages: segmentedImages,
//         isComplete: true
//     });
// };

// function lipSync(imageData, lipRegion, shape, intensity, smoothness, stretch) {
//     const centerX = imageData.width / 2;
//     const centerY = imageData.height / 2;

//     for (let i = 0; i < lipRegion.length; i++) {
//         const pixelIndex = lipRegion[i];
//         const x = pixelIndex % imageData.width;
//         const y = Math.floor(pixelIndex / imageData.width);
        
//         const dx = x - centerX;
//         const dy = y - centerY;
//         const distance = Math.sqrt(dx * dx + dy * dy);
//         const angle = Math.atan2(dy, dx);

//         // Apply shape transformations
//         const opennessFactor = y < centerY ? 1 : (1 + shape.openness * intensity / 100);
//         const widthFactor = shape.width + (stretch / 100);
//         const newDistance = distance * (opennessFactor * shape.height);
//         const newAngle = angle * widthFactor;

//         const newX = centerX + newDistance * Math.cos(newAngle);
//         const newY = centerY + newDistance * Math.sin(newAngle);

//         // Apply smoothing
//         const smoothX = x + (newX - x) * (smoothness / 100);
//         const smoothY = y + (newY - y) * (smoothness / 100);

//         // Apply the transformation
//         if (smoothX >= 0 && smoothX < imageData.width && smoothY >= 0 && smoothY < imageData.height) {
//             const oldIndex = (y * imageData.width + x) * 4;
//             const newIndex = (Math.floor(smoothY) * imageData.width + Math.floor(smoothX)) * 4;
            
//             imageData.data[newIndex] = imageData.data[oldIndex];
//             imageData.data[newIndex + 1] = imageData.data[oldIndex + 1];
//             imageData.data[newIndex + 2] = imageData.data[oldIndex + 2];
//             imageData.data[newIndex + 3] = imageData.data[oldIndex + 3];
//         }
//     }
// }

self.onmessage = function(e) {
    const data = e.data;
    const imageData = data.imageData;
    const selectedRegions = data.selectedRegions;
    const lipRegion = selectedRegions[0]; // Assuming first region is lip region
    const baseImageCount = data.imageCount || 5;
    const totalImageCount = baseImageCount * 64 * 16;
    const baseValue1 = data.value1 || 50;
    const baseValue2 = data.value2 || 50;
    const baseValue3 = data.value3 || 50;

    const mouthShapes = [
        { openness: 0.1, width: 1.0, height: 1.0 },  // Normal
        { openness: 0.7, width: 1.2, height: 0.8 },  // A,E,I
        { openness: 0.1, width: 0.9, height: 1.1 },  // B,M,P
        { openness: 0.4, width: 1.1, height: 0.9 },  // C,D,G,K,N,S,T,X,Y,Z
        { openness: 0.3, width: 1.0, height: 1.0 },  // F,V
        { openness: 0.6, width: 0.7, height: 0.7 },  // O
        { openness: 0.4, width: 0.8, height: 0.9 },  // U
        { openness: 0.5, width: 0.9, height: 1.1 },  // R
        { openness: 0.3, width: 1.3, height: 0.8 },  // Smile
        { openness: 0.1, width: 0.6, height: 1.2 }   // Kiss
    ];

    let processedCount = 0;
    let segmentedImages = [];

    function processNextImage() {
        if (processedCount >= totalImageCount) {
            self.postMessage({
                segmentedImages: segmentedImages,
                isComplete: true
            });
            return;
        }

        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );

        // Calculate perspective parameters with random variation
        const perspectiveStrength = ((baseValue1 / 100) * 2) * (0.5 + Math.random());
        const horizontalTilt = ((baseValue2 - 50) / 50) * (0.5 + Math.random());
        const verticalTilt = ((baseValue3 - 50) / 50) * (0.5 + Math.random());

        // Clear the image with transparent pixels
        for (let j = 0; j < newImageData.data.length; j += 4) {
            newImageData.data[j + 3] = 0;
        }

        // Choose a random mouth shape
        const shapeIndex = Math.floor(Math.random() * mouthShapes.length);
        const shape = mouthShapes[shapeIndex];

        // Apply lip sync transformation to lip region
        lipSync(newImageData, lipRegion, shape, baseValue1, baseValue2, baseValue3);

        // Apply perspective transformation to all selected regions
        for (const region of selectedRegions) {
            for (const pixelIndex of region) {
                const x = pixelIndex % imageData.width;
                const y = Math.floor(pixelIndex / imageData.width);

                const [newX, newY] = applyPerspective(
                    x, y,
                    imageData.width, imageData.height,
                    perspectiveStrength,
                    horizontalTilt,
                    verticalTilt
                );

                if (newX >= 0 && newX < imageData.width && newY >= 0 && newY < imageData.height) {
                    const oldIndex = (y * imageData.width + x) * 4;
                    const newIndex = (Math.floor(newY) * imageData.width + Math.floor(newX)) * 4;

                    // Copy pixel data
                    for (let c = 0; c < 4; c++) {
                        newImageData.data[newIndex + c] = imageData.data[oldIndex + c];
                    }
                }
            }
        }

        segmentedImages.push(newImageData);
        processedCount++;

        // Send batch of images when we have 10 or reached the end
        if (segmentedImages.length >= 10 || processedCount >= totalImageCount) {
            self.postMessage({
                segmentedImages: segmentedImages,
                isComplete: processedCount >= totalImageCount
            });
            segmentedImages = [];
        }

        // Schedule next processing
        setTimeout(processNextImage, 0);
    }

    function applyPerspective(x, y, width, height, strength, horizontalTilt, verticalTilt) {
        const centerX = width / 2;
        const centerY = height / 2;

        // Convert to relative coordinates
        let dx = x - centerX;
        let dy = y - centerY;

        // Apply perspective distortion
        let z = 1 + (dy / height) * strength * 2;
        dx = dx / z;
        dy = dy / z;

        // Apply tilt
        dx += horizontalTilt * dy * 100;
        dy += verticalTilt * dx * 100;

        // Convert back to image coordinates
        return [
            Math.round(centerX + dx),
            Math.round(centerY + dy)
        ];
    }

    // Start processing
    processNextImage();
};

function lipSync(imageData, lipRegion, shape, intensity, smoothness, stretch) {
    const centerX = imageData.width / 2;
    const centerY = imageData.height / 2;

    for (let i = 0; i < lipRegion.length; i++) {
        const pixelIndex = lipRegion[i];
        const x = pixelIndex % imageData.width;
        const y = Math.floor(pixelIndex / imageData.width);
        
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Apply shape transformations
        const opennessFactor = y < centerY ? 1 : (1 + shape.openness * intensity / 100);
        const widthFactor = shape.width + (stretch / 100);
        const newDistance = distance * (opennessFactor * shape.height);
        const newAngle = angle * widthFactor;

        const newX = centerX + newDistance * Math.cos(newAngle);
        const newY = centerY + newDistance * Math.sin(newAngle);

        // Apply smoothing
        const smoothX = x + (newX - x) * (smoothness / 100);
        const smoothY = y + (newY - y) * (smoothness / 100);

        // Apply the transformation
        if (smoothX >= 0 && smoothX < imageData.width && smoothY >= 0 && smoothY < imageData.height) {
            const oldIndex = (y * imageData.width + x) * 4;
            const newIndex = (Math.floor(smoothY) * imageData.width + Math.floor(smoothX)) * 4;
            
            imageData.data[newIndex] = imageData.data[oldIndex];
            imageData.data[newIndex + 1] = imageData.data[oldIndex + 1];
            imageData.data[newIndex + 2] = imageData.data[oldIndex + 2];
            imageData.data[newIndex + 3] = imageData.data[oldIndex + 3];
        }
    }
}
