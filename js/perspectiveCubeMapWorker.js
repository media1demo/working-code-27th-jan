// // // // self.onmessage = function(e) {
// // // //     const { imageData, value } = e.data;
// // // //     const cubeRotation = value * 360 * Math.PI / 180;
    
// // // //     const width = imageData.width;
// // // //     const height = imageData.height;
// // // //     const newImageData = new ImageData(width, height);
    
// // // //     for (let y = 0; y < height; y++) {
// // // //         for (let x = 0; x < width; x++) {
// // // //             const u = (x / width) * 2 - 1;
// // // //             const v = (y / height) * 2 - 1;
            
// // // //             let x3d = Math.cos(cubeRotation) * u - Math.sin(cubeRotation) * v;
// // // //             let y3d = Math.sin(cubeRotation) * u + Math.cos(cubeRotation) * v;
// // // //             let z3d = 1;
            
// // // //             const absX = Math.abs(x3d);
// // // //             const absY = Math.abs(y3d);
// // // //             const absZ = Math.abs(z3d);
            
// // // //             let sourceX, sourceY;
// // // //             if (absX >= absY && absX >= absZ) {
// // // //                 sourceX = (y3d / absX + 1) / 2;
// // // //                 sourceY = (z3d / absX + 1) / 2;
// // // //             } else if (absY >= absX && absY >= absZ) {
// // // //                 sourceX = (x3d / absY + 1) / 2;
// // // //                 sourceY = (z3d / absY + 1) / 2;
// // // //             } else {
// // // //                 sourceX = (x3d / absZ + 1) / 2;
// // // //                 sourceY = (y3d / absZ + 1) / 2;
// // // //             }
            
// // // //             sourceX = Math.floor(sourceX * width);
// // // //             sourceY = Math.floor(sourceY * height);
            
// // // //             if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
// // // //                 const sourceIndex = (sourceY * width + sourceX) * 4;
// // // //                 const targetIndex = (y * width + x) * 4;
                
// // // //                 for (let i = 0; i < 4; i++) {
// // // //                     newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
// // // //                 }
// // // //             }
// // // //         }
// // // //     }
    
// // // //     self.postMessage({ imageData: newImageData });
// // // // };

// // // const DEFAULT_ITERATIONS = 120;
// // // const DEFAULT_ROTATION_RANGE = 15; // degrees
// // // const DEFAULT_Z_DISTANCE = 200;
// // // const DEFAULT_PERSPECTIVE = 1000;

// // // let currentIteration = 0;

// // // // 3D Matrix helper functions
// // // const Matrix3D = {
// // //     // Create identity matrix
// // //     identity() {
// // //         return [
// // //             1, 0, 0, 0,
// // //             0, 1, 0, 0,
// // //             0, 0, 1, 0,
// // //             0, 0, 0, 1
// // //         ];
// // //     },

// // //     // Multiply two 4x4 matrices
// // //     multiply(a, b) {
// // //         const result = new Array(16);
// // //         for (let i = 0; i < 4; i++) {
// // //             for (let j = 0; j < 4; j++) {
// // //                 result[i * 4 + j] = 
// // //                     a[i * 4 + 0] * b[0 * 4 + j] +
// // //                     a[i * 4 + 1] * b[1 * 4 + j] +
// // //                     a[i * 4 + 2] * b[2 * 4 + j] +
// // //                     a[i * 4 + 3] * b[3 * 4 + j];
// // //             }
// // //         }
// // //         return result;
// // //     },

// // //     // Create rotation matrix around X axis
// // //     rotateX(angle) {
// // //         const rad = angle * Math.PI / 180;
// // //         const c = Math.cos(rad);
// // //         const s = Math.sin(rad);
// // //         return [
// // //             1,  0,  0,  0,
// // //             0,  c,  -s, 0,
// // //             0,  s,  c,  0,
// // //             0,  0,  0,  1
// // //         ];
// // //     },

// // //     // Create rotation matrix around Y axis
// // //     rotateY(angle) {
// // //         const rad = angle * Math.PI / 180;
// // //         const c = Math.cos(rad);
// // //         const s = Math.sin(rad);
// // //         return [
// // //             c,  0,  s,  0,
// // //             0,  1,  0,  0,
// // //             -s, 0,  c,  0,
// // //             0,  0,  0,  1
// // //         ];
// // //     },

// // //     // Create perspective matrix
// // //     perspective(fieldOfView, aspect, near, far) {
// // //         const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfView * Math.PI / 180);
// // //         const rangeInv = 1.0 / (near - far);
// // //         return [
// // //             f / aspect, 0, 0, 0,
// // //             0, f, 0, 0,
// // //             0, 0, (near + far) * rangeInv, -1,
// // //             0, 0, near * far * rangeInv * 2, 0
// // //         ];
// // //     },

// // //     // Transform point using matrix
// // //     transformPoint(matrix, x, y, z) {
// // //         const w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
// // //         return {
// // //             x: (matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]) / w,
// // //             y: (matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]) / w,
// // //             z: (matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]) / w
// // //         };
// // //     }
// // // };

// // // // Helper function to create transparent ImageData
// // // function createTransparentImageData(width, height) {
// // //     return new ImageData(
// // //         new Uint8ClampedArray(width * height * 4),
// // //         width,
// // //         height
// // //     );
// // // }

// // // // Apply 3D transform to selected regions
// // // function apply3DTransform(imageData, selectedRegions, rotationX, rotationY, zDistance, perspective) {
// // //     const width = imageData.width;
// // //     const height = imageData.height;
// // //     const result = createTransparentImageData(width, height);
    
// // //     // Create perspective and rotation matrices
// // //     const perspectiveMatrix = Matrix3D.perspective(45, width / height, 0.1, 2000);
// // //     const rotationMatrixX = Matrix3D.rotateX(rotationX);
// // //     const rotationMatrixY = Matrix3D.rotateY(rotationY);
    
// // //     // Combine matrices
// // //     let transformMatrix = Matrix3D.multiply(perspectiveMatrix, rotationMatrixX);
// // //     transformMatrix = Matrix3D.multiply(transformMatrix, rotationMatrixY);
    
// // //     // Process each selected region
// // //     selectedRegions.forEach((region, regionIndex) => {
// // //         // Calculate region bounds
// // //         let minX = width, minY = height, maxX = 0, maxY = 0;
// // //         region.forEach(pixelIndex => {
// // //             const x = pixelIndex % width;
// // //             const y = Math.floor(pixelIndex / width);
// // //             minX = Math.min(minX, x);
// // //             minY = Math.min(minY, y);
// // //             maxX = Math.max(maxX, x);
// // //             maxY = Math.max(maxY, y);
// // //         });
        
// // //         const regionWidth = maxX - minX;
// // //         const regionHeight = maxY - minY;
// // //         const centerX = minX + regionWidth / 2;
// // //         const centerY = minY + regionHeight / 2;
        
// // //         // Create depth map (you can modify this to create different 3D effects)
// // //         const depthMap = new Map();
// // //         region.forEach(pixelIndex => {
// // //             const x = pixelIndex % width;
// // //             const y = Math.floor(pixelIndex / width);
            
// // //             // Calculate relative position from center
// // //             const relX = (x - centerX) / regionWidth;
// // //             const relY = (y - centerY) / regionHeight;
            
// // //             // Create a simple dome-like depth effect
// // //             const z = Math.cos(relX * Math.PI) * Math.cos(relY * Math.PI) * zDistance;
// // //             depthMap.set(pixelIndex, z);
// // //         });
        
// // //         // Transform and render pixels
// // //         const tempBuffer = new Uint8ClampedArray(width * height * 4);
        
// // //         region.forEach(pixelIndex => {
// // //             const x = pixelIndex % width;
// // //             const y = Math.floor(pixelIndex / width);
// // //             const z = depthMap.get(pixelIndex);
            
// // //             // Transform point
// // //             const transformed = Matrix3D.transformPoint(
// // //                 transformMatrix,
// // //                 x - centerX,
// // //                 y - centerY,
// // //                 z
// // //             );
            
// // //             // Project back to 2D space
// // //             const projectedX = Math.round(transformed.x + centerX);
// // //             const projectedY = Math.round(transformed.y + centerY);
            
// // //             if (projectedX >= 0 && projectedX < width && projectedY >= 0 && projectedY < height) {
// // //                 const sourceIdx = pixelIndex * 4;
// // //                 const targetIdx = (projectedY * width + projectedX) * 4;
                
// // //                 // Add basic depth shading
// // //                 const depthFactor = (z + zDistance) / (zDistance * 2);
                
// // //                 for (let c = 0; c < 4; c++) {
// // //                     if (c < 3) {
// // //                         // Apply depth shading to RGB channels
// // //                         tempBuffer[targetIdx + c] = imageData.data[sourceIdx + c] * depthFactor;
// // //                     } else {
// // //                         // Keep original alpha
// // //                         tempBuffer[targetIdx + c] = imageData.data[sourceIdx + c];
// // //                     }
// // //                 }
// // //             }
// // //         });
        
// // //         // Blend transformed region into result
// // //         for (let i = 0; i < tempBuffer.length; i += 4) {
// // //             if (tempBuffer[i + 3] > 0) {
// // //                 for (let c = 0; c < 4; c++) {
// // //                     result.data[i + c] = tempBuffer[i + c];
// // //                 }
// // //             }
// // //         }
// // //     });
    
// // //     return result;
// // // }

// // // self.onmessage = function(e) {
// // //     const { 
// // //         imageData, 
// // //         selectedRegions, 
// // //         value5: iterations = DEFAULT_ITERATIONS,
// // //         value2: rotationRange = DEFAULT_ROTATION_RANGE,
// // //         value3: zDistance = DEFAULT_Z_DISTANCE,
// // //         value4: perspective = DEFAULT_PERSPECTIVE,
// // //         reset 
// // //     } = e.data;
    
// // //     try {
// // //         if (reset) {
// // //             currentIteration = 0;
// // //         }
        
// // //         // Calculate rotation angles using sine waves for smooth movement
// // //         const angle = (currentIteration / iterations) * Math.PI * 2;
// // //         const rotationX = Math.sin(angle) * rotationRange;
// // //         const rotationY = Math.cos(angle) * rotationRange;
        
// // //         let resultImageData;
        
// // //         if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
// // //             resultImageData = apply3DTransform(
// // //                 imageData,
// // //                 selectedRegions,
// // //                 rotationX,
// // //                 rotationY,
// // //                 zDistance,
// // //                 perspective
// // //             );
// // //         } else {
// // //             // If no regions selected, return original image
// // //             resultImageData = new ImageData(
// // //                 new Uint8ClampedArray(imageData.data),
// // //                 imageData.width,
// // //                 imageData.height
// // //             );
// // //         }
        
// // //         currentIteration = (currentIteration + 1) % iterations;
// // //         const progress = currentIteration / iterations;
// // //        self.postMessage({
// // //             segmentedImages: [resultImageData],
// // //             isComplete: true,
// // //             iteration: currentIteration,
// // //             progress
// // //         });
// // //     } catch (error) {
// // //         self.postMessage({
// // //             error: error.message,
// // //             isComplete: true
// // //         });
// // //     }
// // // };

// // // Constants for cube face mapping
// // const CUBE_FACES = {
// //     POSITIVE_X: 0,
// //     NEGATIVE_X: 1,
// //     POSITIVE_Y: 2,
// //     NEGATIVE_Y: 3,
// //     POSITIVE_Z: 4,
// //     NEGATIVE_Z: 5
// // };

// // const DEFAULT_MAP_SIZE = 1024;
// // const DEFAULT_FOV = Math.PI / 2;

// // // Helper function to convert spherical to Cartesian coordinates
// // function sphericalToCartesian(theta, phi) {
// //     return {
// //         x: Math.sin(phi) * Math.cos(theta),
// //         y: Math.sin(phi) * Math.sin(theta),
// //         z: Math.cos(phi)
// //     };
// // }

// // // Helper function to determine which cube face a direction vector hits
// // function getCubeFace(x, y, z) {
// //     const absX = Math.abs(x);
// //     const absY = Math.abs(y);
// //     const absZ = Math.abs(z);
// //     const max = Math.max(absX, absY, absZ);

// //     if (max === absX) return x > 0 ? CUBE_FACES.POSITIVE_X : CUBE_FACES.NEGATIVE_X;
// //     if (max === absY) return y > 0 ? CUBE_FACES.POSITIVE_Y : CUBE_FACES.NEGATIVE_Y;
// //     return z > 0 ? CUBE_FACES.POSITIVE_Z : CUBE_FACES.NEGATIVE_Z;
// // }

// // // Helper function to get UV coordinates on a cube face
// // function getCubemapUV(face, x, y, z) {
// //     switch (face) {
// //         case CUBE_FACES.POSITIVE_X:
// //             return { u: -z / x, v: -y / x };
// //         case CUBE_FACES.NEGATIVE_X:
// //             return { u: z / x, v: -y / x };
// //         case CUBE_FACES.POSITIVE_Y:
// //             return { u: x / y, v: z / y };
// //         case CUBE_FACES.NEGATIVE_Y:
// //             return { u: x / y, v: -z / y };
// //         case CUBE_FACES.POSITIVE_Z:
// //             return { u: x / z, v: -y / z };
// //         case CUBE_FACES.NEGATIVE_Z:
// //             return { u: -x / z, v: -y / z };
// //     }
// // }

// // // Main function to transform equirectangular to cubemap
// // function transformToCubemap(inputData, width, height, options = {}) {
// //     const mapSize = options.mapSize || DEFAULT_MAP_SIZE;
// //     const fov = options.fov || DEFAULT_FOV;
    
// //     // Create output buffer for 6 faces
// //     const outputSize = mapSize * mapSize * 4 * 6;
// //     const outputData = new Uint8ClampedArray(outputSize);
    
// //     // Process each face of the cube
// //     for (let face = 0; face < 6; face++) {
// //         for (let y = 0; y < mapSize; y++) {
// //             for (let x = 0; x < mapSize; x++) {
// //                 // Convert pixel coordinates to normalized device coordinates
// //                 const ndcX = (x / mapSize) * 2 - 1;
// //                 const ndcY = (y / mapSize) * 2 - 1;
                
// //                 // Calculate ray direction for this pixel
// //                 const ray = calculateRayDirection(face, ndcX, ndcY, fov);
                
// //                 // Convert ray direction to spherical coordinates
// //                 const theta = Math.atan2(ray.y, ray.x);
// //                 const phi = Math.acos(ray.z / Math.sqrt(ray.x * ray.x + ray.y * ray.y + ray.z * ray.z));
                
// //                 // Map to equirectangular coordinates
// //                 const u = (theta + Math.PI) / (2 * Math.PI);
// //                 const v = phi / Math.PI;
                
// //                 // Sample input texture
// //                 const inputX = Math.floor(u * (width - 1));
// //                 const inputY = Math.floor(v * (height - 1));
                
// //                 // Copy pixel data
// //                 const inputIdx = (inputY * width + inputX) * 4;
// //                 const outputIdx = (face * mapSize * mapSize + y * mapSize + x) * 4;
                
// //                 for (let c = 0; c < 4; c++) {
// //                     outputData[outputIdx + c] = inputData[inputIdx + c];
// //                 }
// //             }
// //         }
// //     }
    
// //     return outputData;
// // }

// // // Calculate ray direction for a given face and pixel
// // function calculateRayDirection(face, ndcX, ndcY, fov) {
// //     const tanFov = Math.tan(fov / 2);
// //     const rayX = ndcX * tanFov;
// //     const rayY = ndcY * tanFov;
    
// //     switch (face) {
// //         case CUBE_FACES.POSITIVE_X:
// //             return normalize({ x: 1, y: -rayY, z: -rayX });
// //         case CUBE_FACES.NEGATIVE_X:
// //             return normalize({ x: -1, y: -rayY, z: rayX });
// //         case CUBE_FACES.POSITIVE_Y:
// //             return normalize({ x: rayX, y: 1, z: rayY });
// //         case CUBE_FACES.NEGATIVE_Y:
// //             return normalize({ x: rayX, y: -1, z: -rayY });
// //         case CUBE_FACES.POSITIVE_Z:
// //             return normalize({ x: rayX, y: -rayY, z: 1 });
// //         case CUBE_FACES.NEGATIVE_Z:
// //             return normalize({ x: -rayX, y: -rayY, z: -1 });
// //     }
// // }

// // // Vector normalization helper
// // function normalize(vec) {
// //     const length = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
// //     return {
// //         x: vec.x / length,
// //         y: vec.y / length,
// //         z: vec.z / length
// //     };
// // }

// // // Worker message handler
// // self.onmessage = function(e) {
// //     const { imageData, options } = e.data;
    
// //     try {
// //         const result = transformToCubemap(
// //             imageData.data,
// //             imageData.width,
// //             imageData.height,
// //             options
// //         );
        
// //         self.postMessage({
// //             cubemapData: result,
// //             mapSize: options?.mapSize || DEFAULT_MAP_SIZE,
// //             isComplete: true
// //         });
// //     } catch (error) {
// //         self.postMessage({
// //             error: error.message,
// //             isComplete: true
// //         });
// //     }
// // };



// // Constants for cube face mapping
// const CUBE_FACES = {
//     POSITIVE_X: 0,
//     NEGATIVE_X: 1,
//     POSITIVE_Y: 2,
//     NEGATIVE_Y: 3,
//     POSITIVE_Z: 4,
//     NEGATIVE_Z: 5
// };

// const DEFAULT_MAP_SIZE = 1024;
// const DEFAULT_FOV = Math.PI / 2;
// let currentIteration = 0;

// // Helper function to convert spherical to Cartesian coordinates
// function sphericalToCartesian(theta, phi) {
//     return {
//         x: Math.sin(phi) * Math.cos(theta),
//         y: Math.sin(phi) * Math.sin(theta),
//         z: Math.cos(phi)
//     };
// }

// // Helper function to determine which cube face a direction vector hits
// function getCubeFace(x, y, z) {
//     const absX = Math.abs(x);
//     const absY = Math.abs(y);
//     const absZ = Math.abs(z);
//     const max = Math.max(absX, absY, absZ);

//     if (max === absX) return x > 0 ? CUBE_FACES.POSITIVE_X : CUBE_FACES.NEGATIVE_X;
//     if (max === absY) return y > 0 ? CUBE_FACES.POSITIVE_Y : CUBE_FACES.NEGATIVE_Y;
//     return z > 0 ? CUBE_FACES.POSITIVE_Z : CUBE_FACES.NEGATIVE_Z;
// }

// // Helper function to get UV coordinates on a cube face
// function getCubemapUV(face, x, y, z) {
//     switch (face) {
//         case CUBE_FACES.POSITIVE_X:
//             return { u: -z / x, v: -y / x };
//         case CUBE_FACES.NEGATIVE_X:
//             return { u: z / x, v: -y / x };
//         case CUBE_FACES.POSITIVE_Y:
//             return { u: x / y, v: z / y };
//         case CUBE_FACES.NEGATIVE_Y:
//             return { u: x / y, v: -z / y };
//         case CUBE_FACES.POSITIVE_Z:
//             return { u: x / z, v: -y / z };
//         case CUBE_FACES.NEGATIVE_Z:
//             return { u: -x / z, v: -y / z };
//     }
// }

// // Main function to transform equirectangular to cubemap
// function transformToCubemap(imageData, options = {}) {
//     const width = imageData.width;
//     const height = imageData.height;
//     const mapSize = options.mapSize || DEFAULT_MAP_SIZE;
//     const fov = options.fov || DEFAULT_FOV;
    
//     // Create new ImageData for output
//     const outputImageData = new ImageData(mapSize, mapSize * 6);
    
//     // Process each face of the cube
//     for (let face = 0; face < 6; face++) {
//         for (let y = 0; y < mapSize; y++) {
//             for (let x = 0; x < mapSize; x++) {
//                 // Convert pixel coordinates to normalized device coordinates
//                 const ndcX = (x / mapSize) * 2 - 1;
//                 const ndcY = (y / mapSize) * 2 - 1;
                
//                 // Calculate ray direction for this pixel
//                 const ray = calculateRayDirection(face, ndcX, ndcY, fov);
                
//                 // Convert ray direction to spherical coordinates
//                 const theta = Math.atan2(ray.y, ray.x);
//                 const phi = Math.acos(ray.z / Math.sqrt(ray.x * ray.x + ray.y * ray.y + ray.z * ray.z));
                
//                 // Map to equirectangular coordinates
//                 const u = (theta + Math.PI) / (2 * Math.PI);
//                 const v = phi / Math.PI;
                
//                 // Sample input texture
//                 const inputX = Math.floor(u * (width - 1));
//                 const inputY = Math.floor(v * (height - 1));
                
//                 // Copy pixel data
//                 const inputIdx = (inputY * width + inputX) * 4;
//                 const outputIdx = (face * mapSize * mapSize + y * mapSize + x) * 4;
                
//                 for (let c = 0; c < 4; c++) {
//                     outputImageData.data[outputIdx + c] = imageData.data[inputIdx + c];
//                 }
//             }
//         }
//     }
    
//     return outputImageData;
// }

// // Calculate ray direction for a given face and pixel
// function calculateRayDirection(face, ndcX, ndcY, fov) {
//     const tanFov = Math.tan(fov / 2);
//     const rayX = ndcX * tanFov;
//     const rayY = ndcY * tanFov;
    
//     switch (face) {
//         case CUBE_FACES.POSITIVE_X:
//             return normalize({ x: 1, y: -rayY, z: -rayX });
//         case CUBE_FACES.NEGATIVE_X:
//             return normalize({ x: -1, y: -rayY, z: rayX });
//         case CUBE_FACES.POSITIVE_Y:
//             return normalize({ x: rayX, y: 1, z: rayY });
//         case CUBE_FACES.NEGATIVE_Y:
//             return normalize({ x: rayX, y: -1, z: -rayY });
//         case CUBE_FACES.POSITIVE_Z:
//             return normalize({ x: rayX, y: -rayY, z: 1 });
//         case CUBE_FACES.NEGATIVE_Z:
//             return normalize({ x: -rayX, y: -rayY, z: -1 });
//     }
// }

// // Vector normalization helper
// function normalize(vec) {
//     const length = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
//     return {
//         x: vec.x / length,
//         y: vec.y / length,
//         z: vec.z / length
//     };
// }

// // Worker message handler
// self.onmessage = function(e) {
//     const { 
//         imageData, 
//         value,
//         value2,
//         value5: iterations,
//         reset 
//     } = e.data;
    
//     try {
//         // Reset counter if requested
//         if (reset) {
//             currentIteration = 0;
//         }

//         // Process the image
//         const resultImageData = transformToCubemap(imageData, {
//             mapSize: value2,
//             fov: value
//         });

//         // Update iteration counter
//         currentIteration = (currentIteration + 1) % (iterations || 1);
        
//         // Send back results matching the expected format
//         self.postMessage({
//             segmentedImages: [resultImageData],
//             isComplete: true,
//             iteration: currentIteration,
//             progress: currentIteration / (iterations || 1)
//         });
//     } catch (error) {
//         self.postMessage({
//             error: error.message,
//             isComplete: true
//         });
//     }
// };

// Constants for animation
const DEFAULT_ROTATION_SPEED = 0.02;
const DEFAULT_ITERATIONS = 120;
const DEFAULT_PERSPECTIVE = 1000;

let currentIteration = 0;

// Helper function to create new ImageData
function createNewImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

// 3D transformation matrices
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

// Apply perspective transformation
function applyPerspective(imageData, rotation, perspective) {
    const width = imageData.width;
    const height = imageData.height;
    const result = createNewImageData(width, height);
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    
    // Create rotation matrix
    const matrix = createRotationMatrix(rotation);
    
    // Transform each pixel
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Convert to 3D coordinates
            const xPos = x - halfWidth;
            const yPos = y - halfHeight;
            
            // Apply rotation
            const rotX = matrix.xx * xPos + matrix.xy * yPos;
            const rotY = matrix.yx * xPos + matrix.yy * yPos;
            const rotZ = matrix.zx * xPos + matrix.zy * yPos + perspective;
            
            // Apply perspective projection
            const scale = perspective / (perspective + rotZ);
            const projX = Math.round(halfWidth + rotX * scale);
            const projY = Math.round(halfHeight + rotY * scale);
            
            // Copy pixel if within bounds
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

// Worker message handler
self.onmessage = function(e) {
    const { 
        imageData, 
        value: rotationSpeed = DEFAULT_ROTATION_SPEED,
        value2: perspective = DEFAULT_PERSPECTIVE,
        value5: iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;
    
    try {
        // Reset counter if requested
        if (reset) {
            currentIteration = 0;
        }
        
        // Calculate current rotation based on iteration
        const rotation = currentIteration * rotationSpeed;
        
        // Apply perspective transformation
        const resultImageData = applyPerspective(
            imageData,
            rotation,
            perspective
        );
        
        // Update iteration counter
        currentIteration = (currentIteration + 1) % iterations;
        
        // Send back results
        self.postMessage({
            segmentedImages: [resultImageData],
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