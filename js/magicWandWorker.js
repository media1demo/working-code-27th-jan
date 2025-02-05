// // magicWandWorker.js
// self.onmessage = function(e) {
//     const { imageData, startX, startY, tolerance } = e.data;
//     const selectedRegion = magicWand(imageData, startX, startY, tolerance);
//     self.postMessage({ selectedRegion });
// };

// function magicWand(imageData, startX, startY, tolerance) {
//     const width = imageData.width;
//     const height = imageData.height;
//     const data = imageData.data;
//     const startIndex = (startY * width + startX) * 4;
//     const startColor = {
//         r: data[startIndex],
//         g: data[startIndex + 1],
//         b: data[startIndex + 2]
//     };

//     const queue = [[startX, startY]];
//     const visited = new Set();
//     const selectedRegion = [];

//     while (queue.length > 0) {
//         const [x, y] = queue.pop();
//         const index = (y * width + x) * 4;

//         if (visited.has(index)) continue;
//         visited.add(index);

//         const currentColor = {
//             r: data[index],
//             g: data[index + 1],
//             b: data[index + 2]
//         };

//         if (colorDistance(startColor, currentColor) <= tolerance) {
//             selectedRegion.push(y * width + x);

//             if (x > 0) queue.push([x - 1, y]);
//             if (x < width - 1) queue.push([x + 1, y]);
//             if (y > 0) queue.push([x, y - 1]);
//             if (y < height - 1) queue.push([x, y + 1]);
//         }
//     }

//     return selectedRegion;
// }

// function colorDistance(color1, color2) {
//     return Math.sqrt(
//         Math.pow(color1.r - color2.r, 2) +
//         Math.pow(color1.g - color2.g, 2) +
//         Math.pow(color1.b - color2.b, 2)
//     );
// }



self.onmessage = function(e) {
    const { imageData, startX, startY, tolerance, mode } = e.data;
    const selectedRegion = magicWand(imageData, startX, startY, tolerance);
    self.postMessage({ selectedRegion });
};

function magicWand(imageData, startX, startY, tolerance) {
    const width = imageData.width;
    const height = imageData.height;
    const data = new Uint32Array(imageData.data.buffer);
    
    const targetColor = data[startY * width + startX];
    const visited = new Uint8Array(width * height);
    const selectedRegion = [];
    
    const queue = [{x: startX, y: startY}];
    visited[startY * width + startX] = 1;
    
    const toleranceSq = tolerance * tolerance * 3; // For RGB comparison
    
    while (queue.length > 0) {
        const {x, y} = queue.pop();
        const index = y * width + x;
        
        if (colorMatch(data[index], targetColor, toleranceSq)) {
            selectedRegion.push(index);
            
            // Check 4 neighboring pixels
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

function colorMatch(c1, c2, toleranceSq) {
    const r1 = c1 & 0xff;
    const g1 = (c1 >> 8) & 0xff;
    const b1 = (c1 >> 16) & 0xff;
    const r2 = c2 & 0xff;
    const g2 = (c2 >> 8) & 0xff;
    const b2 = (c2 >> 16) & 0xff;
    const dr = r1 - r2;
    const dg = g1 - g2;
    const db = b1 - b2;
    return (dr * dr + dg * dg + db * db) <= toleranceSq;
}