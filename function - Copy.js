
function drawKeypoints(ctx, points, color, label) {
    // Draw top point
    ctx.beginPath();
    ctx.arc(points.top.x, points.top.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    // Draw bottom point
    ctx.beginPath();
    ctx.arc(points.bottom.x, points.bottom.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    // Draw connecting line
    ctx.beginPath();
    ctx.moveTo(points.top.x, points.top.y);
    ctx.lineTo(points.bottom.x, points.bottom.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw label
    ctx.font = '12px Arial';
    ctx.fillText(label, points.top.x, points.top.y - 10);
}



function processSegmentVariations(imageData, partName) {
    return new Promise((resolve) => {

        worker.postMessage({
            imageData: imageData.data,
            partName: partName,
            width: imageData.width,
            height: imageData.height
        });

        worker.onmessage = function(e) {
            const { type, extremePoints, averages, partName } = e.data;
            // console.log('averages :>> ', averages);
            // console.log('extremePoints :>> ', extremePoints);
            const variations = [{
                data: new Uint8ClampedArray(imageData.data),
                extremePoints: extremePoints,
                points: {}
            }];

            // Store points for averaging
            if (!collectedPoints.has(partName)) {
                collectedPoints.set(partName, []);
            }

            if (extremePoints && extremePoints.top) collectedPoints.get(partName).push(extremePoints.top);
            if (extremePoints && extremePoints.bottom) collectedPoints.get(partName).push(extremePoints.bottom);

            // Initialize points object with missing properties
            Object.keys(BODY_PARTS).forEach(part => {
                variations[0].points[part] = {
                    top: null,
                    bottom: null
                };
            });

            // Assign the extreme points to the correct properties
            if (extremePoints) {
                variations[0].points[partName] = {
                    top: extremePoints.top,
                    bottom: extremePoints.bottom
                };
            }

            resolve(variations);
        };
    
    
    });
}
