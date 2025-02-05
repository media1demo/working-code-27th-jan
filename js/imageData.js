// imageData.js
const getPixel = (imgData, { x, y }) => {
    const i = (y * imgData.width + x) * 4;
    return [
        imgData.data[i],
        imgData.data[i + 1],
        imgData.data[i + 2],
    ];
};

const setPixel = (imgData, { x, y }, [r, g, b]) => {
    const i = (y * imgData.width + x) * 4;
    imgData.data[i] = r;
    imgData.data[i + 1] = g;
    imgData.data[i + 2] = b;
};

self.getPixel = getPixel;
self.setPixel = setPixel;