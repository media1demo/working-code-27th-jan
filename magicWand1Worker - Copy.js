self.onmessage = function(e) {
    const { imageData, startX, startY, tolerance, mode } = e.data;
    const increasedTolerance = tolerance * 1.5; // Increase tolerance by 50%
    const selectedRegion = magicWand(imageData, startX, startY, increasedTolerance);
    // console.log(selectedRegion);
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
    
    const toleranceSq = tolerance * tolerance * 3;
    
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