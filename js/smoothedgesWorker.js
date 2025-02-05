self.onmessage = function(e) {
    const imageData = e.data.imageData;
    const originalCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const originalCtx = originalCanvas.getContext('2d');
    originalCtx.putImageData(imageData, 0, 0);
  
    const processedCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const processedCtx = processedCanvas.getContext('2d');
  
    processedCtx.putImageData(imageData, 0, 0);
    const blurRadius = Math.max(imageData.width, imageData.height) * 0.005;
    processedCtx.filter = `blur(${blurRadius}px)`;
    processedCtx.drawImage(processedCanvas, 0, 0);
  
    let processedImageData = processedCtx.getImageData(0, 0, processedCanvas.width, processedCanvas.height);
    let data = processedImageData.data;
  
    for (let i = 0; i < data.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        const value = data[i + j];
        data[i + j] = value >= 128 ? 255 : 0;
      }
    }
  
    processedCtx.putImageData(processedImageData, 0, 0);
  
    // Create merged canvas
    const mergedCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const mergedCtx = mergedCanvas.getContext('2d');
  
    // Draw original image
    mergedCtx.drawImage(originalCanvas, 0, 0);
  
    // Set blend mode to 'lighten' and draw processed image
    mergedCtx.globalCompositeOperation = 'lighten';
    mergedCtx.drawImage(processedCanvas, 0, 0);
  
    // Reset composite operation
    mergedCtx.globalCompositeOperation = 'source-over';
  
    // Apply additional lighten effect
    const mergedImageData = mergedCtx.getImageData(0, 0, mergedCanvas.width, mergedCanvas.height);
    const mergedData = mergedImageData.data;
    for (let i = 0; i < mergedData.length; i += 4) {
      mergedData[i] = Math.min(255, mergedData[i] + 30);     // Red
      mergedData[i + 1] = Math.min(255, mergedData[i + 1] + 30); // Green
      mergedData[i + 2] = Math.min(255, mergedData[i + 2] + 30); // Blue
    }
  
    mergedCtx.putImageData(mergedImageData, 0, 0);
  
    // Send both processed and merged image data back to main script
    self.postMessage({
      processedImageData: processedImageData,
      mergedImageData: mergedCtx.getImageData(0, 0, mergedCanvas.width, mergedCanvas.height)
    });
  };