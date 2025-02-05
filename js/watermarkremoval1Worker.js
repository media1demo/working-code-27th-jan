// importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.11.0/dist/tf.min.js');
// importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.2/dist/coco-ssd.min.js');

// importScripts('https://unpkg.com/tesseract.js@v2.1.0/dist/tesseract.min.js');

// // importScripts('https://cdnjs.cloudflare.com/ajax/libs/opencv.js/4.5.2/opencv.min.js');
// // importScripts('https://cdn.jsdelivr.net/npm/@techstark/opencv-js@4.5.5-release.1/opencv.js');
// // importScripts('/tf.min.js');
// // importScripts('/coco-ssd.min.js');
// // importScripts('./tesseract.min.js');
// // importScripts('/opencv.min.js');



// let model;
// let tesseract;

// async function loadModels() {
//     model = await cocoSsd.load();
//     tesseract = await Tesseract.createWorker();
//     await tesseract.loadLanguage('eng');
//     await tesseract.initialize('eng');
//     console.log('Models loaded');
// }

// loadModels();

// async function detectTextRegions(imageData) {
//     console.log("Detecting text regions");
//     const tensor = tf.browser.fromPixels(imageData);
//     const cocoDetections = await model.detect(tensor);
    
//     const tesseractResult = await tesseract.recognize(imageData);
//     const tesseractDetections = tesseractResult.data.words.map(word => ({
//         bbox: [word.bbox.x0, word.bbox.y0, word.bbox.x1 - word.bbox.x0, word.bbox.y1 - word.bbox.y0],
//         class: 'text',
//         score: word.confidence
//     }));

//     const opencvDetections = await detectTextOpenCV(imageData);

//     const allDetections = [...cocoDetections, ...tesseractDetections, ...opencvDetections];
//     tensor.dispose();

//     return allDetections;
// }

// async function detectTextOpenCV(imageData) {
//     return new Promise(resolve => {
//         cv.onRuntimeInitialized = () => {
//             const src = cv.matFromImageData(imageData);
//             const gray = new cv.Mat();
//             cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
//             const binary = new cv.Mat();
//             cv.threshold(gray, binary, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);
//             const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));
//             const morph = new cv.Mat();
//             cv.morphologyEx(binary, morph, cv.MORPH_CLOSE, kernel);
//             const contours = new cv.MatVector();
//             const hierarchy = new cv.Mat();
//             cv.findContours(morph, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

//             const detections = [];
//             for (let i = 0; i < contours.size(); ++i) {
//                 const rect = cv.boundingRect(contours.get(i));
//                 detections.push({
//                     bbox: [rect.x, rect.y, rect.width, rect.height],
//                     class: 'text',
//                     score: 0.5
//                 });
//             }

//             src.delete(); gray.delete(); binary.delete(); morph.delete(); contours.delete(); hierarchy.delete();
//             resolve(detections);
//         };
//     });
// }

// function removeText(imageData, textRegions) {
//     console.log("Removing text");
//     const data = new Uint8ClampedArray(imageData.data);
//     const width = imageData.width;
//     const height = imageData.height;

//     textRegions.forEach(region => {
//         console.log('Detected object:', region.class);


//         const [x, y, w, h] = region.bbox.map(Math.round);
//         const patchSize = 5;

//         for (let i = x; i < x + w; i++) {
//             for (let j = y; j < y + h; j++) {
//                 let sumR = 0, sumG = 0, sumB = 0, count = 0;

//                 for (let pi = -patchSize; pi <= patchSize; pi++) {
//                     for (let pj = -patchSize; pj <= patchSize; pj++) {
//                         const ni = i + pi;
//                         const nj = j + pj;
//                         if (ni >= 0 && ni < width && nj >= 0 && nj < height &&
//                             (Math.abs(pi) > patchSize / 2 || Math.abs(pj) > patchSize / 2)) {
//                             const index = (nj * width + ni) * 4;
//                             sumR += data[index];
//                             sumG += data[index + 1];
//                             sumB += data[index + 2];
//                             count++;
//                         }
//                     }
//                 }

//                 const index = (j * width + i) * 4;
//                 data[index] = sumR / count;
//                 data[index + 1] = sumG / count;
//                 data[index + 2] = sumB / count;
//             }
//         }
//     });

//     return new ImageData(data, width, height);
// }

// self.onmessage = async function(e) {
//     console.log('Received message:', e.data.command);
//     if (e.data.command === 'processImage') {
//         const imageData = e.data.imageData;

//         try {
//             if (!model || !tesseract) {
//                 console.log('Loading models');
//                 await loadModels();
//             }

//             const detections = await detectTextRegions(imageData);
//             const processedImageData = removeText(imageData, detections);

//             self.postMessage({
//                 command: 'processComplete',
//                 processedImageData: processedImageData
//             });
//         } catch (error) {
//             console.error('Error processing image:', error);
//             self.postMessage({
//                 command: 'error',
//                 message: error.message
//             });
//         }
//     }
// };