importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs');
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet');

let model;

async function loadMobileNet() {
  model = await mobilenet.load();
}

loadMobileNet();

self.onmessage = async function(e) {
  const { imageData, selectedRegions, imageCount, maxBrightness } = e.data;
  
  if (!model) {
    await loadMobileNet();
  }

  const width = imageData.width;
  const height = imageData.height;

  const segmentedImages = [];

  for (let i = 0; i < imageCount; i++) {
    const tempCanvas = new OffscreenCanvas(width, height);
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    tempCtx.putImageData(imageData, 0, 0);

    const tensor = tf.browser.fromPixels(tempCanvas);
    const predictions = await model.classify(tensor);

    // Draw predictions on the canvas
    tempCtx.font = '12px Arial';
    tempCtx.fillStyle = 'red';
    predictions.forEach((pred, index) => {
      tempCtx.fillText(`${pred.className}: ${pred.probability.toFixed(2)}`, 10, 20 + index * 20);
    });

    const newImageData = tempCtx.getImageData(0, 0, width, height);
    segmentedImages.push(newImageData);

    // Report progress
    self.postMessage({
      segmentedImages: [newImageData],
      isComplete: false
    });

    tensor.dispose();
  }

  // Send final message
  self.postMessage({
    segmentedImages,
    isComplete: true
  });
};