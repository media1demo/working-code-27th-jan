
let segmentationResult;
let processedData = null; 
let net;
let imageArray = []; 

function processSegmentVariations(imageData, partName) {
    return new Promise((resolve) => {

        segmentationWorker.postMessage({
            imageData: imageData.data,
            partName: partName,
            width: imageData.width,
            height: imageData.height
        });

        segmentationWorker.onmessage = function(e) {
            const { type, extremePoints, averages, partName } = e.data;

            const variations = [{
                data: new Uint8ClampedArray(imageData.data),
                extremePoints: extremePoints,
                points: {}
            }];

            // Store points for averaging
            if (!collectedPoints.has(partName)) {
                collectedPoints.set(partName, []);
            }

            if (extremePoints && extremePoints.top) collectedPoints.get(partName).push(extremePoints.top);
            if (extremePoints && extremePoints.bottom) collectedPoints.get(partName).push(extremePoints.bottom);

            // Initialize points object with missing properties
            Object.keys(BODY_PARTS).forEach(part => {
                variations[0].points[part] = {
                    top: null,
                    bottom: null
                };
            });

            // Assign the extreme points to the correct properties
            if (extremePoints) {
                variations[0].points[partName] = {
                    top: extremePoints.top,
                    bottom: extremePoints.bottom
                };
            }

            resolve(variations);
        };
    });
}

const BODY_PARTS = {
    'left_face': { name: 'Left Face', description: 'Left side of the face' },
    'right_face': { name: 'Right Face', description: 'Right side of the face' },
    'left_upper_arm_front': { name: 'Left Upper Arm (Front)', description: 'Front of left upper arm' },
    'left_upper_arm_back': { name: 'Left Upper Arm (Back)', description: 'Back of left upper arm' },
    'right_upper_arm_front': { name: 'Right Upper Arm (Front)', description: 'Front of right upper arm' },
    'right_upper_arm_back': { name: 'Right Upper Arm (Back)', description: 'Back of right upper arm' },
    'left_lower_arm_front': { name: 'Left Lower Arm (Front)', description: 'Front of left forearm' },
    'left_lower_arm_back': { name: 'Left Lower Arm (Back)', description: 'Back of left forearm' },
    'right_lower_arm_front': { name: 'Right Lower Arm (Front)', description: 'Front of right forearm' },
    'right_lower_arm_back': { name: 'Right Lower Arm (Back)', description: 'Back of right forearm' },
    'left_hand': { name: 'Left Hand', description: 'Left hand' },
    'right_hand': { name: 'Right Hand', description: 'Right hand' },
    'torso_front': { name: 'Torso Front', description: 'Front of the torso' },
    'torso_back': { name: 'Torso Back', description: 'Back of the torso' },
    'left_upper_leg_front': { name: 'Left Upper Leg (Front)', description: 'Front of left thigh' },
    'left_upper_leg_back': { name: 'Left Upper Leg (Back)', description: 'Back of left thigh' },
    'right_upper_leg_front': { name: 'Right Upper Leg (Front)', description: 'Front of right thigh' },
    'right_upper_leg_back': { name: 'Right Upper Leg (Back)', description: 'Back of right thigh' },
    'left_lower_leg_front': { name: 'Left Lower Leg (Front)', description: 'Front of left calf' },
    'left_lower_leg_back': { name: 'Left Lower Leg (Back)', description: 'Back of left calf' },
    'right_lower_leg_front': { name: 'Right Lower Leg (Front)', description: 'Front of right calf' },
    'right_lower_leg_back': { name: 'Right Lower Leg (Back)', description: 'Back of right calf' },
    'left_foot': { name: 'Left Foot', description: 'Left foot' },
    'right_foot': { name: 'Right Foot', description: 'Right foot' },
    'left_upper_foot': { name: 'Left Upper Foot', description: 'Upper part of left foot' },
    'left_lower_foot': { name: 'Left Lower Foot', description: 'Lower part of left foot' },
    'right_upper_foot': { name: 'Right Upper Foot', description: 'Upper part of right foot' },
    'right_lower_foot': { name: 'Right Lower Foot', description: 'Lower part of right foot' }
};

document.getElementById('imageUpload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const img = document.getElementById('sourceImage');
        img.src = e.target.result;
        img.onload = async () => {
            await loadModels();
            await prepareSegmentation();
        };
    };
    
    reader.readAsDataURL(file);
});

async function prepareSegmentation() {
    const img = document.getElementById('sourceImage');
    segmentationResult = await net.segmentPersonParts(img);
}

const segmentationWorker = new Worker('keypoints-worker.js');
let collectedPoints = new Map();

function startProcessing(processType) {
    if (!segmentationResult) {
        alert('Segmentation not ready. Please wait.');
        return;
    }
    const count = parseInt(document.getElementById('imageCount').value, 10) || 1;
    if (isNaN(count) || count < 1) {
        alert('Please enter a valid number (multiple of 5).');
        return;
    }
    
    // Clear imageArray before starting new processing
    imageArray = [];
    if (!window.imageArrayCollection) {
        window.imageArrayCollection = [];
    }

    for (let i = 0; i < count; i++) {
        console.log(i);
        processImageWithOverlay(processType);
    }

    // Capture the source image data and add it to the imageArray
    const gifImage = document.getElementById('sourceImage');
    const canvas = document.createElement('canvas');
    canvas.width = gifImage.width;
    canvas.height = gifImage.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(gifImage, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const sourceImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Create a new array for this processing instance
    const currentProcessImageArray = [sourceImageData.data];

    // Add the image data to imageArray if not already added
    if (!imageArray.some(arr => arr.length === imageData.data.length && 
        arr.every((val, index) => val === imageData.data[index]))) {
    }
    
}

async function loadModels() {
    net = await bodyPix.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 0.75,
        quantBytes: 2
    });
}

document.getElementById('visualizeBtn').addEventListener('click', () => {
    startProcessing('visualize');
});

document.getElementById('sourceImage').onload = async () => {
    await loadModels();
    await prepareSegmentation(); // Automatically prepare segmentation
};

async function processImageWithOverlay(processType) {
    const img = document.getElementById('sourceImage');
    const mainContainer = document.getElementById('mainContainer');
    mainContainer.innerHTML = '';

    const imageGrid = document.createElement('div');
    imageGrid.className = 'image-grid';

    const segmentation = segmentationResult;
    const bodyPartImages = {};
    collectedPoints.clear();

    for (let partId = 0; partId < 24; partId++) {
        const partName = Object.keys(BODY_PARTS)[partId];
        if (!partName) continue;
        if (!segmentation.data.includes(partId)) {
            console.log(`Part ${partName} not detected in segmentation.`);
            continue; // Skip processing if part is not present
        }

        const segmentCanvas = document.createElement('canvas');
        segmentCanvas.width = img.width;
        segmentCanvas.height = img.height;
        const segmentCtx = segmentCanvas.getContext('2d');
        segmentCtx.drawImage(img, 0, 0);

        const imageData = segmentCtx.getImageData(0, 0, img.width, img.height);
        for (let i = 0; i < segmentation.data.length; i++) {
            if (segmentation.data[i] !== partId) imageData.data[i * 4 + 3] = 0;
        }

        const variations = await processSegmentVariations(imageData, partName);
        bodyPartImages[partName] = variations.map(v => ({
            imageData: v.data,
            width: img.width,
            height: img.height,
            extremePoints: v.extremePoints
        }));
    }
    
    const pointsToProcess = {
        leftFace: collectedPoints.get('left_face'),
        rightFace: collectedPoints.get('right_face'),
        leftUpperArmFront: collectedPoints.get('left_upper_arm_front'),
        leftUpperArmBack: collectedPoints.get('left_upper_arm_back'),
        leftLowerArmFront: collectedPoints.get('left_lower_arm_front'),
        leftLowerArmBack: collectedPoints.get('left_lower_arm_back'),
        leftHand: collectedPoints.get('left_hand'),
        rightUpperArmFront: collectedPoints.get('right_upper_arm_front'),
        rightUpperArmBack: collectedPoints.get('right_upper_arm_back'),
        rightLowerArmFront: collectedPoints.get('right_lower_arm_front'),
        rightLowerArmBack: collectedPoints.get('right_lower_arm_back'),
        rightHand: collectedPoints.get('right_hand'),
        torsoFront: collectedPoints.get('torso_front'),
        torsoBack: collectedPoints.get('torso_back'),
        leftUpperLegFront: collectedPoints.get('left_upper_leg_front'),
        leftUpperLegBack: collectedPoints.get('left_upper_leg_back'),
        leftLowerLegFront: collectedPoints.get('left_lower_leg_front'),
        leftLowerLegBack: collectedPoints.get('left_lower_leg_back'),
        rightUpperLegFront: collectedPoints.get('right_upper_leg_front'),
        rightUpperLegBack: collectedPoints.get('right_upper_leg_back'),
        rightLowerLegFront: collectedPoints.get('right_lower_leg_front'),
        rightLowerLegBack: collectedPoints.get('right_lower_leg_back'),
        leftFoot: collectedPoints.get('left_foot'),
        rightFoot: collectedPoints.get('right_foot')
    };

    console.log('imageArray :>> ', imageArray);    

    segmentationWorker.postMessage({
        type: 'calculateAverage',
        points: pointsToProcess,
        bodyPartImages,
        partNames: {
            leftUpperArmFront: 'left_upper_arm_front',
            leftUpperArmBack: 'left_upper_arm_back',
            leftLowerArmFront: 'left_lower_arm_front',
            leftLowerArmBack: 'left_lower_arm_back',
            leftHand: 'left_hand',
            rightUpperArmFront: 'right_upper_arm_front',
            rightUpperArmBack: 'right_upper_arm_back',
            rightLowerArmFront: 'right_lower_arm_front',
            rightLowerArmBack: 'right_lower_arm_back',
            rightHand: 'right_hand',
            leftFoot: 'left_foot',
            rightFoot: 'right_foot',
            leftUpperFoot: 'left_upper_foot',
            leftLowerFoot: 'left_lower_foot',
            rightUpperFoot: 'right_upper_foot',
            rightLowerFoot: 'right_lower_foot',
            leftUpperLegFront: 'left_upper_leg_front',
            leftUpperLegBack: 'left_upper_leg_back',
            leftLowerLegFront: 'left_lower_leg_front',
            leftLowerLegBack: 'left_lower_leg_back',
            rightUpperLegFront: 'right_upper_leg_front',
            rightUpperLegBack: 'right_upper_leg_back',
            rightLowerLegFront: 'right_lower_leg_front',
            rightLowerLegBack: 'right_lower_leg_back'
        },
        offset: { x: 100, y: 50 },
        imageArray
    }); 

    segmentationWorker.onmessage = e => {
        const { type, averages, extremePoints, partNames } = e.data;
        
        if (type === 'combinedResults' && (averages || extremePoints)) {
            processedData = {
                averages,
                extremePoints,
                partNames,
                timestamp: Date.now()
            };
            console.log('processedData :>> ', processedData);

            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
     
            const wrapper = document.createElement('div');
            wrapper.className = 'image-wrapper';
            wrapper.appendChild(canvas);
            wrapper.appendChild(document.createElement('div')).className = 'keypoints-label';
            mainContainer.appendChild(wrapper);

            // Determine which workers to use based on extreme points
            const handParts = [
                'leftHand', 'rightHand', 
                'leftUpperArmFront', 'leftUpperArmBack', 
                'leftLowerArmFront', 'leftLowerArmBack',
                'rightUpperArmFront', 'rightUpperArmBack', 
                'rightLowerArmFront', 'rightLowerArmBack'
            ];

            const legParts = [
                'leftFoot', 'rightFoot',
                'leftUpperLegFront', 'leftUpperLegBack', 
                'leftLowerLegFront', 'leftLowerLegBack',
                'rightUpperLegFront', 'rightUpperLegBack', 
                'rightLowerLegFront', 'rightLowerLegBack'
            ];

            // Check if any hand or leg parts are present
            const hasHandParts = handParts.some(part => 
                extremePoints[part] && 
                Object.keys(extremePoints[part]).length > 0
            );

            const hasLegParts = legParts.some(part => 
                extremePoints[part] && 
                Object.keys(extremePoints[part]).length > 0
            );

            // Create workers conditionally
            const workersToUse = [];
            if (hasHandParts) {
                const postprocessingWorker = new Worker('handworker.js');
                workersToUse.push({
                    worker: postprocessingWorker,
                    type: 'hand'
                });
            }

            if (hasLegParts) {
                const legWorker = new Worker('legworker.js');
                workersToUse.push({
                    worker: legWorker,
                    type: 'leg'
                });
            }

            // Prepare worker messages
            const workerMessages = workersToUse.map(({type}) => ({
                type: e.data.type,
                imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
                width: canvas.width,
                height: canvas.height,
                extremePoints,
                averages,
                timestamp: Date.now(),
                partNames,
                bodyPartImages,
                rotationAngles: [0, 45, 90, 135, 180],
                imageArray
            }));
            console.log('extremePoints :>> ', extremePoints);
            // Use Promise.allSettled to handle workers
            Promise.allSettled(
                workersToUse.map(({worker}, index) => 
                    new Promise((resolve, reject) => {
                        worker.onmessage = (e) => {
                            if (e.data.type === 'processedVariations') {
                                resolve({
                                    type: workersToUse[index].type,
                                    variations: e.data.variations
                                });
                            }
                        };
                        worker.onerror = reject;
                        worker.postMessage(workerMessages[index]);
                    })
                )
            ).then((results) => {
          
          
                // Separate hand and leg variations
                const handWorkerVariations = results
                    .filter(r => r.status === 'fulfilled' && r.value.type === 'hand')[0]?.value?.variations || [];
                
                const legWorkerVariations = results
                    .filter(r => r.status === 'fulfilled' && r.value.type === 'leg')[0]?.value?.variations || [];

                // Rest of the existing code for visualization remains the same
                const maxVariations = Math.max(handWorkerVariations.length, legWorkerVariations.length);
                const combinedVariations = [];

                const combinedDiv = document.getElementById('combinedid') || (() => {
                    const div = document.createElement('div');
                    div.id = 'combinedid';
                    div.style.display = 'flex';
                    div.style.flexWrap = 'wrap';
                    div.style.flexDirection = 'column'; // Change to column for better layout
                    div.style.justifyContent = 'center';
                    div.style.gap = '10px';
                    document.body.appendChild(div);
                    return div;
                })();

                // combinedDiv.innerHTML = ''; // Clear previous images


                const combinedHeader = document.createElement('h2');
combinedHeader.textContent = 'Combined Hand and Leg Variations';
combinedHeader.style.marginBottom = '20px';
combinedDiv.innerHTML = ''; // Clear previous content
combinedDiv.appendChild(combinedHeader);
const combinedAnimatedContainer = document.createElement('div');
combinedAnimatedContainer.className = 'combined-animated-container';
combinedAnimatedContainer.style.display = 'flex';
combinedAnimatedContainer.style.justifyContent = 'center';
combinedAnimatedContainer.style.marginBottom = '20px';
// Create a static variations container
const combinedStaticVariationsContainer = document.createElement('div');
combinedStaticVariationsContainer.className = 'combined-static-variations';
combinedStaticVariationsContainer.style.display = 'flex';
combinedStaticVariationsContainer.style.flexWrap = 'wrap';
combinedStaticVariationsContainer.style.justifyContent = 'center';
combinedStaticVariationsContainer.style.gap = '10px';

                for (let i = 0; i < maxVariations; i++) {
                    
                    const combinedCanvas = document.createElement('canvas');
                    const combinedWidth = handWorkerVariations[0]?.width || legWorkerVariations[0]?.width;
                    const combinedHeight = handWorkerVariations[0]?.height || legWorkerVariations[0]?.height;
                    
                    if (!combinedWidth || !combinedHeight) {
                        console.warn('No valid width or height for combined canvas');
                        continue;
                    }

                    combinedCanvas.width = combinedWidth;
                    combinedCanvas.height = combinedHeight;
                    combinedCanvas.style.height = "200px";
                    combinedCanvas.style.width = "200px";
                    combinedCanvas.style.border = "1px solid #ddd";

                    const combinedCtx = combinedCanvas.getContext('2d');
                    const overlayImageData = combinedCtx.createImageData(combinedWidth, combinedHeight);

                    const handVariation = handWorkerVariations[i];
                    const legVariation = legWorkerVariations[i];

                    if (handVariation && legVariation) {
                        // Blend images

                        const combinedVariation = {
            width: handVariation.width,
            height: handVariation.height,
            imageData: new Uint8ClampedArray(handVariation.width * handVariation.height * 4)
        };
             // Blend images
             for (let j = 0; j < combinedVariation.imageData.length; j += 4) {
            combinedVariation.imageData[j] = Math.min(255, handVariation.imageData[j] * 0.5 + legVariation.imageData[j] * 0.5);
            combinedVariation.imageData[j + 1] = Math.min(255, handVariation.imageData[j + 1] * 0.5 + legVariation.imageData[j + 1] * 0.5);
            combinedVariation.imageData[j + 2] = Math.min(255, handVariation.imageData[j + 2] * 0.5 + legVariation.imageData[j + 2] * 0.5);
            combinedVariation.imageData[j + 3] = Math.min(255, handVariation.imageData[j + 3] * 0.5 + legVariation.imageData[j + 3] * 0.5);
        }
        combinedVariations.push(combinedVariation);

                        // for (let j = 0; j < overlayImageData.data.length; j += 4) {
                        //     overlayImageData.data[j] = Math.min(255, handVariation.imageData[j] * 0.5 + legVariation.imageData[j] * 0.5);
                        //     overlayImageData.data[j + 1] = Math.min(255, handVariation.imageData[j + 1] * 0.5 + legVariation.imageData[j + 1] * 0.5);
                        //     overlayImageData.data[j + 2] = Math.min(255, handVariation.imageData[j + 2] * 0.5 + legVariation.imageData[j + 2] * 0.5);
                        //     overlayImageData.data[j + 3] = Math.min(255, handVariation.imageData[j + 3] * 0.5 + legVariation.imageData[j + 3] * 0.5);
                        // }

                    } else if (handVariation) {
                        overlayImageData.data.set(handVariation.imageData);
                    } else if (legVariation) {
                        overlayImageData.data.set(legVariation.imageData);
                    } 
                    else {
                        console.warn(`No variation found for iteration ${i}`);
                        continue;
                    }

                    // Render combined image
                    combinedCtx.putImageData(overlayImageData, 0, 0);

                    // Create wrapper with label
                    const combinedWrapper = document.createElement('div');
                    combinedWrapper.style.textAlign = 'center';
                    
                    let labelText = 'Combined Variation ';
                    if (handVariation && legVariation) {
                        labelText += `${i + 1} (Blended)`;
                    } else if (handVariation) {
                        labelText += `${i + 1} (Hand Only)`;
                    } else if (legVariation) {
                        labelText += `${i + 1} (Leg Only)`;
                    }
                    
                    combinedWrapper.innerHTML = `<p>${labelText}</p>`;
                    combinedWrapper.appendChild(combinedCanvas);

                    
                    
                    // Add to combined div
                    combinedDiv.appendChild(combinedWrapper);
                }
                // Visualize variations in sets
                const handSetsOfFive = [];
                const legSetsOfFive = [];
                const combinedContainer = document.createElement('div');
                combinedContainer.id = 'combined-variations-container';
                combinedContainer.style.marginBottom = '40px';
                document.body.appendChild(combinedContainer);
                if (combinedVariations.length > 0) {
                    visualizeVariations(combinedVariations, combinedContainer, true);
                }
                for (let i = 0; i < handWorkerVariations.length; i += 5) {
                    handSetsOfFive.push(handWorkerVariations.slice(i, i + 5));
                }

                for (let i = 0; i < legWorkerVariations.length; i += 5) {
                    legSetsOfFive.push(legWorkerVariations.slice(i, i + 5));
                }

                handSetsOfFive.forEach((set, setIndex) => {
                    const container = document.createElement('div');
                    container.id = `hand-variations-container-${setIndex}`;
                    container.style.marginBottom = '40px';
                    document.body.appendChild(container);
                    visualizeVariations(set, container);
                });

                legSetsOfFive.forEach((set, setIndex) => {
                    const container = document.createElement('div');
                    container.id = `leg-variations-container-${setIndex}`;
                    container.style.marginBottom = '40px';
                    document.body.appendChild(container);
                    visualizeVariations(set, container);
                });

            }).catch(error => {
                console.error('Worker processing error:', error);
            });
        }
    };
}

function visualizeVariations(variations, container, isCombined = false) {
    container.innerHTML = '';

    // Create a container for the animated view
    const animatedContainer = document.createElement('div');
    animatedContainer.className = 'animated-container';
    animatedContainer.style.display = 'flex';
    animatedContainer.style.justifyContent = 'center';
    animatedContainer.style.marginBottom = '20px';

    // Create title for variations
    const titleContainer = document.createElement('div');
    titleContainer.style.textAlign = 'center';
    titleContainer.style.marginBottom = '15px';
    
    const titleText = isCombined 
        ? 'Combined Hand and Leg Variations' 
        : (container.id.includes('hand') ? 'Hand Variations' : 'Leg Variations');
    
    const title = document.createElement('h3');
    title.textContent = titleText;
    titleContainer.appendChild(title);
    container.appendChild(titleContainer);

    // Create a container for individual images
    const individualImagesContainer = document.createElement('div');
    individualImagesContainer.className = 'individual-images-container';
    individualImagesContainer.style.display = 'flex';
    individualImagesContainer.style.flexWrap = 'wrap';
    individualImagesContainer.style.justifyContent = 'center';
    individualImagesContainer.style.gap = '10px';

    // Animation container for GIF-like effect
    const animationCanvases = [];

    variations.forEach((variation, index) => {
        if (!variation.imageData) {
            console.warn(`Variation ${index} has no imageData. Skipping.`);
            return;
        }

        // Animated Canvas (for GIF-like effect)
        const animatedCanvas = document.createElement('canvas');
        animatedCanvas.width = variation.width;
        animatedCanvas.height = variation.height;
        animatedCanvas.style.height = "200px";
        animatedCanvas.style.width = "200px";
        animatedCanvas.style.margin = "0 5px";

        const animatedCtx = animatedCanvas.getContext('2d');
        animatedCtx.putImageData(new ImageData(variation.imageData, variation.width, variation.height), 0, 0);
        
        animationCanvases.push(animatedCanvas);
        animatedContainer.appendChild(animatedCanvas);

        // Individual Image Canvas
        const individualCanvas = document.createElement('canvas');
        individualCanvas.width = variation.width;
        individualCanvas.height = variation.height;
        individualCanvas.style.height = "150px";
        individualCanvas.style.width = "150px";
        individualCanvas.style.border = "1px solid #ddd";

        const individualCtx = individualCanvas.getContext('2d');
        individualCtx.putImageData(new ImageData(variation.imageData, variation.width, variation.height), 0, 0);

        // Create a wrapper for individual image with index
        const individualWrapper = document.createElement('div');
        individualWrapper.style.textAlign = 'center';
        individualWrapper.innerHTML = `<p>${isCombined ? 'Combined' : ''} Variation ${index + 1}</p>`;
        individualWrapper.appendChild(individualCanvas);
        individualImagesContainer.appendChild(individualWrapper);
    });

    // Animated GIF-like Effect
    function animateFrames() {
        let currentIndex = 0;

        function showNextFrame() {
            // Hide all animated canvases
            animationCanvases.forEach(canvas => {
                canvas.style.display = 'none';
            });

            // Show the current canvas  
            animationCanvases[currentIndex].style.display = 'block';

            // Increment the index
            currentIndex = (currentIndex + 1) % animationCanvases.length;

            // Set timeout for the next frame
            setTimeout(showNextFrame, 500);
        }

        // Start the animation if there are multiple frames
        if (animationCanvases.length > 1) {
            showNextFrame();
        } else if (animationCanvases.length === 1) {
            animationCanvases[0].style.display = 'block';
        }
    }

    // Add containers to the main container
    container.appendChild(animatedContainer);
    container.appendChild(document.createElement('hr')); // Separator
    container.appendChild(individualImagesContainer);

    // Start the animation
    animateFrames();
}

