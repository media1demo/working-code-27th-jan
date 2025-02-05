self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const rotatedImageData = rotateImage(imageData, value, 'topRight');
    self.postMessage({ imageData: rotatedImageData });
};

function rotateImage(imageData, angle, corner) {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);

    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.translate(getRotationCenterX(corner, imageData.width), 
                      getRotationCenterY(corner, imageData.height));
    tempCtx.rotate(angle * Math.PI / 180);
    tempCtx.translate(-getRotationCenterX(corner, imageData.width), 
                      -getRotationCenterY(corner, imageData.height));

    tempCtx.drawImage(canvas, 0, 0);

    return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
}

function getRotationCenterX(corner, width) {
    switch(corner) {
        case 'topLeft':
        case 'bottomLeft':
            return 0;
        case 'topRight':
        case 'bottomRight':
            return width;
    }
}

function getRotationCenterY(corner, height) {
    switch(corner) {
        case 'topLeft':
        case 'topRight':
            return 0;
        case 'bottomLeft':
        case 'bottomRight':
            return height;
    }
}