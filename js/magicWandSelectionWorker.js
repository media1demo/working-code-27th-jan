self.onmessage = function(e) {
    const { imageData, startX, startY, tolerance } = e.data;

    // Perform the Magic Wand selection
    const selectedRegion = magicWand(imageData, startX, startY, tolerance);

    // Send the selected region back to the main thread
    self.postMessage({ selectedRegion });
};

/**
 * Magic Wand tool to select a region of similar color.
 * @param {ImageData} imageData - The image data to process.
 * @param {number} startX - The starting X coordinate.
 * @param {number} startY - The starting Y coordinate.
 * @param {number} tolerance - The color similarity threshold.
 * @returns {Array<number>} - An array of pixel indices in the selected region.
 */
function magicWand(imageData, startX, startY, tolerance) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    // Get the starting pixel's color
    const startIndex = (startY * width + startX) * 4;
    const startColor = {
        r: data[startIndex],
        g: data[startIndex + 1],
        b: data[startIndex + 2]
    };

    // Initialize the queue and visited set
    const queue = [[startX, startY]];
    const visited = new Set();
    const selectedRegion = [];

    // Flood fill algorithm
    while (queue.length > 0) {
        const [x, y] = queue.pop();
        const index = (y * width + x) * 4;

        // Skip if the pixel has already been visited
        if (visited.has(index)) continue;
        visited.add(index);

        // Get the current pixel's color
        const currentColor = {
            r: data[index],
            g: data[index + 1],
            b: data[index + 2]
        };

        // Check if the current pixel's color matches the starting color within the tolerance
        if (colorDistance(startColor, currentColor) <= tolerance) {
            // Add the pixel to the selected region
            selectedRegion.push(y * width + x);

            // Add neighboring pixels to the queue
            if (x > 0) queue.push([x - 1, y]); // Left
            if (x < width - 1) queue.push([x + 1, y]); // Right
            if (y > 0) queue.push([x, y - 1]); // Top
            if (y < height - 1) queue.push([x, y + 1]); // Bottom
        }
    }

    return selectedRegion;
}

/**
 * Calculate the Euclidean distance between two colors in RGB space.
 * @param {Object} color1 - The first color as { r, g, b }.
 * @param {Object} color2 - The second color as { r, g, b }.
 * @returns {number} - The Euclidean distance between the two colors.
 */
function colorDistance(color1, color2) {
    return Math.sqrt(
        Math.pow(color1.r - color2.r, 2) +
        Math.pow(color1.g - color2.g, 2) +
        Math.pow(color1.b - color2.b, 2)
    );
}