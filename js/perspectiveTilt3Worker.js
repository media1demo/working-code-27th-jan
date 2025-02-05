self.onmessage = function(e) {
    const { imageData, value, clickedPoints } = e.data;
    const result = applyRotationAroundPoints(imageData, value, clickedPoints);
    self.postMessage({ imageData: result });
};

function applyRotationAroundPoints(imageData, value, clickedPoints) {
    const { width, height, data } = imageData;
    const newData = new Uint8ClampedArray(data.length);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let totalRotation = 0;
            let totalWeight = 0;

            // Calculate weighted rotation based on distance to clicked points
            clickedPoints.forEach(point => {
                const dx = x - point.x;
                const dy = y - point.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const weight = 1 / (1 + distance * 0.01); // Adjust this factor to control the area of influence

                totalRotation += value.rotation * weight;
                totalWeight += weight;
            });

            // Normalize the rotation
            const rotation = totalWeight > 0 ? totalRotation / totalWeight : 0;

            // Apply rotation
            const centerX = width / 2;
            const centerY = height / 2;
            const angle = rotation * Math.PI / 180; // Convert to radians

            const relativeX = x - centerX;
            const relativeY = y - centerY;

            const rotatedX = relativeX * Math.cos(angle) - relativeY * Math.sin(angle);
            const rotatedY = relativeX * Math.sin(angle) + relativeY * Math.cos(angle);

            const sourceX = Math.round(rotatedX + centerX);
            const sourceY = Math.round(rotatedY + centerY);

            if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                const targetIndex = (y * width + x) * 4;
                const sourceIndex = (sourceY * width + sourceX) * 4;

                for (let i = 0; i < 4; i++) {
                    newData[targetIndex + i] = data[sourceIndex + i];
                }
            }
        }
    }

    return new ImageData(newData, width, height);
}