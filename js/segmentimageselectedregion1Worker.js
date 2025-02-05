
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs');
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix');

let net;

async function loadModel() {
  net = await bodyPix.load();
}

loadModel();

self.onmessage = async function(e) {
  const { imageData, imageCount, maxBrightness, selectedRegions } = e.data;
  console.log('selectedRegions :>> ', selectedRegions);

  if (!net) {
    await loadModel();
  }

  const segmentedImages = [];
  const allColoredPixels = new Set();

  const segmentPromises = [];

  for (let i = 0; i < imageCount; i++) {
    segmentPromises.push(processSegment(imageData, allColoredPixels));
  }

  const segmentResults = await Promise.all(segmentPromises);

  segmentResults.forEach(result => {
    segmentedImages.push(...result.newSegments);
    updateSelectedRegions(result.newSegments, selectedRegions);
  });

  // Combine all colored segments into one main image
  const mainSegmentedImage = combineColoredSegments(imageData, allColoredPixels);
  segmentedImages.unshift(mainSegmentedImage);

  // Send all segmented images in a single message
  self.postMessage({ segmentedImages, selectedRegions, isComplete: true });
  console.log('segmentedImages :>> ', segmentedImages);
};



async function processSegment(imageData, allColoredPixels) {
  const offscreen = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = offscreen.getContext('2d');
  ctx.putImageData(imageData, 0, 0);

  const segmentation = await net.segmentPersonParts(offscreen);

  const coloredPartImage = bodyPix.toColoredPartMask(segmentation);

  bodyPix.drawMask(
    offscreen, offscreen, coloredPartImage, 0.7, 0, true
  );

  const segmentedImageData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);

  // Extract unique colored segments
  const newSegments = extractUniqueColoredSegments(segmentedImageData, allColoredPixels);

  return { newSegments };
}

function extractUniqueColoredSegments(imageData, allColoredPixels) {
  const width = imageData.width;
  const height = imageData.height;
  const segments = new Map();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const r = imageData.data[index];
      const g = imageData.data[index + 1];
      const b = imageData.data[index + 2];
      const a = imageData.data[index + 3];

      if (r !== 0 || g !== 0 || b !== 0) {
        const pixelKey = `${x},${y}`;
        if (!allColoredPixels.has(pixelKey)) {
          allColoredPixels.add(pixelKey);
          const colorKey = `${r},${g},${b}`;
          if (!segments.has(colorKey)) {
            segments.set(colorKey, new ImageData(width, height));
          }
          const segmentData = segments.get(colorKey).data;
          segmentData[index] = r;
          segmentData[index + 1] = g;
          segmentData[index + 2] = b;
          segmentData[index + 3] = a;
        }
      }
    }
  }

  return Array.from(segments.values());
}

function updateSelectedRegions(newSegments, selectedRegions) {
  newSegments.forEach(segment => {
    const pixelIndices = [];
    const width = segment.width;
    for (let i = 0; i < segment.data.length; i += 4) {
      if (segment.data[i + 3] > 0) {
        const x = (i / 4) % width;
        const y = Math.floor((i / 4) / width);
        pixelIndices.push(y * width + x);
      }
    }
    if (pixelIndices.length > 0) {
      selectedRegions.push(pixelIndices);
    }
  });
}

// function combineColoredSegments(originalImageData, coloredPixels) {
//   const combinedImage = new ImageData(
//     new Uint8ClampedArray(originalImageData.data),
//     originalImageData.width,
//     originalImageData.height
//   );

//   for (const pixelKey of coloredPixels) {
//     const [x, y] = pixelKey.split(',').map(Number);
//     const index = (y * originalImageData.width + x) * 4;
//     combinedImage.data[index] = originalImageData.data[index];
//     combinedImage.data[index + 1] = originalImageData.data[index + 1];
//     combinedImage.data[index + 2] = originalImageData.data[index + 2];
//     combinedImage.data[index + 3] = originalImageData.data[index + 3];
//   }

//   return combinedImage;
// }

function combineColoredSegments(originalImageData, coloredPixels) {
  const combinedImage = new ImageData(
    new Uint8ClampedArray(originalImageData.data),
    originalImageData.width,
    originalImageData.height
  );

  const width = originalImageData.width;
  const height = originalImageData.height;

  // Create a set of all colored pixels for faster lookup
  const coloredPixelsSet = new Set(coloredPixels);

  // Iterate over the image to add the green border
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;

      // Check if the current pixel is a border pixel
      if (!coloredPixelsSet.has(`${x},${y}`)) {
        const isBorderPixel = (
          (x > 0 && coloredPixelsSet.has(`${x - 1},${y}`)) ||
          (x < width - 1 && coloredPixelsSet.has(`${x + 1},${y}`)) ||
          (y > 0 && coloredPixelsSet.has(`${x},${y - 1}`)) ||
          (y < height - 1 && coloredPixelsSet.has(`${x},${y + 1}`))
        );

        if (isBorderPixel) {
          // Set the border pixel to green
          combinedImage.data[index] = 0; // R
          combinedImage.data[index + 1] = 255; // G
          combinedImage.data[index + 2] = 0; // B
          combinedImage.data[index + 3] = 255; // A
        } else {
          // Copy the original pixel data
          combinedImage.data[index] = originalImageData.data[index];
          combinedImage.data[index + 1] = originalImageData.data[index + 1];
          combinedImage.data[index + 2] = originalImageData.data[index + 2];
          combinedImage.data[index + 3] = originalImageData.data[index + 3];
        }
      } else {
        // Copy the original pixel data for colored pixels
        combinedImage.data[index] = originalImageData.data[index];
        combinedImage.data[index + 1] = originalImageData.data[index + 1];
        combinedImage.data[index + 2] = originalImageData.data[index + 2];
        combinedImage.data[index + 3] = originalImageData.data[index + 3];
      }
    }
  }

  return combinedImage;
}