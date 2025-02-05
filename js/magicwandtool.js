const MagicWand = {
    floodFill: function(image, startX, startY, colorThreshold) {
      const width = image.width;
      const height = image.height;
      const bytes = image.bytes;
      const data = image.data;
      const length = width * height;
      const mask = new Uint8ClampedArray(length);
      const stack = [];
  
      const startPos = (startY * width + startX) * bytes;
      const startColor = [
        data[startPos],
        data[startPos + 1],
        data[startPos + 2],
        data[startPos + 3]
      ];
  
      stack.push(startPos);
      mask[startPos / bytes] = 1;
  
      while (stack.length) {
        const currentPos = stack.pop();
        const x = currentPos % (width * bytes) / bytes;
        const y = Math.floor(currentPos / (width * bytes));
  
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
  
            const nextX = x + dx;
            const nextY = y + dy;
  
            if (
              nextX < 0 ||
              nextX >= width ||
              nextY < 0 ||
              nextY >= height
            ) {
              continue;
            }
  
            const nextPos = (nextY * width + nextX) * bytes;
            if (mask[nextPos / bytes]) continue;
  
            const nextColor = [
              data[nextPos],
              data[nextPos + 1],
              data[nextPos + 2],
              data[nextPos + 3]
            ];
  
            if (
              Math.abs(nextColor[0] - startColor[0]) <= colorThreshold &&
              Math.abs(nextColor[1] - startColor[1]) <= colorThreshold &&
              Math.abs(nextColor[2] - startColor[2]) <= colorThreshold &&
              Math.abs(nextColor[3] - startColor[3]) <= colorThreshold
            ) {
              stack.push(nextPos);
              mask[nextPos / bytes] = 1;
            }
          }
        }
      }
  
      return mask;
    },
  
    getBorderIndices: function(mask) {
      const indices = [];
      const width = Math.sqrt(mask.length);
  
      for (let i = 0; i < mask.length; i++) {
        if (mask[i]) {
          const x = i % width;
          const y = Math.floor(i / width);
  
          if (
            (x === 0 || !mask[i - 1]) ||
            (x === width - 1 || !mask[i + 1]) ||
            (y === 0 || !mask[i - width]) ||
            (y === width - 1 || !mask[i + width])
          ) {
            indices.push(i);
          }
        }
      }
  
      return indices;
    }
  };