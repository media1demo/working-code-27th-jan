// Image processing worker

self.onmessage = function(e) {
    const { imageData, selectedRegions, imageCount, maxBrightness, value1, value2, value3, value4, value5, clickedPoints, lines } = e.data;
  
    // Split the image into 16 segments
    const segments = splitImageIntoSegments(imageData);
  
    // Replace the selected region with the corresponding corner parts
    const replacedImageData = replaceSelectedRegion(imageData, segments, selectedRegions);
  
    // Post the result back to the main thread
    self.postMessage({
        segmentedImages: [replacedImageData],
        isComplete: true
    });
  };
  
  function splitImageIntoSegments(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const segmentWidth = Math.floor(width / 4);
    const segmentHeight = Math.floor(height / 4);
    const segments = [];
  
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            const segment = new ImageData(segmentWidth, segmentHeight);
            for (let sy = 0; sy < segmentHeight; sy++) {
                for (let sx = 0; sx < segmentWidth; sx++) {
                    const srcIndex = ((y * segmentHeight + sy) * width + (x * segmentWidth + sx)) * 4;
                    const dstIndex = (sy * segmentWidth + sx) * 4;
                    for (let i = 0; i < 4; i++) {
                        segment.data[dstIndex + i] = imageData.data[srcIndex + i];
                    }
                }
            }
            segments.push(segment);
        }
    }
    return segments;
  }
  
  function replaceSelectedRegion(imageData, segments, selectedRegions) {
    const width = imageData.width;
    const height = imageData.height;
    const segmentWidth = Math.floor(width / 4);
    const segmentHeight = Math.floor(height / 4);
  
    const cornerSegments = [segments[0], segments[3], segments[12], segments[15]];
  
    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
  
            // Determine which segment this pixel belongs to
            const segmentX = Math.floor(x / segmentWidth);
            const segmentY = Math.floor(y / segmentHeight);
            const segmentIndex = segmentY * 4 + segmentX;
  
            // Determine which corner segment to use
            let cornerIndex;
            if (segmentX < 2) {
                cornerIndex = segmentY < 2 ? 0 : 2;
            } else {
                cornerIndex = segmentY < 2 ? 1 : 3;
            }
  
            const cornerSegment = cornerSegments[cornerIndex];
  
            // Calculate local coordinates within the segment
            const localX = x % segmentWidth;
            const localY = y % segmentHeight;
            const srcIndex = (localY * segmentWidth + localX) * 4;
  
            // Copy the pixel from the corner segment to the main image
            for (let i = 0; i < 4; i++) {
                imageData.data[pixelIndex * 4 + i] = cornerSegment.data[srcIndex + i];
            }
        });
    });
  
    return imageData;
  }