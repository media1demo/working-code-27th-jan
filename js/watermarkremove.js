
function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
}

loadScript('https://unpkg.com/tesseract.js@v2.1.0/dist/tesseract.min.js', () => {
    loadScript('https://docs.opencv.org/4.5.2/opencv.js', () => {
        onOpenCvReady();
        processUploadedImage();
    });
});

    const style = document.createElement('style');
    style.textContent = `
        .result-container {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        }
        .threshold-result {
            border: 1px solid #ccc;
            padding: 10px;
            max-width: 300px;
        }
        .threshold-result img {
            max-width: 100%;
        }
    `;
    document.head.appendChild(style);


    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.id = 'imageInput';
    imageInput.accept = 'image/*';

    const uploadedImage = document.createElement('img');
    uploadedImage.id = 'uploadedImage';
    uploadedImage.style.maxWidth = '100%';
    uploadedImage.style.marginBottom = '20px';

    const resultDiv = document.createElement('div');
    resultDiv.id = 'result';

    document.body.appendChild(imageInput);
    document.body.appendChild(uploadedImage);
    document.body.appendChild(resultDiv);
    let cvReady = false;

    function onOpenCvReady() {
        cvReady = true;
        console.log('OpenCV.js is ready.');
        processUploadedImage();
    }

    imageInput.addEventListener('change', function(e) {
        if (!cvReady) {
            alert('OpenCV.js is not ready yet. Please wait a moment and try again.');
            return;
        }

        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = function(event) {
            uploadedImage.src = event.target.result;
            uploadedImage.onload = function() {
                const resizedImage = resizeImage(uploadedImage);
                processWithMultipleThresholds(resizedImage);
            };
        };

        reader.readAsDataURL(file);
    });

    function resizeImage(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_WIDTH = 1080;
        
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        return canvas;
    }

    async function processWithMultipleThresholds(canvas) {
        try {
            const thresholds = [150, 175];
            let bestThreshold = 0;
            let maxTextLength = 0;
            let bestText = '';
            let bestWords = [];

            resultDiv.innerHTML = "<h3>Processing... Please wait.</h3>";

            let resultsContainer = document.createElement('div');
            resultsContainer.className = 'result-container';

            for (let threshold of thresholds) {
                console.log(`Processing threshold: ${threshold}`);
                const preprocessedCanvas = preprocess(canvas, threshold);
                const { text, words } = await detectText(preprocessedCanvas);
                
                console.log(`Threshold ${threshold}: Detected ${text.length} characters`);

                if (text.length > maxTextLength) {
                    maxTextLength = text.length;
                    bestThreshold = threshold;
                    bestText = text;
                    bestWords = words;
                }

                let thresholdResult = document.createElement('div');
                thresholdResult.className = 'threshold-result';
                thresholdResult.innerHTML = `
                    <h4>Threshold: ${threshold}</h4>
                    <img src="${preprocessedCanvas.toDataURL()}" alt="Preprocessed image">
                    <p>Characters detected: ${text.length}</p>
                    <pre>${text.substring(0, 100)}${text.length > 100 ? '...' : ''}</pre>
                `;
                resultsContainer.appendChild(thresholdResult);
            }

            console.log("Processing text removal...");
            const textRemovedCanvas = await removeTextAndFillWithFallback(canvas, bestWords);
            console.log("Text removal complete.");
            resultDiv.innerHTML = '';
            
            let summaryDiv = document.createElement('div');
            summaryDiv.innerHTML = `
                <h3>Best Threshold: ${bestThreshold}</h3>
                <h4>Most Characters Detected: ${maxTextLength}</h4>
                <h4>Best Text:</h4>
                <pre>${bestText}</pre>
                <h3>Original Image:</h3>
                <img src="${canvas.toDataURL()}" alt="Original image">
                <h3>Image with Text Removed:</h3>
                <img src="${textRemovedCanvas.toDataURL()}" alt="Image with text removed">
                <h3>All Results:</h3>
            `;
            
            resultDiv.appendChild(summaryDiv);
            resultDiv.appendChild(resultsContainer);

            console.log("Processing complete. Results should be visible.");
        } catch (error) {
            console.error("An error occurred during processing:", error);
            resultDiv.innerHTML = `<h3>Error occurred during processing: ${error.message}</h3>`;
        }
    }

function visualizeTextAreas(canvas, words) {
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    for (let word of words) {
        ctx.strokeRect(word.bbox.x0, word.bbox.y0, word.bbox.x1 - word.bbox.x0, word.bbox.y1 - word.bbox.y0);
    }
    return canvas;
}




    function removeTextAndFillInChunks(canvas, words) {
        const visualizedCanvas = visualizeTextAreas(canvas, words);
        resultDiv.appendChild(visualizedCanvas);
        return new Promise((resolve, reject) => {
            const CHUNK_SIZE = 100; // pixels
            const ctx = canvas.getContext('2d');
            const fullWidth = canvas.width;
            const fullHeight = canvas.height;
            
            const processChunk = async (x, y) => {
                try {
                    console.log(`Processing chunk at (${x}, ${y})`);
                    const chunkWidth = Math.min(CHUNK_SIZE, fullWidth - x);
                    const chunkHeight = Math.min(CHUNK_SIZE, fullHeight - y);
                    
                    const chunkCanvas = document.createElement('canvas');
                    chunkCanvas.width = chunkWidth;
                    chunkCanvas.height = chunkHeight;
                    const chunkCtx = chunkCanvas.getContext('2d');
                    chunkCtx.drawImage(canvas, x, y, chunkWidth, chunkHeight, 0, 0, chunkWidth, chunkHeight);
                    
                    const chunkWords = words.filter(word => {
                        return word.bbox.x0 >= x && word.bbox.x1 <= x + chunkWidth &&
                               word.bbox.y0 >= y && word.bbox.y1 <= y + chunkHeight;
                    });

                    let src = cv.imread(chunkCanvas);
                    let dst = new cv.Mat();
                    let mask = new cv.Mat();

                    // Create mask
                    mask = cv.Mat.zeros(src.rows, src.cols, cv.CV_8U);
                    for (let word of chunkWords) {
                        let pt1 = new cv.Point(word.bbox.x0 - x, word.bbox.y0 - y);
                        let pt2 = new cv.Point(word.bbox.x1 - x, word.bbox.y1 - y);
                        cv.rectangle(mask, pt1, pt2, [255, 255, 255, 255], -1);
                    }

                    // Inpaint
                    cv.inpaint(src, mask, dst, 3, cv.INPAINT_TELEA);

                    // Convert result back to canvas
                    cv.imshow(chunkCanvas, dst);

                    // Clean up
                    src.delete();
                    dst.delete();
                    mask.delete();

                    ctx.drawImage(chunkCanvas, x, y);
                    console.log(`Chunk at (${x}, ${y}) processed successfully`);
                } catch (error) {
                    console.error(`Error processing chunk at (${x}, ${y}):`, error);
                    throw error;
                }
            };

            (async () => {
                try {
                    for (let y = 0; y < fullHeight; y += CHUNK_SIZE) {
                        for (let x = 0; x < fullWidth; x += CHUNK_SIZE) {
                            await processChunk(x, y);
                            // Update progress
                            resultDiv.innerHTML = `<p>Processing: ${Math.round((y * fullWidth + x) / (fullWidth * fullHeight) * 100)}%</p>`;
                        }
                    }
                    resolve(canvas);
                } catch (error) {
                    reject(error);
                }
            })();
        });
    }

    async function removeTextAndFillWithFallback(canvas, words) {
        try {
            return await removeTextAndFillOpenCV(canvas, words);
        } catch (error) {
            console.warn("OpenCV.js processing failed, falling back to JavaScript method:", error);
            return removeTextAndFillJS(canvas, words);
        }
    }

    function removeTextAndFillOpenCV(canvas, words) {
        return new Promise((resolve, reject) => {
            const CHUNK_SIZE = 100; // Reduced chunk size
            const ctx = canvas.getContext('2d');
            const fullWidth = canvas.width;
            const fullHeight = canvas.height;
            
            const processChunk = async (x, y) => {
                try {
                    console.log(`Processing chunk at (${x}, ${y})`);
                    const chunkWidth = Math.min(CHUNK_SIZE, fullWidth - x);
                    const chunkHeight = Math.min(CHUNK_SIZE, fullHeight - y);
                    
                    const chunkCanvas = document.createElement('canvas');
                    chunkCanvas.width = chunkWidth;
                    chunkCanvas.height = chunkHeight;
                    const chunkCtx = chunkCanvas.getContext('2d');
                    chunkCtx.drawImage(canvas, x, y, chunkWidth, chunkHeight, 0, 0, chunkWidth, chunkHeight);
                    
                    const chunkWords = words.filter(word => {
                        return word.bbox.x0 >= x && word.bbox.x1 <= x + chunkWidth &&
                               word.bbox.y0 >= y && word.bbox.y1 <= y + chunkHeight;
                    });

                    let src = cv.imread(chunkCanvas);
                    let dst = new cv.Mat();
                    let mask = cv.Mat.zeros(src.rows, src.cols, cv.CV_8U);

                    for (let word of chunkWords) {
                        let pt1 = new cv.Point(word.bbox.x0 - x, word.bbox.y0 - y);
                        let pt2 = new cv.Point(word.bbox.x1 - x, word.bbox.y1 - y);
                        cv.rectangle(mask, pt1, pt2, [255, 255, 255, 255], -1);
                    }

                    cv.inpaint(src, mask, dst, 3, cv.INPAINT_TELEA);
                    cv.imshow(chunkCanvas, dst);

                    src.delete(); dst.delete(); mask.delete();

                    ctx.drawImage(chunkCanvas, x, y);
                    console.log(`Chunk at (${x}, ${y}) processed successfully`);
                    
                    // Add a small delay to allow for garbage collection
                    await new Promise(resolve => setTimeout(resolve, 10));
                } catch (error) {
                    console.error(`Error processing chunk at (${x}, ${y}):`, error);
                    throw error;
                }
            };

            (async () => {
                try {
                    for (let y = 0; y < fullHeight; y += CHUNK_SIZE) {
                        for (let x = 0; x < fullWidth; x += CHUNK_SIZE) {
                            await processChunk(x, y);
                            resultDiv.innerHTML = `<p>Processing: ${Math.round((y * fullWidth + x) / (fullWidth * fullHeight) * 100)}%</p>`;
                        }
                    }
                    resolve(canvas);
                } catch (error) {
                    reject(error);
                }
            })();
        });
    }
    function removeTextAndFillJS(canvas, words) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let word of words) {
        const padding = 2; 
        const x0 = Math.max(0, word.bbox.x0 - padding);
        const y0 = Math.max(0, word.bbox.y0 - padding);
        const x1 = Math.min(canvas.width, word.bbox.x1 + padding);
        const y1 = Math.min(canvas.height, word.bbox.y1 + padding);

        for (let y = y0; y < y1; y++) {
            for (let x = x0; x < x1; x++) {
                const index = (y * canvas.width + x) * 4;
                const surroundingPixels = getSurroundingPixels(data, x, y, canvas.width, canvas.height, 5);
                const [r, g, b] = averageColor(surroundingPixels);
                data[index] = r;
                data[index + 1] = g;
                data[index + 2] = b;
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

function getSurroundingPixels(data, x, y, width, height, radius) {
    const pixels = [];
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const index = (ny * width + nx) * 4;
                pixels.push([data[index], data[index + 1], data[index + 2]]);
            }
        }
    }
    return pixels;
}


    function averageColor(pixels) {
        const sum = pixels.reduce((acc, pixel) => [acc[0] + pixel[0], acc[1] + pixel[1], acc[2] + pixel[2]], [0, 0, 0]);
        return sum.map(v => Math.round(v / pixels.length));
    }



    function preprocess(canvas, threshold) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = data[i + 1] = data[i + 2] = avg;
        }

        for (let i = 0; i < data.length; i += 4) {
            const value = data[i] > threshold ? 255 : 0;
            data[i] = data[i + 1] = data[i + 2] = value;
        }

        const newCanvas = document.createElement('canvas');
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height;
        const newCtx = newCanvas.getContext('2d');
        newCtx.putImageData(imageData, 0, 0);
        return newCanvas;
    }

    function removeTextAndFill(canvas, words) {
        return new Promise((resolve, reject) => {
            try {
                let src = cv.imread(canvas);
                let dst = new cv.Mat();
                let mask = new cv.Mat();
                let tempMat = new cv.Mat();

                // Downscale for processing
                let scale = 0.5;
                let dsize = new cv.Size(src.cols * scale, src.rows * scale);
                cv.resize(src, tempMat, dsize, 0, 0, cv.INTER_AREA);

                // Create mask
                mask = cv.Mat.zeros(tempMat.rows, tempMat.cols, cv.CV_8U);
                for (let word of words) {
                    console.log(`Processing word: ${word.text} at (${word.bbox.x0}, ${word.bbox.y0}) - (${word.bbox.x1}, ${word.bbox.y1})`);

                    let pt1 = new cv.Point(word.bbox.x0 * scale, word.bbox.y0 * scale);
                    let pt2 = new cv.Point(word.bbox.x1 * scale, word.bbox.y1 * scale);
                    cv.rectangle(mask, pt1, pt2, [255, 255, 255, 255], -1);
                }
                console.log('Text removal complete');


                // Inpaint
                cv.inpaint(tempMat, mask, dst, 3, cv.INPAINT_TELEA);

                // Upscale result
                cv.resize(dst, tempMat, new cv.Size(src.cols, src.rows), 0, 0, cv.INTER_CUBIC);

                // Convert result back to canvas
                const outputCanvas = document.createElement('canvas');
                cv.imshow(outputCanvas, tempMat);

                // Clean up
                src.delete();
                dst.delete();
                mask.delete();
                tempMat.delete();

                resolve(outputCanvas);
            } catch (error) {
                console.error('Error in removeTextAndFill:', error);
                reject(error);
            }
        });
    }
    async function detectText(canvas) {
        try {
            const result = await Tesseract.recognize(canvas, 'eng', {
                logger: m => console.log(m)
            });
            return { text: result.data.text, words: result.data.words };
        } catch (error) {
            console.error('Error in text detection:', error);
            return { text: '', words: [] };
        }
    }
    function processUploadedImage() {
        if (!cvReady) {
            alert('OpenCV.js is not ready yet. Please wait a moment and try again.');
            return;
        }
    
        if (!window.uploadedImageData) {
            alert('No image data available. Please make sure window.uploadedImageData is set.');
            return;
        }
    
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = window.uploadedImageData.width;
        tempCanvas.height = window.uploadedImageData.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(window.uploadedImageData, 0, 0);
    
        const resizedImage = resizeImage(tempCanvas);
        processWithMultipleThresholds(resizedImage);
    }
