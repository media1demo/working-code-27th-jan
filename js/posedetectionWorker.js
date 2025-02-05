importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs');
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/posenet');

let net;

async function loadPoseNet() {
    if (!net) {
        net = await posenet.load();
    }
    return net;
}

self.onmessage = async function(e) {
    const { imageData } = e.data;
    
    try {
        // Ensure PoseNet is loaded
        await loadPoseNet();
        
        const width = imageData.width;
        const height = imageData.height;
        
        // Create temporary canvas for pose estimation
        const tempCanvas = new OffscreenCanvas(width, height);
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        tempCtx.putImageData(imageData, 0, 0);
        
        // Estimate pose
        const pose = await net.estimateSinglePose(tempCanvas, {
            flipHorizontal: false
        });
        
        // Draw keypoints and skeleton
        pose.keypoints.forEach(keypoint => {
            if (keypoint.score > 0.2) {
                const { x, y } = keypoint.position;
                tempCtx.beginPath();
                tempCtx.arc(x, y, 5, 0, 2 * Math.PI);
                tempCtx.fillStyle = 'red';
                tempCtx.fill();
                tempCtx.stroke();
                
                tempCtx.font = '12px Arial';
                tempCtx.fillStyle = 'black';
                tempCtx.fillText(keypoint.part, x + 10, y);
            }
        });
        
        // Draw skeleton
        const adjacentKeyPoints = posenet.getAdjacentKeyPoints(pose.keypoints, 0.2);
        adjacentKeyPoints.forEach(keypoints => {
            tempCtx.beginPath();
            tempCtx.moveTo(keypoints[0].position.x, keypoints[0].position.y);
            tempCtx.lineTo(keypoints[1].position.x, keypoints[1].position.y);
            tempCtx.strokeStyle = 'green';
            tempCtx.stroke();
        });
        
        // Get the final image with pose overlay
        const resultImageData = tempCtx.getImageData(0, 0, width, height);
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true
        }, [resultImageData.data.buffer]);
        
    } catch (error) {
        console.error("Error in worker:", error);
        self.postMessage({ error: error.message, isComplete: true });
    }
};