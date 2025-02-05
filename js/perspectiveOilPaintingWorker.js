self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const radius = Math.floor(value * 5) + 1; // 1 to 6
    const intensity = 20;
    
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = new ImageData(width, height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const buckets = new Array(intensity).fill().map(() => ({ r: 0, g: 0, b: 0, a: 0, count: 0 }));
            
            for (let oy = -radius; oy <= radius; oy++) {
                for (let ox = -radius; ox <= radius; ox++) {
                    const sx = x + ox;
                    const sy = y + oy;
                    
                    if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
                        const sourceIndex = (sy * width + sx) * 4;
                        const r = imageData.data[sourceIndex];
                        const g = imageData.data[sourceIndex + 1];
                        const b = imageData.data[sourceIndex + 2];
                        const a = imageData.data[sourceIndex + 3];
                        
                        const bucketIndex = Math.floor((r + g + b) / 3 / (256 / intensity));
                        buckets[bucketIndex].r += r;
                        buckets[bucketIndex].g += g;
                        buckets[bucketIndex].b += b;
                        buckets[bucketIndex].a += a;
                        buckets[bucketIndex].count++;
                    }
                }
            }
            
            let maxBucket = buckets[0];
            for (let i = 1; i < intensity; i++) {
                if (buckets[i].count > maxBucket.count) {
                    maxBucket = buckets[i];
                }
            }
            
            const targetIndex = (y * width + x) * 4;
            newImageData.data[targetIndex] = maxBucket.r / maxBucket.count;
            newImageData.data[targetIndex + 1] = maxBucket.g / maxBucket.count;
            newImageData.data[targetIndex + 2] = maxBucket.b / maxBucket.count;
            newImageData.data[targetIndex + 3] = maxBucket.a / maxBucket.count;
        }
    }
    
    self.postMessage({ imageData: newImageData });
};