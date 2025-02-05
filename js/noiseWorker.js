// Image processing worker
self.onmessage = function(e) {
    const { imageData, selectedRegions } = e.data;
  
    // Convert selectedRegions to a mask
    const mask = createMaskFromRegions(imageData.width, imageData.height, selectedRegions);
  
    // Perform background-based object removal
    const resultImageData = removeObjectWithBackground(imageData, mask);
  
    // Post the result back to the main thread
    self.postMessage({
      segmentedImages: [resultImageData],
      isComplete: true
    });
  };
  
  function createMaskFromRegions(width, height, selectedRegions) {
    const mask = new Uint8Array(width * height);
    selectedRegions.forEach(region => {
      region.forEach(pixelIndex => {
        mask[pixelIndex] = 255;
      });
    });
    return mask;
  }
  
  function removeObjectWithBackground(imageData, mask) {
    const width = imageData.width;
    const height = imageData.height;
    const result = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
  
    // Step 1: Find the bounding box of the selected region
    const boundingBox = findBoundingBox(mask, width, height);
  
    // Step 2: Expand the bounding box
    const expandedBox = expandBoundingBox(boundingBox, width, height, 20);
  
    // Step 3: Sample background pixels around the expanded bounding box
    const backgroundSamples = sampleBackground(result, mask, expandedBox, width, height);
  
    // Step 4: Fill the selected region with sampled background
    fillRegionWithBackground(result, mask, backgroundSamples, width, height);
  
    return result;
  }
  
  function findBoundingBox(mask, width, height) {
    let minX = width, minY = height, maxX = 0, maxY = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (mask[y * width + x] === 255) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
    return { minX, minY, maxX, maxY };
  }
  
  function expandBoundingBox(box, width, height, expansion) {
    return {
      minX: Math.max(0, box.minX - expansion),
      minY: Math.max(0, box.minY - expansion),
      maxX: Math.min(width - 1, box.maxX + expansion),
      maxY: Math.min(height - 1, box.maxY + expansion)
    };
  }
  
  function sampleBackground(imageData, mask, box, width, height) {
    const samples = [];
    for (let y = box.minY; y <= box.maxY; y++) {
      for (let x = box.minX; x <= box.maxX; x++) {
        if (mask[y * width + x] === 0) {
          const index = (y * width + x) * 4;
          samples.push({
            r: imageData.data[index],
            g: imageData.data[index + 1],
            b: imageData.data[index + 2],
            a: imageData.data[index + 3]
          });
        }
      }
    }
    return samples;
  }
  
  function fillRegionWithBackground(imageData, mask, samples, width, height) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (mask[y * width + x] === 255) {
          const index = (y * width + x) * 4;
          const sample = samples[Math.floor(Math.random() * samples.length)];
          imageData.data[index] = sample.r;
          imageData.data[index + 1] = sample.g;
          imageData.data[index + 2] = sample.b;
          imageData.data[index + 3] = sample.a;
        }
      }
    }
  }