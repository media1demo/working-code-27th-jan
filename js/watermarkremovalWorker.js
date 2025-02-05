// (async function() {

//     // importScripts('https://unpkg.com/tesseract.js@v2.1.0/dist/tesseract.min.js');

//     // Load OpenCV.js (as a module)
//     let cv;
//     try {
//       cv = await import('https://docs.opencv.org/4.5.2/opencv.js');
//       self.cv = cv;
//       self.postMessage('OpenCV loaded');
//     } catch (error) {
//       self.postMessage('Error loading OpenCV: ' + error.message);
//     }
  
//     // Initialize Tesseract worker
//     let tesseractWorker;
  
//     async function initializeTesseract() {
//       tesseractWorker = await Tesseract.createWorker();
//       await tesseractWorker.loadLanguage('eng');
//       await tesseractWorker.initialize('eng');
//       self.postMessage('Tesseract initialized');
//     }
  
//     self.onmessage = async function(e) {
//       if (e.data.type === 'init') {
//         await initializeTesseract();
//       } else if (e.data.type === 'process') {
//         try {
//           const results = await processWithMultipleThresholds(e.data.image);
//           self.postMessage({ type: 'result', results: results });
//         } catch (error) {
//           self.postMessage({ type: 'error', error: error.message });
//         }
//       }
//     };

// const makeScriptURL = (content) => {
//     const blob = new Blob([content], { type: "text/javascript" });
//     return URL.createObjectURL(blob);
//   };
  
//   const workerContent = `
//     // Load Tesseract.js (classic script)
//     importScripts('https://unpkg.com/tesseract.js@v2.1.0/dist/tesseract.min.js');
  
//     // Load OpenCV.js (as a module)
//     import('https://docs.opencv.org/4.5.2/opencv.js')
//       .then((cv) => {
//         // OpenCV is now loaded and available as 'cv'
//         self.cv = cv;
//         self.postMessage('OpenCV loaded');
//       })
//       .catch((error) => {
//         self.postMessage('Error loading OpenCV: ' + error.message);
//       });
  
//     // Initialize Tesseract worker
//     let tesseractWorker;
  
//     self.onmessage = async function(e) {
//       if (e.data.type === 'init') {
//         tesseractWorker = await Tesseract.createWorker();
//         await tesseractWorker.loadLanguage('eng');
//         await tesseractWorker.initialize('eng');
//         self.postMessage('Tesseract initialized');
//       } else if (e.data.type === 'process') {
//         // Your image processing code here
//         // You can use both Tesseract and OpenCV (self.cv) here
//       }
//     };
//   `;
  
//   const workerURL = makeScriptURL(workerContent);
//   const worker = new Worker(workerURL);
  
//   worker.onmessage = (event) => {
//     console.log('Message from worker:', event.data);
//   };
  
//   worker.onerror = (error) => {
//     console.error('Worker error:', error.message);
//   };
  
//   // Initialize the worker
//   worker.postMessage({ type: 'init' });

//   async function processWithMultipleThresholds(imageData) {
//     const thresholds = [150, 175];
//     let bestThreshold = 0;
//     let maxTextLength = 0;
//     let bestText = '';
//     let bestWords = [];
//     let thresholdResults = [];
  
//     const response = await fetch(imageData);
//     const blob = await response.blob();
//     const imageBitmap = await createImageBitmap(blob);
  
//     const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(imageBitmap, 0, 0);
  
//     for (let i = 0; i < thresholds.length; i++) {
//       const threshold = thresholds[i];
//       self.postMessage({ type: 'progress', progress: Math.round((i / thresholds.length) * 50) });
  
//       const preprocessedCanvas = preprocess(canvas, threshold);
//       const { text, words } = await detectText(preprocessedCanvas);
      
//       if (text.length > maxTextLength) {
//         maxTextLength = text.length;
//         bestThreshold = threshold;
//         bestText = text;
//         bestWords = words;
//       }
  
//       thresholdResults.push({
//         value: threshold,
//         image: await canvasToDataURL(preprocessedCanvas),
//         textLength: text.length,
//         text: text
//       });
//     }
  
//     const textRemovedCanvas = await removeTextAndFill(canvas, bestWords);
  
//     imageBitmap.close();
  
//     return {
//       bestThreshold: bestThreshold,
//       maxTextLength: maxTextLength,
//       bestText: bestText,
//       originalImage: await canvasToDataURL(canvas),
//       textRemovedImage: await canvasToDataURL(textRemovedCanvas),
//       thresholds: thresholdResults
//     };
//   }
  
//   function preprocess(canvas, threshold) {
//     let src = cv.imread(canvas);
//     let dst = new cv.Mat();
//     cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
//     cv.threshold(dst, dst, threshold, 255, cv.THRESH_BINARY);
//     cv.imshow(canvas, dst);
//     src.delete();
//     dst.delete();
//     return canvas;
//   }
  
//   async function detectText(canvas) {
//     try {
//       const result = await tesseractWorker.recognize(canvas);
//       return { text: result.data.text, words: result.data.words };
//     } catch (error) {
//       console.error('Error in text detection:', error);
//       return { text: '', words: [] };
//     }
//   }
  
//   function removeTextAndFill(canvas, words) {
//     let src = cv.imread(canvas);
//     let mask = cv.Mat.zeros(src.rows, src.cols, cv.CV_8U);
    
//     for (let word of words) {
//       let pt1 = new cv.Point(word.bbox.x0, word.bbox.y0);
//       let pt2 = new cv.Point(word.bbox.x1, word.bbox.y1);
//       cv.rectangle(mask, pt1, pt2, [255, 255, 255, 255], -1);
//     }
    
//     let dst = new cv.Mat();
//     cv.inpaint(src, mask, dst, 3, cv.INPAINT_TELEA);
    
//     cv.imshow(canvas, dst);
//     src.delete();
//     mask.delete();
//     dst.delete();
//     return canvas;
//   }
  
//   async function canvasToDataURL(canvas) {
//     const blob = await canvas.convertToBlob();
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onloadend = () => resolve(reader.result);
//       reader.onerror = reject;
//       reader.readAsDataURL(blob);
//     });
//   }
  
//   // In your worker's onmessage handler:
//   if (e.data.type === 'process') {
//     try {
//       const results = await processWithMultipleThresholds(e.data.image);
//       self.postMessage({ type: 'result', results: results });
//     } catch (error) {
//       self.postMessage({ type: 'error', error: error.message });
//     }
//   }

// })();
