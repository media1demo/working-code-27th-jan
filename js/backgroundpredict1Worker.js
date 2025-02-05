// // // backgroundPredictWorker.js

// // self.onmessage = function(e) {
// //     // const {
// //     //     imageData,
// //     //     selectedRegions
// //     // } = e.data;

// //     const { imageData, selectedRegions, width, height, type, numberOfVariations } = e.data;

// //     if (!imageData || !selectedRegions) {
// //         self.postMessage({
// //             error: "Missing required data. Please provide both imageData and selectedRegions.",
// //             isComplete: true
// //         });
// //         return;
// //     }

// //     // const width = imageData.width;
// //     // const height = imageData.height;

// //     if (!width || !height) {
// //         self.postMessage({
// //             error: "Invalid image data. Width or height is missing.",
// //             isComplete: true
// //         });
// //         return;
// //     }

// //     try {
// //         const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);

// //         // Create a map of selected pixels for faster lookups
// //         const selectedPixels = new Set(selectedRegions.flat());

// //         // Collect background pixels
// //         const backgroundPixels = collectBackgroundPixels(imageData, selectedPixels, width, height);

// //         // Process the image
// //         for (let y = 0; y < height; y++) {
// //             for (let x = 0; x < width; x++) {
// //                 const pixelIndex = y * width + x;
// //                 if (selectedPixels.has(pixelIndex)) {
// //                     const backgroundColor = getRandomBackgroundPixel(backgroundPixels);
// //                     const i = pixelIndex * 4;
// //                     newImageData.data[i] = backgroundColor[0];
// //                     newImageData.data[i + 1] = backgroundColor[1];
// //                     newImageData.data[i + 2] = backgroundColor[2];
// //                     newImageData.data[i + 3] = backgroundColor[3];
// //                 }
// //             }
// //         }

// //         self.postMessage({
// //             segmentedImages: [newImageData],
// //             isComplete: true
// //         });
// //     } catch (error) {
// //         self.postMessage({
// //             error: "An error occurred during processing: " + error.message,
// //             isComplete: true
// //         });
// //     }
// // };

// // function collectBackgroundPixels(imageData, selectedPixels, width, height) {
// //     const backgroundPixels = [];
// //     for (let y = 0; y < height; y++) {
// //         for (let x = 0; x < width; x++) {
// //             const pixelIndex = y * width + x;
// //             if (!selectedPixels.has(pixelIndex)) {
// //                 const i = pixelIndex * 4;
// //                 backgroundPixels.push([
// //                     imageData.data[i],
// //                     imageData.data[i + 1],
// //                     imageData.data[i + 2],
// //                     imageData.data[i + 3]
// //                 ]);
// //             }
// //         }
// //     }
// //     return backgroundPixels;
// // }

// // function getRandomBackgroundPixel(backgroundPixels) {
// //     if (backgroundPixels.length === 0) {
// //         return [128, 128, 128, 255]; // Fallback to gray if no background pixels
// //     }
// //     return backgroundPixels[Math.floor(Math.random() * backgroundPixels.length)];
// // }


// // Worker code (running2Worker.js)
// self.onmessage = function(e) {
//     const { imageData, selectedRegions, width, height, type, numberOfVariations } = e.data;

//     if (!imageData || !width || !height) {
//         self.postMessage({
//             error: "Invalid image data. Required parameters missing.",
//             isComplete: true
//         });
//         return;
//     }

//     try {
//         const variations = [];
        
//         // Generate variations based on numberOfVariations
//         for (let i = 0; i < numberOfVariations; i++) {
//             const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
            
//             // Process the image data based on your requirements
//             // This is where you'd put your image processing logic
            
//             variations.push({
//                 imageData: newImageData,
//                 width: width,
//                 height: height,
//                 variationIndex: i
//             });
//         }

//         self.postMessage({
//             type: 'processedVariations',
//             variations: variations,
//             isComplete: true
//         });
//     } catch (error) {
//         self.postMessage({
//             error: "Processing error: " + error.message,
//             isComplete: true
//         });
//     }
// };

// // Main code
// function initializeWorkers() {
//     const workersToUse = [];
//     if (hasLegParts) {
//         const legWorker = new Worker('legworker.js');
//         workersToUse.push({
//             worker: legWorker,
//             type: 'leg'
//         });
//     }

//     const numberOfVariations = parseInt(document.getElementById('imageCount').value);
    
//     return { workersToUse, numberOfVariations };
// }

// function processWorkerResults() {
//     const { workersToUse, numberOfVariations } = initializeWorkers();
//     const totalworkerimages = 2 * numberOfVariations;
//     let combinedImagesProcessed = 0;
//     const processedPairs = new Set();

//     // Create worker messages
//     const workerMessages = workersToUse.map(({type}) => ({
//         type,
//         imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
//         width: canvas.width,
//         height: canvas.height,
//         numberOfVariations
//     }));

//     // Process worker results
//     return Promise.allSettled(
//         workersToUse.map(({ worker }, index) =>
//             new Promise((resolve, reject) => {
//                 worker.onmessage = (e) => {
//                     if (e.data.type === 'processedVariations') {
//                         if (!e.data.variations || e.data.variations.length === 0) {
//                             console.warn(`No variations received from ${workersToUse[index].type} worker`);
//                             resolve(null);
//                             return;
//                         }

//                         const processedVariations = e.data.variations.map((variation, variationIndex) => {
//                             const imageUrl = convertImageDataToUrl(
//                                 variation.imageData,
//                                 variation.width,
//                                 variation.height
//                             );

//                             // Create and display the image
//                             const imageInfo = {
//                                 index: variationIndex,
//                                 type: workersToUse[index].type,
//                                 imageUrl: imageUrl,
//                                 imageData: variation.imageData,
//                                 width: variation.width,
//                                 height: variation.height
//                             };

//                             // Add to generated images
//                             generatedImages.push(imageInfo);

//                             // Create and display the image element
//                             displayImage(imageInfo);

//                             return imageInfo;
//                         });

//                         resolve(processedVariations);
                        
//                         // Attempt to combine images after processing
//                         attemptCombination();
//                     }
//                 };

//                 worker.onerror = reject;
//                 worker.postMessage(workerMessages[index]);
//             })
//         )
//     );
// }

// function displayImage(imageInfo) {
//     const wrapper = document.createElement('div');
//     wrapper.className = 'image-wrapper1';

//     const img = new Image();
//     img.src = imageInfo.imageUrl;
//     img.onload = () => {
//         wrapper.appendChild(img);
        
//         const container = document.getElementById('imageContainer');
//         container.appendChild(wrapper);
        
//         // Update canvas display
//         displayImagesOnCanvases();
//     };
// }

// function displayImagesOnCanvases() {
//     const canvasContainer = document.getElementById('canvasContainer');
//     canvasContainer.innerHTML = '';

//     generatedImages.forEach((imageData, index) => {
//         const wrapper = document.createElement('div');
//         wrapper.className = 'canvas-wrapper';

//         const canvas = document.createElement('canvas');
//         canvas.width = imageData.width;
//         canvas.height = imageData.height;
//         canvas.id = `canvas-${index}`;

//         const ctx = canvas.getContext('2d');
//         const img = new Image();
        
//         img.onload = () => {
//             ctx.drawImage(img, 0, 0);
//             canvasImages.push({
//                 canvas: canvas,
//                 imageData: imageData
//             });
//         };
        
//         img.src = imageData.imageUrl;

//         const infoP = document.createElement('p');
//         infoP.textContent = `Canvas ${index + 1} - Type: ${imageData.type}, Width: ${imageData.width}, Height: ${imageData.height}`;

//         wrapper.appendChild(canvas);
//         wrapper.appendChild(infoP);
//         canvasContainer.appendChild(wrapper);
//     });
// }

// Worker code (running2Worker.js)
self.onmessage = function(e) {
    const { imageData, selectedRegions, width, height, type, numberOfVariations } = e.data;

    if (!imageData || !width || !height) {
        self.postMessage({
            error: "Invalid image data. Required parameters missing.",
            isComplete: true
        });
        return;
    }

    try {
        const variations = [];
        
        // Generate variations based on numberOfVariations
        for (let i = 0; i < numberOfVariations; i++) {
            const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
            
            // Process the image data based on your requirements
            // This is where you'd put your image processing logic
            
            variations.push({
                imageData: newImageData,
                width: width,
                height: height,
                variationIndex: i
            });
        }

        self.postMessage({
            type: 'processedVariations',
            variations: variations,
            isComplete: true
        });
    } catch (error) {
        self.postMessage({
            error: "Processing error: " + error.message,
            isComplete: true
        });
    }
};

// Main code
function initializeWorkers() {
    const workersToUse = [];
    if (hasLegParts) {
        const legWorker = new Worker('legworker.js');
        workersToUse.push({
            worker: legWorker,
            type: 'leg'
        });
    }

    const numberOfVariations = parseInt(document.getElementById('imageCount').value);
    
    return { workersToUse, numberOfVariations };
}

function processWorkerResults() {
    const { workersToUse, numberOfVariations } = initializeWorkers();
    const totalworkerimages = 2 * numberOfVariations;
    let combinedImagesProcessed = 0;
    const processedPairs = new Set();

    // Create worker messages
    const workerMessages = workersToUse.map(({type}) => ({
        type,
        imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
        width: canvas.width,
        height: canvas.height,
        numberOfVariations
    }));

    // Process worker results
    return Promise.allSettled(
        workersToUse.map(({ worker }, index) =>
            new Promise((resolve, reject) => {
                worker.onmessage = (e) => {
                    if (e.data.type === 'processedVariations') {
                        if (!e.data.variations || e.data.variations.length === 0) {
                            console.warn(`No variations received from ${workersToUse[index].type} worker`);
                            resolve(null);
                            return;
                        }

                        const processedVariations = e.data.variations.map((variation, variationIndex) => {
                            const imageUrl = convertImageDataToUrl(
                                variation.imageData,
                                variation.width,
                                variation.height
                            );

                            // Create and display the image
                            const imageInfo = {
                                index: variationIndex,
                                type: workersToUse[index].type,
                                imageUrl: imageUrl,
                                imageData: variation.imageData,
                                width: variation.width,
                                height: variation.height
                            };

                            // Add to generated images
                            generatedImages.push(imageInfo);

                            // Create and display the image element
                            displayImage(imageInfo);

                            return imageInfo;
                        });

                        resolve(processedVariations);
                        
                        // Attempt to combine images after processing
                        attemptCombination();
                    }
                };

                worker.onerror = reject;
                worker.postMessage(workerMessages[index]);
            })
        )
    );
}

function displayImage(imageInfo) {
    const wrapper = document.createElement('div');
    wrapper.className = 'image-wrapper1';

    const img = new Image();
    img.src = imageInfo.imageUrl;
    img.onload = () => {
        wrapper.appendChild(img);
        
        const container = document.getElementById('imageContainer');
        container.appendChild(wrapper);
        
        // Update canvas display
        displayImagesOnCanvases();
    };
}

function displayImagesOnCanvases() {
    const canvasContainer = document.getElementById('canvasContainer');
    canvasContainer.innerHTML = '';

    generatedImages.forEach((imageData, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'canvas-wrapper';

        const canvas = document.createElement('canvas');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        canvas.id = `canvas-${index}`;

        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            canvasImages.push({
                canvas: canvas,
                imageData: imageData
            });
        };
        
        img.src = imageData.imageUrl;

        const infoP = document.createElement('p');
        infoP.textContent = `Canvas ${index + 1} - Type: ${imageData.type}, Width: ${imageData.width}, Height: ${imageData.height}`;

        wrapper.appendChild(canvas);
        wrapper.appendChild(infoP);
        canvasContainer.appendChild(wrapper);
    });
}