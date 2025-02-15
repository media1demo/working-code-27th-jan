
let isDrawingCircle = false;
let circleCenter = null;
let currentMousePos = null;

let activeTool = 'magicWand';
let isDrawingLasso = false;
// let isDrawingPolygon = false;
// let startPoint = null;
// let endPoint = null;
let lassoPoints = [];
let polygonPoints = [];
let isRectangleActive = false;
let isDrawingRectangle = false;
let startPoint = null;
let endPoint = null;

const imageUpload = document.getElementById('imageUpload');
const resultsContainer = document.getElementById('resultsContainer');
const effectControls = document.getElementById('effectControls');
const imageCountInput = document.getElementById('imageCount');
const processButton = document.getElementById('processButton');
const masterCheckbox = document.getElementById('masterCheckbox');
const fastProcessButton = document.getElementById('fastProcessButton');
const resizeButton = document.getElementById('resizeButton');
const toggleDrawButton = document.getElementById('toggleDraw');
const removeObjectButton = document.getElementById('removeObject');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const imageCanvas = document.getElementById('imageCanvas');
const ctx = imageCanvas.getContext('2d');
const progressDiv = document.getElementById('progress'); // Initialize progressDiv
const lipSyncButton = document.getElementById('lipSyncButton'); // New button
const generateImagesButton = document.getElementById('generateImages'); // Brightness button
const removeWatermarkButton = document.getElementById('removeWatermarkButton');
removeWatermarkButton.addEventListener('click', removeWatermark);
const magicWandButton = document.getElementById('magicWandTool');
const lassoButton = document.getElementById('lassoTool');
const polygonLassoButton = document.getElementById('polygonLassoTool');
// const imageCanvas = document.getElementById('imageCanvas');
// const ctx = imageCanvas.getContext('2d');

const workers = {};
effects.forEach(effect => { workers[effect] = new Worker(`js/${effect}Worker.js`); });
// console.log(effects);
let processedImages = {};
let originalImage;
let selectedRegions = [];
let tolerance = 32;
let magicWandMode = 'add';
let clickedPoints = [];
let drawMode = false;
let isDrawing = false;
let worker = null;

processButton.addEventListener('click', () => processImageWithMethod(processImage));
fastProcessButton.addEventListener('click', () => processImageWithMethod(fastProcessImage));
masterCheckbox.addEventListener('change', toggleAllEffects);
resizeButton.addEventListener('click', startResizing);
toggleDrawButton.addEventListener('click', toggleDrawMode);
removeObjectButton.addEventListener('click', performObjectRemoval);
// imageCanvas.addEventListener('click', handleCanvasClick);
// imageCanvas.addEventListener('mousedown', startDrawing);
// imageCanvas.addEventListener('mousemove', draw);
// imageCanvas.addEventListener('mouseup', stopDrawing);
lipSyncButton.addEventListener('click', startLipSyncAnimation); // New button event listener
generateImagesButton.addEventListener('click', generateBrightnessVariations); // Brightness button event listener

const animationControlDiv = document.createElement('div');
animationControlDiv.className = 'effect-control';
const animationCheckbox = document.createElement('input');
animationCheckbox.type = 'checkbox';
animationCheckbox.id = 'animationCheckbox';
animationCheckbox.addEventListener('change', toggleAnimationEffects);
const animationLabel = document.createElement('label');
animationLabel.htmlFor = 'animationCheckbox';
animationLabel.textContent = 'Animation';
animationControlDiv.appendChild(animationCheckbox);
animationControlDiv.appendChild(animationLabel);
effectControls.appendChild(animationControlDiv);

function handleCanvasClick(event) {
  console.log(activeTool);
    if (activeTool === 'magicWand') { // Only execute if magic wand is active
        const rect = imageCanvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / (rect.width / imageCanvas.width));
        const y = Math.floor((event.clientY - rect.top) / (rect.height / imageCanvas.height));
        performMagicWandSelection(x, y); // Perform magic wand selection
    }
    else if (activeTool === TOOLS.CIRCLE_MAGIC_WAND) {
        // Add the clicked point to the array
        const rect = imageCanvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / (rect.width / imageCanvas.width));
        const y = Math.floor((event.clientY - rect.top) / (rect.height / imageCanvas.height));
    
//   alert(x)  
        clickedPoints.push({ x, y });
        alert(clickedPoints)
        // Redraw the canvas to show the circle
        redrawCanvas();
    }
    // else if (activeTool === TOOLS.CIRCLE_MAGIC_WAND) {
    //     performCircleMagicWandSelection(x, y);
    // }
}


function performCircleSelection(center, radius) {
    const imageData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
    const selectedPixels = [];
    
    for (let y = 0; y < imageCanvas.height; y++) {
        for (let x = 0; x < imageCanvas.width; x++) {
            const distance = Math.sqrt(
                Math.pow(x - center.x, 2) +
                Math.pow(y - center.y, 2)
            );
            
            if (distance <= radius) {
                selectedPixels.push(y * imageCanvas.width + x);
            }
        }
    }
    
    updateSelectedRegions(selectedPixels);
    redrawCanvas();
}


function performMagicWandSelection(x, y) {
    const imageData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
    const worker = new Worker('magicWand1Worker.js');
    
    worker.postMessage({
        imageData: imageData,
        startX: x,
        startY: y,
        tolerance: tolerance,
        mode: magicWandMode
    });
    
    worker.onmessage = function(e) {
        updateSelectedRegions(e.data.selectedRegion);
        redrawCanvas();
    };
    
}



function drawCirclePreview() {
    if (activeTool === TOOLS.CIRCLE_MAGIC_WAND && startPoint && currentMousePos && isDrawingCircle) {
        // Calculate center point between start and current points
        const centerX = (startPoint.x + currentMousePos.x) / 2;
        const centerY = (startPoint.y + currentMousePos.y) / 2;
        
        // Calculate radius as half the distance between points
        const radius = Math.sqrt(
            Math.pow(currentMousePos.x - startPoint.x, 2) +
            Math.pow(currentMousePos.y - startPoint.y, 2)
        ) / 2;

        // Draw circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Optionally draw the diameter line to show the points
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(currentMousePos.x, currentMousePos.y);
        ctx.strokeStyle = '#00ff00';
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash pattern
    }
}



const TOOLS = {
    MAGIC_WAND: 'magicWand',
    CIRCLE_MAGIC_WAND: 'circleMagicWand',
    RECTANGLE: 'rectangle',
    LASSO: 'lasso',
    POLYGON: 'polygon'
};

let circleRadius = 50; // Default radius, can be adjusted

const circleMagicWandButton = document.getElementById('circleMagicWandTool');
circleMagicWandButton.addEventListener('click', () => {
    activeTool = TOOLS.CIRCLE_MAGIC_WAND;
    resetAllTools();
    circleMagicWandButton.classList.add('active');
    imageCanvas.style.cursor = 'crosshair';
});


// let activeTool = TOOLS.MAGIC_WAND;
// let isDrawing = false;
// let startPoint = null;
// let endPoint = null;
// let polygonPoints = [];

let isDrawingPolygon = false;

function initializeSelectionTools() {
    // Get DOM elements
    const magicWandButton = document.getElementById('magicWandTool');
    const lassoButton = document.getElementById('lassoTool');
    const polygonLassoButton = document.getElementById('polygonLassoTool');
    
    // Set up button click handlers
    magicWandButton.addEventListener('click', () => {
        activeTool = 'magicWand';
        resetAllTools();
        magicWandButton.classList.add('active');
        imageCanvas.style.cursor = 'crosshair';
    });
    
    lassoButton.addEventListener('click', () => {
        activeTool = 'lasso';
        resetAllTools();
        lassoButton.classList.add('active');
        imageCanvas.style.cursor = 'crosshair';
    });
    
    polygonLassoButton.addEventListener('click', () => {
        activeTool = 'polygonLasso';
        resetAllTools();
        polygonLassoButton.classList.add('active');
        imageCanvas.style.cursor = 'crosshair';
    });
    
    // Set up canvas event listeners
    imageCanvas.addEventListener('mousedown', handleMouseDown);
    imageCanvas.addEventListener('mousemove', handleMouseMove);
    imageCanvas.addEventListener('mouseup', handleMouseUp);
    imageCanvas.addEventListener('click', handleClick);
}

function resetAllTools() {
    // Reset states
    isDrawingLasso = false;
    isDrawingPolygon = false;
    lassoPoints = [];
    polygonPoints = [];
    clickedPoints = [];

    
    // Reset UI
    document.getElementById('magicWandTool').classList.remove('active');
    document.getElementById('lassoTool').classList.remove('active');
    document.getElementById('polygonLassoTool').classList.remove('active');
    document.getElementById('circleMagicWandTool').classList.remove('active');

    // Reset canvas
    redrawCanvas();
}

function updateSelectedRegions(newRegion) {
    if (magicWandMode === 'add') {
        selectedRegions.push(newRegion);
    } else if (magicWandMode === 'subtract') {
        selectedRegions = selectedRegions.map(region => 
            region.filter(pixel => !newRegion.includes(pixel))
        );
    } else if (magicWandMode === 'invert') {
        selectedRegions = selectedRegions.map(region => {
            let invertedRegion = region.filter(pixel => !newRegion.includes(pixel))
                .concat(newRegion.filter(pixel => !region.includes(pixel)));
            return invertedRegion;
        });
    }
}

function updateObjectMask(newRegion) {
    if (!objectMask) {
        objectMask = matrix(imageCanvas.width, imageCanvas.height, false);
    }
    newRegion.forEach(pixelIndex => {
        const x = pixelIndex % imageCanvas.width;
        const y = Math.floor(pixelIndex / imageCanvas.width);
        objectMask[y][x] = true;
    });
}

function displaySelectedRegionsBorders() {
    ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    ctx.drawImage(originalImage, 0, 0);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 0.1;
    selectedRegions.forEach(region => {
        ctx.beginPath();
        region.forEach(pixelIndex => {
            const x = pixelIndex % imageCanvas.width;
            const y = Math.floor(pixelIndex / imageCanvas.width);
            ctx.rect(x, y, 1, 1);
        });
        ctx.stroke();
    });
}

function startResizing() {
    if (!originalImage || !originalImage.complete || !originalImage.naturalWidth) {
        alert('Image not loaded.');
        return;
    }

    if (!originalImageData) {
        alert('No image data available.');
        return;
    }

    const toWidth = parseInt(widthInput.value);
    const toHeight = parseInt(heightInput.value);

    if (isNaN(toWidth) || isNaN(toHeight)) {
        alert('Please enter valid width and height values.');
        return;
    }

    if (toWidth >= originalImage.width && toHeight >= originalImage.height) {
        alert('Please enter at least one dimension smaller than the original image.');
        return;
    }

    const resizedImageData = new ImageData(
        new Uint8ClampedArray(originalImageData.data),
        originalImageData.width,
        originalImageData.height
    );

    resizeImage(
        resizedImageData,
        toWidth,
        toHeight,
        ({ step, steps }) => {
            progressDiv.textContent = `Resizing... ${Math.round((step / steps) * 100)}%`;
        }
    ).then(() => {
        imageCanvas.width = toWidth;
        imageCanvas.height = toHeight;
        ctx.putImageData(resizedImageData, 0, 0);
        progressDiv.textContent = 'Resizing complete!';
    });
}

function toggleDrawMode() {
    drawMode = !drawMode;
    toggleDrawButton.textContent = drawMode ? 'Disable Draw' : 'Enable Draw';
}

function startLassoDrawing(point) {
    isDrawingLasso = true;
    lassoPoints = [point];
    redrawCanvas();
}

function draw(e) {
    if (!isDrawing || !drawMode) return;
    const rect = imageCanvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    if (objectMask) {
        for (let i = -5; i <= 5; i++) {
            for (let j = -5; j <= 5; j++) {
                if (x + i >= 0 && x + i < imageCanvas.width && y + j >= 0 && y + j < imageCanvas.height) {
                    objectMask[y + j][x + i] = true;
                }
            }
        }
    }
}

function stopDrawing() {
    isDrawing = false;
}


// First, modify your HTML to have just one polygonLassoButton:
// Remove the first button and keep only the one in the sidebar

// Add this CSS to your styles2.css file:
`.lasso-active {
    cursor: crosshair !important;
}

.imageCanvas.lasso-active {
    border: 2px dashed ;
}

#polygonLassoButton.active {
    
    color: black;
}`

// Add this JavaScript code:
document.addEventListener('DOMContentLoaded', function() {
    // Get references to DOM elements
    // const polygonLassoButton = document.getElementById('lassoTool');



    
    const polygonLassoButton = document.getElementById('polygonLassoTool');
    const rectangleToolButton = document.getElementById('polygonLassoTool'); // Using the same button ID

    rectangleToolButton.textContent = 'Rectangle Tool'; // Change button text
    
    rectangleToolButton.addEventListener('click', () => {
        activeTool = 'rectangle';
        deactivateMagicWand();
        activateRectangleTool();
    });
    
    function deactivateMagicWand() {
        imageCanvas.style.cursor = 'default';
        // Reset any magic wand specific states if needed
    }


function activateRectangleTool() {
    isRectangleActive = true;
    imageCanvas.style.cursor = 'crosshair';
    rectangleToolButton.classList.add('active');
}
 
const lassoButton = document.getElementById('lassoTool');

    const imageCanvas = document.getElementById('imageCanvas');
    const ctx = imageCanvas.getContext('2d');

    // Global variables for lasso tool
    let isLassoActive = false;
    let isDrawingLasso = false;
    // let lassoPoints = [];
    let tolerance = 32; // You can adjust this value

    // Initialize the tool
    function initLassoTool() {
        // Add event listeners
        polygonLassoButton.addEventListener('click', toggleLassoTool);

        function deactivateMagicWand() {
            imageCanvas.style.cursor = 'default';
            // Reset any magic wand specific states if needed
        }

        function activatePolygonLasso() {
            activeTool = 'polygonLasso';
            imageCanvas.style.cursor = 'crosshair';
            polygonLassoButton.classList.add('active');
            magicWandButton.classList.remove('active');
            lassoButton.classList.remove('active');
        }
        magicWandButton.addEventListener('click', activateMagicWand);
        lassoButton.addEventListener('click', activateLasso);
        polygonLassoButton.addEventListener('click', activatePolygonLasso);
        
        // Canvas event listeners
        imageCanvas.addEventListener('mousedown', handleMouseDown);
        imageCanvas.addEventListener('mousemove', handleMouseMove);
        imageCanvas.addEventListener('mouseup', handleMouseUp);
        imageCanvas.addEventListener('click', handleClick);        

        function handleClick(event) {
            if (activeTool === 'magicWand') {
                const point = getCanvasPoint(event);
                performMagicWandSelection(point.x, point.y);
            } else if (activeTool === 'polygonLasso') {
                const point = getCanvasPoint(event);
                handlePolygonClick(point);
            }
            if (activeTool === TOOLS.CIRCLE_MAGIC_WAND) {
                // Add the clicked point to the array
                const rect = imageCanvas.getBoundingClientRect();
                const x = Math.floor((event.clientX - rect.left) / (rect.width / imageCanvas.width));
                const y = Math.floor((event.clientY - rect.top) / (rect.height / imageCanvas.height));            
                clickedPoints.push({ x, y });
                redrawCanvas();
            }
        }
        
        function handleMouseUp(event) {
            
            if (activeTool === 'lasso' && isDrawingLasso) {
                event.preventDefault();
                completeLassoSelection();
            }

            else if (activeTool === TOOLS.CIRCLE_MAGIC_WAND && isDrawingCircle) {
                isDrawingCircle = false;
                if (circleCenter && currentMousePos) {
                    const radius = Math.sqrt(
                        Math.pow(currentMousePos.x - circleCenter.x, 2) +
                        Math.pow(currentMousePos.y - circleCenter.y, 2)
                    );
                    performCircleSelection(circleCenter, radius);
                }
                circleCenter = null;
                currentMousePos = null;
            } 
        }

        function completeLassoSelection() {
            isDrawingLasso = false;
            
            if (lassoPoints.length > 2) {
                lassoPoints.push(lassoPoints[0]); // Close the path
                
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = imageCanvas.width;
                tempCanvas.height = imageCanvas.height;
                const tempCtx = tempCanvas.getContext('2d');
                
                tempCtx.beginPath();
                tempCtx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
                for (let i = 1; i < lassoPoints.length; i++) {
                    tempCtx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
                }
                tempCtx.closePath();
                tempCtx.fillStyle = 'red';
                tempCtx.fill();
                
                const maskData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                const selectedPixels = [];
                
                for (let y = 0; y < maskData.height; y++) {
                    for (let x = 0; x < maskData.width; x++) {
                        const index = (y * maskData.width + x) * 4;
                        if (maskData.data[index] > 0) {
                            selectedPixels.push(y * maskData.width + x);
                        }
                    }
                }
                
                updateSelectedRegions(selectedPixels);
            }
            
            lassoPoints = [];
            redrawCanvas();
        }
        
        function activateLasso() {
            activeTool = 'lasso';
            imageCanvas.style.cursor = 'crosshair';
            lassoButton.classList.add('active');
            magicWandButton.classList.remove('active');
            polygonLassoButton.classList.remove('active');
        }

        lassoButton.addEventListener('click', () => {
            activeTool = 'lasso';
            deactivateMagicWand();
            activateLasso();
        });

        polygonLassoButton.addEventListener('click', () => {
            activeTool = 'polygonLasso';
            deactivateMagicWand();
            activatePolygonLasso();
        });
        
        // imageCanvas.addEventListener('mousedown', (e) => {
        //     if (activeTool === 'polygonLasso') {
        //         handlePolygonClick(e);
        //     }
        // });
       
        // function handleMouseDown(event) {
            
            
            
        //     const point = getCanvasPoint(event);
            
        //     switch(activeTool) {
        //         case 'lasso':
        //             startLassoDrawing(point);
        //             break;
        //         case 'polygonLasso':
        //             handlePolygonClick(point);
        //             break;
        //     }
        // }       
        function handleMouseDown(event) {
            if (activeTool === 'lasso') {
                event.preventDefault();
                isDrawingLasso = true;
                const point = getCanvasPoint(event);
                lassoPoints = [point];
                redrawCanvas();
            }
            else  if (activeTool === TOOLS.CIRCLE_MAGIC_WAND) {
                isDrawingCircle = true;
                const rect = imageCanvas.getBoundingClientRect();
                circleCenter = {
                    x: Math.floor((event.clientX - rect.left) / (rect.width / imageCanvas.width)),
                    y: Math.floor((event.clientY - rect.top) / (rect.height / imageCanvas.height))
                };
                currentMousePos = {...circleCenter};
            }
        }
        

        // function handleMouseMove(event) {
        //     const point = getCanvasPoint(event);
            
        //     switch(activeTool) {
        //         case 'lasso':
        //             if (isDrawingLasso) {
        //                 continueLassoDrawing(point);
        //             }
        //             break;
        //         case 'polygonLasso':
        //             if (isDrawingPolygon) {
        //                 updatePolygonPreview(point);
        //             }
        //             break;
        //     }
        // }

        function handleMouseMove(event) {

            if (activeTool === 'lasso' && isDrawingLasso) {
                event.preventDefault();
                const point = getCanvasPoint(event);
                lassoPoints.push(point);
                redrawCanvas();
            } else if (activeTool === 'polygonLasso' && isDrawingPolygon) {
                const point = getCanvasPoint(event);
                updatePolygonPreview(point);
            }
            else if (activeTool === TOOLS.CIRCLE_MAGIC_WAND && isDrawingCircle) {
                const rect = imageCanvas.getBoundingClientRect();
                currentMousePos = {
                    x: Math.floor((event.clientX - rect.left) / (rect.width / imageCanvas.width)),
                    y: Math.floor((event.clientY - rect.top) / (rect.height / imageCanvas.height))
                };
                redrawCanvas();
            }
        }
        


        function handlePolygonClick(point) {
            if (!isDrawingPolygon) {
                isDrawingPolygon = true;
                polygonPoints = [point];
            } else {
                const startPoint = polygonPoints[0];
                const distance = Math.sqrt(
                    Math.pow(point.x - startPoint.x, 2) + 
                    Math.pow(point.y - startPoint.y, 2)
                );
                
                if (distance < 10 && polygonPoints.length > 2) {
                    completePolygonSelection();
                } else {
                    polygonPoints.push(point);
                }
            }
            redrawCanvas();
        }



        function updatePolygonPreview(point) {
            redrawCanvas();
            
            // Draw preview line
            if (polygonPoints.length > 0) {
                ctx.beginPath();
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 2;
                ctx.moveTo(polygonPoints[polygonPoints.length - 1].x, polygonPoints[polygonPoints.length - 1].y);
                ctx.lineTo(point.x, point.y);
                ctx.stroke();
            }
        }

        
        // imageCanvas.addEventListener('mousemove', (e) => {
        //     if (activeTool === 'polygonLasso') {
        //         updatePolygonPreview(e);
        //     }
        
        // });


        imageCanvas.addEventListener('dblclick', (e) => {
            if (activeTool === 'polygonLasso') {
                completePolygonSelection(e);
            }
        });
        



        function completePolygonSelection() {
            if (polygonPoints.length < 3) return;
            
            polygonPoints.push(polygonPoints[0]); // Close the polygon
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = imageCanvas.width;
            tempCanvas.height = imageCanvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            tempCtx.beginPath();
            tempCtx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
            for (let i = 1; i < polygonPoints.length; i++) {
                tempCtx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
            }
            tempCtx.closePath();
            tempCtx.fillStyle = 'red';
            tempCtx.fill();
            
            const maskData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const selectedPixels = [];
            
            for (let y = 0; y < maskData.height; y++) {
                for (let x = 0; x < maskData.width; x++) {
                    const index = (y * maskData.width + x) * 4;
                    if (maskData.data[index] > 0) {
                        selectedPixels.push(y * maskData.width + x);
                    }
                }
            }
            
            updateSelectedRegions(selectedPixels);
            isDrawingPolygon = false;
            polygonPoints = [];
            redrawCanvas();
        }



        function getPixelsInLassoSelection() {
            // Create temporary canvas for selection mask
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = imageCanvas.width;
            tempCanvas.height = imageCanvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Draw lasso path
            tempCtx.beginPath();
            tempCtx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
            for (let i = 1; i < lassoPoints.length; i++) {
                tempCtx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
            }
            tempCtx.closePath();
            tempCtx.fill();
            
            // Get pixels inside lasso
            const maskData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const selectedPixels = [];
            
            for (let y = 0; y < maskData.height; y++) {
                for (let x = 0; x < maskData.width; x++) {
                    const index = (y * maskData.width + x) * 4;
                    if (maskData.data[index + 3] > 0) {
                        selectedPixels.push(y * maskData.width + x);
                    }
                }
            }
            
            return selectedPixels;
        }

        function getPixelsInPolygonSelection() {
            // Similar to getPixelsInLassoSelection but for polygon
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = imageCanvas.width;
            tempCanvas.height = imageCanvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            tempCtx.beginPath();
            tempCtx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
            for (let i = 1; i < polygonPoints.length; i++) {
                tempCtx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
            }
            tempCtx.closePath();
            tempCtx.fill();
            
            const maskData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const selectedPixels = [];
            
            for (let y = 0; y < maskData.height; y++) {
                for (let x = 0; x < maskData.width; x++) {
                    const index = (y * maskData.width + x) * 4;
                    if (maskData.data[index + 3] > 0) {
                        selectedPixels.push(y * maskData.width + x);
                    }
                }
            }
            
            return selectedPixels;
        }
        


        function resetPolygonTool() {
            polygonPoints = [];
            isDrawingPolygon = false;
            imageCanvas.removeEventListener('mousemove', updatePolygonPreview);
            polygonLassoButton.classList.remove('active');
            imageCanvas.style.cursor = 'default';
            activeTool = 'magicWand';
        }
        
        
        // imageCanvas.addEventListener('mousemove', continueLassoDrawing);
        
        // imageCanvas.addEventListener('mousemove', (e) => {
        //     if (activeTool === 'lasso' && isDrawingLasso) {
        //         continueLassoDrawing(e); // Continue lasso drawing
        //     }
        // });

        // imageCanvas.addEventListener('mousemove', (e) => {
        //     if ((activeTool === 'lasso' || activeTool === 'polygonLasso') && isDrawingLasso) {
        //         continueLassoDrawing(e);
        //     }
        // });
        
        // imageCanvas.addEventListener('mouseup', endLassoDrawing);
        // imageCanvas.addEventListener('mouseup', () => {
        //     if (activeTool === 'lasso' && isDrawingLasso) {
        //         endLassoDrawing(); // End lasso drawing
        //     }
        // });


        // imageCanvas.addEventListener('mouseup', () => {
        //     if (activeTool === 'lasso' || activeTool === 'polygonLasso') {
        //         endLassoDrawing();
        //     }
        // });
        
        // imageCanvas.addEventListener('mouseup', () => {
        //     if (activeTool === 'rectangle') {
        //         endRectangleDrawing();
        //     }
        // });


        function startRectangleDrawing(event) {
            isDrawingRectangle = true;
            startPoint = getCanvasPoint(event);
            endPoint = startPoint;
            redrawCanvas();
        }

        function updateRectangleDrawing(event) {
            if (!isDrawingRectangle) return;
            endPoint = getCanvasPoint(event);
            redrawCanvas();
        }

        function endRectangleDrawing() {
            if (!isDrawingRectangle) return;
            
            isDrawingRectangle = false;
            if (startPoint && endPoint) {
                const rect = normalizeRectangle(startPoint, endPoint);
                if (rect.width > 0 && rect.height > 0) {
                    const imageData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
                    const selectedRegion = getPixelsInRectangle(rect, imageCanvas.width);
                    updateSelectedRegions(selectedRegion);
                    redrawCanvas();
                }
            }
            resetRectangleState();
        }
        
        function normalizeRectangle(start, end) {
            return {
                x: Math.min(start.x, end.x),
                y: Math.min(start.y, end.y),
                width: Math.abs(end.x - start.x),
                height: Math.abs(end.y - start.y)
            };
        }

        function getPixelsInRectangle(rect, canvasWidth) {
            const selectedPixels = [];
            for (let y = rect.y; y < rect.y + rect.height; y++) {
                for (let x = rect.x; x < rect.x + rect.width; x++) {
                    selectedPixels.push(y * canvasWidth + x);
                }
            }
            return selectedPixels;
        }
        
        function resetRectangleState() {
            isRectangleActive = false;
            startPoint = null;
            endPoint = null;
            rectangleToolButton.classList.remove('active');
            imageCanvas.style.cursor = 'default';
            activeTool = 'magicWand'; // Reset to default tool
        }

        // Initialize button state
        polygonLassoButton.classList.remove('active');
    }


// Tool activation functions
function activateMagicWand() {
    activeTool = 'magicWand';
    imageCanvas.style.cursor = 'crosshair';
    magicWandButton.classList.add('active');
    lassoButton.classList.remove('active');
    polygonLassoButton.classList.remove('active');
}


    function activateLassoTool() {
        activeTool = 'lasso'; // Set active tool to lasso
        isLassoActive = true; // Enable lasso tool
        polygonLassoButton.classList.add('active'); // Update UI
        imageCanvas.classList.add('lasso-active'); // Update UI
        polygonLassoButton.textContent = 'Cancel Lasso'; // Update button text
    }
    
    function deactivateLassoTool() {
        activeTool = 'magicWand'; // Set active tool back to magic wand
        isLassoActive = false; // Disable lasso tool
        polygonLassoButton.classList.remove('active'); // Update UI
        imageCanvas.classList.remove('lasso-active'); // Update UI
        polygonLassoButton.textContent = 'Lasso Tool'; // Update button text
        lassoPoints = []; // Clear lasso points
        redrawCanvas(); // Redraw the canvas
    }

    function toggleLassoTool() {
        if (activeTool === 'lasso') {
            deactivateLassoTool(); // Deactivate lasso tool if it's already active
        } else {
            activateLassoTool(); // Activate lasso tool if it's not active
        }
    }
    
    // function startLassoDrawing(event) {
    //     if (activeTool === 'lasso') { // Only execute if lasso tool is active
    //         isDrawingLasso = true;
    //         const point = getCanvasPoint(event);
    //         lassoPoints = [point];
    //         redrawCanvas();
    //     }
    // }

    function startLassoDrawing(event) {
        isDrawingLasso = true;
        const point = getCanvasPoint(event);
        lassoPoints = [point];
        redrawCanvas();
    }
    function continueLassoDrawing(point) {
        if (!isDrawingLasso) return;
        
        const lastPoint = lassoPoints[lassoPoints.length - 1];
        if (Math.abs(point.x - lastPoint.x) > 2 || Math.abs(point.y - lastPoint.y) > 2) {
            lassoPoints.push(point);
            redrawCanvas();
        }
    }

    // function continueLassoDrawing(event) {
    //     if (activeTool === 'lasso' && isDrawingLasso) { // Only execute if lasso tool is active
    //         const point = getCanvasPoint(event);
    //         if (lassoPoints.length > 0) {
    //             const lastPoint = lassoPoints[lassoPoints.length - 1];
    //             if (Math.abs(point.x - lastPoint.x) > 2 || Math.abs(point.y - lastPoint.y) > 2) {
    //                 lassoPoints.push(point);
    //                 redrawCanvas();
    //             }
    //         }
    //     }
    // }

    // function continueLassoDrawing(event) {
    //     if (!isDrawingLasso) return;
        
    //     const point = getCanvasPoint(event);
    //     if (lassoPoints.length > 0) {
    //         const lastPoint = lassoPoints[lassoPoints.length - 1];
    //         if (Math.abs(point.x - lastPoint.x) > 2 || Math.abs(point.y - lastPoint.y) > 2) {
    //             lassoPoints.push(point);
    //             redrawCanvas();
    //         }
    //     }
    // }


    // function endLassoDrawing() {
    //     if (activeTool === 'lasso' && isDrawingLasso) {
    //         isDrawingLasso = false;
    //         if (lassoPoints.length > 2) {
    //             lassoPoints.push(lassoPoints[0]); // Close the path
    //             const imageData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
                
    //             // Create and send message to worker
    //             const worker = new Worker('lassoSelectionWorker.js');
    //             worker.postMessage({
    //                 imageData: imageData,
    //                 lassoPoints: lassoPoints
    //             });

    //             worker.onmessage = function(e) {
    //                 updateSelectedRegions(e.data.selectedRegion);
    //                 redrawCanvas();
                    
    //                 // Reset lasso tool
    //                 isLassoActive = false;
    //                 lassoPoints = [];
    //                 polygonLassoButton.classList.remove('active');
    //                 imageCanvas.classList.remove('lasso-active');
    //                 polygonLassoButton.textContent = 'Polygon Lasso Tool';
    //             };
    //         } else {
    //             lassoPoints = [];
    //             redrawCanvas();
    //         }
    //     }
    // }



    function endLassoDrawing() {
        if (!isDrawingLasso) return;
        
        isDrawingLasso = false;
        if (lassoPoints.length > 2) {
            // Close the path
            lassoPoints.push(lassoPoints[0]);
            
            // Create selection from lasso points
            const selectedPixels = getPixelsInLassoSelection();
            updateSelectedRegions(selectedPixels);
        }
        
        lassoPoints = [];
        redrawCanvas();
    }

    

function resetLassoState() {
    isLassoActive = false;
    lassoPoints = [];
    polygonLassoButton.classList.remove('active');
    lassoButton.classList.remove('active');
    imageCanvas.style.cursor = 'default';
    activeTool = 'magicWand'; // Reset to default tool
}


function getCanvasPoint(event) {
    const rect = imageCanvas.getBoundingClientRect();
    const scaleX = imageCanvas.width / rect.width;
    const scaleY = imageCanvas.height / rect.height;
    
    return {
        x: Math.floor((event.clientX - rect.left) * scaleX),
        y: Math.floor((event.clientY - rect.top) * scaleY)
    };
}



function redrawCanvas() {
    if (!originalImage) return;
    
    ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    ctx.drawImage(originalImage, 0, 0);
    
    // Draw existing selections
    displaySelectedRegionsBorders();
    
    // Draw tool-specific previews
    if (activeTool === 'lasso' && lassoPoints.length > 0) {
        drawLassoPreview();
    } else if (activeTool === 'polygonLasso' && polygonPoints.length > 0) {
        drawPolygonPreview();

    }
    else if (activeTool === TOOLS.CIRCLE_MAGIC_WAND) {
        drawCirclePreview();
    }
}



function drawLassoPreview() {
    ctx.beginPath();
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    
    ctx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
    for (let i = 1; i < lassoPoints.length; i++) {
        ctx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
    }
    
    if (isDrawingLasso) {
        ctx.stroke();
    } else {
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.fill();
        ctx.stroke();
    }
}



function drawPolygonPreview() {
    ctx.beginPath();
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    
    ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
    for (let i = 1; i < polygonPoints.length; i++) {
        ctx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
    }
    ctx.stroke();
    
    // Draw points
    polygonPoints.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = index === 0 ? '#ff0000' : '#00ff00';
        ctx.fill();
    });
}


// function resetPolygonTool() {
//     polygonPoints = [];
//     isDrawingPolygon = false;
//     imageCanvas.removeEventListener('mousemove', updatePolygonPreview);
//     polygonLassoButton.classList.remove('active');
//     imageCanvas.style.cursor = 'default';
//     activeTool = 'magicWand';
// }





const styles = `
.rectangle-active {
    cursor: crosshair !important;
}

#polygonLassoTool.active {
    background-color: #007bff;
    color: white;
}
`;

// Create and append style element
const styleElement = document.createElement('style');
styleElement.textContent = styles;
document.head.appendChild(styleElement);



polygonLassoButton.addEventListener('click', toggleLassoTool); // Toggle lasso tool

    function sendToMagicWand(imageData) {
        // Calculate center point of lasso selection
        const bounds = getLassoBounds();
        const centerX = Math.floor((bounds.minX + bounds.maxX) / 2);
        const centerY = Math.floor((bounds.minY + bounds.maxY) / 2);

        // Create and send message to worker
        const worker = new Worker('magicWand1Worker.js');
        worker.postMessage({
            imageData: imageData,
            startX: centerX,
            startY: centerY,
            tolerance: tolerance,
            mode: 'add'
        });

        worker.onmessage = function(e) {
            updateSelectedRegions(e.data.selectedRegion);
            redrawCanvas();
            
            // Reset lasso tool
            isLassoActive = false;
            lassoPoints = [];
            polygonLassoButton.classList.remove('active');
            imageCanvas.classList.remove('lasso-active');
            polygonLassoButton.textContent = 'Polygon Lasso Tool';
        };
    }

    function getLassoBounds() {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        lassoPoints.forEach(point => {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        });
        
        return { minX, minY, maxX, maxY };
    }

    // function getCanvasPoint(event) {
    //     const rect = imageCanvas.getBoundingClientRect();
    //     const scaleX = imageCanvas.width / rect.width;
    //     const scaleY = imageCanvas.height / rect.height;
        
    //     return {
    //         x: Math.floor((event.clientX - rect.left) * scaleX),
    //         y: Math.floor((event.clientY - rect.top) * scaleY)
    //     };
    // }

    // function redrawCanvas() {
    //     if (!originalImage) return;
        
    //     ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    //     ctx.drawImage(originalImage, 0, 0);
        
    //     // Draw existing selections

    //     // Draw current lasso selection
    //     if (lassoPoints.length > 0) {
    //         ctx.beginPath();
    //         ctx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
            
    //         for (let i = 1; i < lassoPoints.length; i++) {
    //             ctx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
    //         }
            
    //         ctx.strokeStyle = 'black';
    //         ctx.lineWidth = 2;
            
    //         if (isDrawingLasso) {
    //             ctx.setLineDash([5, 5]);
    //         } else {
    //             ctx.closePath();
    //             ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
    //             ctx.fill();
    //         }
            
    //         ctx.stroke();
    //         ctx.setLineDash([]);
    //     }
    // }

    // Initialize the tool


    initLassoTool();
});
