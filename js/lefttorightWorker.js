    // self.onmessage = function(e) {
    //     const {
    //         imageData,
    //         selectedRegions,
    //         imageCount,
    //         maxBrightness,
    //         value1,
    //         value2,
    //         value3,
    //         value4,
    //         value5,
    //         value6,
    //         value7,
    //         value8,
    //         clickedPoints,
    //         lines
    //     } = e.data;

    //     const segmentedImages = [];
    //     const variationsPerOrientation = 25; // New variable to control the number of variations

    //     const orientations = [
    //         { name: "Center", getValue: () => ({ x: value1 / 100, y: value1 / 100 }), value: value1 },
    //         { name: "Top", getValue: () => ({ x: value2 / 100, y: 0.2 }), value: value2 },
    //         { name: "Bottom", getValue: () => ({ x: value3 / 100, y: 0.8 }), value: value3 },
    //         { name: "Left", getValue: () => ({ x: 0.2, y: value4 / 100 }), value: value4 },
    //         { name: "Right", getValue: () => ({ x: 0.8, y: value5 / 100 }), value: value5 },
    //         { name: "TopLeft", getValue: () => ({ x: value6 / 100, y: value6 / 100 }), value: value6 },
    //         { name: "TopRight", getValue: () => ({ x: 1 - value7 / 100, y: value7 / 100 }), value: value7 },
    //         { name: "BottomLeft", getValue: () => ({ x: value8 / 100, y: 1 - value8 / 100 }), value: value8 }
    //     ];

    //     for (let i = 0; i < variationsPerOrientation; i++) {
    //         for (let j = 0; j < orientations.length; j++) {
    //             const newImageData = new ImageData(
    //                 new Uint8ClampedArray(imageData.data),
    //                 imageData.width,
    //                 imageData.height
    //             );

    //             applyColorAdjustments(newImageData, selectedRegions, i, variationsPerOrientation);

    //             const orientation = orientations[j];
    //             const { x, y } = orientation.getValue();
    //             const centerX = x === 0 ? Math.random() * imageData.width : x * imageData.width;
    //             const centerY = y === 0 ? Math.random() * imageData.height : y * imageData.height;
    //             const radius = Math.min(imageData.width, imageData.height) * 0.3;
    //             const strength = ((orientation.value / 100) * 2 - 1) * (i + 1) / imageCount;

    //             applyBulgePinch(newImageData, centerX, centerY, radius, strength, selectedRegions);
    //             applyAdditionalEffects(newImageData, value1, value2, value3, value4, value5, selectedRegions);
    //             segmentedImages.push(newImageData);
    //         }
    //     }

    //     self.postMessage({ segmentedImages: segmentedImages });
    // };

    // function applyColorAdjustments(imageData, selectedRegions, index, totalCount) {
        
    // }



    // function applyBulgePinch(imageData, centerX, centerY, radius, strength, selectedRegions) {
    //     for (const region of selectedRegions) {
    //         for (const pixelIndex of region) {
    //             const x = pixelIndex % imageData.width;
    //             const y = Math.floor(pixelIndex / imageData.width);
    //             const dx = x - centerX;
    //             const dy = y - centerY;
    //             const distance = Math.sqrt(dx * dx + dy * dy);

    //             if (distance < radius) {
    //                 const factor = 1 + strength * (1 - distance / radius);
    //                 const newX = centerX + dx * factor;
    //                 const newY = centerY + dy * factor;

    //                 if (newX >= 0 && newX < imageData.width && newY >= 0 && newY < imageData.height) {
    //                     const newIndex = (Math.floor(newY) * imageData.width + Math.floor(newX)) * 4;
    //                     const index = (y * imageData.width + x) * 4;
    //                     imageData.data[index] = imageData.data[newIndex];
    //                     imageData.data[index + 1] = imageData.data[newIndex + 1];
    //                     imageData.data[index + 2] = imageData.data[newIndex + 2];
    //                     imageData.data[index + 3] = imageData.data[newIndex + 3];
    //                 }
    //             }
    //         }
    //     }
    // }



    // function applyAdditionalEffects(imageData, value1, value2, value3, value4, value5, selectedRegions) {
    //     const saturationAdjustment = value1 / 100; // Assuming value1 is a percentage

    //     for (const region of selectedRegions) {
    //         for (const pixelIndex of region) {
    //             const index = pixelIndex * 4;
    //             const [h, s, l] = rgbToHsl(
    //                 imageData.data[index],
    //                 imageData.data[index + 1],
    //                 imageData.data[index + 2]
    //             );

    //             const newSaturation = Math.min(1, Math.max(0, s * (1 + saturationAdjustment)));
    //             const [r, g, b] = hslToRgb(h, newSaturation, l);

    //             imageData.data[index] = r;
    //             imageData.data[index + 1] = g;
    //             imageData.data[index + 2] = b;
    //         }
    //     }

    //     // You can add more effects using the other values (value2, value3, etc.)
    // }

    // function rgbToHsl(r, g, b) {
    //     r /= 255, g /= 255, b /= 255;
    //     const max = Math.max(r, g, b), min = Math.min(r, g, b);
    //     let h, s, l = (max + min) / 2;

    //     if (max === min) {
    //         h = s = 0; // achromatic
    //     } else {
    //         const d = max - min;
    //         s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    //         switch (max) {
    //             case r: h = (g - b) / d + (g < b ? 6 : 0); break;
    //             case g: h = (b - r) / d + 2; break;
    //             case b: h = (r - g) / d + 4; break;
    //         }
    //         h /= 6;
    //     }

    //     return [h * 360, s, l];
    // }

    // function hslToRgb(h, s, l) {
    //     h /= 360;
    //     let r, g, b;

    //     if (s === 0) {
    //         r = g = b = l; // achromatic
    //     } else {
    //         const hue2rgb = (p, q, t) => {
    //             if (t < 0) t += 1;
    //             if (t > 1) t -= 1;
    //             if (t < 1/6) return p + (q - p) * 6 * t;
    //             if (t < 1/2) return q;
    //             if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    //             return p;
    //         };

    //         const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    //         const p = 2 * l - q;
    //         r = hue2rgb(p, q, h + 1/3);
    //         g = hue2rgb(p, q, h);
    //         b = hue2rgb(p, q, h - 1/3);
    //     }

    //     return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    // }

    let segmentedImages = [];
    const variationsPerOrientation = 25;


    console.log("111111111111111");


    const orientations = [
        { name: "Center", getValue: (value1) => ({ x: value1 / 100, y: value1 / 100 }), value: 0 },
        { name: "Top", getValue: (value2) => ({ x: value2 / 100, y: 0.2 }), value: 0 },
        { name: "Bottom", getValue: (value3) => ({ x: value3 / 100, y: 0.8 }), value: 0 },
        { name: "Left", getValue: (value4) => ({ x: 0.2, y: value4 / 100 }), value: 0 },
        { name: "Right", getValue: (value5) => ({ x: 0.8, y: value5 / 100 }), value: 0 },
        { name: "TopLeft", getValue: (value6) => ({ x: value6 / 100, y: value6 / 100 }), value: 0 },
        { name: "TopRight", getValue: (value7) => ({ x: 1 - value7 / 100, y: value7 / 100 }), value: 0 },
        { name: "BottomLeft", getValue: (value8) => ({ x: value8 / 100, y: 1 - value8 / 100 }), value: 0 }
    ];


    function applyColorAdjustments(imageData, selectedRegions, variationIndex, totalVariations) {
        const adjustmentFactor = variationIndex / totalVariations;
        
        for (const region of selectedRegions) {
            for (const pixelIndex of region) {
                const index = pixelIndex * 4;
                // Apply gradual color adjustments based on variation index
                imageData.data[index] = Math.min(255, imageData.data[index] * (1 + adjustmentFactor * 0.2));
                imageData.data[index + 1] = Math.min(255, imageData.data[index + 1] * (1 + adjustmentFactor * 0.2));
                imageData.data[index + 2] = Math.min(255, imageData.data[index + 2] * (1 + adjustmentFactor * 0.2));
            }
        }
    }

    function applyBulgePinch(imageData, centerX, centerY, radius, strength, selectedRegions) {
        for (const region of selectedRegions) {
            for (const pixelIndex of region) {
                const x = pixelIndex % imageData.width;
                const y = Math.floor(pixelIndex / imageData.width);
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < radius) {
                    const factor = 1 + strength * (1 - distance / radius);
                    const newX = centerX + dx * factor;
                    const newY = centerY + dy * factor;

                    if (newX >= 0 && newX < imageData.width && newY >= 0 && newY < imageData.height) {
                        const newIndex = (Math.floor(newY) * imageData.width + Math.floor(newX)) * 4;
                        const index = (y * imageData.width + x) * 4;
                        imageData.data[index] = imageData.data[newIndex];
                        imageData.data[index + 1] = imageData.data[newIndex + 1];
                        imageData.data[index + 2] = imageData.data[newIndex + 2];
                        imageData.data[index + 3] = imageData.data[newIndex + 3];
                    }
                }
            }
        }
    }

    function applyAdditionalEffects(imageData, value1 = 5, value2 =3, value3 =4, value4=4, value5=4, selectedRegions) {
        const saturationAdjustment = value1 / 100;

        for (const region of selectedRegions) {
            for (const pixelIndex of region) {
                const index = pixelIndex * 4;
                const [h, s, l] = rgbToHsl(
                    imageData.data[index],
                    imageData.data[index + 1],
                    imageData.data[index + 2]
                );

                const newSaturation = Math.min(1, Math.max(0, s * (1 + saturationAdjustment)));
                const [r, g, b] = hslToRgb(h, newSaturation, l);

                imageData.data[index] = r;
                imageData.data[index + 1] = g;
                imageData.data[index + 2] = b;
            }
        }
    }

    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h * 360, s, l];
    }

    function hslToRgb(h, s, l) {
        h /= 360;
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    self.onmessage = function(e) {
        const { imageData, selectedRegions, value =4, value2=4, values = [] } = e.data;
        const variationsPerOrientation = 1; // Default to 1 variation unless specified
        
        try {
            const scaleX = value || 1;
            const scaleY = value2 || value || 1;
            
            // Process images using both scaling and effects
            const processedImages = processImage(
                imageData,
                selectedRegions,
                values,
                variationsPerOrientation,
                scaleX,
                scaleY
            );
            
            self.postMessage({
                segmentedImages: processedImages,
                isComplete: true
            });
        } catch (error) {
            self.postMessage({
                error: error.message,
                isComplete: true
            });
        }
    };

    function processImage(imageData, selectedRegions, values, variationsPerOrientation, scaleX, scaleY) {
        const segmentedImages = [];

        // First apply scaling
        let scaledImageData;
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            scaledImageData = scaleSelectedRegions(imageData, selectedRegions, scaleX, scaleY);
        } else {
            scaledImageData = scaleImageData(imageData, scaleX, scaleY);
        }

        // Then apply additional processing for each orientation
        for (let i = 0; i < variationsPerOrientation; i++) {
            for (let j = 0; j < orientations.length; j++) {
                const newImageData = new ImageData(
                    new Uint8ClampedArray(scaledImageData.data),
                    scaledImageData.width,
                    scaledImageData.height
                );

                applyColorAdjustments(newImageData, selectedRegions, i, variationsPerOrientation);

                const orientation = orientations[j];
                orientation.value = values[j] || 0;
                const { x, y } = orientation.getValue(orientation.value);
                
                const centerX = x === 0 ? Math.random() * scaledImageData.width : x * scaledImageData.width;
                const centerY = y === 0 ? Math.random() * scaledImageData.height : y * scaledImageData.height;
                const radius = Math.min(scaledImageData.width, scaledImageData.height) * 0.3;
                const strength = ((orientation.value / 100) * 2 - 1) * (i + 1) / variationsPerOrientation;

                applyBulgePinch(newImageData, centerX, centerY, radius, strength, selectedRegions);
                applyAdditionalEffects(newImageData, values[0], values[1], values[2], values[3], values[4], selectedRegions);
                segmentedImages.push(newImageData);
            }
        }
        
        return segmentedImages;
    }

    function scaleImageData(imageData, scaleX, scaleY) {
        const scaledWidth = Math.round(imageData.width * scaleX);
        const scaledHeight = Math.round(imageData.height * scaleY);
        const newImageData = new ImageData(scaledWidth, scaledHeight);

        for (let y = 0; y < scaledHeight; y++) {
            for (let x = 0; x < scaledWidth; x++) {
                const sourceX = Math.floor(x / scaleX);
                const sourceY = Math.floor(y / scaleY);
                const sourceIndex = (sourceY * imageData.width + sourceX) * 4;
                const targetIndex = (y * scaledWidth + x) * 4;

                newImageData.data[targetIndex] = imageData.data[sourceIndex];
                newImageData.data[targetIndex + 1] = imageData.data[sourceIndex + 1];
                newImageData.data[targetIndex + 2] = imageData.data[sourceIndex + 2];
                newImageData.data[targetIndex + 3] = imageData.data[sourceIndex + 3];
            }
        }

        return newImageData;
    }

    function scaleSelectedRegions(imageData, selectedRegions, scaleX, scaleY) {
        const scaledWidth = Math.round(imageData.width * scaleX);
        const scaledHeight = Math.round(imageData.height * scaleY);
        const newImageData = new ImageData(scaledWidth, scaledHeight);
        
        // Copy original data first
        const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(imageData, 0, 0);
        
        // Scale only selected regions
        for (const region of selectedRegions) {
            for (const pixelIndex of region) {
                const x = pixelIndex % imageData.width;
                const y = Math.floor(pixelIndex / imageData.width);
                
                const scaledX = Math.floor(x * scaleX);
                const scaledY = Math.floor(y * scaleY);
                const sourceIndex = (y * imageData.width + x) * 4;
                const targetIndex = (scaledY * scaledWidth + scaledX) * 4;
                
                newImageData.data[targetIndex] = imageData.data[sourceIndex];
                newImageData.data[targetIndex + 1] = imageData.data[sourceIndex + 1];
                newImageData.data[targetIndex + 2] = imageData.data[sourceIndex + 2];
                newImageData.data[targetIndex + 3] = imageData.data[sourceIndex + 3];
            }
        }
        
        return newImageData;
    }