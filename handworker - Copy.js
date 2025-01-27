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

    // console.log('imageArray:>> ', imageArray);

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

    function calculateRotatedPoints(upperArmAngle, lowerArmAngle, upperArmRotationCenter, lowerArmRotationCenter, isRightArm = false) {
        return new Promise((resolve) => {
            const rotatedPoints = {};
            const prefix = isRightArm ? 'right' : 'left';
            // Upper arm rotation calculations
            if (extremePoints[`${prefix}UpperArmBack`]) {
                rotatedPoints[`${prefix}UpperArmBack`] = {
                    top: rotatePoint(extremePoints[`${prefix}UpperArmBack`].top, upperArmRotationCenter, upperArmAngle),
                    bottom: rotatePoint(extremePoints[`${prefix}UpperArmBack`].bottom, upperArmRotationCenter, upperArmAngle)
                };
            }

            if (extremePoints[`${prefix}UpperArmFront`]) {
                rotatedPoints[`${prefix}UpperArmFront`] = {
                    top: rotatePoint(extremePoints[`${prefix}UpperArmFront`].top, upperArmRotationCenter, upperArmAngle),
                    bottom: rotatePoint(extremePoints[`${prefix}UpperArmFront`].bottom, upperArmRotationCenter, upperArmAngle)
                };
            }

            // Calculate upper arm averages
            if (rotatedPoints[`${prefix}UpperArmBack`] && rotatedPoints[`${prefix}UpperArmFront`]) {
                rotatedPoints[`${prefix}UpperArmAverage`] = {
                    front: {
                        top: rotatedPoints[`${prefix}UpperArmFront`].top,
                        bottom: rotatedPoints[`${prefix}UpperArmFront`].bottom
                    },
                    back: {
                        top: rotatedPoints[`${prefix}UpperArmBack`].top,
                        bottom: rotatedPoints[`${prefix}UpperArmBack`].bottom
                    },
                    center: {
                        top: {
                            x: (rotatedPoints[`${prefix}UpperArmFront`].top.x + rotatedPoints[`${prefix}UpperArmBack`].top.x) / 2,
                            y: (rotatedPoints[`${prefix}UpperArmFront`].top.y + rotatedPoints[`${prefix}UpperArmBack`].top.y) / 2
                        },
                        bottom: {
                            x: (rotatedPoints[`${prefix}UpperArmFront`].bottom.x + rotatedPoints[`${prefix}UpperArmBack`].bottom.x) / 2,
                            y: (rotatedPoints[`${prefix}UpperArmFront`].bottom.y + rotatedPoints[`${prefix}UpperArmBack`].bottom.y) / 2
                        }
                    }
                };
            }

            // Lower arm rotation calculations
            let lowerArmBackRotated = null;
            let lowerArmFrontRotated = null;

            if (extremePoints[`${prefix}LowerArmBack`]) {
                lowerArmBackRotated = {
                    top: rotatePoint(extremePoints[`${prefix}LowerArmBack`].top, upperArmRotationCenter, upperArmAngle),
                    bottom: rotatePoint(extremePoints[`${prefix}LowerArmBack`].bottom, upperArmRotationCenter, upperArmAngle)
                };
            }

            if (extremePoints[`${prefix}LowerArmFront`]) {
                lowerArmFrontRotated = {
                    top: rotatePoint(extremePoints[`${prefix}LowerArmFront`].top, upperArmRotationCenter, upperArmAngle),
                    bottom: rotatePoint(extremePoints[`${prefix}LowerArmFront`].bottom, upperArmRotationCenter, upperArmAngle)
                };
            }

            // Second rotation for lower arm
            if (lowerArmBackRotated) {
                rotatedPoints[`${prefix}LowerArmBack`] = {
                    top: rotatePoint(lowerArmBackRotated.top, lowerArmRotationCenter, lowerArmAngle),
                    bottom: rotatePoint(lowerArmBackRotated.bottom, lowerArmRotationCenter, lowerArmAngle)
                };
            }

            if (lowerArmFrontRotated) {
                rotatedPoints[`${prefix}LowerArmFront`] = {
                    top: rotatePoint(lowerArmFrontRotated.top, lowerArmRotationCenter, lowerArmAngle),
                    bottom: rotatePoint(lowerArmFrontRotated.bottom, lowerArmRotationCenter, lowerArmAngle)
                };
            }

            // Calculate lower arm averages
            if (rotatedPoints[`${prefix}LowerArmBack`] && rotatedPoints[`${prefix}LowerArmFront`]) {
                rotatedPoints[`${prefix}LowerArmAverage`] = {
                    front: {
                        top: rotatedPoints[`${prefix}LowerArmFront`].top,
                        bottom: rotatedPoints[`${prefix}LowerArmFront`].bottom
                    },
                    back: {
                        top: rotatedPoints[`${prefix}LowerArmBack`].top,
                        bottom: rotatedPoints[`${prefix}LowerArmBack`].bottom
                    },
                    center: {
                        top: {
                            x: (rotatedPoints[`${prefix}LowerArmFront`].top.x + rotatedPoints[`${prefix}LowerArmBack`].top.x) / 2,
                            y: (rotatedPoints[`${prefix}LowerArmFront`].top.y + rotatedPoints[`${prefix}LowerArmBack`].top.y) / 2
                        },
                        bottom: {
                            x: (rotatedPoints[`${prefix}LowerArmFront`].bottom.x + rotatedPoints[`${prefix}LowerArmBack`].bottom.x) / 2,
                            y: (rotatedPoints[`${prefix}LowerArmFront`].bottom.y + rotatedPoints[`${prefix}LowerArmBack`].bottom.y) / 2
                        }
                    }
                };
            }

            // Add hand rotation calculations
            if (extremePoints[`${prefix}Hand`]) {
                // First rotate by upper arm angle
                const handFirstRotation = {
                    top: rotatePoint(extremePoints[`${prefix}Hand`].top, upperArmRotationCenter, upperArmAngle),
                    bottom: rotatePoint(extremePoints[`${prefix}Hand`].bottom, upperArmRotationCenter, upperArmAngle)
                };

                // Then rotate by lower arm angle
                rotatedPoints[`${prefix}Hand`] = {
                    top: rotatePoint(handFirstRotation.top, lowerArmRotationCenter, lowerArmAngle),
                    bottom: rotatePoint(handFirstRotation.bottom, lowerArmRotationCenter, lowerArmAngle)
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
    
    async function processHand(upperArmAngle, lowerArmAngle, upperArmRotationCenter, lowerArmRotationCenter, isRightHand = false) {
        const prefix = isRightHand ? 'right' : 'left';
        if (!bodyPartImages?.[`${prefix}_hand`]?.[0]) return null;
    
        // First rotate around upper arm center
        const afterUpperArmRotation = await rotateSegment(
            bodyPartImages[`${prefix}_hand`][0].imageData,
            width,
            height,
            upperArmAngle,
            upperArmRotationCenter
        );
    
        // Then rotate around lower arm center
        return rotateSegment(
            afterUpperArmRotation,
            width,
            height,
            lowerArmAngle,
            lowerArmRotationCenter
        );
    }

    function calculateJointCenters(extremePoints, averages) {
        // Shoulder joint centers (where upper arms rotate)
        const leftShoulderJoint = {
            x: (extremePoints.leftUpperArmFront.top.x + extremePoints.leftUpperArmBack.top.x) / 2,
            y: (extremePoints.leftUpperArmFront.top.y + extremePoints.leftUpperArmBack.top.y) / 2
        };
        
        const rightShoulderJoint = {
            x: (extremePoints.rightUpperArmFront.top.x + extremePoints.rightUpperArmBack.top.x) / 2,
            y: (extremePoints.rightUpperArmFront.top.y + extremePoints.rightUpperArmBack.top.y) / 2
        };
    
        // Elbow joint centers (where lower arms rotate)
        const leftElbowJoint = {
            x: (extremePoints.leftUpperArmFront.bottom.x + extremePoints.leftUpperArmBack.bottom.x) / 2,
            y: (extremePoints.leftUpperArmFront.bottom.y + extremePoints.leftUpperArmBack.bottom.y) / 2
        };
        
        const rightElbowJoint = {
            x: (extremePoints.rightUpperArmFront.bottom.x + extremePoints.rightUpperArmBack.bottom.x) / 2,
            y: (extremePoints.rightUpperArmFront.bottom.y + extremePoints.rightUpperArmBack.bottom.y) / 2
        };
    
        return {
            shoulders: { left: leftShoulderJoint, right: rightShoulderJoint },
            elbows: { left: leftElbowJoint, right: rightElbowJoint }
        };
    }
  
    async function processVariation(leftUpperArmAngle, leftLowerArmAngle, rightUpperArmAngle, rightLowerArmAngle) {
        const jointCenters = calculateJointCenters(extremePoints, averages);

        // Update rotation centers to use actual joint positions
        const upperArmRotationCenterLeft = jointCenters.shoulders.left;
        const lowerArmRotationCenterLeft = rotatePoint(
            jointCenters.elbows.left,
            jointCenters.shoulders.left,
            leftUpperArmAngle
        );

        const upperArmRotationCenterRight = jointCenters.shoulders.right;
        const lowerArmRotationCenterRight = rotatePoint(
            jointCenters.elbows.right,
            jointCenters.shoulders.right,
            rightUpperArmAngle
        );

        const colors = [
            { r: 255, g: 0, b: 0 },    // upper arm back
            { r: 255, g: 0, b: 0 },    // upper arm front
            { r: 0, g: 0, b: 255 },    // lower arm back
            { r: 0, g: 0, b: 255 }     // lower arm front
        ];

        const promises = [
            calculateRotatedPoints(leftUpperArmAngle, leftLowerArmAngle, upperArmRotationCenterLeft, lowerArmRotationCenterLeft),
            calculateRotatedPoints(rightUpperArmAngle, rightLowerArmAngle, upperArmRotationCenterRight, lowerArmRotationCenterRight, true),

            // Left arm segments
            ...(bodyPartImages?.left_upper_arm_back?.[0] ? [
                rotateSegment(
                    bodyPartImages.left_upper_arm_back[0].imageData,
                    width,
                    height,
                    leftUpperArmAngle,
                    upperArmRotationCenterLeft,
                    colors[0]
                )
            ] : []),
            ...(bodyPartImages?.left_upper_arm_front?.[0] ? [
                rotateSegment(
                    bodyPartImages.left_upper_arm_front[0].imageData,
                    width,
                    height,
                    leftUpperArmAngle,
                    upperArmRotationCenterLeft,
                    colors[1]
                )
            ] : []),

            // Left lower arm segments
            ...(bodyPartImages?.left_lower_arm_back?.[0] ? [
                (async () => {
                    const upperRotated = await rotateSegment(
                        bodyPartImages.left_lower_arm_back[0].imageData,
                        width,
                        height,
                        leftUpperArmAngle,
                        upperArmRotationCenterLeft,
                        colors[2]
                    );
                    return rotateSegment(
                        upperRotated,
                        width,
                        height,
                        leftLowerArmAngle,
                        lowerArmRotationCenterLeft,
                        colors[2]
                    );
                })()
            ] : []),
            ...(bodyPartImages?.left_lower_arm_front?.[0] ? [
                (async () => {
                    const upperRotated = await rotateSegment(
                        bodyPartImages.left_lower_arm_front[0].imageData,
                        width,
                        height,
                        leftUpperArmAngle,
                        upperArmRotationCenterLeft,
                        colors[3]
                    );
                    return rotateSegment(
                        upperRotated,
                        width,
                        height,
                        leftLowerArmAngle,
                        lowerArmRotationCenterLeft,
                        colors[3]
                    );
                })()
            ] : []),

            // Right arm segments
            ...(bodyPartImages?.right_upper_arm_back?.[0] ? [
                rotateSegment(
                    bodyPartImages.right_upper_arm_back[0].imageData,
                    width,
                    height,
                    rightUpperArmAngle,
                    upperArmRotationCenterRight,
                    colors[0]
                )
            ] : []),
            ...(bodyPartImages?.right_upper_arm_front?.[0] ? [
                rotateSegment(
                    bodyPartImages.right_upper_arm_front[0].imageData,
                    width,
                    height,
                    rightUpperArmAngle,
                    upperArmRotationCenterRight,
                    colors[1]
                )
            ] : []),

            // Right lower arm segments
            ...(bodyPartImages?.right_lower_arm_back?.[0] ? [
                (async () => {
                    const upperRotated = await rotateSegment(
                        bodyPartImages.right_lower_arm_back[0].imageData,
                        width,
                        height,
                        rightUpperArmAngle,
                        upperArmRotationCenterRight,
                        colors[2]
                    );
                    return rotateSegment(
                        upperRotated,
                        width,
                        height,
                        rightLowerArmAngle,
                        lowerArmRotationCenterRight,
                        colors[2]
                    );
                })()
            ] : []),
            ...(bodyPartImages?.right_lower_arm_front?.[0] ? [
                (async () => {
                    const upperRotated = await rotateSegment(
                        bodyPartImages.right_lower_arm_front[0].imageData,
                        width,
                        height,
                        rightUpperArmAngle,
                        upperArmRotationCenterRight,
                        colors[3]
                    );
                    return rotateSegment(
                        upperRotated,
                        width,
                        height,
                        rightLowerArmAngle,
                        lowerArmRotationCenterRight,
                        colors[3]
                    );
                })()
            ] : []),

            // Add hand processing
            processHand(leftUpperArmAngle, leftLowerArmAngle, upperArmRotationCenterLeft, lowerArmRotationCenterLeft),
            processHand(rightUpperArmAngle, rightLowerArmAngle, upperArmRotationCenterRight, lowerArmRotationCenterRight, true),

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

        const [rotatedPointsLeftArm, rotatedPointsRightArm, ...rotatedSegments] = await Promise.all(promises.filter(p => p !== null));
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
            rotatedPointsLeftArm,
            rotatedPointsRightArm,
            upperArmRotationCenterLeft,
            lowerArmRotationCenterLeft,
            upperArmRotationCenterRight,
            lowerArmRotationCenterRight,
            leftUpperArmRotation: leftUpperArmAngle,
            leftLowerArmRotation: leftLowerArmAngle,
            rightUpperArmRotation: rightUpperArmAngle,
            rightLowerArmRotation: rightLowerArmAngle
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
                leftUpperArmAngle: generateRandomAngle(0, 90),
                leftLowerArmAngle: generateRandomAngle(0, 90),
                rightUpperArmAngle: generateRandomAngle(0, 90),
                rightLowerArmAngle: generateRandomAngle(0, 90)
            };
    
            const variation = await processVariation(
                angleConfig.leftUpperArmAngle,
                angleConfig.leftLowerArmAngle,
                angleConfig.rightUpperArmAngle,
                angleConfig.rightLowerArmAngle
            );
    
            const processedVariation = {
                imageData: variation.imageData,
                width,
                height,
                extremePointsLeftArm: variation.rotatedPointsLeftArm,
                extremePointsRightArm: variation.rotatedPointsRightArm,
                averages: {
                    ...averages,
                    left_upper_arm: variation.rotatedPointsLeftArm.leftUpperArmAverage,
                    left_lower_arm: variation.rotatedPointsLeftArm.leftLowerArmAverage,
                    right_upper_arm: variation.rotatedPointsRightArm.rightUpperArmAverage,
                    right_lower_arm: variation.rotatedPointsRightArm.rightLowerArmAverage
                },
                movementName: `variation_${index + 1}`,
                rotations: {
                    leftArm: {
                        upper: variation.leftUpperArmRotation,
                        lower: variation.leftLowerArmRotation
                    },
                    rightArm: {
                        upper: variation.rightUpperArmRotation,
                        lower: variation.rightLowerArmRotation
                    }
                },
                partName: partNames
            };
    
            processedVariations.push(processedVariation);
            // console.log(processedVariation);
            // console.log(processedVariations);

            // Send the processed variation to the main thread
            self.postMessage({
                type: 'processedVariations',
                variations: [processedVariation],
                timestamp,
                partNames
            });
            // console.log("Processed Variation:", processedVariation); // Debugging log

            // Optional: Add a small delay between variations if necessary for performance reasons
            await new Promise(resolve => globalThis.setTimeout(resolve, 1)); // Adjust the delay as needed
        }
    
        // console.log('All variations processed :>> ', processedVariations);
    };
    // Execute movement processing
    processMovements().catch(error => {
        self.postMessage({
            type: 'error',
            error: error.message,
            timestamp
        });
    });
};