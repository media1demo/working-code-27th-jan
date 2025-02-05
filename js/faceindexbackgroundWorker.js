function segmentImage(imageData, selectedRegions) {
    // Input Validation
    if (!imageData || !selectedRegions || selectedRegions.length === 0) {
      throw new Error("imageData and selectedRegions must be provided");
    }
  
    const { width, height } = imageData;
    const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
  
    // Identify Selected Pixels
    const selectedPixels = new Set();
    selectedRegions.forEach(region => {
      region.forEach(pixelIndex => {
        selectedPixels.add(pixelIndex);
      });
    });
  
    // Set Transparency for Selected Pixels
    for (let i = 0; i < newImageData.data.length; i += 4) {
      if (selectedPixels.has(i / 4)) {
        newImageData.data[i] = 0; // Set red to 0
        newImageData.data[i + 1] = 0; // Set green to 0
        newImageData.data[i + 2] = 0; // Set blue to 0
        newImageData.data[i + 3] = 255; // Set alpha to 255 (fully opaque)
      } else {
        newImageData.data[i] = 255; // Set red to 255
        newImageData.data[i + 1] = 255; // Set green to 255
        newImageData.data[i + 2] = 255; // Set blue to 255
        newImageData.data[i + 3] = 255; // Set alpha to 255 (fully opaque)
      }
    }
  
    return newImageData;
  }
  
  self.onmessage = function(e) {
    const { imageData, selectedRegions } = e.data;
  
    try {
      const resultImageData = segmentImage(imageData, selectedRegions);
      self.postMessage({
        segmentedImages: [resultImageData],
        isComplete: true
      });
    } catch (error) {
      self.postMessage({
        error: error.message,
        isComplete: true
      });
    }
  };