// Helper function to calculate average point
function calculateAveragePoint(points) {
    if (!points || points.length === 0) return null;

    const sum = points.reduce((acc, point) => ({
        x: acc.x + point.x,
        y: acc.y + point.y
    }), { x: 0, y: 0 });

    return {
        x: sum.x / points.length,
        y: sum.y / points.length
    };
}

// Helper function to find extreme points in a segment
function findExtremePoints(imageData, width, height) {
    let topPoint = null, bottomPoint = null;
    let minY = Infinity, maxY = -Infinity;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            if (imageData[idx + 3] !== 0) { // If pixel is not transparent
                if (y < minY) {
                    minY = y;
                    topPoint = { x, y };
                }
                if (y > maxY) {
                    maxY = y;
                    bottomPoint = { x, y };
                }
            }
        }
    }

    return topPoint && bottomPoint ? { top: topPoint, bottom: bottomPoint } : null;
}

// Function to calculate combined averages for front and back parts
function calculateCombinedAverages(points) {
    const averages = {};
    const bodyParts = [
        { front: 'leftUpperArmFront', back: 'leftUpperArmBack', combined: 'left_upper_arm' },
        { front: 'rightUpperArmFront', back: 'rightUpperArmBack', combined: 'right_upper_arm' },
        { front: 'leftLowerArmFront', back: 'leftLowerArmBack', combined: 'left_lower_arm' },
        { front: 'rightLowerArmFront', back: 'rightLowerArmBack', combined: 'right_lower_arm' },
        { front: 'leftUpperLegFront', back: 'leftUpperLegBack', combined: 'left_upper_leg' },
        { front: 'rightUpperLegFront', back: 'rightUpperLegBack', combined: 'right_upper_leg' },
        { front: 'leftLowerLegFront', back: 'leftLowerLegBack', combined: 'left_lower_leg' },
        { front: 'rightLowerLegFront', back: 'rightLowerLegBack', combined: 'right_lower_leg' }
    ];

    bodyParts.forEach(({ front, back, combined }) => {
        if (points[front] && points[back]) {
            const frontPoints = points[front];
            const backPoints = points[back];
            const minYFront = Math.min(...frontPoints.map(p => p.y));
            const maxYFront = Math.max(...frontPoints.map(p => p.y));
            const minYBack = Math.min(...backPoints.map(p => p.y));
            const maxYBack = Math.max(...backPoints.map(p => p.y));

            averages[combined] = {
                top: calculateAveragePoint([
                    ...frontPoints.filter(p => p.y === minYFront),
                    ...backPoints.filter(p => p.y === minYBack)
                ]),
                bottom: calculateAveragePoint([
                    ...frontPoints.filter(p => p.y === maxYFront),
                    ...backPoints.filter(p => p.y === maxYBack)
                ])
            };
        }
    });

    return averages;
}

const partNames = []

self.onmessage = function(e) {
    const { type, imageData, partName, bodypartImages, width, height, points } = e.data;
// console.log('partName :>> ', partName);
partNames.push(partName)
    if (type === 'calculateAverage') {
        const averages = calculateCombinedAverages(points);
        const extremePoints = {};

        Object.entries(points).forEach(([part, pointArray]) => {
            if (pointArray && pointArray.length > 0) {
                const minY = Math.min(...pointArray.map(p => p.y));
                const maxY = Math.max(...pointArray.map(p => p.y));

                extremePoints[part] = {
                    top: calculateAveragePoint(pointArray.filter(p => p.y === minY)),
                    bottom: calculateAveragePoint(pointArray.filter(p => p.y === maxY))
                };
            }
        });

        self.postMessage({
            type: 'combinedResults',
            averages,
            extremePoints, 
            partNames
        });
    } else {
        const extremePoints = findExtremePoints(imageData, width, height);
        self.postMessage({
            type: 'segmentResults',
            extremePoints,
            partName
        });
    }
};