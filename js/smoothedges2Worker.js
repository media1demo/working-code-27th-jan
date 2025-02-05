// self.onmessage = function(e) {

//     const imageData = e.data.imageData;
//     const width = imageData.width;
//     const height = imageData.height;
//     const data = imageData.data;

//     applyEssentialClassic(data);

//     applyLowFidelityPhoto(data, width, height);

//     self.postMessage({
//         processedImageData: imageData
//     });

// };

// function applyEssentialClassic(data) {

//     for (let i = 0; i < data.length; i += 4) {

//         data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.2 + 128));
//         data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.2 + 128));
//         data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.2 + 128));
//     }

// }

// function applyLowFidelityPhoto(data, width, height) {
//     const tempData = new Uint8ClampedArray(data);
//     const pixelSize = 4; // Adjust this value to change the pixelation effect
//     const colorLevels = 4; // Adjust this value to change the number of color levels

//     for (let y = 0; y < height; y += pixelSize) {
//         for (let x = 0; x < width; x += pixelSize) {
//             const i = (y * width + x) * 4;
//             const r = quantizeColor(tempData[i], colorLevels);
//             const g = quantizeColor(tempData[i + 1], colorLevels);
//             const b = quantizeColor(tempData[i + 2], colorLevels);
//             const a = tempData[i + 3];

//             for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
//                 for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
//                     const j = ((y + dy) * width + (x + dx)) * 4;
//                     data[j] = r;
//                     data[j + 1] = g;
//                     data[j + 2] = b;
//                     data[j + 3] = a;
//                 }
//             }
//         }
//     }
// }

// function quantizeColor(value, levels) {
//     const step = 255 / (levels - 1);
//     return Math.round(Math.round(value / step) * step);
// }

self.onmessage = function(e) {
    const { imageData, effectType } = e.data;
    console.log(imageData);

    try {
        // Initial canvas processing steps
        const originalCanvas = new OffscreenCanvas(imageData.width, imageData.height);
        const originalCtx = originalCanvas.getContext('2d');
        originalCtx.putImageData(imageData, 0, 0);

        const processedCanvas = new OffscreenCanvas(imageData.width, imageData.height);
        const processedCtx = processedCanvas.getContext('2d');

        // Apply blur and threshold
        processedCtx.putImageData(imageData, 0, 0);
        const blurRadius = Math.max(imageData.width, imageData.height) * 0.005;
        processedCtx.filter = `blur(${blurRadius}px)`;
        processedCtx.drawImage(processedCanvas, 0, 0);

        let processedImageData = processedCtx.getImageData(0, 0, processedCanvas.width, processedCanvas.height);
        let data = processedImageData.data;

        for (let i = 0; i < data.length; i += 4) {
            for (let j = 0; j < 3; j++) {
                const value = data[i + j];
                data[i + j] = value >= 128 ? 255 : 0;
            }
        }

        processedCtx.putImageData(processedImageData, 0, 0);

        // Create merged canvas
        const mergedCanvas = new OffscreenCanvas(imageData.width, imageData.height);
        const mergedCtx = mergedCanvas.getContext('2d');

        // Draw original image
        mergedCtx.drawImage(originalCanvas, 0, 0);

        // Set blend mode to 'lighten' and draw processed image
        mergedCtx.globalCompositeOperation = 'lighten';
        mergedCtx.drawImage(processedCanvas, 0, 0);

        // Reset composite operation
        mergedCtx.globalCompositeOperation = 'source-over';

        // Get the merged image data
        let mergedImageData = mergedCtx.getImageData(0, 0, mergedCanvas.width, mergedCanvas.height);
        const mergedData = mergedImageData.data;

        // Apply lighten effect
        for (let i = 0; i < mergedData.length; i += 4) {
            mergedData[i] = Math.min(255, mergedData[i] + 30);     // Red
            mergedData[i + 1] = Math.min(255, mergedData[i + 1] + 30); // Green
            mergedData[i + 2] = Math.min(255, mergedData[i + 2] + 30); // Blue
        }

        // Now apply the additional effects based on type
        switch (effectType) {
            case 'essential-classic':
                applyEssentialClassic(mergedData);
                break;
            case 'low-fidelity':
                applyLowFidelityPhoto(mergedData, imageData.width, imageData.height);
                break;
            case 'both':
                applyEssentialClassic(mergedData);
                applyLowFidelityPhoto(mergedData, imageData.width, imageData.height);
                break;
        }

        // Send back the processed image
        self.postMessage({
            segmentedImages: [mergedImageData],
            isComplete: true
        }, [mergedImageData.data.buffer]);
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};

function applyEssentialClassic(data) {
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.2 + 128));
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.2 + 128));
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.2 + 128));
    }
}

function applyLowFidelityPhoto(data, width, height) {
    const tempData = new Uint8ClampedArray(data);
    const pixelSize = 4;
    const colorLevels = 4;

    for (let y = 0; y < height; y += pixelSize) {
        for (let x = 0; x < width; x += pixelSize) {
            const i = (y * width + x) * 4;
            
            const r = quantizeColor(tempData[i], colorLevels);
            const g = quantizeColor(tempData[i + 1], colorLevels);
            const b = quantizeColor(tempData[i + 2], colorLevels);
            const a = tempData[i + 3];

            for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
                for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
                    const j = ((y + dy) * width + (x + dx)) * 4;
                    data[j] = r;
                    data[j + 1] = g;
                    data[j + 2] = b;
                    data[j + 3] = a;
                }
            }
        }
    }
}

function quantizeColor(value, levels) {
    const step = 255 / (levels - 1);
    return Math.round(Math.round(value / step) * step);
}