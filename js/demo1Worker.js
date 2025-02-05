// Constants
const ALPHA_DELETE_THRESHOLD = 244;
const MAX_WIDTH_LIMIT = 1500;
const MAX_HEIGHT_LIMIT = 1500;

// Utility functions
function getPixel(imageData, { x, y }) {
    const index = (y * imageData.width + x) * 4;
    return [
        imageData.data[index],
        imageData.data[index + 1],
        imageData.data[index + 2],
        imageData.data[index + 3]
    ];
}

function getPixelDeleteEnergy() {
    const numColors = 3;
    const maxColorDistance = 255;
    const numNeighbors = 2;
    const multiplier = 2;
    const maxSeamSize = Math.max(MAX_WIDTH_LIMIT, MAX_HEIGHT_LIMIT);
    return -1 * multiplier * numNeighbors * maxSeamSize * numColors * (maxColorDistance ** 2);
}

function getPixelEnergy(left, middle, right) {
    const [mR, mG, mB, mA] = middle;

    let lEnergy = 0;
    if (left) {
        const [lR, lG, lB] = left;
        lEnergy = (lR - mR) ** 2 + (lG - mG) ** 2 + (lB - mB) ** 2;
    }

    let rEnergy = 0;
    if (right) {
        const [rR, rG, rB] = right;
        rEnergy = (rR - mR) ** 2 + (rG - mG) ** 2 + (rB - mB) ** 2;
    }

    return mA > ALPHA_DELETE_THRESHOLD ? (lEnergy + rEnergy) : getPixelDeleteEnergy();
}

function getPixelEnergyH(img, { w }, { x, y }) {
    const left = (x - 1) >= 0 ? getPixel(img, { x: x - 1, y }) : null;
    const middle = getPixel(img, { x, y });
    const right = (x + 1) < w ? getPixel(img, { x: x + 1, y }) : null;
    return getPixelEnergy(left, middle, right);
}

function calculateEnergyMapH(img, mask, { w, h }) {
    const energyMap = Array(h).fill().map(() => Array(w).fill(Infinity));
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            let energy = getPixelEnergyH(img, { w, h }, { x, y });
            
            // Check if the pixel is part of the mask
            const maskIdx = (y * w + x) * 4;
            if (mask && mask.data[maskIdx + 0] > 200 && mask.data[maskIdx + 1] < 50 && mask.data[maskIdx + 2] < 50) {
                // If it's a red pixel (part of the mask), set energy to a very low value
                energy = Number.MIN_SAFE_INTEGER;
            }
            
            energyMap[y][x] = energy;
        }
    }
    return energyMap;
}

function findLowEnergySeamH(energyMap, { w, h }) {
    const seamsMap = Array(h).fill().map(() => Array(w).fill(null));

    // Populate the first row of the map
    for (let x = 0; x < w; x++) {
        seamsMap[0][x] = {
            energy: energyMap[0][x],
            coordinate: { x, y: 0 },
            previous: null,
        };
    }

    // Populate the rest of the rows
    for (let y = 1; y < h; y++) {
        for (let x = 0; x < w; x++) {
            let minPrevEnergy = Infinity;
            let minPrevX = x;
            for (let i = (x - 1); i <= (x + 1); i++) {
                if (i >= 0 && i < w && seamsMap[y - 1][i].energy < minPrevEnergy) {
                    minPrevEnergy = seamsMap[y - 1][i].energy;
                    minPrevX = i;
                }
            }

            seamsMap[y][x] = {
                energy: minPrevEnergy + energyMap[y][x],
                coordinate: { x, y },
                previous: { x: minPrevX, y: y - 1 },
            };
        }
    }

    // Find where the minimum energy seam ends
    let lastMinCoordinate = null;
    let minSeamEnergy = Infinity;
    for (let x = 0; x < w; x++) {
        if (seamsMap[h - 1][x].energy < minSeamEnergy) {
            minSeamEnergy = seamsMap[h - 1][x].energy;
            lastMinCoordinate = { x, y: h - 1 };
        }
    }

    // Find the minimal energy seam
    const seam = [];
    if (!lastMinCoordinate) return seam;

    let currentSeam = seamsMap[lastMinCoordinate.y][lastMinCoordinate.x];
    while (currentSeam) {
        seam.push(currentSeam.coordinate);
        const prevMinCoordinates = currentSeam.previous;
        if (!prevMinCoordinates) {
            currentSeam = null;
        } else {
            currentSeam = seamsMap[prevMinCoordinates.y][prevMinCoordinates.x];
        }
    }

    return seam.reverse();
}

function deleteSeamH(img, seam, { w }) {
    const newImageData = new ImageData(w - 1, img.height);
    seam.forEach(({ x: seamX, y: seamY }) => {
        let newX = 0;
        for (let x = 0; x < w; x++) {
            if (x !== seamX) {
                const oldIdx = (seamY * w + x) * 4;
                const newIdx = (seamY * (w - 1) + newX) * 4;
                for (let i = 0; i < 4; i++) {
                    newImageData.data[newIdx + i] = img.data[oldIdx + i];
                }
                newX++;
            }
        }
    });
    return newImageData;
}

function resizeImage(imageData, mask, targetWidth) {
    let currentImageData = imageData;
    let currentMask = mask;
    const size = { w: imageData.width, h: imageData.height };

    while (size.w > targetWidth) {
        let energyMap = calculateEnergyMapH(currentImageData, currentMask, size);
        const seam = findLowEnergySeamH(energyMap, size);
        currentImageData = deleteSeamH(currentImageData, seam, size);
        if (currentMask) {
            currentMask = deleteSeamH(currentMask, seam, size);
        }
        size.w--;
    }

    return currentImageData;
}

// Worker message handler
self.onmessage = function(e) {
    const { imageData, selectedRegions, imageCount, maxBrightness } = e.data;
    
    // Create a mask from selected regions
    const mask = new ImageData(imageData.width, imageData.height);
    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            const index = pixelIndex * 4;
            mask.data[index] = 255;  // Red
            mask.data[index + 1] = 0;  // Green
            mask.data[index + 2] = 0;  // Blue
            mask.data[index + 3] = 255;  // Alpha
        });
    });

    // Calculate target width (e.g., 90% of original width)
    const targetWidth = Math.floor(imageData.width * 0.9);

    // Perform seam carving
    const resizedImageData = resizeImage(imageData, mask, targetWidth);

    // Send the result back to the main thread
    self.postMessage({
        segmentedImages: [resizedImageData],
        isComplete: true
    });
};