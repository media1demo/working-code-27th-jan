self.onmessage = function(e) {
    const { imageData } = e.data;
    const data = imageData.data;

    // Apply essential classic filter and reduce fidelity
    for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale
        let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        
        // Reduce fidelity by rounding to the nearest multiple of 32 (for lower fidelity)
        avg = Math.round(avg / 32) * 32;

        // Apply the same value to RGB channels
        data[i] = avg;     // Red
        data[i + 1] = avg; // Green
        data[i + 2] = avg; // Blue
        // Alpha channel remains the same
    }

    self.postMessage({ processedImageData: imageData });
};
