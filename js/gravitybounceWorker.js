function scaleSelectedRegions(imageData, selectedRegions, scaleX, scaleY) {
    const width = imageData.width;
    const height = imageData.height;
    
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );
    
    // Animation parameters
    const gravity = 980;
    const bounceRestitution = 0.6;
    const currentTime = (performance.now() % 3000) / 1000;
    
    // Impact distortion parameters
    const maxImpactDistortion = 1.5;  // Maximum horizontal spread
    const maxSquash = 0.4;           // Maximum vertical squash
    const impactDuration = 0.1;      // Duration of impact effect in seconds
    
    selectedRegions.forEach(region => {
        let minX = width, minY = height, maxX = 0, maxY = 0;
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        });
        
        const centerX = Math.floor((minX + maxX) / 2);
        const regionHeight = maxY - minY + 1;
        const regionWidth = maxX - minX + 1;
        
        const calculateMotion = (time) => {
            const maxDropDistance = height - minY - regionHeight;
            const timeToGround = Math.sqrt((2 * maxDropDistance) / gravity);
            const cycleDuration = timeToGround * 2;
            const cycleTime = time % cycleDuration;
            
            let position, verticalDistortion = 1, horizontalDistortion = 1;
            let impactPhase = 0;
            const isDownward = cycleTime <= timeToGround;
            
            if (isDownward) {
                position = minY + (0.5 * gravity * cycleTime * cycleTime);
                
                // Check for impact
                if (position + regionHeight >= height) {
                    position = height - regionHeight;
                    
                    // Calculate impact phase (0 to 1)
                    impactPhase = Math.min(1, (cycleTime - timeToGround + impactDuration) / impactDuration);
                    
                    // Apply impact distortions
                    verticalDistortion = 1 - (maxSquash * (1 - Math.abs(2 * impactPhase - 1)));
                    horizontalDistortion = maxImpactDistortion * (1 - Math.abs(2 * impactPhase - 1));
                }
            } else {
                const timeInRise = cycleTime - timeToGround;
                const maxBounceHeight = maxDropDistance * bounceRestitution;
                const bounceTime = Math.sqrt((2 * maxBounceHeight) / gravity);
                
                if (timeInRise <= bounceTime) {
                    const bounceVelocity = Math.sqrt(2 * gravity * maxBounceHeight);
                    position = height - regionHeight - 
                              (bounceVelocity * timeInRise - 
                               0.5 * gravity * timeInRise * timeInRise);
                               
                    // Recovery from impact distortion
                    if (timeInRise < impactDuration) {
                        const recoveryPhase = timeInRise / impactDuration;
                        verticalDistortion = 1 - (maxSquash * (1 - recoveryPhase));
                        horizontalDistortion = 1 + ((maxImpactDistortion - 1) * (1 - recoveryPhase));
                    }
                } else {
                    position = height - regionHeight - maxBounceHeight;
                }
            }
            
            return {
                y: Math.max(minY, Math.min(height - regionHeight, position)),
                verticalDistortion,
                horizontalDistortion,
                impactPhase
            };
        };
        
        const motion = calculateMotion(currentTime);
        
        // Create buffer for transformed pixels
        const tempBuffer = new Uint8ClampedArray(width * height * 4).fill(0);
        
        // Apply transformations with enhanced distortion
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Calculate distorted position
            const relativeX = x - centerX;
            const relativeY = y - minY;
            
            // Apply horizontal spread from center
            const distortedX = centerX + (relativeX * motion.horizontalDistortion);
            
            // Apply vertical squash/stretch
            const distortedY = motion.y + (relativeY * motion.verticalDistortion);
            
            // Add wave effect during impact
            let finalX = distortedX;
            let finalY = distortedY;
            
            if (motion.impactPhase > 0) {
                // Add ripple effect during impact
                const distance = Math.sqrt(relativeX * relativeX + relativeY * relativeY);
                const ripplePhase = distance / regionWidth - motion.impactPhase * 2;
                const rippleAmplitude = 5 * (1 - motion.impactPhase);
                const rippleOffset = Math.sin(ripplePhase * Math.PI * 2) * rippleAmplitude;
                
                finalX += rippleOffset * (relativeX / distance || 0);
                finalY += rippleOffset * (relativeY / distance || 0);
            }
            
            if (finalY >= 0 && finalY < height && finalX >= 0 && finalX < width) {
                const sourceIdx = (y * width + x) * 4;
                const targetIdx = (Math.floor(finalY) * width + Math.floor(finalX)) * 4;
                
                // Bilinear interpolation for smoother distortion
                const fx = finalX - Math.floor(finalX);
                const fy = finalY - Math.floor(finalY);
                
                const w1 = (1 - fx) * (1 - fy);
                const w2 = fx * (1 - fy);
                const w3 = (1 - fx) * fy;
                const w4 = fx * fy;
                
                for (let c = 0; c < 4; c++) {
                    tempBuffer[targetIdx + c] = imageData.data[sourceIdx + c] * w1;
                    if (fx > 0 && finalX < width - 1) {
                        tempBuffer[targetIdx + c] += imageData.data[sourceIdx + 4 + c] * w2;
                    }
                    if (fy > 0 && finalY < height - 1) {
                        tempBuffer[targetIdx + c] += imageData.data[sourceIdx + width * 4 + c] * w3;
                        if (fx > 0 && finalX < width - 1) {
                            tempBuffer[targetIdx + c] += imageData.data[sourceIdx + width * 4 + 4 + c] * w4;
                        }
                    }
                }
            }
        });
        
        // Clear original region
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            for (let c = 0; c < 4; c++) {
                newImageData.data[baseIndex + c] = 0;
            }
        });
        
        // Copy transformed pixels to output
        for (let i = 0; i < tempBuffer.length; i += 4) {
            if (tempBuffer[i + 3] > 0) {
                for (let c = 0; c < 4; c++) {
                    newImageData.data[i + c] = tempBuffer[i + c];
                }
            }
        }
    });
    
    return newImageData;
}

// Keep the message handler and scaleImageData function unchanged
self.onmessage = function(e) {
    const { imageData, selectedRegions, value, value2 } = e.data;
    try {
        const scaleX = value || 1;
        const scaleY = value2 || value || 1;
        let resultImageData;
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = scaleSelectedRegions(imageData, selectedRegions, scaleX, scaleY);
        } else {
            resultImageData = scaleImageData(imageData, scaleX, scaleY);
        }
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};

function scaleImageData(imageData, scaleX, scaleY) {
    const width = imageData.width;
    const height = imageData.height;
    const destWidth = Math.floor(width * scaleX);
    const destHeight = Math.floor(height * scaleY);
    
    const scaledImageData = new ImageData(
        new Uint8ClampedArray(destWidth * destHeight * 4),
        destWidth,
        destHeight
    );
    
    for (let y = 0; y < destHeight; y++) {
        for (let x = 0; x < destWidth; x++) {
            const srcX = Math.min(Math.floor(x / scaleX), width - 1);
            const srcY = Math.min(Math.floor(y / scaleY), height - 1);
            
            const destIdx = (y * destWidth + x) * 4;
            const srcIdx = (srcY * width + srcX) * 4;
            
            scaledImageData.data[destIdx] = imageData.data[srcIdx];
            scaledImageData.data[destIdx + 1] = imageData.data[srcIdx + 1];
            scaledImageData.data[destIdx + 2] = imageData.data[srcIdx + 2];
            scaledImageData.data[destIdx + 3] = imageData.data[srcIdx + 3];
        }
    }

    return scaledImageData;
}