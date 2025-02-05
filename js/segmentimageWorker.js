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

  for (let i = 0; i < imageCount; i++) {
    // Create an offscreen canvas
    const offscreen = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = offscreen.getContext('2d');
    ctx.putImageData(imageData, 0, 0);

    // Perform segmentation
    const segmentation = await net.segmentPersonParts(offscreen);
    
    // Create colored mask
    const coloredPartImage = bodyPix.toColoredPartMask(segmentation);

    // Draw mask on canvas
    bodyPix.drawMask(
      offscreen, offscreen, coloredPartImage, 0.7, 0, false
    );

    // Get the resulting ImageData
    const segmentedImageData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);

    // Update selected regions based on the segmented image
    updateSelectedRegions(segmentedImageData, selectedRegions);

    segmentedImages.push(segmentedImageData);
  }

  // console.log('selectedRegions :>> ', selectedRegions);
  // Post the segmented images and updated selected regions back to the main thread
  self.postMessage({ segmentedImages, selectedRegions, isComplete: true });


  setTimeout(() => {
    self.postMessage({ newregionneedtosend, isComplete: false });

    // self.postMessage({ segmentedImages, selectedRegions, isComplete: true });
    // console.log(newregionneedtosend);
  }, 4000);
};

function updateSelectedRegions(segmentedImageData, selectedRegions) {
  const width = segmentedImageData.width;
  const height = segmentedImageData.height;

  // Create a map to store pixels for each segment
  const segmentMap = new Map();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const r = segmentedImageData.data[index];
      const g = segmentedImageData.data[index + 1];
      const b = segmentedImageData.data[index + 2];
      const a = segmentedImageData.data[index + 3];

      // Check if the pixel is part of a colored segment
      if (r !== 0 || g !== 0 || b !== 0) {
        // Create a unique key for the segment
        const segmentKey = `${r},${g},${b}`;

        // Add the pixel to the corresponding segment in the map
        if (!segmentMap.has(segmentKey)) {
          segmentMap.set(segmentKey, []);
        }
        segmentMap.get(segmentKey).push(y * width + x);
      }
    }
  }

  // Add each segment to the selected regions
  for (const segmentPixels of segmentMap.values()) {
    selectedRegions.push(segmentPixels);
  }
  newregionneedtosend= selectedRegions;
 

}