// perspectiveTiltWorker.js
self.onmessage = function(e) {
    console.log("worker side code");
    const { imageData, value } = e.data;
    const width = imageData.width;
    const height = imageData.height;
    const pixels = imageData.data;
    
    const tiltAngle = value * Math.PI / 4; // Tilt angle up to 45 degrees
    const sinAngle = Math.sin(tiltAngle);
    const cosAngle = Math.cos(tiltAngle);
    
    const newImageData = new ImageData(width, height);
    const newPixels = newImageData.data;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Calculate the source position
            const sourceX = x - width / 2;
            const sourceY = y - height / 2;
            
            // Apply tilt transformation
            const tiltedX = sourceX * cosAngle + sourceY * sinAngle;
            const tiltedY = -sourceX * sinAngle + sourceY * cosAngle;
            
            // Map back to image coordinates
            const mappedX = tiltedX + width / 2;
            const mappedY = tiltedY + height / 2;
            
            if (mappedX >= 0 && mappedX < width - 1 && mappedY >= 0 && mappedY < height - 1) {
                // Bilinear interpolation
                const x1 = Math.floor(mappedX);
                const y1 = Math.floor(mappedY);
                const x2 = x1 + 1;
                const y2 = y1 + 1;
                
                const wx = mappedX - x1;
                const wy = mappedY - y1;
                
                const index = (y * width + x) * 4;
                
                for (let i = 0; i < 4; i++) {
                    const topLeft = pixels[(y1 * width + x1) * 4 + i];
                    const topRight = pixels[(y1 * width + x2) * 4 + i];
                    const bottomLeft = pixels[(y2 * width + x1) * 4 + i];
                    const bottomRight = pixels[(y2 * width + x2) * 4 + i];
                    
                    const interpolatedValue = 
                        topLeft * (1 - wx) * (1 - wy) +
                        topRight * wx * (1 - wy) +
                        bottomLeft * (1 - wx) * wy +
                        bottomRight * wx * wy;
                    
                    newPixels[index + i] = interpolatedValue;
                }
            }
        }
    }
    
    self.postMessage({ imageData: newImageData });
};