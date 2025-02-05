self.onmessage = async function(e) {
    const { imageData, originalImage } = e.data;

    // Load Tesseract.js
    await loadScript('https://unpkg.com/tesseract.js@v2.1.0/dist/tesseract.min.js');

    // Create an image from the passed data
    const img = new Image();
    img.src = originalImage;

    await new Promise(resolve => {
        img.onload = resolve;
    });

    // Create a canvas and draw the image
    const canvas = new OffscreenCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Initialize Tesseract worker
    const worker = await Tesseract.createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    // Perform text detection
    const { data: { words } } = await worker.recognize(canvas);

    // Process detected words and create mask
    const maskCanvas = new OffscreenCanvas(img.width, img.height);
    const maskCtx = maskCanvas.getContext('2d');
    maskCtx.fillStyle = 'black';
    maskCtx.fillRect(0, 0, img.width, img.height);

    words.forEach(word => {
        const { bbox } = word;
        maskCtx.fillStyle = 'white';
        maskCtx.fillRect(bbox.x0, bbox.y0, bbox.x1 - bbox.x0, bbox.y1 - bbox.y0);
    });

    // Apply the mask to the original image
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(maskCanvas, 0, 0);

    // Get the final image data
    const finalImageData = ctx.getImageData(0, 0, img.width, img.height);

    // Terminate the worker
    await worker.terminate();

    // Send the processed image back to the main thread
    self.postMessage({ segmentedImages: [finalImageData] });
};

function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}