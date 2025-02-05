importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs');
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix');

let net;

async function loadModel() {
  net = await bodyPix.load();
}

loadModel();

self.onmessage = async function(e) {
  const { imageData, imageCount, maxBrightness, selectedRegions } = e.data;

  if (!net) {
    await loadModel();
  }

  const segmentedImages = [];
  const allColoredPixels = new Set();

  // Create a pool of Web Workers
  const workerCount = navigator.hardwareConcurrency || 4; // Use available cores or default to 4
  const workers = [];
  for (let i = 0; i < workerCount; i++) {
    workers.push(new Worker('segmentationparallelWorker.js'));
  }

  // Process images in parallel
  const promises = [];
  for (let i = 0; i < imageCount; i++) {
    const worker = workers[i % workerCount];
    promises.push(new Promise((resolve) => {
      worker.onmessage = (event) => {
        const { newSegments, updatedSelectedRegions } = event.data;
        segmentedImages.push(...newSegments);
        updateSelectedRegions(updatedSelectedRegions, selectedRegions);
        resolve();
      };
      worker.postMessage({ imageData, net, allColoredPixels });
    }));
  }

  // Wait for all workers to complete
  await Promise.all(promises);

  // Terminate workers
  workers.forEach(worker => worker.terminate());

  // Combine all colored segments into one main image
  const mainSegmentedImage = combineColoredSegments(imageData, allColoredPixels);
  
  segmentedImages.unshift(mainSegmentedImage);

  self.postMessage({ segmentedImages, selectedRegions, isComplete: true });

  setTimeout(() => {
    self.postMessage({ newregionneedtosend: selectedRegions, isComplete: false });
  }, 4000);
};


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