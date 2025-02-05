self.onmessage = function(e) {
    if (e.data.imageData) {
        // Simulate image processing
        console.log('Processing image in Web Worker');
        
        // Create a new ImageData object with the same dimensions
        const width = e.data.imageData.width;
        const height = e.data.imageData.height;
        const processedImageData = new ImageData(width, height);
        
        // Here you would implement your actual image processing
        // For this example, we'll just copy the original data
        processedImageData.data.set(e.data.imageData.data);
        
        // Send the processed ImageData back to the main script
        self.postMessage({ processedImageData: processedImageData }, [processedImageData.data.buffer]);
    }
};