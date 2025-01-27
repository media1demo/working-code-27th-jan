
function performObjectRemoval() {
    const imageData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
    worker = new Worker('removeobjectworker.js');
    worker.onmessage = function(event) {
        const { img, size } = event.data;
        imageCanvas.width = size.w;
        imageCanvas.height = size.h;
        ctx.putImageData(img, 0, 0);
        console.log('Object removal complete');
    };
    worker.postMessage({ imageData, objectMask });
}

// Add the necessary functions for resizing and object removal here
function getPixelDeleteEnergy() {
    const numColors = 3;
    const maxColorDistance = 255;
    const numNeighbors = 2;
    const multiplier = 2;
    const maxSeamSize = Math.max(1500, 1500);
    return -1 * multiplier * numNeighbors * maxSeamSize * numColors * (maxColorDistance ** 2);
}

function matrix(w, h, filler) {
    return new Array(h).fill(null).map(() => new Array(w).fill(filler));
}

function getPixel(img, { x, y }) {
    const index = (y * img.width + x) * 4;
    return [
        img.data[index],
        img.data[index + 1],
        img.data[index + 2],
        img.data[index + 3]
    ];
}

function setPixel(img, { x, y }, color) {
    const index = (y * img.width + x) * 4;
    img.data[index] = color[0];
    img.data[index + 1] = color[1];
    img.data[index + 2] = color[2];
    img.data[index + 3] = color[3];
}

function getPixelEnergy(left, middle, right) {
    const [mR, mG, mB, mA] = middle;

    // Check if this pixel is marked for removal
    const maskIndex = (middle.y * size.w + middle.x) * 4;
    if (maskData && maskData.data[maskIndex + 3] > 0) {
        return getPixelDeleteEnergy(); // Very low energy for marked pixels
    }

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

    return mA > 244 ? (lEnergy + rEnergy) : getPixelDeleteEnergy();
}

function getPixelEnergyH(img, { w }, { x, y }) {
    const left = (x - 1) >= 0 ? getPixel(img, { x: x - 1, y }) : null;
    const middle = getPixel(img, { x, y });
    const right = (x + 1) < w ? getPixel(img, { x: x + 1, y }) : null;
    return getPixelEnergy(left, middle, right);
}

function getPixelEnergyV(img, { h }, { x, y }) {
    const top = (y - 1) >= 0 ? getPixel(img, { x, y: y - 1 }) : null;
    const middle = getPixel(img, { x, y });
    const bottom = (y + 1) < h ? getPixel(img, { x, y: y + 1 }) : null;
    return getPixelEnergy(top, middle, bottom);
}

function calculateEnergyMapH(img, { w, h }) {
    const energyMap = matrix(w, h, Infinity);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            energyMap[y][x] = getPixelEnergyH(img, { w, h }, { x, y });
        }
    }
    return energyMap;
}

function calculateEnergyMapV(img, { w, h }) {
    const energyMap = matrix(w, h, Infinity);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            energyMap[y][x] = getPixelEnergyV(img, { w, h }, { x, y });
        }
    }
    return energyMap;
}

function reCalculateEnergyMapH(img, { w, h }, energyMap, seam) {
    seam.forEach(({ x: seamX, y: seamY }) => {
        for (let x = seamX; x < (w - 1); x++) {
            energyMap[seamY][x] = energyMap[seamY][x + 1];
        }
        energyMap[seamY][seamX] = getPixelEnergyH(img, { w, h }, { x: seamX, y: seamY });
    });
    return energyMap;
}

function reCalculateEnergyMapV(img, { w, h }, energyMap, seam) {
    seam.forEach(({ x: seamX, y: seamY }) => {
        for (let y = seamY; y < (h - 1); y++) {
            energyMap[y][seamX] = energyMap[y + 1][seamX];
        }
        energyMap[seamY][seamX] = getPixelEnergyV(img, { w, h }, { x: seamX, y: seamY });
    });
    return energyMap;
}

function findLowEnergySeamH(energyMap, { w, h }) {
    const seamsMap = matrix(w, h, null);

    for (let x = 0; x < w; x++) {
        seamsMap[0][x] = {
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

    let lastMinCoordinate = null;
    let minSeamEnergy = Infinity;
    for (let x = 0; x < w; x++) {
        if (seamsMap[h - 1][x].energy < minSeamEnergy) {
            minSeamEnergy = seamsMap[h - 1][x].energy;
            lastMinCoordinate = { x, y: h - 1 };
        }
    }

    const seam = [];
    if (!lastMinCoordinate) {
        return seam;
    }

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

    return seam;
}

function findLowEnergySeamV(energyMap, { w, h }) {
    const seamsMap = matrix(w, h, null);

    for (let y = 0; y < h; y++) {
        seamsMap[y][0] = {
            energy: energyMap[y][0],
            coordinate: { x: 0, y },
            previous: null,
        };
    }

    for (let x = 1; x < w; x++) {
        for (let y = 0; y < h; y++) {
            let minPrevEnergy = Infinity;
            let minPrevY = y;
            for (let i = (y - 1); i <= (y + 1); i++) {
                if (i >= 0 && i < h && seamsMap[i][x - 1].energy < minPrevEnergy) {
                    minPrevEnergy = seamsMap[i][x - 1].energy;
                    minPrevY = i;
                }
            }

            seamsMap[y][x] = {
                energy: minPrevEnergy + energyMap[y][x],
                coordinate: { x, y },
                previous: { x: x - 1, y: minPrevY },
            };
        }
    }

    let lastMinCoordinate = null;
    let minSeamEnergy = Infinity;
    for (let y = 0; y < h; y++) {
        if (seamsMap[y][w - 1].energy < minSeamEnergy) {
            minSeamEnergy = seamsMap[y][w - 1].energy;
            lastMinCoordinate = { x: w - 1, y };
        }
    }

    const seam = [];
    if (!lastMinCoordinate) {
        return seam;
    }

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

    return seam;
}

function deleteSeamH(img, seam, { w }) {
    seam.forEach(({ x: seamX, y: seamY }) => {
        for (let x = seamX; x < (w - 1); x++) {
            const nextPixel = getPixel(img, { x: x + 1, y: seamY });
            setPixel(img, { x, y: seamY }, nextPixel);
        }
    });
}

function deleteSeamV(img, seam, { h }) {
    seam.forEach(({ x: seamX, y: seamY }) => {
        for (let y = seamY; y < (h - 1); y++) {
            const nextPixel = getPixel(img, { x: seamX, y: y + 1 });
            setPixel(img, { x: seamX, y }, nextPixel);
        }
    });
}

async function resizeImageWidth(img, toSize, onIteration) {
    const pxToRemove = img.width - toSize;
    if (pxToRemove < 0) {
        throw new Error('Upsizing is not supported');
    }

    let energyMap = null;
    let seam = null;

    for (let i = 0; i < pxToRemove; i++) {
        energyMap = energyMap && seam
            ? reCalculateEnergyMapH(img, size, energyMap, seam)
            : calculateEnergyMapH(img, size);

        seam = findLowEnergySeamH(energyMap, size);

        deleteSeamH(img, seam, size);

        if (onIteration) {
            await onIteration({
                energyMap,
                seam,
                img,
                size,
                step: i,
                steps: pxToRemove,
            });
        }

        size.w -= 1;

        await new Promise(resolve => setTimeout(resolve, 1));
    }
}

async function resizeImageHeight(img, toSize, onIteration) {
    const pxToRemove = img.height - toSize;
    if (pxToRemove < 0) {
        throw new Error('Upsizing is not supported');
    }

    let energyMap = null;
    let seam = null;

    for (let i = 0; i < pxToRemove; i++) {
        energyMap = energyMap && seam
            ? reCalculateEnergyMapV(img, size, energyMap, seam)
            : calculateEnergyMapV(img, size);

        seam = findLowEnergySeamV(energyMap, size);

        deleteSeamV(img, seam, size);

        if (onIteration) {
            await onIteration({
                energyMap,
                seam,
                img,
                size,
                step: i,
                steps: pxToRemove,
            });
        }

        size.h -= 1;

        await new Promise(resolve => setTimeout(resolve, 1));
    }
}

async function resizeImage(img, toWidth, toHeight, onIteration) {
    const pxToRemoveH = img.width - toWidth;
    const pxToRemoveV = img.height - toHeight;

    size = { w: img.width, h: img.height };

    const globalSteps = pxToRemoveH + pxToRemoveV;
    let globalStep = 0;

    const onResizeIteration = async (onIterationArgs) => {
        const {
            seam,
            img: onIterationImg,
            size: onIterationSize,
            energyMap,
        } = onIterationArgs;

        globalStep += 1;

        if (!onIteration) {
            return;
        }

        await onIteration({
            seam,
            img: onIterationImg,
            size: onIterationSize,
            energyMap,
            step: globalStep,
            steps: globalSteps,
        });
    };

    await resizeImageWidth(img, toWidth, onResizeIteration);
    await resizeImageHeight(img, toHeight, onResizeIteration);
}

// Lip Sync Animation Function
function startLipSyncAnimation() {
    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');
    const worker = new Worker('js/indexlips.js');

    const img = new Image();
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Simplified lip region selection (lower half of the image)
        const lipRegion = new Set();
        for (let y = Math.floor(canvas.height / 2); y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                lipRegion.add(y * canvas.width + x);
            }
        }

        worker.postMessage({
            imageData: imageData,
            selectedRegions: Array.from(lipRegion),
            imageCount: 10
        });
    };
    img.src = 'lips12.png';

    worker.onmessage = function(e) {
        const { segmentedImages, isComplete } = e.data;
        
        let frameIndex = 0;
        function animateFrame() {
            if (frameIndex < segmentedImages.length) {
                ctx.putImageData(segmentedImages[frameIndex], 0, 0);
                frameIndex++;
                requestAnimationFrame(animateFrame);
                console.log("1111111111111");
            } else if (!isComplete) {
                frameIndex = 0;
                requestAnimationFrame(animateFrame);
                console.log("1111111111111");

            }


        }
        animateFrame();

        if (isComplete) {
            console.log('Animation complete');
        }
    };
}
