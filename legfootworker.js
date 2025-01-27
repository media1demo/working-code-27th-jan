self.onmessage = function(e) {

    const { 
        type, 
        imageData, 
        width, 
        height, 
        bodyPartImages, 
        extremePoints, 
        averages, 
        timestamp, 
        partNames,
        numberOfVariations, 
        rotationAngles,
        imageArray // Add images to the destructured object
    } = e.data;

    function rotatePoint(point, center, angle) {
        const radians = (angle * Math.PI) / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        const dx = point.x - center.x;
        const dy = point.y - center.y;

        return {
            x: center.x + (dx * cos - dy * sin),
            y: center.y + (dx * sin + dy * cos)
        };
    }

    async function rotateImages(images, rotationAngles) {
        const rotatedImages = [];
        for (const image of images) {
            const rotatedImage = await rotateSegment(image.data, image.width, image.height, rotationAngles[0], { x: image.width / 2, y: image.height / 2 });
            rotatedImages.push(rotatedImage);
        }
        return rotatedImages;
    }

    function calculateRotatedPoints(upperLegAngle, lowerLegAngle, upperLegRotationCenter, lowerLegRotationCenter, isRightLeg = false) {
        return new Promise((resolve) => {
            const rotatedPoints = {};
            const prefix = isRightLeg ? 'right' : 'left';
            // Upper leg rotation calculations
            if (extremePoints[`${prefix}UpperLegBack`]) {
                rotatedPoints[`${prefix}UpperLegBack`] = {
                    top: rotatePoint(extremePoints[`${prefix}UpperLegBack`].top, upperLegRotationCenter, upperLegAngle),
                    bottom: rotatePoint(extremePoints[`${prefix}UpperLegBack`].bottom, upperLegRotationCenter, upperLegAngle)
                };
            }

            if (extremePoints[`${prefix}UpperLegFront`]) {
                rotatedPoints[`${prefix}UpperLegFront`] = {
                    top: rotatePoint(extremePoints[`${prefix}UpperLegFront`].top, upperLegRotationCenter, upperLegAngle),
                    bottom: rotatePoint(extremePoints[`${prefix}UpperLegFront`].bottom, upperLegRotationCenter, upperLegAngle)
                };
            }

            // Calculate upper leg averages
            if (rotatedPoints[`${prefix}UpperLegBack`] && rotatedPoints[`${prefix}UpperLegFront`]) {
                rotatedPoints[`${prefix}UpperLegAverage`] = {
                    front: {
                        top: rotatedPoints[`${prefix}UpperLegFront`].top,
                        bottom: rotatedPoints[`${prefix}UpperLegFront`].bottom
                    },
                    back: {
                        top: rotatedPoints[`${prefix}UpperLegBack`].top,
                        bottom: rotatedPoints[`${prefix}UpperLegBack`].bottom
                    },
                    center: {
                        top: {
                            x: (rotatedPoints[`${prefix}UpperLegFront`].top.x + rotatedPoints[`${prefix}UpperLegBack`].top.x) / 2,
                            y: (rotatedPoints[`${prefix}UpperLegFront`].top.y + rotatedPoints[`${prefix}UpperLegBack`].top.y) / 2
                        },
                        bottom: {
                            x: (rotatedPoints[`${prefix}UpperLegFront`].bottom.x + rotatedPoints[`${prefix}UpperLegBack`].bottom.x) / 2,
                            y: (rotatedPoints[`${prefix}UpperLegFront`].bottom.y + rotatedPoints[`${prefix}UpperLegBack`].bottom.y) / 2
                        }
                    }
                };
            }

            // Lower leg rotation calculations
            let lowerLegBackRotated = null;
            let lowerLegFrontRotated = null;

            if (extremePoints[`${prefix}LowerLegBack`]) {
                lowerLegBackRotated = {
                    top: rotatePoint(extremePoints[`${prefix}LowerLegBack`].top, upperLegRotationCenter, upperLegAngle),
                    bottom: rotatePoint(extremePoints[`${prefix}LowerLegBack`].bottom, upperLegRotationCenter, upperLegAngle)
                };
            }

            if (extremePoints[`${prefix}LowerLegFront`]) {
                lowerLegFrontRotated = {
                    top: rotatePoint(extremePoints[`${prefix}LowerLegFront`].top, upperLegRotationCenter, upperLegAngle),
                    bottom: rotatePoint(extremePoints[`${prefix}LowerLegFront`].bottom, upperLegRotationCenter, upperLegAngle)
                };
            }

            // Second rotation for lower leg
            if (lowerLegBackRotated) {
                rotatedPoints[`${prefix}LowerLegBack`] = {
                    top: rotatePoint(lowerLegBackRotated.top, lowerLegRotationCenter, lowerLegAngle),
                    bottom: rotatePoint(lowerLegBackRotated.bottom, lowerLegRotationCenter, lowerLegAngle)
                };
            }

            if (lowerLegFrontRotated) {
                rotatedPoints[`${prefix}LowerLegFront`] = {
                    top: rotatePoint(lowerLegFrontRotated.top, lowerLegRotationCenter, lowerLegAngle),
                    bottom: rotatePoint(lowerLegFrontRotated.bottom, lowerLegRotationCenter, lowerLegAngle)
                };
            }

            // Calculate lower leg averages
            if (rotatedPoints[`${prefix}LowerLegBack`] && rotatedPoints[`${prefix}LowerLegFront`]) {
                rotatedPoints[`${prefix}LowerLegAverage`] = {
                    front: {
                        top: rotatedPoints[`${prefix}LowerLegFront`].top,
                        bottom: rotatedPoints[`${prefix}LowerLegFront`].bottom
                    },
                    back: {
                        top: rotatedPoints[`${prefix}LowerLegBack`].top,
                        bottom: rotatedPoints[`${prefix}LowerLegBack`].bottom
                    },
                    center: {
                        top: {
                            x: (rotatedPoints[`${prefix}LowerLegFront`].top.x + rotatedPoints[`${prefix}LowerLegBack`].top.x) / 2,
                            y: (rotatedPoints[`${prefix}LowerLegFront`].top.y + rotatedPoints[`${prefix}LowerLegBack`].top.y) / 2
                        },
                        bottom: {
                            x: (rotatedPoints[`${prefix}LowerLegFront`].bottom.x + rotatedPoints[`${prefix}LowerLegBack`].bottom.x) / 2,
                            y: (rotatedPoints[`${prefix}LowerLegFront`].bottom.y + rotatedPoints[`${prefix}LowerLegBack`].bottom.y) / 2
                        }
                    }
                };
            }

            // Add foot rotation calculations
            if (extremePoints[`${prefix}Foot`]) {
                // First rotate by upper leg angle
                const footFirstRotation = {
                    top: rotatePoint(extremePoints[`${prefix}Foot`].top, upperLegRotationCenter, upperLegAngle),
                    bottom: rotatePoint(extremePoints[`${prefix}Foot`].bottom, upperLegRotationCenter, upperLegAngle)
                };

                // Then rotate by lower leg angle
                rotatedPoints[`${prefix}Foot`] = {
                    top: rotatePoint(footFirstRotation.top, lowerLegRotationCenter, lowerLegAngle),
                    bottom: rotatePoint(footFirstRotation.bottom, lowerLegRotationCenter, lowerLegAngle)
                };
            }

            resolve(rotatedPoints);
        });
    }

    function rotateSegment(segmentData, width, height, angle, center) {
        return new Promise((resolve) => {
            const radians = (angle * Math.PI) / 180;
            const cos = Math.cos(radians);
            const sin = Math.sin(radians);
            const rotatedData = new Uint8ClampedArray(width * height * 4);
    
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const dx = x - center.x;
                    const dy = y - center.y;
    
                    const srcX = Math.round(center.x + (dx * cos + dy * sin));
                    const srcY = Math.round(center.y + (-dx * sin + dy * cos));
    
                    if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
                        const targetIdx = (y * width + x) * 4;
                        const srcIdx = (srcY * width + srcX) * 4;
                        
                        if (segmentData[srcIdx + 3] > 0) {
                            // Preserve original colors
                            rotatedData[targetIdx] = segmentData[srcIdx];
                            rotatedData[targetIdx + 1] = segmentData[srcIdx + 1];
                            rotatedData[targetIdx + 2] = segmentData[srcIdx + 2];
                            rotatedData[targetIdx + 3] = segmentData[srcIdx + 3];
                        }
                    }
                }
            }
            resolve(rotatedData);
        });
    }
    
    async function processFoot(upperLegAngle, lowerLegAngle, upperLegRotationCenter, lowerLegRotationCenter, isRightFoot = false) {
        const prefix = isRightFoot ? 'right' : 'left';
        if (!bodyPartImages?.[`${prefix}_foot`]?.[0]) return null;
    
        // First rotate around upper leg center
        const afterUpperLegRotation = await rotateSegment(
            bodyPartImages[`${prefix}_foot`][0].imageData,
            width,
            height,
            upperLegAngle,
            upperLegRotationCenter
        );
    
        // Then rotate around lower leg center
        return rotateSegment(
            afterUpperLegRotation,
            width,
            height,
            lowerLegAngle,
            lowerLegRotationCenter
        );
    }

    function calculateJointCenters(extremePoints, averages) {

        const leftHipJoint = {
            x: (extremePoints.leftUpperLegFront.top.x + extremePoints.leftUpperLegBack.top.x) / 2,
            y: (extremePoints.leftUpperLegFront.top.y + extremePoints.leftUpperLegBack.top.y) / 2
        };
        
        const rightHipJoint = {
            x: (extremePoints.rightUpperLegFront.top.x + extremePoints.rightUpperLegBack.top.x) / 2,
            y: (extremePoints.rightUpperLegFront.top.y + extremePoints.rightUpperLegBack.top.y) / 2
        };
    
        // Knee joint centers (where lower legs rotate)
        const leftKneeJoint = {
            x: (extremePoints.leftUpperLegFront.bottom.x + extremePoints.leftUpperLegBack.bottom.x) / 2,
            y: (extremePoints.leftUpperLegFront.bottom.y + extremePoints.leftUpperLegBack.bottom.y) / 2
        };
        
        const rightKneeJoint = {
            x: (extremePoints.rightUpperLegFront.bottom.x + extremePoints.rightUpperLegBack.bottom.x) / 2,
            y: (extremePoints.rightUpperLegFront.bottom.y + extremePoints.rightUpperLegBack.bottom.y) / 2
        };
    
        return {
            hips: { left: leftHipJoint, right: rightHipJoint },
            knees: { left: leftKneeJoint, right: rightKneeJoint }
        };

    }
  
    async function processVariation(leftUpperLegAngle, leftLowerLegAngle, rightUpperLegAngle, rightLowerLegAngle) {
        const jointCenters = calculateJointCenters(extremePoints, averages);

        // Update rotation centers to use actual joint positions
        const upperLegRotationCenterLeft = jointCenters.hips.left;
        const lowerLegRotationCenterLeft = rotatePoint(
            jointCenters.knees.left,
            jointCenters.hips.left,
            leftUpperLegAngle
        );

        const upperLegRotationCenterRight = jointCenters.hips.right;
        const lowerLegRotationCenterRight = rotatePoint(
            jointCenters.knees.right,
            jointCenters.hips.right,
            rightUpperLegAngle
        );

        const colors = [
            { r: 255, g: 0, b: 0 },    // upper leg back
            { r: 255, g: 0, b: 0 },    // upper leg front
            { r: 0, g: 0, b: 255 },    // lower leg back
            { r: 0, g: 0, b: 255 }     // lower leg front
        ];

        const promises = [
            calculateRotatedPoints(leftUpperLegAngle, leftLowerLegAngle, upperLegRotationCenterLeft, lowerLegRotationCenterLeft),
            calculateRotatedPoints(rightUpperLegAngle, rightLowerLegAngle, upperLegRotationCenterRight, lowerLegRotationCenterRight, true),

            // Left leg segments
            ...(bodyPartImages?.left_upper_leg_back?.[0] ? [
                rotateSegment(
                    bodyPartImages.left_upper_leg_back[0].imageData,
                    width,
                    height,
                    leftUpperLegAngle,
                    upperLegRotationCenterLeft,
                    colors[0]
                )
            ] : []),
            ...(bodyPartImages?.left_upper_leg_front?.[0] ? [
                rotateSegment(
                    bodyPartImages.left_upper_leg_front[0].imageData,
                    width,
                    height,
                    leftUpperLegAngle,
                    upperLegRotationCenterLeft,
                    colors[1]
                )
            ] : []),

            // Left lower leg segments
            ...(bodyPartImages?.left_lower_leg_back?.[0] ? [
                (async () => {
                    const upperRotated = await rotateSegment(
                        bodyPartImages.left_lower_leg_back[0].imageData,
                        width,
                        height,
                        leftUpperLegAngle,
                        upperLegRotationCenterLeft,
                        colors[2]
                    );
                    return rotateSegment(
                        upperRotated,
                        width,
                        height,
                        leftLowerLegAngle,
                        lowerLegRotationCenterLeft,
                        colors[2]
                    );
                })()
            ] : []),
            ...(bodyPartImages?.left_lower_leg_front?.[0] ? [
                (async () => {
                    const upperRotated = await rotateSegment(
                        bodyPartImages.left_lower_leg_front[0].imageData,
                        width,
                        height,
                        leftUpperLegAngle,
                        upperLegRotationCenterLeft,
                        colors[3]
                    );
                    return rotateSegment(
                        upperRotated,
                        width,
                        height,
                        leftLowerLegAngle,
                        lowerLegRotationCenterLeft,
                        colors[3]
                    );
                })()
            ] : []),

            // Right leg segments
            ...(bodyPartImages?.right_upper_leg_back?.[0] ? [
                rotateSegment(
                    bodyPartImages.right_upper_leg_back[0].imageData,
                    width,
                    height,
                    rightUpperLegAngle,
                    upperLegRotationCenterRight,
                    colors[0]
                )
            ] : []),
            ...(bodyPartImages?.right_upper_leg_front?.[0] ? [
                rotateSegment(
                    bodyPartImages.right_upper_leg_front[0].imageData,
                    width,
                    height,
                    rightUpperLegAngle,
                    upperLegRotationCenterRight,
                    colors[1]
                )
            ] : []),

            // Right lower leg segments
            ...(bodyPartImages?.right_lower_leg_back?.[0] ? [
                (async () => {
                    const upperRotated = await rotateSegment(
                        bodyPartImages.right_lower_leg_back[0].imageData,
                        width,
                        height,
                        rightUpperLegAngle,
                        upperLegRotationCenterRight,
                        colors[2]
                    );
                    return rotateSegment(
                        upperRotated,
                        width,
                        height,
                        rightLowerLegAngle,
                        lowerLegRotationCenterRight,
                        colors[2]
                    );
                })()
            ] : []),
            ...(bodyPartImages?.right_lower_leg_front?.[0] ? [
                (async () => {
                    const upperRotated = await rotateSegment(
                        bodyPartImages.right_lower_leg_front[0].imageData,
                        width,
                        height,
                        rightUpperLegAngle,
                        upperLegRotationCenterRight,
                        colors[3]
                    );
                    return rotateSegment(
                        upperRotated,
                        width,
                        height,
                        rightLowerLegAngle,
                        lowerLegRotationCenterRight,
                        colors[3]
                    );
                })()
            ] : []),

            // Add foot processing
            processFoot(leftUpperLegAngle, leftLowerLegAngle, upperLegRotationCenterLeft, lowerLegRotationCenterLeft),
            processFoot(rightUpperLegAngle, rightLowerLegAngle, upperLegRotationCenterRight, lowerLegRotationCenterRight, true),

            // Add non-rotated body parts
            ...(bodyPartImages?.left_face?.[0] ? [
                new Promise((resolve) => resolve(bodyPartImages.left_face[0].imageData))
            ] : []),
            ...(bodyPartImages?.right_face?.[0] ? [
                new Promise((resolve) => resolve(bodyPartImages.right_face[0].imageData))
            ] : []),
            ...(bodyPartImages?.torso_front?.[0] ? [
                new Promise((resolve) => resolve(bodyPartImages.torso_front[0].imageData))
            ] : []),
            ...(bodyPartImages?.torso_back?.[0] ? [
                new Promise((resolve) => resolve(bodyPartImages.torso_back[0].imageData))
            ] : []),
            ...(bodyPartImages?.head?.[0] ? [
                new Promise((resolve) => resolve(bodyPartImages.head[0].imageData))
            ] : []),
            ...(bodyPartImages?.neck?.[0] ? [
                new Promise((resolve) => resolve(bodyPartImages.neck[0].imageData))
            ] : []),
            ...(bodyPartImages?.pelvis?.[0] ? [
                new Promise((resolve) => resolve(bodyPartImages.pelvis[0].imageData))
            ] : []),
            ...(bodyPartImages?.left_shoulder?.[0] ? [
                new Promise((resolve) => resolve(bodyPartImages.left_shoulder[0].imageData))
            ] : []),
            ...(bodyPartImages?.right_shoulder?.[0] ? [
                new Promise((resolve) => resolve(bodyPartImages.right_shoulder[0].imageData))
            ] : []),
            ...(bodyPartImages?.left_hip?.[0] ? [
                new Promise((resolve) => resolve(bodyPartImages.left_hip[0].imageData))
            ] : []),
            ...(bodyPartImages?.right_hip?.[0] ? [
                new Promise((resolve) => resolve(bodyPartImages.right_hip[0].imageData))
            ] : [])
        ];

        const [rotatedPointsLeftLeg, rotatedPointsRightLeg, ...rotatedSegments] = await Promise.all(promises.filter(p => p !== null));
        const combinedSegments = [];

        const validRotatedSegments = rotatedSegments.filter(segment => segment !== null).concat(combinedSegments);

        const finalImageData = new Uint8ClampedArray(width * height * 4);

        validRotatedSegments.forEach((segmentData) => {
            for (let i = 0; i < segmentData.length; i += 4) {
                if (segmentData[i + 3] > 0) {
                    finalImageData[i] = segmentData[i];
                    finalImageData[i + 1] = segmentData[i + 1];
                    finalImageData[i + 2] = segmentData[i + 2];
                    finalImageData[i + 3] = segmentData[i + 3];
                }
            }
        });

        return {
            imageData: finalImageData,
            rotatedPointsLeftLeg,
            rotatedPointsRightLeg,
            upperLegRotationCenterLeft,
            lowerLegRotationCenterLeft,
            upperLegRotationCenterRight,
            lowerLegRotationCenterRight,
            leftUpperLegRotation: leftUpperLegAngle,
            leftLowerLegRotation: leftLowerLegAngle,
            rightUpperLegRotation: rightUpperLegAngle,
            rightLowerLegRotation: rightLowerLegAngle
        };
    }

    const processMovements = async () => {
        // Define a function to generate random angles within a range
        const generateRandomAngle = (min, max) => {
            return Math.random() * (max - min) + min;
        };
    
        const processedVariations = [];
    
        for (let index = 0; index < numberOfVariations; index++) {
            const angleConfig = {
                leftUpperLegAngle: generateRandomAngle(0, 90),
                leftLowerLegAngle: generateRandomAngle(0, 90),
                rightUpperLegAngle: generateRandomAngle(0, 90),
                rightLowerLegAngle: generateRandomAngle(0, 90)
            };
    
            const variation = await processVariation(
                angleConfig.leftUpperLegAngle,
                angleConfig.leftLowerLegAngle,
                angleConfig.rightUpperLegAngle,
                angleConfig.rightLowerLegAngle
            );
    
            const processedVariation = {
                imageData: variation.imageData,
                width,
                height,
                extremePointsLeftLeg: variation.rotatedPointsLeftLeg,
                extremePointsRightLeg: variation.rotatedPointsRightLeg,
                averages: {
                    ...averages,
                    left_upper_leg: variation.rotatedPointsLeftLeg.leftUpperLegAverage,
                    left_lower_leg: variation.rotatedPointsLeftLeg.leftLowerLegAverage,
                    right_upper_leg: variation.rotatedPointsRightLeg.rightUpperLegAverage,
                    right_lower_leg: variation.rotatedPointsRightLeg.rightLowerLegAverage
                },
                movementName: `variation_${index + 1}`,
                rotations: {
                    leftLeg: {
                        upper: variation.leftUpperLegRotation,
                        lower: variation.leftLowerLegRotation
                    },
                    rightLeg: {
                        upper: variation.rightUpperLegRotation,
                        lower: variation.rightLowerLegRotation
                    }
                },
                partName: partNames
            };
    
            processedVariations.push(processedVariation);
          
            

            // Send the processed variation to the main thread
            self.postMessage({
                type: 'processedVariations',
                variations: [processedVariation],
                timestamp,
                partNames
            });
           
            await new Promise(resolve => globalThis.setTimeout(resolve, 1)); // Adjust the delay as needed
        }
    
        
    };

    processMovements().catch(error => {
        self.postMessage({
            type: 'error',
            error: error.message,
            timestamp
        });
    });

};