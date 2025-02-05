self.onmessage = function(e) {
    const { segmentedImages, maxBrightness, selectedRegions, originalImageData } = e.data;
  
    if (!selectedRegions || !Array.isArray(selectedRegions)) {
      console.error('Invalid selectedRegions:', selectedRegions);
      return;
    }
  
    const brightnessLevels = [0, 50, 100, 150, 200, 255]; // Define your brightness levels
  
    let processedImages = [];
  
    if (segmentedImages && Array.isArray(segmentedImages)) {
      processedImages = segmentedImages.flatMap(imageData => {
        return brightnessLevels.map(brightness => {
          return applyBrightnessToSelectedRegions(imageData, selectedRegions, brightness);
        });
      });
    } else if (originalImageData) {
      // Apply brightness to the selected regions of the original image
      processedImages = brightnessLevels.map(brightness => {
        return applyBrightnessToSelectedRegions(originalImageData, selectedRegions, brightness);
      });
    } else {
      console.error('No valid image data provided');
      return;
    }
  
    self.postMessage({ processedImages });
    console.log('Processed Images :>> ', processedImages);
  };
  
  function applyBrightnessToSelectedRegions(imageData, selectedRegions, brightness) {
    if (!imageData || !imageData.data) {
      console.error('Invalid imageData:', imageData);
      return null;
    }
  
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
  
    selectedRegions.forEach(region => {
      region.forEach(pixelIndex => {
        const index = pixelIndex * 4;
        data[index] = Math.min(255, data[index] + brightness); // Adjust red channel
        data[index + 1] = Math.min(255, data[index + 1] + brightness); // Adjust green channel
        data[index + 2] = Math.min(255, data[index + 2] + brightness); // Adjust blue channel
      });
    });
  
    return new ImageData(data, imageData.width, imageData.height);
  }
  