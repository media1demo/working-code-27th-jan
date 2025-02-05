// Import TensorFlow.js and KNN classifier
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js');
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/knn-classifier');

let classifier;
let model;
let currentIteration = 0;

// Initialize the classifier
async function initializeClassifier() {
    if (!classifier) {
        classifier = knnClassifier.create();
    }
    return classifier;
}

// Convert ImageData to tensor
function imageDataToTensor(imageData) {
    return tf.browser.fromPixels(imageData, 4)
        .expandDims(0)
        .toFloat()
        .div(255.0);
}

// Process selected regions using KNN classifier
async function processRegions(imageData, selectedRegions) {
    const width = imageData.width;
    const height = imageData.height;
    const resultImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );

    // Convert full image to tensor for processing
    const imageTensor = imageDataToTensor(imageData);

    try {
        // Process each selected region
        for (const region of selectedRegions) {
            // Create a mask for the current region
            const mask = new Uint8ClampedArray(width * height).fill(0);
            region.forEach(pixelIndex => {
                mask[pixelIndex] = 1;
            });

            // Convert mask to tensor
            const maskTensor = tf.tensor2d(mask, [height, width])
                .expandDims(-1)
                .expandDims(0);

            // Apply mask to image tensor
            const maskedRegion = imageTensor.mul(maskTensor);

            // Get features for the region
            const prediction = await classifier.predictClass(maskedRegion);

            // Apply different effects based on classification
            if (prediction && prediction.label) {
                const label = parseInt(prediction.label);
                region.forEach(pixelIndex => {
                    const baseIndex = pixelIndex * 4;
                    
                    // Apply different effects based on classification label
                    switch (label) {
                        case 0:
                            // Increase red channel
                            resultImageData.data[baseIndex] = Math.min(255, resultImageData.data[baseIndex] * 1.5);
                            break;
                        case 1:
                            // Increase green channel
                            resultImageData.data[baseIndex + 1] = Math.min(255, resultImageData.data[baseIndex + 1] * 1.5);
                            break;
                        case 2:
                            // Increase blue channel
                            resultImageData.data[baseIndex + 2] = Math.min(255, resultImageData.data[baseIndex + 2] * 1.5);
                            break;
                        default:
                            // Grayscale effect
                            const avg = (resultImageData.data[baseIndex] + 
                                       resultImageData.data[baseIndex + 1] + 
                                       resultImageData.data[baseIndex + 2]) / 3;
                            resultImageData.data[baseIndex] = avg;
                            resultImageData.data[baseIndex + 1] = avg;
                            resultImageData.data[baseIndex + 2] = avg;
                    }
                });
            }

            // Clean up tensors
            maskTensor.dispose();
            maskedRegion.dispose();
        }

        // Clean up main image tensor
        imageTensor.dispose();

        return resultImageData;
    } catch (error) {
        console.error('Error processing regions:', error);
        throw error;
    }
}

// Add example to classifier
async function addExample(imageData, label, selectedRegions) {
    const imageTensor = imageDataToTensor(imageData);
    
    for (const region of selectedRegions) {
        // Create mask for the region
        const mask = new Uint8ClampedArray(imageData.width * imageData.height).fill(0);
        region.forEach(pixelIndex => {
            mask[pixelIndex] = 1;
        });

        const maskTensor = tf.tensor2d(mask, [imageData.height, imageData.width])
            .expandDims(-1)
            .expandDims(0);

        // Apply mask to image tensor
        const maskedRegion = imageTensor.mul(maskTensor);
        
        // Add example to classifier
        classifier.addExample(maskedRegion, label);

        // Clean up tensors
        maskTensor.dispose();
        maskedRegion.dispose();
    }
    
    imageTensor.dispose();
}

// Handle messages from main thread
self.onmessage = async function(e) {
    const { 
        imageData, 
        selectedRegions, 
        action,
        label,
        reset 
    } = e.data;
    
    try {
        // Initialize classifier if needed
        await initializeClassifier();

        if (reset) {
            currentIteration = 0;
            classifier.clearAllClasses();
        }

        let result;
        switch (action) {
            case 'addExample':
                await addExample(imageData, label, selectedRegions);
                result = imageData;
                break;
            
            case 'process':
                result = await processRegions(imageData, selectedRegions);
                break;
            
            default:
                throw new Error(`Unknown action: ${action}`);
        }

        currentIteration++;
        
        self.postMessage({
            segmentedImages: [result],
            isComplete: true,
            iteration: currentIteration
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};