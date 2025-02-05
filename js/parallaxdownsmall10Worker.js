// Constants for 3D effect
const DEFAULT_ITERATIONS = 120;
const DEFAULT_ROTATION_RANGE = 15; // degrees
const DEFAULT_Z_DISTANCE = 200;
const DEFAULT_PERSPECTIVE = 1000;

let currentIteration = 0;

// 3D Matrix helper functions
const Matrix3D = {
    // Create identity matrix
    identity() {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    },

    // Multiply two 4x4 matrices
    multiply(a, b) {
        const result = new Array(16);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result[i * 4 + j] = 
                    a[i * 4 + 0] * b[0 * 4 + j] +
                    a[i * 4 + 1] * b[1 * 4 + j] +
                    a[i * 4 + 2] * b[2 * 4 + j] +
                    a[i * 4 + 3] * b[3 * 4 + j];
            }
        }
        return result;
    },

    // Create rotation matrix around X axis
    rotateX(angle) {
        const rad = angle * Math.PI / 180;
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        return [
            1,  0,  0,  0,
            0,  c,  -s, 0,
            0,  s,  c,  0,
            0,  0,  0,  1
        ];
    },

    // Create rotation matrix around Y axis
    rotateY(angle) {
        const rad = angle * Math.PI / 180;
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        return [
            c,  0,  s,  0,
            0,  1,  0,  0,
            -s, 0,  c,  0,
            0,  0,  0,  1
        ];
    },

    // Create perspective matrix
    perspective(fieldOfView, aspect, near, far) {
        const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfView * Math.PI / 180);
        const rangeInv = 1.0 / (near - far);
        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    },

    // Transform point using matrix
    transformPoint(matrix, x, y, z) {
        const w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
        return {
            x: (matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]) / w,
            y: (matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]) / w,
            z: (matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]) / w
        };
    }
};

// Helper function to create transparent ImageData
function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

// ... (previous Matrix3D helper functions remain the same)

// ... (previous Matrix3D and helper functions remain the same)

function apply3DTransformMulti(imageData, selectedRegions, baseRotationX, baseRotationY, zDistance, perspective) {
    const width = imageData.width;
    const height = imageData.height;
    
    // Create separate result buffers for each region
    return selectedRegions.map((region, regionIndex) => {
        // Create a new ImageData for this region
        const resultForRegion = createTransparentImageData(width, height);
        
        // Calculate region bounds
        let minX = width, minY = height, maxX = 0, maxY = 0;
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        });
        
        // Extract just this region's pixels into a new buffer
        const regionBuffer = new Uint8ClampedArray(width * height * 4);
        region.forEach(pixelIndex => {
            const sourceIdx = pixelIndex * 4;
            for (let c = 0; c < 4; c++) {
                regionBuffer[sourceIdx + c] = imageData.data[sourceIdx + c];
            }
        });
        
        const regionWidth = maxX - minX;
        const regionHeight = maxY - minY;
        const centerX = minX + regionWidth / 2;
        const centerY = minY + regionHeight / 2;
        
        // Create unique parameters for this region
        const rotationX = baseRotationX + (Math.sin(regionIndex) * 30);
        const rotationY = baseRotationY + (Math.cos(regionIndex) * 30);
        const uniqueZ = zDistance * (1 + regionIndex * 0.5);
        
        // Create transformation matrices specific to this region
        const perspectiveMatrix = Matrix3D.perspective(45, width / height, 0.1, 2000);
        const rotationMatrixX = Matrix3D.rotateX(rotationX);
        const rotationMatrixY = Matrix3D.rotateY(rotationY);
        
        let transformMatrix = Matrix3D.multiply(perspectiveMatrix, rotationMatrixX);
        transformMatrix = Matrix3D.multiply(transformMatrix, rotationMatrixY);
        
        // Transform only this region's pixels
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Calculate unique 3D position
            const relX = (x - centerX) / regionWidth;
            const relY = (y - centerY) / regionHeight;
            
            let z;
            // Different 3D shape for each region
            switch(regionIndex % 4) {
                case 0: // Dome
                    z = Math.cos(relX * Math.PI) * Math.cos(relY * Math.PI) * uniqueZ;
                    break;
                case 1: // Wave
                    z = Math.sin(relX * 6) * uniqueZ * 0.5;
                    break;
                case 2: // Pyramid
                    z = (1 - Math.abs(relX)) * uniqueZ;
                    break;
                case 3: // Ripple
                    const dist = Math.sqrt(relX * relX + relY * relY);
                    z = Math.cos(dist * 10) * uniqueZ * 0.3;
                    break;
            }
            
            // Transform point
            const transformed = Matrix3D.transformPoint(
                transformMatrix,
                x - centerX,
                y - centerY,
                z
            );
            
            // Project back to 2D
            const projectedX = Math.round(transformed.x + centerX);
            const projectedY = Math.round(transformed.y + centerY);
            
            if (projectedX >= 0 && projectedX < width && 
                projectedY >= 0 && projectedY < height) {
                
                const sourceIdx = pixelIndex * 4;
                const targetIdx = (projectedY * width + projectedX) * 4;
                
                // Unique color modification for each region
                const depthFactor = (z + uniqueZ) / (uniqueZ * 2);
                
                for (let c = 0; c < 4; c++) {
                    if (c < 3) {
                        // Apply color modifications unique to this region
                        let colorMod;
                        switch(regionIndex % 3) {
                            case 0:
                                colorMod = c === 0 ? 1.2 : 0.8; // Reddish
                                break;
                            case 1:
                                colorMod = c === 1 ? 1.2 : 0.8; // Greenish
                                break;
                            case 2:
                                colorMod = c === 2 ? 1.2 : 0.8; // Bluish
                                break;
                        }
                        resultForRegion.data[targetIdx + c] = 
                            regionBuffer[sourceIdx + c] * depthFactor * colorMod;
                    } else {
                        resultForRegion.data[targetIdx + c] = 
                            regionBuffer[sourceIdx + c];
                    }
                }
            }
        });
        
        return resultForRegion;
    });
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value5: iterations = DEFAULT_ITERATIONS,
        value2: rotationRange = DEFAULT_ROTATION_RANGE,
        value3: zDistance = DEFAULT_Z_DISTANCE,
        value4: perspective = DEFAULT_PERSPECTIVE,
        reset 
    } = e.data;
    
    try {
        if (reset) {
            currentIteration = 0;
        }
        
        const angle = (currentIteration / iterations) * Math.PI * 2;
        const baseRotationX = Math.sin(angle) * rotationRange;
        const baseRotationY = Math.cos(angle) * rotationRange;
        
        let segmentedImages;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Process each region separately
            segmentedImages = apply3DTransformMulti(
                imageData,
                selectedRegions,
                baseRotationX,
                baseRotationY,
                zDistance,
                perspective
            );
        } else {
            // Return original image if no regions
            segmentedImages = [new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            )];
        }
        
        currentIteration = (currentIteration + 1) % iterations;
        
        self.postMessage({
            segmentedImages,
            isComplete: true,
            iteration: currentIteration,
            progress: currentIteration / iterations
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};