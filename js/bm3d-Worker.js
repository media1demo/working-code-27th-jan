self.onmessage = function(e) {
    const {
        imageData,
        sigma,
        step1BlkSize,
        step2BlkSize,
        step1BlkStep,
        step2BlkStep,
        step1MaxMatchedCnt,
        step2MaxMatchedCnt,
        step1SearchWindow,
        step2SearchWindow,
        step1MatchThreshold,
        step2MatchThreshold,
        betaKaiser
    } = e.data;

    const denoisedImage = BM3D(imageData, sigma, step1BlkSize, step2BlkSize, step1BlkStep, step2BlkStep,
                               step1MaxMatchedCnt, step2MaxMatchedCnt, step1SearchWindow, step2SearchWindow,
                               step1MatchThreshold, step2MatchThreshold, betaKaiser);
console.log('denoisedImage :>> ', denoisedImage);
    const psnr = calculatePSNR(imageData, denoisedImage);

    self.postMessage({ denoisedImage, psnr });
};

function BM3D(imageData, sigma, step1BlkSize, step2BlkSize, step1BlkStep, step2BlkStep,
              step1MaxMatchedCnt, step2MaxMatchedCnt, step1SearchWindow, step2SearchWindow,
              step1MatchThreshold, step2MatchThreshold, betaKaiser) {
    const basicImg = BM3D1stStep(imageData, sigma, step1BlkSize, step1BlkStep, step1MaxMatchedCnt,
                                 step1SearchWindow, step1MatchThreshold, betaKaiser);
    const finalImg = BM3D2ndStep(basicImg, imageData, sigma, step2BlkSize, step2BlkStep, step2MaxMatchedCnt,
                                 step2SearchWindow, step2MatchThreshold, betaKaiser);
   
   console.log("ini");
                                 return finalImg;
}

function BM3D1stStep(imageData, sigma, blkSize, blkStep, maxMatchedCnt, searchWindow, matchThreshold, betaKaiser) {
    const { width, height } = imageData;
    const basicImg = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
    const weightImg = new ImageData(new Uint8ClampedArray(width * height * 4), width, height);
    const kaiserWindow = createKaiserWindow(blkSize, betaKaiser);
    console.log("ini");

    for (let i = 0; i < width - blkSize + 1; i += blkStep) {
        for (let j = 0; j < height - blkSize + 1; j += blkStep) {
            const blockPoint = [i, j];
            const similarBlocks = findSimilarBlocks(imageData, blockPoint, blkSize, searchWindow, matchThreshold, maxMatchedCnt);
            const filteredBlocks = hardThreshold3DTransform(similarBlocks, sigma);
            aggregateBlocks(basicImg, weightImg, filteredBlocks, blockPoint, kaiserWindow);
        }
    }

    normalizeImage(basicImg, weightImg);
    return basicImg;
}

function BM3D2ndStep(basicImg, noisyImg, sigma, blkSize, blkStep, maxMatchedCnt, searchWindow, matchThreshold, betaKaiser) {
    const { width, height } = basicImg;
    const finalImg = new ImageData(new Uint8ClampedArray(basicImg.data), width, height);
    const weightImg = new ImageData(new Uint8ClampedArray(width * height * 4), width, height);
    const kaiserWindow = createKaiserWindow(blkSize, betaKaiser);
    console.log("ini");

    for (let i = 0; i < width - blkSize + 1; i += blkStep) {
        for (let j = 0; j < height - blkSize + 1; j += blkStep) {
            const blockPoint = [i, j];
            const [similarBasicBlocks, similarNoisyBlocks] = findSimilarBlocks2Step(basicImg, noisyImg, blockPoint, blkSize, searchWindow, matchThreshold, maxMatchedCnt);
            const [filteredBlocks, wienerWeights] = wienerFilter3DTransform(similarBasicBlocks, similarNoisyBlocks, sigma);
            aggregateBlocksWiener(finalImg, weightImg, filteredBlocks, wienerWeights, blockPoint, kaiserWindow);
        }
    }

    normalizeImage(finalImg, weightImg);
    return finalImg;
}

function findSimilarBlocks(imageData, blockPoint, blkSize, searchWindow, threshold, maxMatchedCnt) {
    const [x, y] = blockPoint;
    const similarBlocks = [];
    const referenceBlock = getBlock(imageData, x, y, blkSize);
    console.log("ini");

    for (let i = Math.max(0, x - searchWindow); i <= Math.min(imageData.width - blkSize, x + searchWindow); i++) {
        for (let j = Math.max(0, y - searchWindow); j <= Math.min(imageData.height - blkSize, y + searchWindow); j++) {
            if (i === x && j === y) continue;
            
            const candidateBlock = getBlock(imageData, i, j, blkSize);
            const distance = calculateBlockDistance(referenceBlock, candidateBlock);
            
            if (distance < threshold) {
                similarBlocks.push({ block: candidateBlock, position: [i, j], distance });
            }
        }
    }
    
    similarBlocks.sort((a, b) => a.distance - b.distance);
    return similarBlocks.slice(0, maxMatchedCnt);
}

function findSimilarBlocks2Step(basicImg, noisyImg, blockPoint, blkSize, searchWindow, threshold, maxMatchedCnt) {
    const similarBasicBlocks = findSimilarBlocks(basicImg, blockPoint, blkSize, searchWindow, threshold, maxMatchedCnt);
    
    console.log("ini");

    const similarNoisyBlocks = similarBasicBlocks.map(({ position }) => {
        return { block: getBlock(noisyImg, position[0], position[1], blkSize), position };
    });
    return [similarBasicBlocks, similarNoisyBlocks];
}

function hardThreshold3DTransform(similarBlocks, sigma) {
    const threshold = 2.7 * sigma;
    const transformedBlocks = similarBlocks.map(block => dct2D(block));

    console.log("ini");

    const filteredBlocks = transformedBlocks.map(block => {
        return block.map(row => row.map(val => Math.abs(val) < threshold ? 0 : val));
    });
    return filteredBlocks.map(block => idct2D(block));
}

function wienerFilter3DTransform(similarBasicBlocks, similarNoisyBlocks, sigma) {


    console.log("ini");
    const transformedBasicBlocks = similarBasicBlocks.map(block => dct2D(block));
    const transformedNoisyBlocks = similarNoisyBlocks.map(block => dct2D(block));
    
    const wienerWeights = transformedBasicBlocks.map(block => {
        return block.map(row => row.map(val => val ** 2 / (val ** 2 + sigma ** 2)));
    });
    
    const filteredBlocks = transformedNoisyBlocks.map((block, i) => {
        return block.map((row, j) => row.map((val, k) => val * wienerWeights[i][j][k]));
    });
    
    return [filteredBlocks.map(block => idct2D(block)), wienerWeights];
}

function aggregateBlocks(targetImg, weightImg, filteredBlocks, blockPoint, kaiserWindow) {
    const [x, y] = blockPoint;
    const blkSize = filteredBlocks[0].length;
    console.log("ini");
    
    for (let i = 0; i < blkSize; i++) {
        for (let j = 0; j < blkSize; j++) {
            let sum = 0;
            let weightSum = 0;
            
            for (const block of filteredBlocks) {
                const weight = kaiserWindow[i][j];
                sum += block[i][j] * weight;
                weightSum += weight;
            }
            
            const pixelIndex = ((y + j) * targetImg.width + (x + i)) * 4;
            targetImg.data[pixelIndex] += sum;
            weightImg.data[pixelIndex] += weightSum;
        }
    }
}

function aggregateBlocksWiener(targetImg, weightImg, filteredBlocks, wienerWeights, blockPoint, kaiserWindow) {
    const [x, y] = blockPoint;
    console.log("ini");
    const blkSize = filteredBlocks[0].length;
    
    for (let i = 0; i < blkSize; i++) {
        for (let j = 0; j < blkSize; j++) {
            let sum = 0;
            let weightSum = 0;
            
            for (let k = 0; k < filteredBlocks.length; k++) {
                const weight = kaiserWindow[i][j] * wienerWeights[k][i][j];
                sum += filteredBlocks[k][i][j] * weight;
                weightSum += weight;
            }
            
            const pixelIndex = ((y + j) * targetImg.width + (x + i)) * 4;
            targetImg.data[pixelIndex] += sum;
            weightImg.data[pixelIndex] += weightSum;
        }
    }
}

function normalizeImage(targetImg, weightImg) {
    for (let i = 0; i < targetImg.data.length; i += 4) {
        if (weightImg.data[i] > 0) {
            targetImg.data[i] = Math.round(targetImg.data[i] / weightImg.data[i]);
            targetImg.data[i + 1] = targetImg.data[i];
            targetImg.data[i + 2] = targetImg.data[i];
        }

        console.log("ini");
        targetImg.data[i + 3] = 255;
    }
}

function createKaiserWindow(size, beta) {
    console.log("ini");
    const window = [];
    for (let i = 0; i < size; i++) {
        window[i] = [];
        for (let j = 0; j < size; j++) {
            const x = (2 * i / (size - 1)) - 1;
            const y = (2 * j / (size - 1)) - 1;
            const r = Math.sqrt(x * x + y * y);
            window[i][j] = r <= 1 ? bessel(beta * Math.sqrt(1 - r * r)) / bessel(beta) : 0;
        }
    }
    return window;
}

function bessel(x) {
    console.log("ini");
    let sum = 1;
    let term = 1;
    for (let i = 1; i <= 10; i++) {
        term *= (x * x) / (4 * i * i);
        sum += term;
    }
    return sum;
}

function calculatePSNR(img1, img2) {
    console.log("ini");
    const mse = calculateMSE(img1, img2);
    return 10 * Math.log10(255 * 255 / mse);
}

function calculateMSE(img1, img2) {
    let sum = 0;
    console.log("ini");
    for (let i = 0; i < img1.data.length; i += 4) {
        const diff = img1.data[i] - img2.data[i];
        sum += diff * diff;
    }
    return sum / (img1.width * img1.height);
}

function getBlock(imageData, x, y, size) {
    console.log("ini");
    const block = [];
    for (let i = 0; i < size; i++) {
        block[i] = [];
        for (let j = 0; j < size; j++) {
            const pixelIndex = ((y + j) * imageData.width + (x + i)) * 4;
            block[i][j] = imageData.data[pixelIndex];
        }
    }
    return block;
}

function calculateBlockDistance(block1, block2) {
    let sum = 0;
    console.log("ini");
    for (let i = 0; i < block1.length; i++) {
        for (let j = 0; j < block1[i].length; j++) {
            const diff = block1[i][j] - block2[i][j];
            sum += diff * diff;
        }
    }
    return sum / (block1.length * block1[0].length);
}

function dct2D(block) {
    const N = block.length;
    const result = Array(N).fill().map(() => Array(N).fill(0));
    console.log("ini");
    
    for (let u = 0; u < N; u++) {
        for (let v = 0; v < N; v++) {
            let sum = 0;
            for (let i = 0; i < N; i++) {
                for (let j = 0; j < N; j++) {
                    sum += block[i][j] * Math.cos((2 * i + 1) * u * Math.PI / (2 * N)) * Math.cos((2 * j + 1) * v * Math.PI / (2 * N));
                }
            }
            result[u][v] = sum * (u === 0 ? 1 / Math.sqrt(N) : Math.sqrt(2 / N)) * (v === 0 ? 1 / Math.sqrt(N) : Math.sqrt(2 / N));
        }
    }
    
    return result;
}

function idct2D(block) {
    const N = block.length;
    const result = Array(N).fill().map(() => Array(N).fill(0));
    console.log("ini");
    
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            let sum = 0;
            for (let u = 0; u < N; u++) {
                for (let v = 0; v < N; v++) {
                    sum += (u === 0 ? 1 / Math.sqrt(N) : Math.sqrt(2 / N)) * (v === 0 ? 1 / Math.sqrt(N) : Math.sqrt(2 / N)) *
                           block[u][v] * Math.cos((2 * i + 1) * u * Math.PI / (2 * N)) * Math.cos((2 * j + 1) * v * Math.PI / (2 * N));
                }
            }
            result[i][j] = Math.round(sum);
        }
    }
    
    return result;
}