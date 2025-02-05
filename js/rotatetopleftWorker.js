// self.onmessage = function(e) {
//     const { imageData, value } = e.data;
//     const rotatedImageData = rotateImage(imageData, value, 'topLeft');
//     self.postMessage({ imageData: rotatedImageData });
// };

// function rotateImage(imageData, angle, corner) {
//     const canvas = new OffscreenCanvas(imageData.width, imageData.height);
//     const ctx = canvas.getContext('2d');
//     ctx.putImageData(imageData, 0, 0);

//     const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
//     const tempCtx = tempCanvas.getContext('2d');

//     tempCtx.translate(getRotationCenterX(corner, imageData.width), 
//                       getRotationCenterY(corner, imageData.height));
//     tempCtx.rotate(angle * Math.PI / 180);
//     tempCtx.translate(-getRotationCenterX(corner, imageData.width), 
//                       -getRotationCenterY(corner, imageData.height));

//     tempCtx.drawImage(canvas, 0, 0);

//     return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
// }

// function getRotationCenterX(corner, width) {
//     switch(corner) {
//         case 'topLeft':
//         case 'bottomLeft':
//             return 0;
//         case 'topRight':
//         case 'bottomRight':
//             return width;
//     }
// }

// function getRotationCenterY(corner, height) {
//     switch(corner) {
//         case 'topLeft':
//         case 'topRight':
//             return 0;
//         case 'bottomLeft':
//         case 'bottomRight':
//             return height;
//     }
// }



const DEFAULT_ROTATION_ANGLE = 45;
const DEFAULT_ITERATIONS = 120;
const DEFAULT_ROTATION_STEP = 2;

let currentIteration = 0;

function getRotationCenterX(corner, width) {
    switch(corner) {
        case 'topLeft':
        case 'bottomLeft':
            return 0;
        case 'topRight':
        case 'bottomRight':
            return width;
    }
}

function getRotationCenterY(corner, height) {
    switch(corner) {
        case 'topLeft':
        case 'topRight':
            return 0;
        case 'bottomLeft':
        case 'bottomRight':
            return height;
    }
}

function rotateImage(imageData, angle, corner) {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);

    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.translate(
        getRotationCenterX(corner, imageData.width),
        getRotationCenterY(corner, imageData.height)
    );
    tempCtx.rotate(angle * Math.PI / 180);
    tempCtx.translate(
        -getRotationCenterX(corner, imageData.width),
        -getRotationCenterY(corner, imageData.height)
    );

    tempCtx.drawImage(canvas, 0, 0);

    return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
}

// Function to rotate selected regions
function rotateSelectedRegions(imageData, selectedRegions, maxRotationAngle, corner) {
    const width = imageData.width;
    const height = imageData.height;
    
    // Create mask canvas
    const maskCanvas = new OffscreenCanvas(width, height);
    const maskCtx = maskCanvas.getContext('2d');
    
    // Create result canvas
    const resultCanvas = new OffscreenCanvas(width, height);
    const resultCtx = resultCanvas.getContext('2d');
    resultCtx.putImageData(imageData, 0, 0);
    
    selectedRegions.forEach(region => {
        // Create temporary canvas for this region
        const tempCanvas = new OffscreenCanvas(width, height);
        const tempCtx = tempCanvas.getContext('2d');
        
        // Clear temp canvas and mask
        tempCtx.clearRect(0, 0, width, height);
        maskCtx.clearRect(0, 0, width, height);
        
        // Draw region mask
        maskCtx.beginPath();
        region.forEach((pixelIndex, index) => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            if (index === 0) {
                maskCtx.moveTo(x, y);
            } else {
                maskCtx.lineTo(x, y);
            }
        });
        maskCtx.closePath();
        maskCtx.fill();
        
        // Draw original image content for this region
        tempCtx.drawImage(resultCanvas, 0, 0);
        tempCtx.globalCompositeOperation = 'destination-in';
        tempCtx.drawImage(maskCanvas, 0, 0);
        tempCtx.globalCompositeOperation = 'source-over';
        
        // Rotate this region
        const rotationAngle = Math.random() * maxRotationAngle;
        const rotatedData = rotateImage(
            tempCtx.getImageData(0, 0, width, height),
            rotationAngle,
            corner
        );
        
        // Clear the area in the result canvas
        resultCtx.globalCompositeOperation = 'destination-out';
        resultCtx.drawImage(maskCanvas, 0, 0);
        resultCtx.globalCompositeOperation = 'source-over';
        
        // Draw rotated region
        resultCtx.putImageData(rotatedData, 0, 0);
    });
    
    return resultCtx.getImageData(0, 0, width, height);
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value, 
        value2: maxRotationAngle = DEFAULT_ROTATION_ANGLE,
        value5: iterations = DEFAULT_ITERATIONS,
        reset,
        corner = 'topLeft' // Default to top-left corner
    } = e.data;
    
    try {
        if (reset) {
            currentIteration = 0;
        }
        
        let resultImageData;
        let progress;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Selected regions mode
            resultImageData = rotateSelectedRegions(
                imageData,
                selectedRegions,
                maxRotationAngle,
                corner
            );
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // Full image mode
            const totalRotation = DEFAULT_ROTATION_STEP * (currentIteration + 1);
            resultImageData = rotateImage(
                imageData,
                totalRotation,
                corner
            );
            currentIteration++;
            progress = undefined;
        }
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};