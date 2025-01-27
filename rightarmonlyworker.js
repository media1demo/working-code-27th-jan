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
        rotationAngles
    } = e.data;
console.log("right arm worer only");


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
    
        // Hip joint centers (where upper legs rotate)
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
            shoulders: { left: leftShoulderJoint, right: rightShoulderJoint },
            elbows: { left: leftElbowJoint, right: rightElbowJoint },
            hips: { left: leftHipJoint, right: rightHipJoint },
            knees: { left: leftKneeJoint, right: rightKneeJoint }
        };
    }

    async function processVariation(leftUpperArmAngle, leftLowerArmAngle, rightUpperArmAngle, rightLowerArmAngle, leftUpperLegAngle, leftLowerLegAngle, rightUpperLegAngle, rightLowerLegAngle) {
        const jointCenters = calculateJointCenters(extremePoints, averages);
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

        const promises = [
            calculateRotatedPoints(leftUpperArmAngle, leftLowerArmAngle, upperArmRotationCenterLeft, lowerArmRotationCenterLeft),
            calculateRotatedPoints(rightUpperArmAngle, rightLowerArmAngle, upperArmRotationCenterRight, lowerArmRotationCenterRight, true),
            calculateRotatedPoints(leftUpperLegAngle, leftLowerLegAngle, upperLegRotationCenterLeft, lowerLegRotationCenterLeft),
            calculateRotatedPoints(rightUpperLegAngle, rightLowerLegAngle, upperLegRotationCenterRight, lowerLegRotationCenterRight, true),

            // Left arm segments
            ...(bodyPartImages?.left_upper_arm_back?.[0] ? [
                rotateSegment(
                    bodyPartImages.left_upper_arm_back[0].imageData,
                    width,
                    height,
                    leftUpperArmAngle,
                    upperArmRotationCenterLeft
                )
            ] : []),
            ...(bodyPartImages?.left_upper_arm_front?.[0] ? [
                rotateSegment(
                    bodyPartImages.left_upper_arm_front[0].imageData,
                    width,
                    height,
                    leftUpperArmAngle,
                    upperArmRotationCenterLeft
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
                        upperArmRotationCenterLeft
                    );
                    return rotateSegment(
                        upperRotated,
                        width,
                        height,
                        leftLowerArmAngle,
                        lowerArmRotationCenterLeft
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
                        upperArmRotationCenterLeft
                    );
                    return rotateSegment(
                        upperRotated,
                        width,
                        height,
                        leftLowerArmAngle,
                        lowerArmRotationCenterLeft
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
                    upperArmRotationCenterRight
                )
            ] : []),
            ...(bodyPartImages?.right_upper_arm_front?.[0] ? [
                rotateSegment(
                    bodyPartImages.right_upper_arm_front[0].imageData,
                    width,
                    height,
                    rightUpperArmAngle,
                    upperArmRotationCenterRight
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
                        upperArmRotationCenterRight
                    );
                    return rotateSegment(
                        upperRotated,
                        width,
                        height,
                        rightLowerArmAngle,
                        lowerArmRotationCenterRight
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
                        upperArmRotationCenterRight
                    );
                    return rotateSegment(
                        upperRotated,
                        width,
                        height,
                        rightLowerArmAngle,
                        lowerArmRotationCenterRight
                    );
                })()
            ] : []),

            // Left leg segments
            ...(bodyPartImages?.left_upper_leg_back?.[0] ? [
                rotateSegment(
                    bodyPartImages.left_upper_leg_back[0].imageData,
                    width,
                    height,
                    leftUpperLegAngle,
                    upperLegRotationCenterLeft
                )
            ] : []),
            ...(bodyPartImages?.left_upper_leg_front?.[0] ? [
                rotateSegment(
                    bodyPartImages.left_upper_leg_front[0].imageData,
                    width,
                    height,
                    leftUpperLegAngle,
                    upperLegRotationCenterLeft
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
                        upperLegRotationCenterLeft
                    );
                    return rotateSegment(
                        upperRotated,
                        width,
                        height,
                        leftLowerLegAngle,
                        lowerLegRotationCenterLeft
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
                        upperLegRotationCenterLeft
                    );
                    return rotateSegment(
                        upperRotated,
                        width,
                        height,
                        leftLowerLegAngle,
                        lowerLegRotationCenterLeft
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
                    upperLegRotationCenterRight
                )
            ] : []),
            ...(bodyPartImages?.right_upper_leg_front?.[0] ? [
                rotateSegment(
                    bodyPartImages.right_upper_leg_front[0].imageData,
                    width,
                    height,
                    rightUpperLegAngle,
                    upperLegRotationCenterRight
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
                        upperLegRotationCenterRight
                    );
                    return rotateSegment(
                        upperRotated,
                        width,
                        height,
                        rightLowerLegAngle,
                        lowerLegRotationCenterRight
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
                        upperLegRotationCenterRight
                    );
                    return rotateSegment(
                        upperRotated,
                        width,
                        height,
                        rightLowerLegAngle,
                        lowerLegRotationCenterRight
                    );
                })()
            ] : []),

            // Add hand processing
            processHand(leftUpperArmAngle, leftLowerArmAngle, upperArmRotationCenterLeft, lowerArmRotationCenterLeft),
            processHand(rightUpperArmAngle, rightLowerArmAngle, upperArmRotationCenterRight, lowerArmRotationCenterRight, true),

            // Add foot processing
            processFoot(leftUpperLegAngle, leftLowerLegAngle, upperLegRotationCenterLeft, lowerLegRotationCenterLeft),
            processFoot(rightUpperLegAngle, rightLowerLegAngle, upperLegRotationCenterRight, lowerLegRotationCenterRight, true),

            // Add non-rotated body parts
            ...(bodyPartImages?.left_face?.[0] ? [
                bodyPartImages.left_face[0].imageData
            ] : []),
            ...(bodyPartImages?.right_face?.[0] ? [
                bodyPartImages.right_face[0].imageData
            ] : []),
            ...(bodyPartImages?.torso_front?.[0] ? [
                bodyPartImages.torso_front[0].imageData
            ] : []),
            ...(bodyPartImages?.torso_back?.[0] ? [
                bodyPartImages.torso_back[0].imageData
            ] : []),
            ...(bodyPartImages?.head?.[0] ? [
                bodyPartImages.head[0].imageData
            ] : []),
            ...(bodyPartImages?.neck?.[0] ? [
                bodyPartImages.neck[0].imageData
            ] : []),
            ...(bodyPartImages?.pelvis?.[0] ? [
                bodyPartImages.pelvis[0].imageData
            ] : []),
            ...(bodyPartImages?.left_shoulder?.[0] ? [
                bodyPartImages.left_shoulder[0].imageData
            ] : []),
            ...(bodyPartImages?.right_shoulder?.[0] ? [
                bodyPartImages.right_shoulder[0].imageData
            ] : []),
            ...(bodyPartImages?.left_hip?.[0] ? [
                bodyPartImages.left_hip[0].imageData
            ] : []),
            ...(bodyPartImages?.right_hip?.[0] ? [
                bodyPartImages.right_hip[0].imageData
            ] : [])
        ];

        const [rotatedPointsLeftArm, rotatedPointsRightArm, rotatedPointsLeftLeg, rotatedPointsRightLeg, ...rotatedSegments] = await Promise.all(promises);
        const validRotatedSegments = rotatedSegments.filter(segment => segment !== null);

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
            rotatedPointsLeftLeg,
            rotatedPointsRightLeg,
            upperArmRotationCenterLeft,
            lowerArmRotationCenterLeft,
            upperArmRotationCenterRight,
            lowerArmRotationCenterRight,
            upperLegRotationCenterLeft,
            lowerLegRotationCenterLeft,
            upperLegRotationCenterRight,
            lowerLegRotationCenterRight,
            leftUpperArmRotation: leftUpperArmAngle,
            leftLowerArmRotation: leftLowerArmAngle,
            rightUpperArmRotation: rightUpperArmAngle,
            rightLowerArmRotation: rightLowerArmAngle,
            leftUpperLegRotation: leftUpperLegAngle,
            leftLowerLegRotation: leftLowerLegAngle,
            rightUpperLegRotation: rightUpperLegAngle,
            rightLowerLegRotation: rightLowerLegAngle
        };
    }

   
    
    if (type === 'combinedResults') {

        const generateMovements = (count) => {
            const movements = [];
            const maxAngle = 90; // Maximum rotation angle
            const angleStep = maxAngle / (count - 1);

            for (let i = 0; i < count; i++) {

                const movement = {
                    leftUpperArmAngle: 0,
                    leftLowerArmAngle: 0,
                    
                    rightUpperArmAngle: i === 0 ? 0 : (i % 2 === 0 ? -angleStep * (i / 2) : angleStep * ((i + 1) / 2)),
                    rightLowerArmAngle: i === 0 ? 0 : (i % 2 === 0 ? -angleStep * (i / 2) : angleStep * ((i + 1) / 2)),
                    
                    leftUpperLegAngle: 0,
                    leftLowerLegAngle: 0,
                    rightUpperLegAngle: 0,
                    rightLowerLegAngle: 0
                };
                
                movements.push(movement);
            }
            
            return movements;
        };

        const movements = generateMovements(numberOfVariations);

        Promise.all(
            movements.map(({ leftUpperArmAngle, leftLowerArmAngle, rightUpperArmAngle, rightLowerArmAngle, leftUpperLegAngle, leftLowerLegAngle, rightUpperLegAngle, rightLowerLegAngle }) => {
                return processVariation(leftUpperArmAngle, leftLowerArmAngle, rightUpperArmAngle, rightLowerArmAngle, leftUpperLegAngle, leftLowerLegAngle, rightUpperLegAngle, rightLowerLegAngle);
            })
        ).then(variations => {
            self.postMessage({
                type: 'processedVariations',
                variations: variations.map(variation => ({
                    imageData: variation.imageData,
                    width,
                    height,
                    extremePointsLeftArm: variation.rotatedPointsLeftArm,
                    extremePointsRightArm: variation.rotatedPointsRightArm,
                    extremePointsLeftLeg: variation.rotatedPointsLeftLeg,
                    extremePointsRightLeg: variation.rotatedPointsRightLeg,
                    averages: {
                        ...averages,
                        left_upper_arm: variation.rotatedPointsLeftArm.leftUpperArmAverage,
                        left_lower_arm: variation.rotatedPointsLeftArm.leftLowerArmAverage,
                        right_upper_arm: variation.rotatedPointsRightArm.rightUpperArmAverage,
                        right_lower_arm: variation.rotatedPointsRightArm.rightLowerArmAverage,
                        left_upper_leg: variation.rotatedPointsLeftLeg.leftUpperLegAverage,
                        left_lower_leg: variation.rotatedPointsLeftLeg.leftLowerLegAverage,
                        right_upper_leg: variation.rotatedPointsRightLeg.rightUpperLegAverage,
                        right_lower_leg: variation.rotatedPointsRightLeg.rightLowerLegAverage
                    },
                    leftUpperArmRotation: variation.leftUpperArmRotation,
                    leftLowerArmRotation: variation.leftLowerArmRotation,
                    rightUpperArmRotation: variation.rightUpperArmRotation,
                    rightLowerArmRotation: variation.rightLowerArmRotation,
                    leftUpperLegRotation: variation.leftUpperLegRotation,
                    leftLowerLegRotation: variation.leftLowerLegRotation,
                    rightUpperLegRotation: variation.rightUpperLegRotation,
                    rightLowerLegRotation: variation.rightLowerLegRotation,
                    partName: partNames
                })),
                timestamp,
                partNames
            });
        });
    }

};