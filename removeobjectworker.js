const getPixel = (imageData, { x, y }) => {
    const i = (y * imageData.width + x) * 4;
    return [
        imageData.data[i],
        imageData.data[i + 1],
        imageData.data[i + 2],
        imageData.data[i + 3]
    ];
};

const setPixel = (imageData, { x, y }, color) => {
    const i = (y * imageData.width + x) * 4;
    imageData.data[i] = color[0];
    imageData.data[i + 1] = color[1];
    imageData.data[i + 2] = color[2];
    imageData.data[i + 3] = color[3];
};

// seam-carving.js functions
const OBJECT_REMOVAL_ENERGY = -1000;

const matrix = (w, h, filler) => {
    return new Array(h).fill(null).map(() => new Array(w).fill(filler));
};

const getPixelEnergy = (left, middle, right) => {
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
};

const calculateEnergyMap = (img, { w, h }, objectMask) => {
    const energyMap = matrix(w, h, Infinity);
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
};

const findLowEnergySeam = (energyMap, { w, h }) => {
    const seamPixelsMap = matrix(w, h, null);
    
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
};

const deleteSeam = (img, seam, { w }) => {
    seam.forEach(({ x: seamX, y: seamY }) => {
        for (let x = seamX; x < (w - 1); x++) {
            const nextPixel = getPixel(img, { x: x + 1, y: seamY });
            setPixel(img, { x, y: seamY }, nextPixel);
        }
    });
};

const createMatrix = (width, height, TypedArray = Float32Array, initialValue = 0) => {
    const matrix = new TypedArray(width * height);
    matrix.fill(initialValue);
    matrix.width = width;
    matrix.height = height;
    return matrix;
};

// Fast pixel access without coordinate object creation
const getPixelFast = (imageData, x, y) => {
    const index = (y * imageData.width + x) * 4;
    return [
        imageData.data[index],
        imageData.data[index + 1],
        imageData.data[index + 2],
        imageData.data[index + 3]
    ];
};

// Pre-compute pixel energy map for faster processing
const calculateEnergyMapOptimized = (img, width, height, objectMask) => {
    const energyMap = createMatrix(width, height);
    const OBJECT_REMOVAL_ENERGY = -1000;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (objectMask[y * width + x]) {
                energyMap[y * width + x] = OBJECT_REMOVAL_ENERGY;
                continue;
            }

            let lEnergy = 0, rEnergy = 0;
            const middlePixel = getPixelFast(img, x, y);

            if (x > 0) {
                const leftPixel = getPixelFast(img, x - 1, y);
                lEnergy = (leftPixel[0] - middlePixel[0]) ** 2 +
                          (leftPixel[1] - middlePixel[1]) ** 2 +
                          (leftPixel[2] - middlePixel[2]) ** 2;
            }

            if (x < width - 1) {
                const rightPixel = getPixelFast(img, x + 1, y);
                rEnergy = (rightPixel[0] - middlePixel[0]) ** 2 +
                          (rightPixel[1] - middlePixel[1]) ** 2 +
                          (rightPixel[2] - middlePixel[2]) ** 2;
            }

            energyMap[y * width + x] = Math.sqrt(lEnergy + rEnergy);
        }
    }

    return energyMap;
};

// Optimized seam finding using dynamic programming
const findLowEnergySeamOptimized = (energyMap, width, height) => {
    const seamEnergies = createMatrix(width, height);
    const seamPaths = new Int32Array(width * height);

    // First row
    for (let x = 0; x < width; x++) {
        seamEnergies[x] = energyMap[x];
    }

    // Dynamic programming
    for (let y = 1; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let minEnergy = Infinity;
            let minIndex = x;

            // Check adjacent pixels in previous row
            for (let dx = -1; dx <= 1; dx++) {
                const prevX = x + dx;
                if (prevX >= 0 && prevX < width) {
                    const prevEnergy = seamEnergies[(y - 1) * width + prevX];
                    if (prevEnergy < minEnergy) {
                        minEnergy = prevEnergy;
                        minIndex = prevX;
                    }
                }
            }

            seamEnergies[y * width + x] = minEnergy + energyMap[y * width + x];
            seamPaths[y * width + x] = minIndex;
        }
    }

    // Find minimum seam in last row
    let minSeamEnd = 0;
    let minSeamEnergy = seamEnergies[(height - 1) * width];
    for (let x = 1; x < width; x++) {
        const energy = seamEnergies[(height - 1) * width + x];
        if (energy < minSeamEnergy) {
            minSeamEnergy = energy;
            minSeamEnd = x;
        }
    }

    // Reconstruct seam path
    const seam = [];
    let x = minSeamEnd;
    for (let y = height - 1; y >= 0; y--) {
        seam.push({ x, y });
        x = seamPaths[y * width + x];
    }

    return seam.reverse();
};

// Optimized object removal
function removeObject(img, objectMask) {
    const { width, height } = img;
    const objectMaskFlat = new Uint8Array(width * height);
    
    // Convert 2D mask to flat array
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            objectMaskFlat[y * width + x] = objectMask[y][x] ? 1 : 0;
        }
    }

    const pxToRemove = objectMaskFlat.filter(px => px === 1).length;
    
    for (let i = 0; i < pxToRemove; i++) {
        const energyMap = calculateEnergyMapOptimized(img, width, height, objectMaskFlat);
        const seam = findLowEnergySeamOptimized(energyMap, width, height);
        
        // Delete seam by shifting pixels
        seam.forEach(({ x, y }) => {
            const srcIndex = (y * width + x) * 4;
            const destIndex = srcIndex;
            
            for (let dx = x; dx < width - 1; dx++) {
                const nextIndex = (y * width + dx + 1) * 4;
                
                img.data[destIndex] = img.data[nextIndex];
                img.data[destIndex + 1] = img.data[nextIndex + 1];
                img.data[destIndex + 2] = img.data[nextIndex + 2];
                img.data[destIndex + 3] = img.data[nextIndex + 3];
            }
        });

        // Update object mask
        seam.forEach(({ x, y }) => {
            for (let dx = x; dx < width - 1; dx++) {
                objectMaskFlat[y * width + dx] = objectMaskFlat[y * width + dx + 1];
            }
            objectMaskFlat[y * width + width - 1] = 0;
        });
    }

    // Resize image data
    const newWidth = width - pxToRemove;
    img.width = newWidth;

    return { img, size: { w: newWidth, h: height } };
}

onmessage = function(event) {
    const { imageData, objectMask } = event.data;
    const result = removeObject(imageData, objectMask);
    postMessage(result);
};


function removeObject(img, objectMask) {
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
    }
    
    return { img, size };
}
