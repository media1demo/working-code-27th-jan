// Constants for both effects
const DEFAULT_MAX_HORIZONTAL_OFFSET = 50;
const DEFAULT_ROTATION_SPEED = 0.0085;
const DEFAULT_ITERATIONS = 120;
const DEFAULT_MOVE_STEP = 10;
const DEFAULT_PERSPECTIVE = 500;

// VR effect constants
const BARREL_DISTORTION = 0.2;
const CHROMATIC_ABERRATION = 0.1;
const VIGNETTE_STRENGTH = 0.1;
const BLUR_STRENGTH = 0.01;
const WAVE_AMPLITUDE = 3;
const PULSE_SPEED = 0.05;

let currentIteration = 0;
let pulsePhase = 0;

// Helper function to create new ImageData
function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

// 3D transformation functions
function createRotationMatrix(angle) {
    return {
        xx: Math.cos(angle),
        xy: 0,
        xz: Math.sin(angle),
        yx: 0,
        yy: 1,
        yz: 0,
        zx: -Math.sin(angle),
        zy: 0,
        zz: Math.cos(angle)
    };
}

function applyPerspective(imageData, rotation, perspective) {
    const width = imageData.width;
    const height = imageData.height;
    const result = createTransparentImageData(width, height);
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    
    const matrix = createRotationMatrix(rotation);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const xPos = x - halfWidth;
            const yPos = y - halfHeight;
            
            const rotX = matrix.xx * xPos + matrix.xy * yPos;
            const rotY = matrix.yx * xPos + matrix.yy * yPos;
            const rotZ = matrix.zx * xPos + matrix.zy * yPos + perspective;
            
            const scale = perspective / (perspective + rotZ);
            const projX = Math.round(halfWidth + rotX * scale);
            const projY = Math.round(halfHeight + rotY * scale);
            
            if (projX >= 0 && projX < width && projY >= 0 && projY < height) {
                const sourceIdx = (y * width + x) * 4;
                const targetIdx = (projY * width + projX) * 4;
                
                for (let i = 0; i < 4; i++) {
                    result.data[targetIdx + i] = imageData.data[sourceIdx + i];
                }
            }
        }
    }
    
    return result;
}

// VR effect functions
function applyEnhancedDistortion(x, y, width, height, time) {
    const nx = (2.0 * x - width) / width;
    const ny = (2.0 * y - height) / height;
    const r = Math.sqrt(nx * nx + ny * ny);
    
    const wave = Math.sin(r * 10 + time * 0.1) * WAVE_AMPLITUDE * (1 - r);
    const distortion = 1.0 + (BARREL_DISTORTION + Math.sin(pulsePhase) * 0.05) * r * r;
    
    return {
        x: Math.floor((nx * distortion * width / 2.0) + width / 2.0 + wave),
        y: Math.floor((ny * distortion * height / 2.0) + height / 2.0 + wave)
    };
}

function applyColorSeparation(imageData, x, y, width) {
    const idx = (y * width + x) * 4;
    const separation = CHROMATIC_ABERRATION * (1 + Math.sin(pulsePhase) * 0.2);
    
    const rX = Math.min(width - 1, x + separation);
    const bX = Math.max(0, x - separation);
    const rIdx = (y * width + Math.floor(rX)) * 4;
    const bIdx = (y * width + Math.floor(bX)) * 4;
    
    return {
        r: imageData.data[rIdx],
        g: imageData.data[idx + 1],
        b: imageData.data[bIdx + 2],
        a: imageData.data[idx + 3]
    };
}

function applyVREffects(imageData, time = 0) {
    const width = imageData.width;
    const height = imageData.height;
    const result = createTransparentImageData(width, height);
    
    pulsePhase += PULSE_SPEED;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const distorted = applyEnhancedDistortion(x, y, width, height, time);
            
            if (distorted.x >= 0 && distorted.x < width && 
                distorted.y >= 0 && distorted.y < height) {
                
                const targetIdx = (y * width + x) * 4;
                const colors = applyColorSeparation(imageData, distorted.x, distorted.y, width);
                
                result.data[targetIdx] = colors.r;
                result.data[targetIdx + 1] = colors.g;
                result.data[targetIdx + 2] = colors.b;
                result.data[targetIdx + 3] = colors.a;
                
                const dx = (x / width) - 0.5;
                const dy = (y / height) - 0.5;
                const distance = Math.sqrt(dx * dx + dy * dy) * 2.0;
                const vignette = Math.max(0.4, 1 - distance * (VIGNETTE_STRENGTH + Math.sin(pulsePhase) * 0.1));
                
                result.data[targetIdx] *= vignette;
                result.data[targetIdx + 1] *= vignette;
                result.data[targetIdx + 2] *= vignette;
            }
        }
    }
    
    return result;
}

function applyMotionBlur(imageData, offset) {
    const width = imageData.width;
    const height = imageData.height;
    const result = createTransparentImageData(width, height);
    result.data.set(imageData.data);
    
    const blurSteps = Math.min(10, Math.abs(offset));
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            for (let step = 1; step < blurSteps; step++) {
                const blurX = Math.floor(x + (offset * step / blurSteps));
                if (blurX >= 0 && blurX < width) {
                    const sourceIdx = (y * width + x) * 4;
                    const targetIdx = (y * width + blurX) * 4;
                    const alpha = BLUR_STRENGTH * (1 - step / blurSteps);
                    
                    for (let c = 0; c < 3; c++) {
                        result.data[targetIdx + c] = Math.max(
                            result.data[targetIdx + c],
                            imageData.data[sourceIdx + c] * alpha
                        );
                    }
                }
            }
        }
    }
    
    return result;
}

self.onmessage = function(e) {


    const { 
        imageData, 
        selectedRegions,
        value: rotationSpeed = DEFAULT_ROTATION_SPEED,
        value2: maxHorizontalOffset = DEFAULT_MAX_HORIZONTAL_OFFSET,
        value3: perspective = DEFAULT_PERSPECTIVE,
        value5: iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;
    // console.log(e.data);
    try {
        if (reset) {
            currentIteration = 0;
            pulsePhase = 0;
        }
        
        const params = {
            rotationSpeed,
            maxHorizontalOffset,
            perspective
        };

        const resultImageData = processCombinedEffects(imageData, selectedRegions, params);
        currentIteration = (currentIteration + 1) % iterations;
        // console.log(resultImageData);
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress: currentIteration / iterations
        });
    } catch (error) {
        // console.log('error :>> ', error);
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};

// Create a masked image containing only selected regions
function createMaskedImage(imageData, selectedRegions) {
    const maskedImage = createTransparentImageData(imageData.width, imageData.height);
    
    if (selectedRegions?.length > 0) {
        selectedRegions.forEach(region => {
            region.forEach(pixelIndex => {
                const sourceIdx = pixelIndex * 4;
                for (let c = 0; c < 4; c++) {
                    maskedImage.data[sourceIdx + c] = imageData.data[sourceIdx + c];
                }
            });
        });
    }
    
    return maskedImage;
}


function getRegionBounds(selectedRegions, width, height) {
    let minX = width, minY = height, maxX = 0, maxY = 0;
    selectedRegions.flat().forEach(pixelIndex => {
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
    });
    return {
        minX, minY, maxX, maxY,
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2,
        width: maxX - minX + 1,
        height: maxY - minY + 1
    };
}

// Create a region-specific rotation matrix
function createRegionRotationMatrix(angle, centerX, centerY) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    return {
        transform: function(x, y) {
            // Translate to origin
            const dx = x - centerX;
            const dy = y - centerY;
            
            // Rotate
            const rotX = dx * cos - dy * sin;
            const rotY = dx * sin + dy * cos;
            
            // Translate back
            return {
                x: Math.round(rotX + centerX),
                y: Math.round(rotY + centerY)
            };
        }
    };
}



// Helper function to calculate region bounds and center
function getRegionBounds(selectedRegions, width, height) {
    let minX = width, minY = height, maxX = 0, maxY = 0;
    selectedRegions.flat().forEach(pixelIndex => {
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
    });
    return {
        minX, minY, maxX, maxY,
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2,
        width: maxX - minX + 1,
        height: maxY - minY + 1
    };
}

// Create a 3D Y-axis rotation matrix
function create3DYRotationMatrix(angle, centerX, centerY, perspective) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    return {
        transform: function(x, y) {
            // Translate to origin
            const dx = x - centerX;
            
            // Apply Y-axis rotation (affects X and Z)
            const rotX = dx * cos;
            const rotZ = dx * sin;
            
            // Apply perspective projection
            const scale = perspective / (perspective + rotZ);
            
            // Calculate final position
            return {
                x: Math.round(centerX + (rotX * scale)),
                y: y,  // Y coordinate remains unchanged for Y-axis rotation
                z: rotZ,
                scale: scale
            };
        }
    };
}

function processCombinedEffects(imageData, selectedRegions, params) {
    let processedImage = createTransparentImageData(imageData.width, imageData.height);
    processedImage.data.set(imageData.data);

    if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
        // Get bounds and center of the region
        const bounds = getRegionBounds(selectedRegions, imageData.width, imageData.height);
        
        // Create 3D rotation matrix for this region
        // const rotation = create3DYRotationMatrix(
        //     currentIteration * params.rotationSpeed,
        //     bounds.centerX,
        //     bounds.centerY,
        //     params.perspective
        // );
        
        const rotation = create3DYRotationMatrix(
            Math.sin(currentIteration * params.rotationSpeed) * 0.5, // Oscillating and bounded rotation
            bounds.centerX,
            bounds.centerY,
            params.perspective
        );

        // Create temporary buffer for rotated content
        const tempBuffer = new Uint8ClampedArray(imageData.width * imageData.height * 4);
        const zBuffer = new Float32Array(imageData.width * imageData.height);
        zBuffer.fill(-Infinity);
        
        // Clear selected regions in the processed image
        selectedRegions.flat().forEach(pixelIndex => {
            const idx = pixelIndex * 4;
            for (let c = 0; c < 4; c++) {
                processedImage.data[idx + c] = 0;
            }
        });
        
        // Apply 3D rotation to selected regions
        selectedRegions.forEach(region => {
            region.forEach(pixelIndex => {
                const x = pixelIndex % imageData.width;
                const y = Math.floor(pixelIndex / imageData.width);
                
                // Apply 3D transform
                const transformed = rotation.transform(x, y);
                
                if (transformed.x >= 0 && transformed.x < imageData.width &&
                    transformed.y >= 0 && transformed.y < imageData.height) {
                    
                    const targetIdx = (transformed.y * imageData.width + transformed.x) * 4;
                    const zIdx = transformed.y * imageData.width + transformed.x;
                    
                    // Only update pixel if it's closer to the viewer
                    if (transformed.z > zBuffer[zIdx]) {
                        zBuffer[zIdx] = transformed.z;
                        
                        // Copy pixel data to temp buffer
                        const sourceIdx = pixelIndex * 4;
                        for (let c = 0; c < 4; c++) {
                            tempBuffer[targetIdx + c] = imageData.data[sourceIdx + c];
                        }
                    }
                }
            });
        });
        
        // Blend rotated pixels back into the main image
        for (let i = 0; i < tempBuffer.length; i += 4) {
            if (tempBuffer[i + 3] > 0) {
                for (let c = 0; c < 4; c++) {
                    processedImage.data[i + c] = tempBuffer[i + c];
                }
            }
        }
        
        // Apply horizontal glitch effect
        if (params.maxHorizontalOffset > 0) {
            const glitchBuffer = new Uint8ClampedArray(imageData.width * imageData.height * 4);
            
            selectedRegions.forEach(region => {
                const horizontalOffset = Math.random() * params.maxHorizontalOffset;
                
                region.forEach(pixelIndex => {
                    const x = pixelIndex % imageData.width;
                    const y = Math.floor(pixelIndex / imageData.width);
                    const newX = Math.max(0, x - horizontalOffset);
                    
                    if (newX >= 0 && newX < imageData.width) {
                        const sourceIdx = (y * imageData.width + x) * 4;
                        const targetIdx = (y * imageData.width + Math.floor(newX)) * 4;
                        
                        for (let c = 0; c < 4; c++) {
                            glitchBuffer[targetIdx + c] = processedImage.data[sourceIdx + c];
                        }
                    }
                });
            });
            
            // Blend glitched pixels
            for (let i = 0; i < glitchBuffer.length; i += 4) {
                if (glitchBuffer[i + 3] > 0) {
                    for (let c = 0; c < 4; c++) {
                        processedImage.data[i + c] = glitchBuffer[i + c];
                    }
                }
            }
            
            processedImage = applyMotionBlur(processedImage, params.maxHorizontalOffset);
        }
    }

    return applyVREffects(processedImage, currentIteration);
}