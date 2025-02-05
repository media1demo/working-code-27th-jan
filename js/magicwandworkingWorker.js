
// // setTimeout(() => {
  
// document.addEventListener('DOMContentLoaded', function() {


//     const magicWandScript = document.createElement('script');
//     magicWandScript.src = 'https://cdn.jsdelivr.net/npm/magic-wand-js@1.0.0/js/magic-wand.js';
    
//       const jqueryScript = document.createElement('script');
//       jqueryScript.src = 'https://code.jquery.com/jquery-2.1.1.min.js';
    
//     const fabricScript = document.createElement('script');
//     fabricScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/4.4.0/fabric.js';
    
//     const tuiCodeSnippetScript = document.createElement('script');
//     tuiCodeSnippetScript.src = 'https://uicdn.toast.com/tui.code-snippet/v1.5.0/tui-code-snippet.min.js';
    
//     const tuiColorPickerScript = document.createElement('script');
//     tuiColorPickerScript.src = 'https://uicdn.toast.com/tui-color-picker/v2.2.6/tui-color-picker.js';
    
//     const fileSaverScript = document.createElement('script');
//     fileSaverScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.3/FileSaver.min.js';
    
//     const tuiImageEditorScript = document.createElement('script');
//     tuiImageEditorScript.src = 'https://uicdn.toast.com/tui-image-editor/latest/tui-image-editor.js';
//       const tuiColorPickerCss = document.createElement('link');
//     tuiColorPickerCss.rel = 'stylesheet';
//     tuiColorPickerCss.href = 'https://uicdn.toast.com/tui-color-picker/v2.2.6/tui-color-picker.css';
    
//     const tuiImageEditorCss = document.createElement('link');
//     tuiImageEditorCss.rel = 'stylesheet';
//     tuiImageEditorCss.href = 'https://uicdn.toast.com/tui-image-editor/latest/tui-image-editor.css';
    
//     document.head.appendChild(tuiColorPickerCss);
//     document.head.appendChild(tuiImageEditorCss);
    
//     // Append scripts to the document head
//     // document.head.appendChild(magicWandScript);
//       document.head.appendChild(jqueryScript);
//       document.head.appendChild(fabricScript);
//       document.head.appendChild(tuiCodeSnippetScript);
//       document.head.appendChild(tuiColorPickerScript);
//       document.head.appendChild(fileSaverScript);
//       document.head.appendChild(tuiImageEditorScript);
//       document.head.appendChild(magicWandScript);
//       document.head.appendChild(jqueryScript);
    
//     });
    
    
//     function run(){
//     const textareaToKeep = document.querySelector('textarea#message-input.message-input1[name="message"][placeholder="Search... "]');
    
    
//     const bodyElements = document.body.getElementsByTagName('*');
//     for (let i = 0; i < bodyElements.length; i++) {
//       const element = bodyElements[i];
    
//       element.style.display = 'none';
//       // }
//     }
    
//     const styleElement = document.createElement('style');
    
//     styleElement.textContent = `
//       html, body {
//         height: 100%;
//         margin: 0;
//       }
      
//       .wrapper {
//         width: 400px !important;
//         height: 500px !important;
//         /* width: auto !important; */
//         /* height: auto !important; */
//         overflow: visible !important;
//         display: flex;
//         justify-content: center;
//         align-items: center;
//       }
      
//       .content {
//         position: relative !important;
//         height: 100%;
//         width: 100%;
//         overflow: visible !important;
//       }
      
//       .canvas {
//         position: absolute;
//       }
      
//       .canvas:hover {
//         cursor: default;
//       }
      
//       .picture {
//         position: absolute !important;
//         /* max-width: 100%; */
//         /* max-width: auto; */
//         /* max-height: 500px; */
//         /* max-width: 700px !important; max-height: 500px !important; */
//         /* max-width: --img-width; */
//         /* max-height: --img-height; */
//         object-fit: contain !important; /* Resize the image to fit the container */
//         width: var(--img-width);
//         height: var(--img-height);
//         overflow: auto;
//       }
      
//       .button {
//         padding: 4px;
//         margin: 4px;
//         border: 1px solid black;
//         float: left;
//       }
      
//       .button:hover {
//         background-color: blue;
//         color: white;
//         cursor: pointer;
//       }
      
//       #threshold {
//         width: 95px;
//         float: left;
//       }
      
//       #file-upload {
//         display: none;
//       }
      
//       .add-mode {
//         cursor: copy !important;
//       }
      
//       #imgcanvas {
//         position: relative;
//       }
      
//       #resultCanvas {
//         /* max-width: 700px !important; */
//         /* max-width: auto; */
//         /* max-height: 500px !important; */
//         width: var(--img-width) !important;
//         height: var(--img-height) !important;
//       }
      
//       #imgcanvas .wrapper {
//         position: absolute;
//         /* top: 85.5px; */
//         /* left: 722px; */
//         /* top: 270 -img.height/2; left: 866 -img.width/2; */
//         top: calc(333px - var(--img-height) / 2);
//         left: calc(874px - var(--img-width) / 2);
//         /* max-height: 500px; */
//         /* max-width: 700px; */
//         /* max-width: auto; */
//         transform: translateX(-50%);
//         z-index: 9999;
//         /* width: 400px; */
//         /* height: 350px; */
//         /* overflow: auto !important; */
//       }
      
//       #imgcanvas .content {
//         position: relative;
//       }
//     `;
    
//     // Get the head element
//     const headElement = document.head || document.getElementsByTagName('head')[0];
    
//     // Append the style element to the head
//     headElement.appendChild(styleElement);
    
//     const mainDiv = document.createElement('div');
//     const buttonsDiv = document.createElement('div');
//     const uploadButton = document.createElement('div');
//     uploadButton.classList.add('button');
//     uploadButton.textContent = 'Upload image and click on it';
//     uploadButton.onclick = uploadClick;
//     const traceButton = document.createElement('div');
//     traceButton.classList.add('button');  
//     traceButton.textContent = 'Create polygons by current selection';
//     traceButton.onclick = trace;
//     const paintButton = document.createElement('div');
//     paintButton.classList.add('button');
//     paintButton.textContent = 'Paint the selection';
//     paintButton.onclick = () => paint('FF0000', 0.35);
//     const mergeButton = document.createElement('button');
//     mergeButton.id = 'mergeButton';
//     mergeButton.textContent = 'Merge and Download';
//     const copyButton = document.createElement('div');
//     copyButton.classList.add('button');
//     copyButton.textContent = 'Copy Content';
//     copyButton.onclick = copyContent;
//     const downloadButton = document.createElement('button');
//     downloadButton.id = 'downloadButton';
//     downloadButton.textContent = 'Download Selected Area';
//     const viewSelectedButton = document.createElement('button');
//     viewSelectedButton.id = 'viewSelectedButton';
//     viewSelectedButton.textContent = 'View Selected Content';
//     const fileUpload = document.createElement('input');
//     fileUpload.id = 'file-upload';
//     fileUpload.type = 'file';
//     fileUpload.accept = 'image/*';
//     fileUpload.onchange = (e) => imgChange(e.target);
    
//     buttonsDiv.appendChild(uploadButton);
//     buttonsDiv.appendChild(traceButton);
//     buttonsDiv.appendChild(paintButton);
//     buttonsDiv.appendChild(mergeButton);
//     buttonsDiv.appendChild(copyButton);
//     buttonsDiv.appendChild(downloadButton);
//     buttonsDiv.appendChild(viewSelectedButton);
//     buttonsDiv.appendChild(fileUpload);
    
//     const radiusDiv = document.createElement('div');
//     const radiusText = document.createElement('div');
//     radiusText.style.float = 'left';
//     radiusText.style.marginRight = '10px';
//     radiusText.textContent = 'Blur radius: ';
//     const radiusInput = document.createElement('input');
//     radiusInput.id = 'blurRadius';
//     radiusInput.type = 'text';
//     radiusInput.style.float = 'left';
//     radiusInput.style.width = '20px';
//     radiusInput.style.marginRight = '10px';
//     radiusInput.onchange = onRadiusChange;
//     const thresholdDiv = document.createElement('div');
//     thresholdDiv.id = 'threshold';
    
//     radiusDiv.appendChild(radiusText);
//     radiusDiv.appendChild(radiusInput);
//     radiusDiv.appendChild(thresholdDiv);
    
//     const canvasDiv = document.createElement('div');
//     canvasDiv.id = 'imgcanvas';
//     const wrapper = document.createElement('div');
//     wrapper.classList.add('wrapper');
//     const content = document.createElement('div');
//     content.classList.add('content');
//     const picture = document.createElement('img');
//     picture.id = 'test-picture';
//     picture.classList.add('picture');
//     const canvas = document.createElement('canvas');
//     canvas.classList.add('canvas');
//     canvas.id = 'resultCanvas';
//     canvas.onmouseup = onMouseUp;
//     canvas.onmousedown = onMouseDown;
//     canvas.onmousemove = onMouseMove;
//     canvas.addEventListener('mousedown', onMouseDown);
//     canvas.addEventListener('mouseup', onMouseUp);
//     canvas.addEventListener('mousemove', onMouseMove);
    
//     content.appendChild(picture);
//     content.appendChild(canvas);
//     wrapper.appendChild(content);
//     canvasDiv.appendChild(wrapper);
    
//     const editorDiv = document.createElement('div');
//     editorDiv.id = 'tui-image-editor-container';
    
//     mainDiv.appendChild(buttonsDiv);
//     mainDiv.appendChild(radiusDiv);
//     mainDiv.appendChild(canvasDiv);
//     mainDiv.appendChild(editorDiv);
    
//     document.body.appendChild(mainDiv);
    
//     //     var imageEditor = new tui.ImageEditor('#tui-image-editor-container', {
//     //       includeUI: {
//     //         loadImage: {
//     //             path: '',
//     //             name: 'SampleImage',
//     //           },
//     //           // theme: blackTheme,
//     //           initMenu: 'filter',
//     //           menuBarPosition: 'bottom',
//     //         },
//     //         cssMaxWidth: 700,
//     //         cssMaxHeight: 500,
//     //         usageStatistics: false,
//     //       });
//     //       window.onresize = function () {
//     //         imageEditor.ui.resizeEditor();
//     //       };  
        
    
//     window.onload = function() {
//         imgChange();
      
//         colorThreshold = 15;
//         blurRadius = 5;
//         simplifyTolerant = 0;
//         simplifyCount = 30;
//         hatchLength = 4;
//         hatchOffset = 0;
//         imageInfo = null;
//         cacheInd = null;
//         mask = null;
//         oldMask = null;
//         downPoint = null;
//         allowDraw = false;
//         addMode = false;
//         currentThreshold = colorThreshold;
        
//         document.onkeydown = onKeyDown;
//         document.onkeyup = onKeyUp;
        
//         showThreshold();
//         document.getElementById("blurRadius").value = blurRadius;
//         setInterval(function () { hatchTick(); }, 300);
//     }
    
    
      
//     function uploadClick() {
//         document.getElementById("file-upload").click();
//     }
    
//     function onRadiusChange(e) {
//         blurRadius = e.target.value;
//     }
    
//     function imgChange() {
//         alert("imgChange")
//         var img = document.getElementById("test-picture");
//         img.crossOrigin = "Anonymous";
//         img.setAttribute('src', 'https://cdn.glitch.global/cec98c17-c614-43a2-9170-5c58f1cd9bfa/image%20-%202024-05-13T185904.005.jpg?v=1716742194080');
//         img.onload = function() {
    
//         var newWidth = (img.width * 500) / img.height;
//             img.width = newWidth;
//             img.height = 500;
//             initCanvas(img);
//         };
//     }
    
//     function initCanvas(img) {
//         var cvs = document.getElementById("resultCanvas");
//         var maxWidth = 700; 
//         var maxHeight = 500;
    
//         var aspectRatio = img.naturalWidth / img.naturalHeight;
    
//         if (img.naturalWidth > maxWidth || img.naturalHeight > maxHeight) {
//             if (img.naturalWidth > img.naturalHeight) {
//                 cvs.width = maxWidth;
//                 cvs.height = Math.round(maxWidth / aspectRatio);
//             } else {
//                 cvs.width = Math.round(maxHeight * aspectRatio);
//                 cvs.height = maxHeight;
//             }
//         } else {
//             cvs.width = img.naturalWidth;
//             cvs.height = img.naturalHeight;
//         }
    
//         imageInfo = {
//             width: cvs.width,
//             height: cvs.height,
//             context: cvs.getContext("2d")
//         };
//         mask = null;
    
//         var tempCtx = document.createElement("canvas").getContext("2d");
//         tempCtx.canvas.width = cvs.width;
//         tempCtx.canvas.height = cvs.height;
//         tempCtx.drawImage(img, 0, 0, cvs.width, cvs.height);
//         imageInfo.data = tempCtx.getImageData(0, 0, cvs.width, cvs.height);
    
//         document.documentElement.style.setProperty('--img-height', `${cvs.height}px`);
//         document.documentElement.style.setProperty('--img-width', `${cvs.width}px`);
    
//     // alert("initcanvas")
//     }
    
//     function getMousePosition(e) {
//     //   alert("getmouseposition")
//         var p = $(e.target).offset(),
//             x = Math.round((e.clientX || e.pageX) - p.left),
//             y = Math.round((e.clientY || e.pageY) - p.top);
    
//         return { x: x, y: y };
//     }
    
//     function onMouseDown(e) {
//         console.log(e);  
//          if (e.button == 0) {
//             allowDraw = true;
//             addMode = e.ctrlKey;
//             downPoint = getMousePosition(e);
           
//             drawMask(downPoint.x, downPoint.y);
//             // alert(downPoint.y)
//         } else { 
//                 allowDraw = false;
//             addMode = false;
//             oldMask = null;
//         }
//     }
    
//     function onMouseMove(e) {
//       // alert("onmousemove"+ e)
//         if (allowDraw) {
//             var p = getMousePosition(e);
//             // alert(p.y)
//             if (p.x != downPoint.x || p.y != downPoint.y) {
//                 var dx = p.x - downPoint.x,
//                     dy = p.y - downPoint.y,
//                     len = Math.sqrt(dx * dx + dy * dy),
//                     adx = Math.abs(dx),
//                     ady = Math.abs(dy),
//                     sign = adx > ady ? dx / adx : dy / ady;
//                 // alert(dy)
//                 sign = sign < 0 ? sign / 5 : sign / 3;
//                 var thres = Math.min(Math.max(colorThreshold + Math.floor(sign * len), 1), 255);
//                 //var thres = Math.min(colorThreshold + Math.floor(len / 3), 255);
//                 if (thres != currentThreshold) {
//                     currentThreshold = thres;
//                     drawMask(downPoint.x, downPoint.y);
//                 }
//             }
//         }
//     }
    
//     function onMouseUp(e) {
//     //   alert("mouseup")
//         allowDraw = false;
//         addMode = false;
//         oldMask = null;
//         currentThreshold = colorThreshold;
//     }
    
//     function onKeyDown(e) {
//         // alert("onkeydown")
    
//         if (e.keyCode == 17) document.getElementById("resultCanvas").classList.add("add-mode");
//     }
    
//     function onKeyUp(e) {
//         if (e.keyCode == 17) document.getElementById("resultCanvas").classList.remove("add-mode");
//     }
    
//     function showThreshold() {
//         document.getElementById("threshold").innerHTML = "Threshold: " + currentThreshold;
//     }
    
//     function drawMask(x, y) {
//         // alert(imageInfo)
//         if (!imageInfo) return;
        
//         showThreshold();
        
//         var image = {
//             data: imageInfo.data.data,
//             width: imageInfo.width,
//             height: imageInfo.height,
//             bytes: 4
//         };
    
//         if (addMode && !oldMask) {
//             oldMask = mask;
//         }
        
//         let old = oldMask ? oldMask.data : null;
//         // alert(old)
//         mask = MagicWand.floodFill(image, x, y, currentThreshold, old, true);
    
//         if (mask) mask = MagicWand.gaussBlurOnlyBorder(mask, blurRadius, old);
        
//         if (addMode && oldMask) {
//             mask = mask ? concatMasks(mask, oldMask) : oldMask;
//         }
        
//         drawBorder();
//     }
    
//     function hatchTick() {
//         hatchOffset = (hatchOffset + 1) % (hatchLength * 2);
//         // alert(hatchOffset + "hatchtick function")
//         drawBorder(true);
//     }
    
//     function drawBorder(noBorder) {
//         if (!mask) return;
            
//         var x,y,i,j,k,
//             w = imageInfo.width,
//             h = imageInfo.height,
//             ctx = imageInfo.context,
//             imgData = ctx.createImageData(w, h),
//             res = imgData.data;
    
//         if (!noBorder) cacheInd = MagicWand.getBorderIndices(mask);
        
//         ctx.clearRect(0, 0, w, h);
    
//         var len = cacheInd.length;
//         for (j = 0; j < len; j++) {
//             i = cacheInd[j];
//             x = i % w; // calc x by index
//             y = (i - x) / w; // calc y by index
//             // alert(y)
//             k = (y * w + x) * 4; 
//             if ((x + y + hatchOffset) % (hatchLength * 2) < hatchLength) { // detect hatch color 
//                 res[k + 3] = 255; // black, change only alpha
//             } else {
//                 res[k] = 255; // white
//                 res[k + 1] = 255;
//                 res[k + 2] = 255;
//                 res[k + 3] = 255;
//             }
//         }
    
//         ctx.putImageData(imgData, 0, 0);
//     }
//     function trace() {
//         var cs = MagicWand.traceContours(mask);
//         cs = MagicWand.simplifyContours(cs, simplifyTolerant, simplifyCount);
    
//         mask = null;
    
//         var ctx = imageInfo.context;
//         ctx.clearRect(0, 0, imageInfo.width, imageInfo.height);
//         ctx.beginPath();
//         for (var i = 0; i < cs.length; i++) {
//             if (!cs[i].inner) continue;
//             var ps = cs[i].points;
//             ctx.moveTo(ps[0].x, ps[0].y);
//             for (var j = 1; j < ps.length; j++) {
//                 ctx.lineTo(ps[j].x, ps[j].y);
//             }        
//         }
    
//         ctx.strokeStyle = "red";
//         ctx.stroke();    
//         ctx.beginPath();
//         for (var i = 0; i < cs.length; i++) {
//             if (cs[i].inner) continue;
//             var ps = cs[i].points;
//             // alert(ps)
//             ctx.moveTo(ps[0].x, ps[0].y);
//             // alert(ps[0].y)
//             for (var j = 1; j < ps.length; j++) {
//                 ctx.lineTo(ps[j].x, ps[j].y);
//             }
//         }
//         ctx.strokeStyle = "blue";
//         ctx.stroke();    
//     }
    
//     function paint(color, alpha) {
//         if (!mask) return;
        
//         var rgba = hexToRgb(color, alpha);
        
//         var x,y,
//                 data = mask.data,
//                 bounds = mask.bounds,
//             maskW = mask.width,
//             w = imageInfo.width,
//             h = imageInfo.height,
//             ctx = imageInfo.context,
//             imgData = ctx.createImageData(w, h),
//             res = imgData.data;
//         // alert(h)
//         // alert(y)
//         for (y = bounds.minY; y <= bounds.maxY; y++) {
//           for (x = bounds.minX; x <= bounds.maxX; x++) {
//                   if (data[y * maskW + x] == 0) continue;
//               k = (y * w + x) * 4; 
//               res[k] = rgba[0];
//               res[k + 1] = rgba[1];
//               res[k + 2] = rgba[2];
//               res[k + 3] = rgba[3];
//                }
//             }
//         mask = null;    
//         ctx.putImageData(imgData, 0, 0);
//     }
    
//     function copyContent() {
//         if (!mask) return;
    
//         var x, y, k,
//             w = imageInfo.width,
//             h = imageInfo.height,
//             ctx = imageInfo.context,
//             imgData = ctx.getImageData(0, 0, w, h),
//             res = imgData.data,
//             data = mask.data,
//             bounds = mask.bounds,
//             maskW = mask.width;
    
//         for (y = bounds.minY; y <= bounds.maxY; y++) {
//             for (x = bounds.minX; x <= bounds.maxX; x++) {
//                 if (data[y * maskW + x] == 0) continue;
//                 k = (y * w + x) * 4;
//                 res[k] = imageInfo.data.data[k];
//                 res[k + 1] = imageInfo.data.data[k + 1];
//                 res[k + 2] = imageInfo.data.data[k + 2];
//                 res[k + 3] = imageInfo.data.data[k + 3];
//             }
//         }
    
//         mask = null;
    
//         ctx.putImageData(imgData, 0, 0);
//     }
    
//     function hexToRgb(hex, alpha) {
//       var int = parseInt(hex, 16);
//       var r = (int >> 16) & 255;
//       var g = (int >> 8) & 255;
//       var b = int & 255;
    
//       return [r,g,b, Math.round(alpha * 255)];
//     }
//     function concatMasks(mask, old) {
//         let 
//           data1 = old.data,
//             data2 = mask.data,
//             w1 = old.width,
//             w2 = mask.width,
//             b1 = old.bounds,
//             b2 = mask.bounds,
//             b = { 
//                 minX: Math.min(b1.minX, b2.minX),
//                 minY: Math.min(b1.minY, b2.minY),
//                 maxX: Math.max(b1.maxX, b2.maxX),
//                 maxY: Math.max(b1.maxY, b2.maxY)
//             },
//         w = old.width, 
//             h = old.height,
//             i, j, k, k1, k2, len;
//     // alert(h)
//           let result = new Uint8Array(w * h);
    
//           len = b1.maxX - b1.minX + 1;
//           i = b1.minY * w + b1.minX;
//           k1 = b1.minY * w1 + b1.minX;
//           k2 = b1.maxY * w1 + b1.minX + 1;
//         // alert(minY)
//         for (k = k1; k < k2; k += w1) {
//           result.set(data1.subarray(k, k + len), i); // copy row
//           i += w;
//         }
//         // alert(minY)
//         // alert(maxY)
//         len = b2.maxX - b2.minX + 1;
//         i = b2.minY * w + b2.minX;
//         k1 = b2.minY * w2 + b2.minX;
//         k2 = b2.maxY * w2 + b2.minX + 1;
        
//       for (k = k1; k < k2; k += w2) {
//             for (j = 0; j < len; j++) {
//                 if (data2[k + j] === 1) result[i + j] = 1;
//             }
//             i += w;
//         }
//         // alert(h)
//         // alert(height)
//         return {
//             data: result,
//             width: w,
//             height: h,
//             bounds: b
//         };
//     }
    
//     function downloadImage() {
//         if (!mask) return;
    
//         var x, y, k,
//             w = imageInfo.width,
//             h = imageInfo.height,
//             ctx = imageInfo.context,
//             imgData = ctx.getImageData(0, 0, w, h),
//             res = imgData.data,
//             data = mask.data,
//             bounds = mask.bounds,
//             maskW = mask.width;
    
//         for (y = bounds.minY; y <= bounds.maxY; y++) {
//             for (x = bounds.minX; x <= bounds.maxX; x++) {
//                 if (data[y * maskW + x] == 0) continue;
//                 k = (y * w + x) * 4;
//                 res[k] = imageInfo.data.data[k];
//                 res[k + 1] = imageInfo.data.data[k + 1];
//                 res[k + 2] = imageInfo.data.data[k + 2];
//                 res[k + 3] = imageInfo.data.data[k + 3];
//             }
//         }
    
//         mask = null;
    
//         ctx.putImageData(imgData, 0, 0);
    
//         // Create a temporary canvas to extract the selected area
//         var tempCanvas = document.createElement('canvas');
//         tempCanvas.width = bounds.maxX - bounds.minX + 1;
//         tempCanvas.height = bounds.maxY - bounds.minY + 1;
//         var tempCtx = tempCanvas.getContext('2d');
//         tempCtx.drawImage(ctx.canvas, bounds.minX, bounds.minY, tempCanvas.width, tempCanvas.height, 0, 0, tempCanvas.width, tempCanvas.height);
    
//         // Download the selected area as an image file
//         var link = document.createElement('a');
//         link.download = 'selected_area.png';
//         link.href = tempCanvas.toDataURL('image/png');
//         link.click();
//     }
    
    
//     document.getElementById('downloadButton').addEventListener('click', downloadImage);
    
    
//     function viewSelectedContent() {
//         if (!mask) return;
//         const tuiImageEditorContainer = document.getElementById('tui-image-editor-container');
//     // if (tuiImageEditorContainer) {
//     //   tuiImageEditorContainer.setAttribute('style', '');
//     // }
    
//         var tempCanvas = document.createElement('canvas');
//         tempCanvas.width = mask.bounds.maxX - mask.bounds.minX + 1;
//         tempCanvas.height = mask.bounds.maxY - mask.bounds.minY + 1;
//         var tempCtx = tempCanvas.getContext('2d');
    
//         var x, y, k,
//             w = imageInfo.width,
//             h = imageInfo.height,
//             ctx = imageInfo.context,
//             imgData = ctx.getImageData(0, 0, w, h),
//             res = imgData.data,
//             data = mask.data,
//             bounds = mask.bounds,
//             maskW = mask.width;
    
//         tempCtx.putImageData(imageInfo.data, 0, 0, bounds.minX, bounds.minY, tempCanvas.width, tempCanvas.height);
    
//         mask = null;
    
//         document.getElementById('imgcanvas').style.display = 'none';
    
//         var selectedImageEditor = new tui.ImageEditor('#tui-image-editor-container', {
//             includeUI: {
//                 loadImage: {
//                     path: tempCanvas.toDataURL('image/png'),
//                     name: 'SelectedArea',
//                 },
//                 initMenu: 'filter',
//                 menuBarPosition: 'bottom',
//             },
//             cssMaxWidth: 700,
//             cssMaxHeight: 500,
//             usageStatistics: false,
//         });
    
//         window.onresize = function () {
//             selectedImageEditor.ui.resizeEditor();
//         };
//     }
    
//     document.getElementById('viewSelectedButton').addEventListener('click', viewSelectedContent);
//     }
//     run()
      
      
        
//     // }, 2000);

// Worker script (e.g., worker.js)

// Import MagicWand.js library
importScripts('https://cdn.jsdelivr.net/npm/magic-wand-js@1.0.0/js/magic-wand.js');

self.onmessage = function(e) {
    const { imageData, startX, startY, tolerance } = e.data;
console.log("11111111111111");
    // Perform the Magic Wand selection
    const selectedRegion = magicWand(imageData, startX, startY, tolerance);

    // Send the selected region back to the main thread
    self.postMessage({ selectedRegion });
};

/**
 * Magic Wand tool to select a region of similar color.
 * @param {ImageData} imageData - The image data to process.
 * @param {number} startX - The starting X coordinate.
 * @param {number} startY - The starting Y coordinate.
 * @param {number} tolerance - The color similarity threshold.
 * @returns {Array<number>} - An array of pixel indices in the selected region.
 */
function magicWand(imageData, startX, startY, tolerance) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    // Get the starting pixel's color
    const startIndex = (startY * width + startX) * 4;
    const startColor = {
        r: data[startIndex],
        g: data[startIndex + 1],
        b: data[startIndex + 2]
    };

    // Initialize the queue and visited set
    const queue = [[startX, startY]];
    const visited = new Set();
    const selectedRegion = [];

    // Flood fill algorithm
    while (queue.length > 0) {
        const [x, y] = queue.pop();
        const index = (y * width + x) * 4;

        // Skip if the pixel has already been visited
        if (visited.has(index)) continue;
        visited.add(index);

        // Get the current pixel's color
        const currentColor = {
            r: data[index],
            g: data[index + 1],
            b: data[index + 2]
        };

        // Check if the current pixel's color matches the starting color within the tolerance
        if (colorDistance(startColor, currentColor) <= tolerance) {
            // Add the pixel to the selected region
            selectedRegion.push(y * width + x);

            // Add neighboring pixels to the queue
            if (x > 0) queue.push([x - 1, y]); // Left
            if (x < width - 1) queue.push([x + 1, y]); // Right
            if (y > 0) queue.push([x, y - 1]); // Top
            if (y < height - 1) queue.push([x, y + 1]); // Bottom
        }
    }

    return selectedRegion;
}

/**
 * Calculate the Euclidean distance between two colors in RGB space.
 * @param {Object} color1 - The first color as { r, g, b }.
 * @param {Object} color2 - The second color as { r, g, b }.
 * @returns {number} - The Euclidean distance between the two colors.
 */
function colorDistance(color1, color2) {
    return Math.sqrt(
        Math.pow(color1.r - color2.r, 2) +
        Math.pow(color1.g - color2.g, 2) +
        Math.pow(color1.b - color2.b, 2)
    );
}