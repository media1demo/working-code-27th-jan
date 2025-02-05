

// self.onmessage = function(e) {
//     const { imageData, startX, startY, tolerance } = e.data;
//     const increasedTolerance = tolerance * 1.5; // Increase tolerance by 50%
//     const selectedRegion = magicWand(imageData, startX, startY, increasedTolerance);
//     self.postMessage({ selectedRegion });
// };

// /**
//  * Magic Wand tool to select a region of similar color.
//  * @param {ImageData} imageData - The image data to process.
//  * @param {number} startX - The starting X coordinate.
//  * @param {number} startY - The starting Y coordinate.
//  * @param {number} tolerance - The color similarity threshold.
//  * @returns {Array<number>} - An array of pixel indices in the selected region.
//  */
// function magicWand(imageData, startX, startY, tolerance) {
//     const width = imageData.width;
//     const height = imageData.height;
//     const data = new Uint8ClampedArray(imageData.data); // Use Uint8ClampedArray for RGBA access
    
//     const targetColor = getPixel(data, startX, startY, width); // Get the target color at the starting point
//     const visited = new Uint8Array(width * height); // Track visited pixels
//     const selectedRegion = []; // Store the selected pixel indices
    
//     const queue = [{x: startX, y: startY}]; // Initialize the queue with the starting point
//     visited[startY * width + startX] = 1; // Mark the starting point as visited
    
//     const toleranceSq = tolerance * tolerance * 3; // Squared tolerance for RGB comparison
    
//     // Flood fill algorithm
//     while (queue.length > 0) {
//         const {x, y} = queue.shift(); // Get the next pixel from the queue (FIFO)
//         const index = y * width + x; // Calculate the pixel index
        
//         // Check if the pixel's color matches the target color within the tolerance
//         if (colorMatch(getPixel(data, x, y, width), targetColor, toleranceSq)) {
//             selectedRegion.push(index); // Add the pixel to the selected region
            
//             // Check 4 neighboring pixels (right, left, bottom, top)
//             checkNeighbor(x + 1, y);
//             checkNeighbor(x - 1, y);
//             checkNeighbor(x, y + 1);
//             checkNeighbor(x, y - 1);
//         }
//     }
    
//     /**
//      * Check if a neighboring pixel is within bounds and hasn't been visited.
//      * @param {number} x - The X coordinate of the neighbor.
//      * @param {number} y - The Y coordinate of the neighbor.
//      */
//     function checkNeighbor(x, y) {
//         if (x >= 0 && x < width && y >= 0 && y < height) { // Ensure the neighbor is within bounds
//             const index = y * width + x; // Calculate the neighbor's index
//             if (!visited[index]) { // Check if the neighbor hasn't been visited
//                 visited[index] = 1; // Mark the neighbor as visited
//                 queue.push({x, y}); // Add the neighbor to the queue
//             }
//         }
//     }
    
//     return selectedRegion; // Return the selected region
// }

// /**
//  * Get the color of a pixel at the specified coordinates.
//  * @param {Uint8ClampedArray} data - The image data.
//  * @param {number} x - The X coordinate.
//  * @param {number} y - The Y coordinate.
//  * @param {number} width - The width of the image.
//  * @returns {Array<number>} - The pixel's color as [R, G, B, A].
//  */
// function getPixel(data, x, y, width) {
//     const index = (y * width + x) * 4; // Calculate the pixel index
//     return [
//         data[index],     // Red
//         data[index + 1], // Green
//         data[index + 2], // Blue
//         data[index + 3]  // Alpha
//     ];
// }

// /**
//  * Compare two colors to see if they match within the given tolerance.
//  * @param {Array<number>} color1 - The first color as [R, G, B, A].
//  * @param {Array<number>} color2 - The second color as [R, G, B, A].
//  * @param {number} toleranceSq - The squared tolerance for RGB comparison.
//  * @returns {boolean} - True if the colors match within the tolerance, false otherwise.
//  */
// function colorMatch(color1, color2, toleranceSq) {
//     const dr = color1[0] - color2[0]; // Red difference
//     const dg = color1[1] - color2[1]; // Green difference
//     const db = color1[2] - color2[2]; // Blue difference
//     const distanceSq = dr * dr + dg * dg + db * db; // Squared Euclidean distance
//     return distanceSq <= toleranceSq; // Check if the distance is within the tolerance
// }

// Constants and State
const DEFAULT_ITERATIONS = 120;
const ANIMATION_PHASES = {
    OPENING: 'opening',
    CLOSING: 'closing'
};

let currentIteration = 0;
let currentPhase = ANIMATION_PHASES.OPENING;

// Helper Functions
function copyImageData(source, destination) {
    destination.data.set(source.data);
}

function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

// Magic Wand Logic
function magicWand(imageData, startX, startY, tolerance) {
    const width = imageData.width;
    const height = imageData.height;
    const data = new Uint8ClampedArray(imageData.data);

    const targetColor = getPixel(data, startX, startY, width);
    const visited = new Uint8Array(width * height);
    const selectedRegion = [];

    const queue = [{x: startX, y: startY}];
    visited[startY * width + startX] = 1;

    const toleranceSq = tolerance * tolerance * 3;

    while (queue.length > 0) {
        const {x, y} = queue.shift();
        const index = y * width + x;

        if (colorMatch(getPixel(data, x, y, width), targetColor, toleranceSq)) {
            selectedRegion.push(index);

            checkNeighbor(x + 1, y);
            checkNeighbor(x - 1, y);
            checkNeighbor(x, y + 1);
            checkNeighbor(x, y - 1);
        }
    }

    function checkNeighbor(x, y) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
            const index = y * width + x;
            if (!visited[index]) {
                visited[index] = 1;
                queue.push({x, y});
            }
        }
    }

    return selectedRegion;
}

function getPixel(data, x, y, width) {
    const index = (y * width + x) * 4;
    return [
        data[index],     // Red
        data[index + 1], // Green
        data[index + 2], // Blue
        data[index + 3]  // Alpha
    ];
}

function colorMatch(color1, color2, toleranceSq) {
    const dr = color1[0] - color2[0];
    const dg = color1[1] - color2[1];
    const db = color1[2] - color2[2];
    const distanceSq = dr * dr + dg * dg + db * db;
    return distanceSq <= toleranceSq;
}

// Main Logic


// Worker script (e.g., worker.js)
self.onmessage = function(e) {
    const { imageData, startX, startY, tolerance } = e.data;

    console.log('Input Parameters:', { startX, startY, tolerance });
    console.log('Image Data:', imageData);

    const increasedTolerance = tolerance * 1.5;
    const selectedRegion = magicWand(imageData, startX, startY, increasedTolerance);

    console.log('Selected Region:', selectedRegion);

    const newImageData = createTransparentImageData(imageData.width, imageData.height);
    copyImageData(imageData, newImageData);

    for (const pixelIndex of selectedRegion) {
        const i = pixelIndex * 4;
        newImageData.data[i] = 255;     // Red
        newImageData.data[i + 1] = 0;   // Green
        newImageData.data[i + 2] = 0;   // Blue
        newImageData.data[i + 3] = 255; // Alpha
    }

    self.postMessage({ segmentedImages: [newImageData], isComplete: true });
};