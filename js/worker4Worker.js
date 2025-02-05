// Circle detection functions
function detectCircles(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const circles = [];

    for (let y = 0; y < height; y += 5) {
        for (let x = 0; x < width; x += 5) {
            if (isEdgePixel(x, y, data, width, height)) {
                const radius = findCircleRadius(x, y, data, width, height);
                if (radius > 50) {
                    circles.push({ x, y, radius });
                }
            }
        }
    }

    return circles;
}

function isEdgePixel(x, y, data, width, height) {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    return r + g + b < 128; // Assuming edges are darker
}

function findCircleRadius(x, y, data, width, height) {
    let radius = 0;
    while (isEdgePixel(x + radius, y, data, width, height) && radius < Math.min(width, height) / 2) {
        radius++;
    }
    return radius;
}


self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value = DEFAULT_INTENSITY,
        effect // New parameter
    } = e.data;
    
    try {

        const processedImageData = processForCircleDetection(imageData);
            self.postMessage({
                segmentedImages: [processedImageData],
                isComplete: true
            });
  
            
            self.postMessage({
                segmentedImages: [imageData], // Default response
                isComplete: true
            });

        } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};

function processForCircleDetection(imageData) {
    const circles = detectCircles(imageData);
    drawCirclesOnImageData(imageData, circles);
    return imageData;
}

function drawCirclesOnImageData(imageData, circles) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    
    circles.forEach(circle => {
        const { x, y, radius } = circle;
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                if (dx*dx + dy*dy <= radius*radius) {
                    const pixelX = x + dx;
                    const pixelY = y + dy;
                    if (pixelX >= 0 && pixelX < width && pixelY >= 0 && pixelY < height) {
                        const index = (pixelY * width + pixelX) * 4;
                        // Set the pixel to red to highlight the circle
                        data[index] = 255; // R
                        data[index + 1] = 0; // G
                        data[index + 2] = 0; // B
                        data[index + 3] = 255; // Alpha
                    }
                }
            }
        }
    });
}