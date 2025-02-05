self.onmessage = function(e) {
    const { imageData, selectedRegions } = e.data;
    const width = imageData.width;
    const height = imageData.height;
  
    // Create a copy of the image data
    let image = new ImageData(
      new Uint8ClampedArray(imageData.data),
      width,
      height
    );
  
    // Create a mask for selected pixels
    let mask = new Uint8Array(width * height);
    selectedRegions.flat().forEach(pixel => mask[pixel] = 1);
  
    // Find the boundaries of the selected region
    let minX = width, maxX = 0, minY = height, maxY = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (mask[y * width + x] === 1) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }
  
    // Remove the selected region
    const newWidth = width - (maxX - minX + 1);
    const newHeight = height - (maxY - minY + 1);
    const newData = new Uint8ClampedArray(newWidth * newHeight * 4);
  
    let newIndex = 0;
    for (let y = 0; y < height; y++) {
      if (y >= minY && y <= maxY) continue; // Skip rows in the selected region
      for (let x = 0; x < width; x++) {
        if (x >= minX && x <= maxX) continue; // Skip columns in the selected region
        const oldIndex = (y * width + x) * 4;
        newData[newIndex++] = image.data[oldIndex];
        newData[newIndex++] = image.data[oldIndex + 1];
        newData[newIndex++] = image.data[oldIndex + 2];
        newData[newIndex++] = image.data[oldIndex + 3];
      }
    }
  
    const newImage = new ImageData(newData, newWidth, newHeight);
  
    // Send the processed image back to the main thread
    self.postMessage({ segmentedImages: [newImage], isComplete: true });
  };
  
  
  
  function computeEnergy(image, mask) {
    const { width, height, data } = image;
    const energy = new Uint32Array(width * height);
  
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (mask[y * width + x] === 1) {
          energy[y * width + x] = 0; // Encourage seam to pass through selected region
        } else {
          const left = x > 0 ? getPixel(data, x - 1, y, width) : getPixel(data, x, y, width);
          const right = x < width - 1 ? getPixel(data, x + 1, y, width) : getPixel(data, x, y, width);
          const up = y > 0 ? getPixel(data, x, y - 1, width) : getPixel(data, x, y, width);
          const down = y < height - 1 ? getPixel(data, x, y + 1, width) : getPixel(data, x, y, width);
  
          const dx = Math.abs(left.r - right.r) + Math.abs(left.g - right.g) + Math.abs(left.b - right.b);
          const dy = Math.abs(up.r - down.r) + Math.abs(up.g - down.g) + Math.abs(up.b - down.b);
  
          energy[y * width + x] = dx + dy;
        }
      }
    }
  
    return energy;
  }
  
  function getPixel(data, x, y, width) {
    const i = (y * width + x) * 4;
    return { r: data[i], g: data[i + 1], b: data[i + 2] };
  }
  
  function findVerticalSeam(energy, width, height) {
    const dp = new Uint32Array(width * height);
    const backtrack = new Int32Array(width * height);
  
    // Initialize first row
    for (let x = 0; x < width; x++) {
      dp[x] = energy[x];
    }
  
    // Dynamic programming to find the minimum energy path
    for (let y = 1; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        let minEnergy = dp[idx - width];
        let minX = x;
  
        if (x > 0 && dp[idx - width - 1] < minEnergy) {
          minEnergy = dp[idx - width - 1];
          minX = x - 1;
        }
        if (x < width - 1 && dp[idx - width + 1] < minEnergy) {
          minEnergy = dp[idx - width + 1];
          minX = x + 1;
        }
  
        dp[idx] = minEnergy + energy[idx];
        backtrack[idx] = minX;
      }
    }
  
    // Find the end of the seam
    let minEnergy = Infinity;
    let minX = 0;
    for (let x = 0; x < width; x++) {
      const idx = (height - 1) * width + x;
      if (dp[idx] < minEnergy) {
        minEnergy = dp[idx];
        minX = x;
      }
    }
  
    // Backtrack to find the seam
    const seam = new Int32Array(height);
    let x = minX;
    for (let y = height - 1; y >= 0; y--) {
      seam[y] = x;
      x = backtrack[y * width + x];
    }
  
    return seam;
  }
  
  function findHorizontalSeam(energy, width, height) {
    const dp = new Uint32Array(width * height);
    const backtrack = new Int32Array(width * height);
  
    // Initialize first column
    for (let y = 0; y < height; y++) {
      dp[y * width] = energy[y * width];
    }
  
    // Dynamic programming to find the minimum energy path
    for (let x = 1; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const idx = y * width + x;
        let minEnergy = dp[idx - 1];
        let minY = y;
  
        if (y > 0 && dp[idx - width - 1] < minEnergy) {
          minEnergy = dp[idx - width - 1];
          minY = y - 1;
        }
        if (y < height - 1 && dp[idx + width - 1] < minEnergy) {
          minEnergy = dp[idx + width - 1];
          minY = y + 1;
        }
  
        dp[idx] = minEnergy + energy[idx];
        backtrack[idx] = minY;
      }
    }
  
    // Find the end of the seam
    let minEnergy = Infinity;
    let minY = 0;
    for (let y = 0; y < height; y++) {
      const idx = y * width + width - 1;
      if (dp[idx] < minEnergy) {
        minEnergy = dp[idx];
        minY = y;
      }
    }
  
    // Backtrack to find the seam
    const seam = new Int32Array(width);
    let y = minY;
    for (let x = width - 1; x >= 0; x--) {
      seam[x] = y;
      y = backtrack[y * width + x];
    }
  
    return seam;
  }
  
  function removeVerticalSeam(image, seam) {
    const { width, height, data } = image;
    const newWidth = width - 1;
    const newData = new Uint8ClampedArray(newWidth * height * 4);
  
    for (let y = 0; y < height; y++) {
      const seamX = seam[y];
      for (let x = 0; x < newWidth; x++) {
        const oldIdx = (y * width + (x < seamX ? x : x + 1)) * 4;
        const newIdx = (y * newWidth + x) * 4;
        newData[newIdx] = data[oldIdx];
        newData[newIdx + 1] = data[oldIdx + 1];
        newData[newIdx + 2] = data[oldIdx + 2];
        newData[newIdx + 3] = data[oldIdx + 3];
      }
    }
  
    return new ImageData(newData, newWidth, height);
  }
  
  function removeHorizontalSeam(image, seam) {
    const { width, height, data } = image;
    const newHeight = height - 1;
    const newData = new Uint8ClampedArray(width * newHeight * 4);
  
    for (let x = 0; x < width; x++) {
      const seamY = seam[x];
      for (let y = 0; y < newHeight; y++) {
        const oldIdx = ((y < seamY ? y : y + 1) * width + x) * 4;
        const newIdx = (y * width + x) * 4;
        newData[newIdx] = data[oldIdx];
        newData[newIdx + 1] = data[oldIdx + 1];
        newData[newIdx + 2] = data[oldIdx + 2];
        newData[newIdx + 3] = data[oldIdx + 3];
      }
    }
  
    return new ImageData(newData, width, newHeight);
  }
  
  function updateMask(mask, seam, newWidth, height) {
    const newMask = new Uint8Array(newWidth * height);
  
    for (let y = 0; y < height; y++) {
      const seamX = seam[y];
      for (let x = 0; x < newWidth; x++) {
        const oldIdx = y * (newWidth + 1) + (x < seamX ? x : x + 1);
        const newIdx = y * newWidth + x;
        newMask[newIdx] = mask[oldIdx];
      }
    }
  
    return newMask;
  }
  
  function updateMaskHorizontal(mask, seam, width, newHeight) {
    const newMask = new Uint8Array(width * newHeight);
  
    for (let x = 0; x < width; x++) {
      const seamY = seam[x];
      for (let y = 0; y < newHeight; y++) {
        const oldIdx = (y < seamY ? y : y + 1) * width + x;
        const newIdx = y * width + x;
        newMask[newIdx] = mask[oldIdx];
      }
    }
  
    return newMask;
  }