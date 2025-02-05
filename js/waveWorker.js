
self.onmessage = function(e) {
    const { imageData, value, selectedRegions } = e.data;
    
    if (!imageData) {
        self.postMessage({
            error: "Missing required data. Please provide imageData.",
            isComplete: true
        });
        return;
    }

    console.log("object");
    const width = imageData.width;
    const height = imageData.height;
    
    const newImageData = new ImageData(width, height);
    
    // Unpack and scale the input values
    const [time, speed, intensity] = value;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sourceX = x;
            let sourceY = y;
            
            // Create a wave effect that moves across the image
            const waveX = Math.sin((y / height * 4 + time * speed) * Math.PI * 2) * intensity * 10;
            const waveY = Math.cos((x / width * 4 + time * speed) * Math.PI * 2) * intensity * 5;
            
            sourceX += waveX;
            sourceY += waveY;
            
            // Add a pulsing effect
            const pulse = Math.sin(time * speed * 2) * intensity * 10;
            sourceX += (x - width / 2) * pulse / width;
            sourceY += (y - height / 2) * pulse / height;
            
            // Ensure sourceX and sourceY are within bounds
            sourceX = Math.max(0, Math.min(width - 1, sourceX));
            sourceY = Math.max(0, Math.min(height - 1, sourceY));
            
            const sourceIndex = (Math.floor(sourceY) * width + Math.floor(sourceX)) * 4;
            const targetIndex = (y * width + x) * 4;
            
            // Copy pixel data
            for (let i = 0; i < 4; i++) {
                newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
            }
        }
    }
    
    // Keep the original response format but wrap newImageData in segmentedImages array
    self.postMessage({
        segmentedImages: [newImageData],
        isComplete: true
    });
};