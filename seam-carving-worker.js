// seam-carving-worker.js
const OBJECT_REMOVAL_ENERGY = -1000;

// Utility functions
function getPixel(imageData, { x, y }) {
    const i = (y * imageData.width + x) * 4;
    return [
        imageData.data[i],
        imageData.data[i + 1],
        imageData.data[i + 2],
        imageData.data[i + 3]
    ];
}

function setPixel(imageData, { x, y }, color) {
    const i = (y * imageData.width + x) * 4;
    imageData.data[i] = color[0];
    imageData.data[i + 1] = color[1];
    imageData.data[i + 2] = color[2];
    imageData.data[i + 3] = color[3];
}

function createMatrix(w, h, filler) {
    return new Array(h).fill(null).map(() => new Array(w).fill(filler));
}

function getPixelEnergy(left, middle, right) {
    const [mR, mG, mB] = middle;
    
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
    
    return Math.sqrt(lEnergy + rEnergy);
}

function calculateEnergyMap(img, { w, h }, objectMask) {
    const energyMap = createMatrix(w, h, Infinity);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (objectMask && objectMask[y][x]) {
                energyMap[y][x] = OBJECT_REMOVAL_ENERGY;
            } else {
                const left = (x - 1) >= 0 ? getPixel(img, { x: x - 1, y }) : null;
                const middle = getPixel(img, { x, y });
                const right = (x + 1) < w ? getPixel(img, { x: x + 1, y }) : null;
                energyMap[y][x] = getPixelEnergy(left, middle, right);
            }
        }
    }
    return energyMap;
}

function findLowEnergySeam(energyMap, { w, h }) {
    const seamPixelsMap = createMatrix(w, h, null);
    
    for (let x = 0; x < w; x++) {
        seamPixelsMap[0][x] = {
            energy: energyMap[0][x],
            coordinate: { x, y: 0 },
            previous: null,
        };
    }
    
    for (let y = 1; y < h; y++) {
        for (let x = 0; x < w; x++) {
            let minPrevEnergy = Infinity;
            let minPrevX = x;
            for (let i = (x - 1); i <= (x + 1); i++) {
                if (i >= 0 && i < w && seamPixelsMap[y - 1][i].energy < minPrevEnergy) {
                    minPrevEnergy = seamPixelsMap[y - 1][i].energy;
                    minPrevX = i;
                }
            }
            
            seamPixelsMap[y][x] = {
                energy: minPrevEnergy + energyMap[y][x],
                coordinate: { x, y },
                previous: { x: minPrevX, y: y - 1 },
            };
        }
    }
    
    let lastMinCoordinate = null;
    let minSeamEnergy = Infinity;
    for (let x = 0; x < w; x++) {
        if (seamPixelsMap[h - 1][x].energy < minSeamEnergy) {
            minSeamEnergy = seamPixelsMap[h - 1][x].energy;
            lastMinCoordinate = { x, y: h - 1 };
        }
    }
    
    const seam = [];
    if (!lastMinCoordinate) {
        return seam;
    }
    
    let currentSeam = seamPixelsMap[lastMinCoordinate.y][lastMinCoordinate.x];
    while (currentSeam) {
        seam.push(currentSeam.coordinate);
        const prevMinCoordinates = currentSeam.previous;
        if (!prevMinCoordinates) {
            currentSeam = null;
        } else {
            currentSeam = seamPixelsMap[prevMinCoordinates.y][prevMinCoordinates.x];
        }
    }
    
    return seam.reverse();
}

function deleteSeam(img, seam, { w }) {
    seam.forEach(({ x: seamX, y: seamY }) => {
        for (let x = seamX; x < (w - 1); x++) {
            const nextPixel = getPixel(img, { x: x + 1, y: seamY });
            setPixel(img, { x, y: seamY }, nextPixel);
        }
    });
}

function removeObject(img, objectMask, callback) {
    const size = { w: img.width, h: img.height };
    const pxToRemove = Math.max(...objectMask.map(row => row.filter(Boolean).length));
    
    for (let i = 0; i < pxToRemove; i++) {
        const energyMap = calculateEnergyMap(img, size, objectMask);
        const seam = findLowEnergySeam(energyMap, size);
        deleteSeam(img, seam, size);
        
        // Update object mask
        seam.forEach(({ x, y }) => {
            for (let j = x; j < size.w - 1; j++) {
                objectMask[y][j] = objectMask[y][j + 1];
            }
            objectMask[y][size.w - 1] = false;
        });
        
        size.w--;
        
        if (callback) {
            callback(Math.floor((i + 1) / pxToRemove * 100));
        }
    }
    
    return { img, size };
}

// Worker message handler
self.onmessage = function(e) {
    if (e.data.type === 'removeObject') {
        try {
            const { imageData, objectMask } = e.data;
            
            // Perform object removal
            const result = removeObject(
                imageData, 
                objectMask, 
                (progress) => {
                    // Send progress updates back to main thread
                    self.postMessage({
                        type: 'progress',
                        progress: progress
                    });
                }
            );

            // Send final result back to main thread
            self.postMessage({
                type: 'result',
                imageData: result.img,
                width: result.size.w,
                height: result.size.h
            });
        } catch (error) {
            self.postMessage({
                type: 'error',
                message: error.toString()
            });
        }
    }
};