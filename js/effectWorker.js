self.onmessage = function(e) {
    const imageData = e.data.imageData;
    const selectedRegion = e.data.selectedRegion;
    const effect = e.data.effect;
    const value = e.data.value;

    for (let i = 0; i < selectedRegion.length; i++) {
        const pixelIndex = selectedRegion[i];
        const dataIndex = pixelIndex * 4;

        // Only process non-transparent pixels
        if (imageData.data[dataIndex + 3] > 0) {
            applyEffectToPixel(imageData.data, dataIndex, effect, value);
        }
    }

    self.postMessage({imageData: imageData});
};

function applyEffectToPixel(data, index, effect, value) {
    switch(effect) {
        case 'brightness':
            data[index] = Math.min(255, Math.max(0, data[index] + value));
            data[index + 1] = Math.min(255, Math.max(0, data[index + 1] + value));
            data[index + 2] = Math.min(255, Math.max(0, data[index + 2] + value));
            break;
        case 'contrast':
            data[index] = Math.min(255, Math.max(0, (data[index] - 128) * value + 128));
            data[index + 1] = Math.min(255, Math.max(0, (data[index + 1] - 128) * value + 128));
            data[index + 2] = Math.min(255, Math.max(0, (data[index + 2] - 128) * value + 128));
            break;
        case 'saturation':
            const gray = 0.2989 * data[index] + 0.5870 * data[index + 1] + 0.1140 * data[index + 2];
            data[index] = Math.min(255, Math.max(0, gray + value * (data[index] - gray)));
            data[index + 1] = Math.min(255, Math.max(0, gray + value * (data[index + 1] - gray)));
            data[index + 2] = Math.min(255, Math.max(0, gray + value * (data[index + 2] - gray)));
            break;
    }
}
