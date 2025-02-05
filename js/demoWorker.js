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

  let mask = new Uint8Array(width * height);
  selectedRegions.flat().forEach(pixel => mask[pixel] = 1);

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

  // Perform seam carving only within the selected region
  const regionWidth = maxX - minX + 1;
  const regionHeight = maxY - minY + 1;

  // Extract the region to be processed
  let regionData = extractRegion(image, minX, minY, regionWidth, regionHeight);
  let regionMask = extractRegion({ data: mask, width, height }, minX, minY, regionWidth, regionHeight);

  // Remove vertical seams
  while (regionData.width > 1) {
    const energy = computeEnergy(regionData, regionMask.data);
    const seam = findVerticalSeam(energy, regionData.width, regionData.height);
    regionData = removeVerticalSeam(regionData, seam);
    regionMask = removeVerticalSeam(regionMask, seam);
  }

  // Remove horizontal seams
  while (regionData.height > 1) {
    const energy = computeEnergy(regionData, regionMask.data);
    const seam = findHorizontalSeam(energy, regionData.width, regionData.height);
    regionData = removeHorizontalSeam(regionData, seam);
    regionMask = removeHorizontalSeam(regionMask, seam);
  }

  // Merge the processed region back into the original image
  image = mergeRegion(image, regionData, minX, minY);

  // Send the processed image back to the main thread
  self.postMessage({ segmentedImages: [image], isComplete: true });
};


function extractRegion(image, x, y, width, height) {
  const { data, width: fullWidth } = image;
  const newData = new Uint8ClampedArray(width * height * 4);

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const srcIdx = ((y + i) * fullWidth + (x + j)) * 4;
      const destIdx = (i * width + j) * 4;
      newData[destIdx] = data[srcIdx];
      newData[destIdx + 1] = data[srcIdx + 1];
      newData[destIdx + 2] = data[srcIdx + 2];
      newData[destIdx + 3] = data[srcIdx + 3];
    }
  }

  return new ImageData(newData, width, height);
}



function mergeRegion(originalImage, processedRegion, x, y) {
  const { width: origWidth, height: origHeight, data: origData } = originalImage;
  const { width: procWidth, height: procHeight, data: procData } = processedRegion;
  const newData = new Uint8ClampedArray(origData);

  // Fill the processed region with transparent pixels (alpha = 0)
  for (let i = 0; i < origHeight; i++) {
    for (let j = 0; j < origWidth; j++) {
      if (i >= y && i < y + procHeight && j >= x && j < x + procWidth) {
        const destIdx = (i * origWidth + j) * 4;
        newData[destIdx + 3] = 0; // Set alpha to 0 (fully transparent)
      }
    }
  }

  return new ImageData(newData, origWidth, origHeight);
}


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
      let minPrevX = x;

      if (x > 0 && dp[idx - width - 1] < minEnergy) {
        minEnergy = dp[idx - width - 1];
        minPrevX = x - 1;
      }
      if (x < width - 1 && dp[idx - width + 1] < minEnergy) {
        minEnergy = dp[idx - width + 1];
        minPrevX = x + 1;
      }

      dp[idx] = minEnergy + energy[idx];
      backtrack[idx] = minPrevX;
    }
  }

  // Find the end of the seam
  let minEnergy = Infinity;
  let seamEndX = 0;
  for (let x = 0; x < width; x++) {
    const idx = (height - 1) * width + x;
    if (dp[idx] < minEnergy) {
      minEnergy = dp[idx];
      seamEndX = x;
    }
  }

  // Backtrack to find the seam
  const seam = new Int32Array(height);
  let x = seamEndX;
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
      let minPrevY = y;

      if (y > 0 && dp[idx - width - 1] < minEnergy) {
        minEnergy = dp[idx - width - 1];
        minPrevY = y - 1;
      }
      if (y < height - 1 && dp[idx + width - 1] < minEnergy) {
        minEnergy = dp[idx + width - 1];
        minPrevY = y + 1;
      }

      dp[idx] = minEnergy + energy[idx];
      backtrack[idx] = minPrevY;
    }
  }

  // Find the end of the seam
  let minEnergy = Infinity;
  let seamEndY = 0;
  for (let y = 0; y < height; y++) {
    const idx = y * width + width - 1;
    if (dp[idx] < minEnergy) {
      minEnergy = dp[idx];
      seamEndY = y;
    }
  }

  // Backtrack to find the seam
  const seam = new Int32Array(width);
  let y = seamEndY;
  for (let x = width - 1; x >= 0; x--) {
    seam[x] = y;
    y = backtrack[y * width + x];
  }

  return seam;
}

function removeVerticalSeam(image, seam) {
  const { width, height, data } = image;
  const newWidth = width - 1;
  
  if (newWidth < 1) {
    console.warn('Cannot remove more vertical seams. Image width is already at minimum.');
    return image; // Return the original image data
  }
  
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

  console.log('New dimensions:', newWidth, 'x', height);
  return new ImageData(newData, newWidth, height);
}

function removeHorizontalSeam(image, seam) {
  const { width, height, data } = image;
  const newHeight = height - 1;
  
  if (newHeight < 1) {
    console.warn('Cannot remove more horizontal seams. Image height is already at minimum.');
    return image; // Return the original image data
  }
  
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
  
  console.log('New dimensions:', width, 'x', newHeight);
  return new ImageData(newData, width, newHeight);
}

function updateMask(mask, seam, newWidth, height, minX, minY) {
  const newMask = new Uint8Array(newWidth * height);

  for (let y = 0; y < height; y++) {
    const seamX = seam[y];
    for (let x = 0; x < newWidth; x++) {
      const oldIdx = (y + minY) * (newWidth + 1) + minX + (x < seamX ? x : x + 1);
      const newIdx = y * newWidth + x;
      newMask[newIdx] = mask[oldIdx];
    }
  }

  return newMask;
}

function updateMaskHorizontal(mask, seam, width, newHeight, minX, minY) {
  const newMask = new Uint8Array(width * newHeight);

  for (let x = 0; x < width; x++) {
    const seamY = seam[x];
    for (let y = 0; y < newHeight; y++) {
      const oldIdx = (minY + (y < seamY ? y : y + 1)) * mask.width + minX + x;
      const newIdx = y * width + x;
      newMask[newIdx] = mask[oldIdx];
    }
  }

  return newMask;
}