self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.8.1/gl-matrix-min.js');

self.onmessage = async function(e) {
    const { imageData, selectedRegions, imageCount, maxBrightness } = e.data;
    const width = imageData.width;
    const height = imageData.height;
     
    try {
        // Fetch the placeholder image from an online API
        const response = await fetch(`https://picsum.photos/${width}/${height}`);
        const blob = await response.blob();
        const jpgArrayBuffer = await blob.arrayBuffer();
        const jpgUint8Array = new Uint8Array(jpgArrayBuffer);

        // Create an ImageData object from the fetched image
        const jpgImageData = await createImageData(jpgUint8Array, width, height);

        // Create variations
        const segmentedImages = [];

        for (let i = 0; i < imageCount; i++) {
            const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);

            // Replace selected regions with fetched image data
            selectedRegions.forEach(region => {
                region.forEach(pixelIndex => {
                    const x = pixelIndex % width;
                    const y = Math.floor(pixelIndex / width);
                    const index = (y * width + x) * 4;

                    // Blend original image with fetched image
                    const alpha = 0.5 + (Math.random() * 0.5); // Random blend factor between 0.5 and 1
                    newImageData.data[index] = (1 - alpha) * imageData.data[index] + alpha * jpgImageData.data[index];
                    newImageData.data[index + 1] = (1 - alpha) * imageData.data[index + 1] + alpha * jpgImageData.data[index + 1];
                    newImageData.data[index + 2] = (1 - alpha) * imageData.data[index + 2] + alpha * jpgImageData.data[index + 2];
                });
            });

            segmentedImages.push(newImageData);
        }

        self.postMessage({ segmentedImages, isComplete: true });
    } catch (error) {
        self.postMessage({ error: error.message, isComplete: true });
    }
};

// Helper function to create ImageData from array buffer
async function createImageData(arrayBuffer, width, height) {
    const bitmap = await createImageBitmap(new Blob([arrayBuffer]));
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);
    return ctx.getImageData(0, 0, width, height);
}