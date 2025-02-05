// self.onmessage = function(e) {
//     const { imageData, value, index } = e.data;
//     const data = imageData.data;

//     for (let i = 0; i < data.length; i += 4) {
//         data[i] = Math.min(255, Math.max(0, data[i] + value));
//         data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + value));
//         data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + value));
//     }

//     self.postMessage({ imageData, index, value });
// };


// self.onmessage = function(e) {
//     const imageData = e.data.imageData;
//     const brightnessValue = e.data.value;
    
//     // Apply brightness effect
//     for (let i = 0; i < imageData.data.length; i += 4) {
//         imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] + brightnessValue));
//         imageData.data[i+1] = Math.min(255, Math.max(0, imageData.data[i+1] + brightnessValue));
//         imageData.data[i+2] = Math.min(255, Math.max(0, imageData.data[i+2] + brightnessValue));
//     }
    
//     // Send processed image data back to main script
//     self.postMessage({imageData: imageData});
// };


self.onmessage = function(e) {
    const { imageData, selectedRegions, imageCount, maxBrightness } = e.data;
    const segmentedImages = generateBrightnessVariations(imageData, selectedRegions, imageCount, maxBrightness);
    self.postMessage({ segmentedImages });
};

function generateBrightnessVariations(imageData, selectedRegions, imageCount, maxBrightness) {
    const segmentedImages = [];
    const step = (maxBrightness * 2) / (imageCount - 1);

    for (let i = 0; i < imageCount; i++) {
        const brightness = -maxBrightness + (step * i);
        const adjustedImageData = adjustImageBrightness(imageData, selectedRegions, brightness);
        segmentedImages.push(adjustedImageData);
    }

    return segmentedImages;
}

function adjustImageBrightness(imageData, selectedRegions, brightness) {
    const adjustedData = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);

    const selectedPixels = new Set(selectedRegions.flat());

    for (let i = 0; i < adjustedData.data.length; i += 4) {
        const pixelIndex = i / 4;
        if (selectedPixels.has(pixelIndex)) {
            for (let j = 0; j < 3; j++) {
                adjustedData.data[i + j] = clamp(imageData.data[i + j] + brightness);
            }
        } else {
            adjustedData.data[i] = imageData.data[i];
            adjustedData.data[i + 1] = imageData.data[i + 1];
            adjustedData.data[i + 2] = imageData.data[i + 2];
        }
        adjustedData.data[i + 3] = imageData.data[i + 3]; // Keep original alpha
    }

    return adjustedData;
}


function clamp(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
}