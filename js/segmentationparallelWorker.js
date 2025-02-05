
// self.onmessage = async function(e) {
//     const { imageData, net, allColoredPixels } = e.data;
  
//     const offscreen = new OffscreenCanvas(imageData.width, imageData.height);
//     const ctx = offscreen.getContext('2d');
//     ctx.putImageData(imageData, 0, 0);
  
//     const segmentation = await net.segmentPersonParts(offscreen);
  
//     const coloredPartImage = bodyPix.toColoredPartMask(segmentation);
  
//     bodyPix.drawMask(
//       offscreen, offscreen, coloredPartImage, 0.7, 0, true
//     );
  
//     const segmentedImageData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
    
//     // Extract unique colored segments
//     const newSegments = extractUniqueColoredSegments(segmentedImageData, allColoredPixels);
    
//     // Update selected regions based on new segments
//     const updatedSelectedRegions = updateSelectedRegions(newSegments, []);
  
//     self.postMessage({ newSegments, updatedSelectedRegions });
//   };

  
// function extractUniqueColoredSegments(imageData, allColoredPixels) {
//     const width = imageData.width;
//     const height = imageData.height;
//     const segments = new Map();
  
//     for (let y = 0; y < height; y++) {
//       for (let x = 0; x < width; x++) {
//         const index = (y * width + x) * 4;
//         const r = imageData.data[index];
//         const g = imageData.data[index + 1];
//         const b = imageData.data[index + 2];
//         const a = imageData.data[index + 3];
  
//         if (r !== 0 || g !== 0 || b !== 0) {
//           const pixelKey = `${x},${y}`;
//           if (!allColoredPixels.has(pixelKey)) {
//             allColoredPixels.add(pixelKey);
//             const colorKey = `${r},${g},${b}`;
//             if (!segments.has(colorKey)) {
//               segments.set(colorKey, new ImageData(width, height));
//             }
//             const segmentData = segments.get(colorKey).data;
//             segmentData[index] = r;
//             segmentData[index + 1] = g;
//             segmentData[index + 2] = b;
//             segmentData[index + 3] = a;
//           }
//         }
//       }
//     }
  
//     return Array.from(segments.values());
//   }
  
//   function updateSelectedRegions(newSegments, selectedRegions) {
//     newSegments.forEach(segment => {
//       const pixelIndices = [];
//       const width = segment.width;
//       for (let i = 0; i < segment.data.length; i += 4) {
//         if (segment.data[i + 3] > 0) {
//           const x = (i / 4) % width;
//           const y = Math.floor((i / 4) / width);
//           pixelIndices.push(y * width + x);
//         }
//       }
//       if (pixelIndices.length > 0) {
//         selectedRegions.push(pixelIndices);
//       }
//     });
//   }
  
//   function combineColoredSegments(originalImageData, coloredPixels) {
//     const combinedImage = new ImageData(
//       new Uint8ClampedArray(originalImageData.data),
//       originalImageData.width,
//       originalImageData.height
//     );
  
//     for (const pixelKey of coloredPixels) {
//       const [x, y] = pixelKey.split(',').map(Number);
//       const index = (y * originalImageData.width + x) * 4;
//       combinedImage.data[index] = originalImageData.data[index];
//       combinedImage.data[index + 1] = originalImageData.data[index + 1];
//       combinedImage.data[index + 2] = originalImageData.data[index + 2];
//       combinedImage.data[index + 3] = originalImageData.data[index + 3];
//     }
  
//     return combinedImage;
//   }


// Extract unique colored segments from the image
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

// Update selected regions with new segments
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

// Combine colored segments with the original image
function combineColoredSegments(originalImageData, coloredPixels) {
  const combinedImage = new ImageData(
      new Uint8ClampedArray(originalImageData.data),
      originalImageData.width,
      originalImageData.height
  );

  for (const pixelKey of coloredPixels) {
      const [x, y] = pixelKey.split(',').map(Number);
      const index = (y * originalImageData.width + x) * 4;
      combinedImage.data[index] = originalImageData.data[index];
      combinedImage.data[index + 1] = originalImageData.data[index + 1];
      combinedImage.data[index + 2] = originalImageData.data[index + 2];
      combinedImage.data[index + 3] = originalImageData.data[index + 3];
  }

  return combinedImage;
}

// Worker message handler
self.onmessage = function (e) {
  const { imageData, selectedRegions, allColoredPixels: allColoredPixelsArray } = e.data;

  // Convert the array back to a Set
  const allColoredPixels = new Set(allColoredPixelsArray);

  try {
      // Step 1: Extract unique colored segments
      const newSegments = extractUniqueColoredSegments(imageData, allColoredPixels);

      // Step 2: Update selected regions with new segments
      updateSelectedRegions(newSegments, selectedRegions);

      // Step 3: Combine colored segments with the original image
      const combinedImage = combineColoredSegments(imageData, allColoredPixels);
      const maxWidth = 1024; // Set your desired maximum width
      const maxHeight = 1024; // Set your desired maximum height
      const resizedImageData = resizeImage(combinedImage, maxWidth, maxHeight);
      // Send the results back to the main thread
      self.postMessage(
          {
            resizedImageData,
              selectedRegions,
              allColoredPixels: Array.from(allColoredPixels), // Convert Set to Array for transfer
          },
          [combinedImage.data.buffer]
      );
  } catch (error) {
      // Handle errors
      self.postMessage({ error: error.message });
  }
};

function resizeImage(image, maxWidth, maxHeight) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  let width = image.width;
  let height = image.height;

  // Calculate the new dimensions while maintaining the aspect ratio
  if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width *= ratio;
      height *= ratio;
  }

  // Set canvas dimensions and draw the resized image
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0, width, height);

  return ctx.getImageData(0, 0, width, height);
}