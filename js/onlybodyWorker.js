// segmentimageWorker.js
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs');
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix');

let model;

async function loadModel() {
  model = await bodyPix.load();
}

loadModel();

self.onmessage = async function(e) {
  if (!model) {
    await loadModel();
  }

  const { imageData, imageCount } = e.data;
  
  const segmentation = await model.segmentPerson(imageData);
  
  const segmentedImages = [];
  for (let i = 0; i < imageCount; i++) {
    const maskImage = await bodyPix.toMask(segmentation);
    const segmentedImageData = new ImageData(
      maskImage.data,
      imageData.width,
      imageData.height
    );
    segmentedImages.push(segmentedImageData);
  }

  self.postMessage({ segmentedImages, isComplete: true });
};