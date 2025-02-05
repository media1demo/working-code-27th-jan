// self.onmessage = function(e) {
//     const { imageData, threshold, evaluate } = e.data;
//     const result = segmentImage(imageData, threshold);
    
//     if (evaluate) {
//         const score = evaluateSegmentation(result);
//         self.postMessage({ segmentedData: result, threshold: threshold, score: score });
//     } else {
//         self.postMessage({ segmentedData: result });
//     }
// };

// function watershedSegmentation(imageData) {
//     const width = imageData.width;
//     const height = imageData.height;
//     const data = new Uint8ClampedArray(imageData.data);
//     const labels = new Int32Array(width * height);
//     const queue = [];
//     let currentLabel = 0;

//     // Step 1: Find local minima
//     for (let y = 1; y < height - 1; y++) {
//         for (let x = 1; x < width - 1; x++) {
//             const index = y * width + x;
//             if (isLocalMinimum(data, width, x, y)) {
//                 labels[index] = ++currentLabel;
//                 queue.push(index);
//             }
//         }
//     }

//     // Step 2: Grow regions
//     while (queue.length > 0) {
//         const index = queue.shift();
//         const x = index % width;
//         const y = Math.floor(index / width);

//         for (let dy = -1; dy <= 1; dy++) {
//             for (let dx = -1; dx <= 1; dx++) {
//                 if (dx === 0 && dy === 0) continue;
//                 const nx = x + dx;
//                 const ny = y + dy;
//                 if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

//                 const neighborIndex = ny * width + nx;
//                 if (labels[neighborIndex] === 0) {
//                     labels[neighborIndex] = labels[index];
//                     queue.push(neighborIndex);
//                 }
//             }
//         }
//     }

//     // Step 3: Color the segments
//     const colors = generateRandomColors(currentLabel);
//     for (let i = 0; i < labels.length; i++) {
//         const label = labels[i];
//         const color = colors[label];
//         data[i * 4] = color.r;
//         data[i * 4 + 1] = color.g;
//         data[i * 4 + 2] = color.b;
//     }

//     return new ImageData(data, width, height);
// }

// function isLocalMinimum(data, width, x, y) {
//     const index = (y * width + x) * 4;
//     const intensity = (data[index] + data[index + 1] + data[index + 2]) / 3;

//     for (let dy = -1; dy <= 1; dy++) {
//         for (let dx = -1; dx <= 1; dx++) {
//             if (dx === 0 && dy === 0) continue;
//             const nx = x + dx;
//             const ny = y + dy;
//             const nIndex = (ny * width + nx) * 4;
//             const nIntensity = (data[nIndex] + data[nIndex + 1] + data[nIndex + 2]) / 3;
//             if (nIntensity < intensity) return false;
//         }
//     }
//     return true;
// }

// function generateRandomColors(count) {
//     const colors = [{r: 0, g: 0, b: 0}];  // First color is black for background
//     for (let i = 1; i <= count; i++) {
//         colors.push({
//             r: Math.floor(Math.random() * 256),
//             g: Math.floor(Math.random() * 256),
//             b: Math.floor(Math.random() * 256)
//         });
//     }
//     return colors;
// }



// function evaluateSegmentation(segmentedData) {
//     const segments = new Map();
//     const totalPixels = segmentedData.width * segmentedData.height;

//     // Count pixels in each segment
//     for (let i = 0; i < segmentedData.data.length; i += 4) {
//         const color = `${segmentedData.data[i]},${segmentedData.data[i+1]},${segmentedData.data[i+2]}`;
//         segments.set(color, (segments.get(color) || 0) + 1);
//     }

//     const segmentSizes = Array.from(segments.values());
//     const minSize = Math.min(...segmentSizes);
//     const maxSize = Math.max(...segmentSizes);

//     // Calculate score based on segment size distribution
//     const sizeRange = maxSize - minSize;
//     const avgSize = totalPixels / segments.size;
//     const sizeVariance = segmentSizes.reduce((acc, size) => acc + Math.pow(size - avgSize, 2), 0) / segments.size;

//     // Lower score is better
//     return sizeRange + sizeVariance / avgSize;
// }