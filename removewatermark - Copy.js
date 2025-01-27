        
        let cvReady = false;

 
        function removeWatermark() {
            if (!cvReady) {
                alert('OpenCV.js is not ready yet. Please wait a moment and try again.');
                return;
            }

            const file = imageUpload.files[0];
            if (!file) {
                alert('Please select an image first.');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                uploadedImage = new Image(); // Initialize uploadedImage

                uploadedImage.src = event.target.result;
                uploadedImage.onload = function() {
                    const resizedImage = resizeImage1(uploadedImage);
                    processWithMultipleThresholds(resizedImage);
                };
            };

            reader.readAsDataURL(file);
        }
        
        let uploadedImage;
        let resultDiv;
        // const resultDiv = document.createElement('div');       
        
        document.addEventListener('DOMContentLoaded', () => {
            resultDiv = document.getElementById('resultsContainer');
        });

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

                // Define the processWithMultipleThresholds function
          
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

    
    async function removeTextAndFillWithFallback(canvas, words) {
        try {
            return await removeTextAndFillOpenCV(canvas, words);
        } catch (error) {
            console.warn("OpenCV.js processing failed, falling back to JavaScript method:", error);
            return removeTextAndFillJS(canvas, words);
        }
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

function averageColor(pixels) {
        const sum = pixels.reduce((acc, pixel) => [acc[0] + pixel[0], acc[1] + pixel[1], acc[2] + pixel[2]], [0, 0, 0]);
        return sum.map(v => Math.round(v / pixels.length));
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

                    if (text.length > maxTextLength) {
                        maxTextLength = text.length;
                        bestThreshold = threshold;
                        bestText = text;
                        bestWords = words;
                    }

                    let thresholdResult = document.createElement('div');
                    thresholdResult.className = 'threshold-result';
                    resultsContainer.appendChild(thresholdResult);
                }

                console.log("Processing text removal...");
                const textRemovedCanvas = await removeTextAndFillWithFallback(canvas, bestWords);
                console.log("Text removal complete.");
                resultDiv.innerHTML = '';

                let summaryDiv = document.createElement('div');
                summaryDiv.innerHTML = `
                    
                    <img src="${canvas.toDataURL()}" alt="Original image">
                    
                    <img src="${textRemovedCanvas.toDataURL()}" alt="Image with text removed">
                  
                `;

                resultDiv.appendChild(summaryDiv);
                resultDiv.appendChild(resultsContainer);

                console.log("Processing complete. Results should be visible.");
            } catch (error) {
                console.error("An error occurred during processing:", error);
                resultDiv.innerHTML = `<h3>Error occurred during processing: ${error.message}</h3>`;
            }
        }
    
        function resizeImage1(img) {
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
      
        function loadScript(src, callback) {
            const script = document.createElement('script');
            script.src = src;
            script.onload = callback;
            document.head.appendChild(script);
        }

        // Ensure cvReady is set to true when OpenCV.js is loaded
        function onOpenCvReady() {
            cvReady = true;
            console.log('OpenCV.js is ready.');
        }

        // Load OpenCV.js and set cvReady to true when loaded
        loadScript('https://docs.opencv.org/4.5.2/opencv.js', onOpenCvReady);
