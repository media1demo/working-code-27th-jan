// imageSeam.js
self.importScripts('imageData.js');

const matrix = (w, h, filler) => {
    return new Array(h).fill(null).map(() => new Array(w).fill(filler));
};

const getPixelEnergy = (left, middle, right) => {
    const [mR, mG, mB] = middle;
    let lEnergy = 0;
    let rEnergy = 0;

    if (left) {
        const [lR, lG, lB] = left;
        lEnergy = (lR - mR) ** 2 + (lG - mG) ** 2 + (lB - mB) ** 2;
    }

    if (right) {
        const [rR, rG, rB] = right;
        rEnergy = (rR - mR) ** 2 + (rG - mG) ** 2 + (rB - mB) ** 2;
    }

    return Math.sqrt(lEnergy + rEnergy);
};

const calculateEnergyMap = (img, { w, h }) => {
    const energyMap = matrix(w, h, Infinity);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const left = x > 0 ? getPixel(img, { x: x - 1, y }) : null;
            const middle = getPixel(img, { x, y });
            const right = x < w - 1 ? getPixel(img, { x: x + 1, y }) : null;
            energyMap[y][x] = getPixelEnergy(left, middle, right);
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
            for (let i = x - 1; i <= x + 1; i++) {
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

    return seam;
};

const deleteSeam = (img, seam, { w }) => {
    seam.forEach(({ x: seamX, y: seamY }) => {
        for (let x = seamX; x < w - 1; x++) {
            const nextPixel = getPixel(img, { x: x + 1, y: seamY });
            setPixel(img, { x, y: seamY }, nextPixel);
        }
    });
};

const resizeImageWidth = ({ img, toWidth }) => {
    const size = { w: img.width, h: img.height };
    const pxToRemove = img.width - toWidth;

    for (let i = 0; i < pxToRemove; i++) {
        const energyMap = calculateEnergyMap(img, size);
        const seam = findLowEnergySeam(energyMap, size);
        deleteSeam(img, seam, size);
        size.w -= 1;
    }

    return { img, size };
};

self.onmessage = (e) => {
    const result = resizeImageWidth(e.data);
    self.postMessage(result);
};