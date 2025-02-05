// function applyRunningEffect(imageData, selectedRegions, value) {
//   // Create result canvas with original image
//   const resultCanvas = new OffscreenCanvas(imageData.width, imageData.height);
//   const resultCtx = resultCanvas.getContext('2d');
//   resultCtx.putImageData(imageData, 0, 0);

//   // Create canvas for selected regions
//   const canvas = new OffscreenCanvas(imageData.width, imageData.height);
//   const ctx = canvas.getContext('2d');
  
//   // Create mask for selected regions
//   const selectedPixels = new Uint8ClampedArray(imageData.width * imageData.height * 4);
//   selectedPixels.fill(0);
//   selectedRegions.forEach(region => {
//       region.forEach(pixelIndex => {
//           const i = pixelIndex * 4;
//           selectedPixels[i] = imageData.data[i];
//           selectedPixels[i + 1] = imageData.data[i + 1];
//           selectedPixels[i + 2] = imageData.data[i + 2];
//           selectedPixels[i + 3] = imageData.data[i + 3];
//       });
//   });
  
//   // Put selected pixels into canvas
//   ctx.putImageData(new ImageData(selectedPixels, imageData.width, imageData.height), 0, 0);

//   // Create temporary canvas for the effect
//   const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
//   const tempCtx = tempCanvas.getContext('2d');

//   // Animation parameters
//   const stretchFactor = 1 + value * 0.1;
//   const waveAmplitude = value * 10;
//   const waveFrequency = 0.05;

//   // Apply wave and stretch effect
//   tempCtx.save();
//   tempCtx.translate(0, imageData.height / 2);
//   tempCtx.scale(1, stretchFactor);
//   tempCtx.translate(0, -imageData.height / 2);

//   for (let x = 0; x < imageData.width; x++) {
//       const yOffset = Math.sin(x * waveFrequency) * waveAmplitude;
//       tempCtx.drawImage(canvas, x, 0, 1, imageData.height, x, yOffset, 1, imageData.height);
//   }

//   tempCtx.restore();

//   // Clear the selected regions from the result
//   resultCtx.globalCompositeOperation = 'destination-out';
//   selectedRegions.forEach(region => {
//       region.forEach(pixelIndex => {
//           const x = pixelIndex % imageData.width;
//           const y = Math.floor(pixelIndex / imageData.width);
//           resultCtx.fillRect(x, y, 1, 1);
//       });
//   });

//   // Add transformed selected regions back
//   resultCtx.globalCompositeOperation = 'source-over';
//   resultCtx.drawImage(tempCanvas, 0, 0);

//   return resultCtx.getImageData(0, 0, imageData.width, imageData.height);
// }

// const DEFAULT_CYCLE_LENGTH = 0.5;
// let currentIteration = 0;

// self.onmessage = function(e) {
//   try {
//       const {
//           imageData,
//           selectedRegions,
//           value,
//           reset,
//           cycleLength = DEFAULT_CYCLE_LENGTH,
//       } = e.data;

//       if (reset) {
//           currentIteration = 0;
//       }

//       let resultImageData;
//       let progress;

//       if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
//           resultImageData = applyRunningEffect(imageData, selectedRegions, value);
//           currentIteration = (currentIteration + 1) % cycleLength;
//           progress = currentIteration / cycleLength;
//       } else {
//           resultImageData = new ImageData(
//               new Uint8ClampedArray(imageData.data),
//               imageData.width,
//               imageData.height
//           );
//           progress = 1;
//       }

//       self.postMessage(
//           {
//               segmentedImages: [resultImageData],
//               isComplete: true,
//               iteration: currentIteration,
//               progress,
//           },
//           [resultImageData.data.buffer]
//       );
//   } catch (error) {
//       self.postMessage({
//           error: `Animation error: ${error.message}`,
//           isComplete: true,
//           stack: error.stack,
//       });
//   }
// };
const DEFAULT_CYCLE_LENGTH = 0.5;

// Define poses for an exaggerated cartoon run
const poses = [
    // Wind-up pose
    { 
        rotation: -15,
        scale: { x: 1.2, y: 0.9 },
        leftLeg: 60, 
        rightLeg: -30, 
        leftArm: -70, 
        rightArm: 45,
        yOffset: 0
    },
    // Stretch pose
    { 
        rotation: 5,
        scale: { x: 0.8, y: 1.2 },
        leftLeg: -45, 
        rightLeg: 60, 
        leftArm: 45, 
        rightArm: -70,
        yOffset: -20
    },
    // Squash pose
    { 
        rotation: 15,
        scale: { x: 1.3, y: 0.8 },
        leftLeg: 30, 
        rightLeg: -60, 
        leftArm: -45, 
        rightArm: 70,
        yOffset: 10
    },
    // Recovery pose
    { 
        rotation: -5,
        scale: { x: 0.9, y: 1.1 },
        leftLeg: -60, 
        rightLeg: 30, 
        leftArm: 70, 
        rightArm: -45,
        yOffset: -15
    }
];

let currentIteration = 0;

function applyRunningEffect(imageData, selectedRegions, value) {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    
    const resultCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const resultCtx = resultCanvas.getContext('2d');
    resultCtx.putImageData(imageData, 0, 0);

    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');

    // Extract selected regions
    const selectedPixels = new Uint8ClampedArray(imageData.width * imageData.height * 4);
    selectedPixels.fill(0);
    
    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            const i = pixelIndex * 4;
            for (let j = 0; j < 4; j++) {
                selectedPixels[i + j] = imageData.data[i + j];
            }
        });
    });

    ctx.putImageData(new ImageData(selectedPixels, imageData.width, imageData.height), 0, 0);

    // Calculate interpolated pose
    const cycleProgress = value % 1;
    const currentIndex = Math.floor(cycleProgress * poses.length);
    const nextIndex = (currentIndex + 1) % poses.length;
    const interpolationValue = (cycleProgress * poses.length) % 1;

    const currentPose = interpolatePoses(
        poses[currentIndex],
        poses[nextIndex],
        easeInOutQuad(interpolationValue)
    );

    // Add whoosh effect
    const whooshOffset = Math.sin(value * Math.PI * 4) * 5;
    
    // Apply cartoon squash and stretch
    tempCtx.save();
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.translate(
        tempCanvas.width / 2 + whooshOffset, 
        tempCanvas.height / 2 + currentPose.yOffset
    );
    
    // Apply overall rotation and scaling
    tempCtx.rotate(currentPose.rotation * Math.PI / 180);
    tempCtx.scale(currentPose.scale.x, currentPose.scale.y);

    // Add anticipation lean
    const leanAngle = Math.sin(value * Math.PI * 2) * 10;
    tempCtx.rotate(leanAngle * Math.PI / 180);

    // Draw squashed/stretched body
    tempCtx.drawImage(canvas, 
        0, 0, imageData.width, imageData.height * 0.6,
        -imageData.width / 2, -imageData.height / 2, 
        imageData.width, imageData.height * 0.6
    );

    // Draw exaggerated legs
    const legStretch = 1 + Math.abs(Math.sin(value * Math.PI * 2)) * 0.2;
    
    tempCtx.save();
    tempCtx.scale(1, legStretch);
    tempCtx.rotate(currentPose.leftLeg * Math.PI / 180);
    tempCtx.drawImage(canvas,
        0, imageData.height * 0.6, imageData.width / 2, imageData.height * 0.4,
        -imageData.width / 4, 0, imageData.width / 2, imageData.height * 0.4
    );
    tempCtx.restore();

    tempCtx.save();
    tempCtx.scale(1, legStretch);
    tempCtx.rotate(currentPose.rightLeg * Math.PI / 180);
    tempCtx.drawImage(canvas,
        imageData.width / 2, imageData.height * 0.6, imageData.width / 2, imageData.height * 0.4,
        0, 0, imageData.width / 2, imageData.height * 0.4
    );
    tempCtx.restore();

    // Draw exaggerated arms with follow-through
    const armDelay = Math.sin((value - 0.1) * Math.PI * 2) * 15;
    
    tempCtx.save();
    tempCtx.rotate((currentPose.leftArm + armDelay) * Math.PI / 180);
    tempCtx.drawImage(canvas,
        0, imageData.height * 0.2, imageData.width / 2, imageData.height * 0.2,
        -imageData.width / 4, -imageData.height * 0.2, 
        imageData.width / 2, imageData.height * 0.2
    );
    tempCtx.restore();

    tempCtx.save();
    tempCtx.rotate((currentPose.rightArm - armDelay) * Math.PI / 180);
    tempCtx.drawImage(canvas,
        imageData.width / 2, imageData.height * 0.2, imageData.width / 2, imageData.height * 0.2,
        0, -imageData.height * 0.2, imageData.width / 2, imageData.height * 0.2
    );
    tempCtx.restore();

    tempCtx.restore();

    // Clear selected regions and add transformed image
    resultCtx.globalCompositeOperation = 'destination-out';
    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            const x = pixelIndex % imageData.width;
            const y = Math.floor(pixelIndex / imageData.width);
            resultCtx.fillRect(x, y, 1, 1);
        });
    });

    resultCtx.globalCompositeOperation = 'source-over';
    resultCtx.drawImage(tempCanvas, 0, 0);

    return resultCtx.getImageData(0, 0, imageData.width, imageData.height);
}

// Helper function to interpolate between poses
function interpolatePoses(pose1, pose2, t) {
    return {
        rotation: lerp(pose1.rotation, pose2.rotation, t),
        scale: {
            x: lerp(pose1.scale.x, pose2.scale.x, t),
            y: lerp(pose1.scale.y, pose2.scale.y, t)
        },
        leftLeg: lerp(pose1.leftLeg, pose2.leftLeg, t),
        rightLeg: lerp(pose1.rightLeg, pose2.rightLeg, t),
        leftArm: lerp(pose1.leftArm, pose2.leftArm, t),
        rightArm: lerp(pose1.rightArm, pose2.rightArm, t),
        yOffset: lerp(pose1.yOffset, pose2.yOffset, t)
    };
}

// Linear interpolation
function lerp(start, end, t) {
    return start + (end - start) * t;
}

// Smooth easing function
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

self.onmessage = function(e) {
    try {
        const {
            imageData,
            selectedRegions,
            value,
            reset,
            cycleLength = DEFAULT_CYCLE_LENGTH,
        } = e.data;

        if (reset) {
            currentIteration = 0;
        }

        let resultImageData;
        let progress;

        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applyRunningEffect(imageData, selectedRegions, value);
            currentIteration = (currentIteration + 1) % cycleLength;
            progress = currentIteration / cycleLength;
        } else {
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            progress = 1;
        }

        self.postMessage(
            {
                segmentedImages: [resultImageData],
                isComplete: true,
                iteration: currentIteration,
                progress,
            },
            [resultImageData.data.buffer]
        );
    } catch (error) {
        self.postMessage({
            error: `Animation error: ${error.message}`,
            isComplete: true,
            stack: error.stack,
        });
    }
};