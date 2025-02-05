document.addEventListener("presentationstart", (e) => {
 
    const lexicons = nlp.model().one.lexicon;
    const stopwords = [];
    
    for(let word in lexicons) {
      if(Array.isArray(lexicons[word])) {
        if(lexicons[word].includes("Conjunction") || lexicons[word].includes("Preposition") || lexicons[word].includes("Pronoun")) {
          stopwords.push(word);
        }
      } else {
        if(lexicons[word].match("Conjunction") || lexicons[word].match("Preposition") || lexicons[word].match("Pronoun")) {
          stopwords.push(word);
        }
      }
    }
    
    let text  = document.querySelector("#message-input").value
    let doc   = nlp(text)
    let words = text.split(' ')
    
    let filtered_words = words.filter(word => !stopwords.includes(word))
    
    let filtered_text = filtered_words.join(' ')
    
    doc = nlp(filtered_text)
    
    let x_values = []
    let y_values = []
    let width_values = []
    let height_values = []
    
    let tokens = doc.terms().data()
    
    let coordinates = text.match(/\((\d+), (\d+)\)/g)
    
    if (coordinates) {
        for (let coord of coordinates) {
            let nums = coord.match(/\d+/g)
            x_values.push(parseInt(nums[0]))
            y_values.push(parseInt(nums[1]))
        }
    }
    
    let added_nums = coordinates ? [].concat.apply([], coordinates.map(coord => coord.match(/\d+/g))) : []
    
    let value_count = 0
    let x = 0 
    let y = 0 
    let z = 0
    let w = 0
    
    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i]
        let terms = token.terms
        for (let term of terms) {
            if (term.tags && term.tags.includes('Value')) {
                let num = parseInt(term.text)
                value_count++
                if (added_nums.includes(num)) {
                    continue
                }
    
                let prev_token = i > 0 ? tokens[i - 1].text.toLowerCase() : ""
                let next_token = i < tokens.length - 1 ? tokens[i + 1].text.toLowerCase() : ""
                let total_token = prev_token + ' ' + next_token
    
                if (['x', 'left', 'corner'].some(word => total_token.includes(word)) || (total_token.includes('sides') && doc.text().includes('quadrilateral'))) {
                    x_values.push(num)
                    x++
                    console.log(`Added ${num} to x_values: ${x_values}`);
                } else if (['y', 'top'].some(word => total_token.includes(word)) || (total_token.includes('sides') && doc.text().includes('quadrilateral'))) {
                    y_values.push(num)
                    y++
                } else if (total_token.includes('width') || (total_token.includes('sides') && doc.text().includes('quadrilateral'))) {
                    width_values.push(num)
                    z++
                } else if (total_token.includes('height') || (total_token.includes('sides') && doc.text().includes('quadrilateral'))) {
                    height_values.push(num)
                    w++
                } else if (['right', 'rhs'].some(word => total_token.includes(word))) {
                    x_values.push(num)
                } else if (['bottom', 'down'].some(word => total_token.includes(word))) {
                    y_values.push(num)
                }
            } 
        }
    }
    
    let var_counts = {
        'x': new Set(x_values).size,
        'y': new Set(y_values).size,
        'width': new Set(width_values).size,
        'height': new Set(height_values).size
    }
    
    if (x+y+z+w < value_count && value_count < 4) {
        let values = doc.values().toNumber().out('array');
        if (values.length >= 2) {
    
            if (x_values.length === 0 && y_values.length === 0) {
                console.log('width_values :>> ', width_values);  
                console.log('height_values :>> ', height_values);
                console.log('width_values.length :>> ', width_values.length);
                console.log('height_values.length :>> ', height_values.length);
                if (width_values.length === 0 ){width_values.push(values[0]);
                console.log("width added first");}                 
                if (height_values.length === 0){height_values.push(values[1])}
                console.log(`Assumed width: ${values[ width_values.length-1]}, height: ${values[height_values.length - 1]}`);
            }
    
            else if (width_values.length === 0 && height_values.length === 0) {
                console.log("thank you")
            }
        }
    }
    
    if (var_counts['x'] >= 2 && var_counts['y'] >= 2) {
          let width = Math.abs(Math.max(...x_values) - Math.min(...x_values));
          let height = Math.abs(Math.max(...y_values) - Math.min(...y_values));
          console.log(Math.max(...x_values));
          console.log(Math.min(...x_values));
          console.log(Math.max(...y_values));
          console.log(Math.min(...y_values));
          width_values.push(width);
          height_values.push(height);
          console.log(`Calculated width: ${width}, height: ${height}`);
      }
      
      console.log(`x: ${x_values[0] || 0}, y: ${y_values[0] || 0}, width: ${width_values[0] || 100}, height: ${height_values[0] || 100}`)
      
      window.y_pos = y_values[0]
      
      window.x_pos = x_values[0]
      window.width = width_values[0]
      window.height = height_values[0]
      
      const messageInput = document.querySelector("#message-input").value;
      
        function handleInputChange() {
        
        const messageInput = document.querySelector("#message-input").value;
        console.log('messageInput :>> ', messageInput);
        const image = new Image();
        console.log('image :>> ', image);
        let imageUrls = [];
        let imageUrl = `https://source.unsplash.com/600x500/?${encodeURIComponent(messageInput)}`;
        console.log('imageUrl :>> ', imageUrl);
        
        imageUrls.push(imageUrl);
        let imageEditor;
    
        function imageEditors() {
         
         setTimeout(() => {
            const messageInput = document.querySelector("#message-input").value;    
            value_y = window.height
            value_x = window.width
           
            console.log(value_x)
            console.log(value_y)
    
            imageEditor = new tui.ImageEditor('#tui-image-editor-container', {
              includeUI: {
                  loadImage: {
                      path: imageUrls[imageUrls.length - 1], 
                      name: 'messageInput'
                  },     
                  initMenu: 'filter',
                  menuBarPosition: 'bottom'
              },          
              cssMaxWidth: (Math.min(500, extractNumber1(value_x)) || 700),
              cssMaxHeight: (Math.min(500, extractNumber1(value_x))  || 500),
              usageStatistics: false
            });
           
            window.shared.imageEditorArray.push(imageEditor);
             
            if(!imageEditor) {
              console.log('Error creating ImageEditor');
            }
            
            console.log('getImageName:', imageEditor.getImageName());
            console.log('getCanvasSize:', imageEditor.getCanvasSize());
            console.log('Image loaded');
        
            }, 3000);
        }
        
        function Grayscale() {
          const array = window.shared.imageEditorArray;
          console.log('array :>> ', array);
          let imageEditor = array[0];
                
          setTimeout(function() {
            imageEditor.applyFilter('Grayscale');  
            window.shared.imageEditorArray.push(imageEditor);  
          }, 2000);
        }
       
        let canApplyFilter = true;
    
        function Invert() {
    
        if (!canApplyFilter) {
          console.log("Cannot apply or remove filter within 5 seconds of last operation");
          return;
        }
    
        const array = window.shared.imageEditorArray;
        imageEditor = array[array.length - 1];
    
        if (imageEditor.hasFilter('Invert')) {
        console.log("has filter 1111111111111111111")
        setTimeout(function() {
          imageEditor.removeFilter('Invert');
        }, 2000);
    
        } else {
          console.log("does not has filter 2222222222222")
            setTimeout(function() {
    
          imageEditor.applyFilter('Invert');
                }, 2000);
          console.log("filter applied")
        }
    
        window.shared.imageEditorArray.push(imageEditor);
    
        canApplyFilter = false;
        setTimeout(function() {
          canApplyFilter = true;
        }, 5000);
    }
          
        function cloth() {
           alert("a")
           const array = window.shared.imageEditorArray;
           imageEditor = array[array.length - 1];
    
            let segmentationData; 
            let maskCanvases = []; 
            const labelToResult = {};
            const labelToColor = {};
    
    function dataURLtoBlob(dataurl) {
      var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while(n--){
          u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], {type:mime});
    }
    
    async function sendImageToServer(originalImageData) {
      var blob = dataURLtoBlob(originalImageData);
      var formData = new FormData();
      formData.append('image_file', blob, 'image123.jpg');
    
      try {
        const response = await fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/image_segmentation', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
    
        if (data.error && data.error.includes("Model is currently loading")) {
        const timeout = data.estimated_time * 1000; 
        await new Promise(resolve => setTimeout(resolve, timeout));
        console.log("Model loaded, retrying request...");
    
        const retryResponse = await fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/image_segmentation', {
          method: 'POST',
          body: formData
        });
        const retryData = await retryResponse.json();
        console.log(retryData);
    
      } else {
        console.log(data);
    
      }
    
        if (response.ok) {
          console.log(response.ok);
          const colorPalette = [
            'rgba(0, 153, 153, 0.5)', 
            'rgba(255, 255, 0, 0.5)',
            'rgba(0, 0, 255, 0.5)', 
            'rgba(153, 0, 153, 0.5)', 
            'rgba(255, 255, 0, 0.5)', 
            'rgba(255, 192, 203, 0.5)', 
            'rgba(153, 0, 0, 0.5)' 
          ];
          const colorToLabel = {
      'rgba(0, 153, 153, 0.5)': 'Label1', 
      'rgba(255, 255, 0, 0.5)': 'Label2',
      'rgba(0, 0, 255, 0.5)': 'Label3', 
      'rgba(153, 0, 153, 0.5)': 'Label4', 
      'rgba(255, 255, 0, 0.5)': 'Label5', 
      'rgba(255, 192, 203, 0.5)': 'Label6', 
      'rgba(153, 0, 0, 0.5)': 'Label7'
    };
          segmentationData = data;
      Object.entries(segmentationData).forEach(([label, result], index) => {
        const mask = result.mask;
        console.log('mask:', mask);
        const color = colorPalette[index % colorPalette.length];
        labelToColor[label] = color;
    
        if (!labelToResult[label]) {
          labelToResult[label] = [];
        }
        labelToResult[label].push(result);
    
        console.log('label:', label);
        console.log('color:', color);
        drawMask(originalImageData, mask, color, label);
      });
    
    maskCanvases = [];
    
    
      
        } else {
          resultDiv.innerHTML = '<p>Error: ' + data.error + '</p>';
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
    
          setTimeout(() => {
    
            const originalImageData = imageEditor.toDataURL();
            sendImageToServer(originalImageData);
          }, 200);
    
    function drawMask(originalImageData, maskData, color, label) {
      if (originalImageData && maskData) {
        const img = new Image();
        img.onload = function () {
          const imgWidth = img.width;
          const imgHeight = img.height;
          const canvas = imageEditor._graphics.getCanvas();
          canvas.width = imgWidth;
          canvas.height = imgHeight;
          const ctx = canvas.getContext('2d');
    
          ctx.drawImage(img, 0, 0);
          const mask = new Image();
          mask.onload = function () {
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = canvas.width;
            maskCanvas.height = canvas.height;
            maskCanvas.title = `${label}`; // Set the canvas title to the label
            const maskCtx = maskCanvas.getContext('2d');
            maskCtx.drawImage(mask, 0, 0);
            maskCanvas.maskData = maskData;
    
            const maskImageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
            const data = maskImageData.data;
    
            ctx.fillStyle = color;
            for (let i = 0; i < data.length; i += 4) {
              const brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
              if (brightness > 128) {
                const x = (i / 4) % maskCanvas.width;
                const y = Math.floor((i / 4) / maskCanvas.width);
                ctx.fillRect(x, y, 1, 1);
              }
            }
          };
          mask.src = 'data:image/png;base64,' + maskData;
          console.log("mask", mask);
        };
        console.log("img", img);
        img.src = originalImageData;
      } else {
        console.error('Invalid image or mask data');
      }
    }
    
    function compareColors(color1, color2, tolerance = 0.01) {
      const [r1, g1, b1, a1] = color1.slice(5, -1).split(',').map(Number);
      const [r2, g2, b2, a2] = color2.slice(5, -1).split(',').map(Number);
    
      const rDiff = Math.abs(r1 - r2) <= tolerance ? 0 : Math.abs(r1 - r2);
      const gDiff = Math.abs(g1 - g2) <= tolerance ? 0 : Math.abs(g1 - g2);
      const bDiff = Math.abs(b1 - b2) <= tolerance ? 0 : Math.abs(b1 - b2);
      const aDiff = Math.abs(a1 - a2) <= tolerance ? 0 : Math.abs(a1 - a2);
    
      return rDiff + gDiff + bDiff + aDiff === 0;
    }
    
    const canvas = imageEditor._graphics.getCanvas();
    
    function getClosestColorString(color) {
      const colorValues = Object.keys(colorPalette).map(colorString => {
        const [r, g, b, a] = colorString
          .replace(/[^\d,]/g, '')
          .split(',')
          .map(Number);
    
        const distance = Math.sqrt(
          (color.r - r) ** 2 +
          (color.g - g) ** 2 +
          (color.b - b) ** 2 +
          (color.a - a) ** 2
        );
    
        return { colorString, distance };
      });
    
      const closestColor = colorValues.reduce((prev, curr) =>
        prev.distance <= curr.distance ? prev : curr
      );
    
      return closestColor.colorString;
    }
    const tooltip = document.getElementById('tooltip');
    if (window.getComputedStyle(tooltip).display === 'none') {
      tooltip.style.display = 'block';
    }
    canvas.on('mouse:move', (options) => {
      const { e, pointer } = options;
      console.log('Mouse move at:', pointer.x, pointer.y);
    
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
    
      if (pointer.x >= 0 && pointer.x < canvasWidth && pointer.y >= 0 && pointer.y < canvasHeight) {
        const pixelData = canvas.getContext('2d').getImageData(pointer.x, pointer.y, 1, 1).data;
        const color = {
          r: pixelData[0],
          g: pixelData[1],
          b: pixelData[2],
          a: pixelData[3] / 255
        };
    
        const closestColorString = getClosestColorString(color);
        const hoveredColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
        console.log('Hover color:', hoveredColor);
    
        const label = Object.entries(labelToColor).find(([_, value]) => value === closestColorString)?.[0];
        console.log(`Closest color: ${closestColorString}, Label: ${label || 'Unknown'}`);
    
        if (label) {
          const results = labelToResult[label];
          console.log('results :>> ', results);
          results.forEach(result => {
            console.log(`result.label: ${result.label}`);
          });
          const tooltipContent = results.map(result => result.label).join('<br>');
          tooltip.innerHTML = tooltipContent;
          tooltip.style.left = `${e.clientX}px`;
          tooltip.style.top = `${e.clientY}px`;
          tooltip.style.opacity = 1;
    
        } else {
          console.log('Hovering over image, but not over any color');
          tooltip.style.opacity = 0;
    
        }
      } else {
        console.log("Hovering outside the image");
        tooltip.style.opacity = 0;
    
      }
    });
    
    const colorPalette = {
      'rgba(0, 153, 153, 0.5)': 'Label1',
      'rgba(255, 255, 0, 0.5)': 'Label2',
      'rgba(0, 0, 255, 0.5)': 'Label3',
      'rgba(153, 0, 153, 0.5)': 'Label4',
      'rgba(255, 255, 0, 0.5)': 'Label5',
      'rgba(255, 192, 203, 0.5)': 'Label6',
      'rgba(153, 0, 0, 0.5)': 'Label7'
    };
          
}
    async function text_to_image(){
      
      const prompt = document.querySelector("#message-input").value;
      const imageContainer = document.getElementById('imageid')
           
      try {
        const response = await fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/generate_image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });
    
        const imageData = await response.json();
        const imageUrl = `data:image/jpeg;base64,${imageData.image_data}`;
        imageUrls.push(imageUrl);
        imageContainer.innerHTML = `<img src="${imageUrl}" alt="Generated Image">`;
    
        } 
      
      catch (error) {
      console.error('Error:', error);
      }
      
      console.log('imageUrls[0] :>> ', imageUrls[imageUrls.length - 1]);
    
          imageEditor = new tui.ImageEditor('#tui-image-editor-container', {
            includeUI: {
              loadImage: {
                path:  imageUrls[imageUrls.length - 1],
                name: 'GeneratedImage',
              },
              initMenu: 'filter',
              menuBarPosition: 'bottom',
            },
            cssMaxWidth: 700,
            cssMaxHeight: 500,
            usageStatistics: false,
          });
    
          window.onresize = function () {
            imageEditor.ui.resizeEditor();
          };
    
          imageEditor.loadImageFromURL(imageUrls[imageUrls.length - 1], "SampleImage2").then((sizeValue)=>{
              imageEditor.ui.activeMenuEvent();
              imageEditor.ui.resizeEditor({imageSize: sizeValue});
              console.log("Image allegedly loaded.")
          }).catch(e=>{
              console.error("Something went wrong:")
              console.error(e)
          })
    
    }
    
            
    var isBlurExecuted = false;
    
    function Blur() {
      if (isBlurExecuted) {
        return;
      }
    
      isBlurExecuted = true;
    
      var blur_num;
      const array = window.shared.imageEditorArray;
      var imageEditor = window.shared.imageEditorArray[window.shared.imageEditorArray.length - 1];
      setTimeout(function() {
        imageEditor.addShape('rect', {
            fill: {
            type: 'filter',
            filter: [{blur: 0.02}]
          },
          width: 800,
          height: 700
        }).then(objectProps => {
          console.log(objectProps);
        });
      }, 2200);
    }
    
        function Sharpen() {
          const array = window.shared.imageEditorArray;
          console.log('array :>> ', array);
          let imageEditor =  array[array.length - 1];
          console.log('imageEditor :>> ', imageEditor);
          // console.log('imageEditor :>> ', imageEditor);
          setTimeout(function() {
            imageEditor.applyFilter('Sharpen');
          }, 2000);
          window.shared.imageEditorArray.push(imageEditor);
        } 
        
        function Emboss() {
            const array = window.shared.imageEditorArray;
    
            let imageEditor = array[0];
    
            setTimeout(function() {
                imageEditor.applyFilter('Emboss'); 
            }, 2000);
    
             window.shared.imageEditorArray.push(imageEditor);
        }
        
        function extractNumbers(text) {
          let numbers = text.match(/\d+/g);
          return numbers ? numbers.map(Number) : [];
        }
        
          var string1 = document.querySelector("#message-input").value;
        
          value_num = extractNumbers(string1)
          const array = window.shared.imageEditorArray;
    
        imageEditor = array[0];
    
          console.log('imageEditor :>> ', imageEditor);
        
        function Brightness() {
    
            setTimeout(function() {
            var string = document.querySelector("#message-input").value;
            console.log(string)
            console.log(extractNumbers(string));
            value_num = extractNumbers(string);
            console.log(value_num)
            const array = window.shared.imageEditorArray;
            console.log('array :>> ', array);
            bright_num = window.bright_num;  
            console.log(bright_num);
    
            let imageEditor = array[0];
              setTimeout(function() {
                let brightnessValue = bright_num ? parseInt(bright_num, 10) / 255 : 70;
                  console.log("Brightness Value: ", brightnessValue);
                  imageEditor.applyFilter('brightness', {'brightness': brightnessValue});
                }, 2000);  
              }, 1000);
              window.shared.imageEditorArray.push(imageEditor);
            }
          
        function Sepia(){  
              const array = window.shared.imageEditorArray;
              console.log('array :>> ', array);
              let imageEditor = array[0];
              console.log('imageEditor :>> ', imageEditor);
              console.log('imageEditor :>> ', imageEditor);
              setTimeout(function() {
              imageEditor.applyFilter('Sepia'); 
              }, 2000);
              window.shared.imageEditorArray.push(imageEditor);
            }
    
        function Textfn(){
          setTimeout(() => {
            const array = window.shared.imageEditorArray;
            console.log('array :>> ', array); 
            value_y = window.y_pos
            value_x = window.x_pos
            var messageinput = document.querySelector("#message-input");
            font_num = window.font
            console.log("font_num", font_num)
            foundColors = window.foundColors
            font_Weight1 = window.font_Weight
            
            let input = messageinput.value;
            input = input.replace(/text|saturation|brightness/gi, "");
            
            let imageEditor = array[0];
            
            let fill = (typeof foundColors !== 'undefined') ? foundColors : 'black';
            
            let fontSize = (typeof font_num !== 'undefined') ? font_num : 88;
            
            let fontWeight = (typeof font_Weight1 !== 'undefined') ? font_Weight1 : 'normal';
            // alert(fontWeight)
            
            let positionX = (typeof value_x !== 'undefined') ? value_x : 1;
            let positionY = (typeof value_y !== 'undefined') ? value_y : 1;
            
            // alert("fill" + fill)
            ///console.log("fill",fill)
            
            console.log("positionY",value_y)
            console.log("positionX",value_x)
            console.log("fontWeight",font_Weight1)
            console.log("fontSize",font_num)
            console.log("fill",foundColors)
            let input1 = messageinput.value;
            input1 = input1.replace(/text|saturation|brightness/gi, "");
            
            console.log(input1)
                
            imageEditor.addText(input1, {
              styles: {
                    fill: fill,
                    fontSize: fontSize,
                    fontWeight: fontWeight
                },     
                position: {
                    x: positionX,
                    y: positionY
                }   
                })
            .then(objectProps => {
                    console.log(objectProps.id);
                }).catch(error => {
                console.log("Failed to add text", error);
                });
            
            ;   
               window.shared.imageEditorArray.push(imageEditor);
       }, 5000);
              } 
          
              function changeCursor(){
                imageEditor.changeCursor('crosshair');
                  window.shared.imageEditorArray.push(imageEditor);
    
              }
        
              function IconColor(){
                 imageEditor.changeIconColor(id, '#000000');
                  window.shared.imageEditorArray.push(imageEditor);
              }
        
              function Saturation() {
                const array = window.shared.imageEditorArray;
                let imageEditor = array[0];
                saturation_num = window.saturation_num;
                console.log('saturation_num :>> ', saturation_num);
                
                // alert(saturation_num)
                
                setTimeout(() => {
                let saturationValue = saturation_num ? parseInt(saturation_num, 10) : 50;
                  console.log("Saturation Value: ", saturationValue);
                  imageEditor.applyFilter('saturation', {'saturation': saturationValue});
                }, 2000);
    
                window.shared.imageEditorArray.push(imageEditor);
              }      
        
          function Mask() {
            const array = window.shared.imageEditorArray; 
            let imageEditor = array[0];
            
            
            setTimeout(() => {
              
            var inputText = document.createElement("input");
            inputText.setAttribute("type", "text");
              
              
            inputText.setAttribute("id", "myInput");
            inputText.setAttribute("placeholder", "Enter search term");
            document.body.appendChild(inputText);
            
            var inputFile = document.createElement("input");
            inputFile.setAttribute("type", "file");
            inputFile.setAttribute("id", "myFile");
            inputFile.setAttribute("name", "filename");
            document.body.appendChild(inputFile);
            
            var button = document.createElement("button");
            button.innerHTML = "Load Image";
            button.id = "Load_image";
            var button_mask = document.querySelector("input[type='submit']");
            
            var checkExist = setInterval(function() {
              var loadImageButton = document.getElementById("Load_image");
              if (loadImageButton) {
                loadImageButton.click();
                clearInterval(checkExist);
              }
            }, 1000); 
              
            document.querySelector("input[type='submit']").addEventListener("click", function() {
              var loadImageButton = document.getElementById("Load_image");
              if(loadImageButton) {
                  loadImageButton.click();
              }
            });
            
            button_mask.onclick = function() {
              loadImageOrUrl();
            };
            
            button.onclick = function() {
              loadImageOrUrl();
            };
        
            document.body.appendChild(button);
                    
            function loadImage() {
                var input = document.getElementById('myFile');
                var file = input.files[0];
                var reader = new FileReader();
                reader.onload = function(event) {
                    var dataUrl = event.target.result;
                    imageEditor.addImageObject(dataUrl).then(objectProps => {
                        var id = objectProps.id;
                        imageEditor.applyFilter('mask', {maskObjId: id}).then(obj => {
                            console.log('filterType: ', obj.type);
                            console.log('actType: ', obj.action);
                        }).catch(message => {
                            console.log('error: ', message);
                        });
                                  window.shared.imageEditorArray.push(imageEditor);
    
                    });
                };
                reader.readAsDataURL(file);
            }   
                
            async function loadImageFromUrl() {
                var input = document.querySelector("#message-input");
                var searchTerm = input.value;
                var url = 'https://source.unsplash.com/500x600/?' + encodeURIComponent(searchTerm);
                var response = await fetch(url);
                var blob = await response.blob();
                var reader = new FileReader();
                reader.onload = function(event) {
                    var dataUrl = event.target.result;
                    imageEditor.addImageObject(dataUrl).then(objectProps => {
                        var id = objectProps.id;
                        imageEditor.applyFilter('mask', {maskObjId: id}).then(obj => {
                            console.log('filterType: ', obj.type);
                             console.log('actType: ', obj.action);
                        }).catch(message => {
                            console.log('error: ', message);
                        });
                    });
                };            window.shared.imageEditorArray.push(imageEditor);
    
                reader.readAsDataURL(blob);
            }
          
            function loadImageOrUrl() {
            // alert("loadimageorUrl")
              var fileInput = document.getElementById('myFile');
              var urlInput = document.querySelector("#message-input");
              // alert("urlInput.value.trim()" + urlInput.value.trim())
              console.log("urlInput.value.trim()",urlInput.value.trim())
              
              if(urlInput.value.trim() === 'mask') {
              var btn = document.createElement("button");
              btn.className = "btn btn-primary";  
              btn.innerText = "Add a Mask";
              btn.style.color = "red";
              btn.style.padding = "20px"; 
              
              document.body.appendChild(btn); 
              btn.click()
                
              btn.addEventListener("click", function() {
                fileInput.click(); 
              });
              
              btn.style.position = "absolute";
              btn.style.top = "40%";
              btn.style.left = "50%";  
              btn.style.transform = "translate(-50%, -40%)";
              // btn.style.backgroundColor = "#007bff";
              btn.style.border = "none";
              // btn.style.color = "white";
              btn.style.padding = "20px";
              btn.style.textAlign = "center";
              btn.style.textDecoration = "none";
              // btn.style.display = "inline-block";
              btn.style.fontSize = "16px";
              btn.click()
              btn.style.margin = "4px 2px";
              // btn.style.cursor = "pointer";
              btn.innerText = "Add a Mask";
              
              fileInput.addEventListener('change', loadImage); 
                console.log("you need to click on button to  upload mask")
                  }
                  
                  else {
                    loadImageFromUrl();
                    }
                  }
              
                  fileInput.addEventListener('change', () => {
                    loadImage(); 
                  });
                }, 2000); 
              }
    
        function ColorDodge() {
          const array = window.shared.imageEditorArray;
          let imageEditor = array[0];
        
          setTimeout(() => {
            imageEditor.applyFilter('colordodge');
                        window.shared.imageEditorArray.push(imageEditor);
    
          }, 2000);
          
        }
        
        function Vintage() {
          const array = window.shared.imageEditorArray;
          let imageEditor = array[0];
        
          setTimeout(() => {
            imageEditor.applyFilter('vintage');
            window.shared.imageEditorArray.push(imageEditor);
    
          }, 2000);
        }
        
        function addicon(){
          const array = window.shared.imageEditorArray;
          let imageEditor = array[0];
          // alert("addicon")
           var messageinput_icon = document.querySelector("#message-input").value
           setTimeout(() => {
           value_x = window.x_pos
           value_y = window.y_pos
           var lastAddedIconId;
           var icon_name = window.foundWord_icon;
            // alert("icon_name",icon_name)
              
            if (messageinput_icon.includes("arrow")) {
        
            imageEditor.addIcon('arrow', {
              left: value_x,
              top: value_y
              }).then(objectProps => {
                  console.log(objectProps.id);
                  lastAddedIconId = objectProps.id;
            });
            window.shared.imageEditorArray.push(imageEditor);
            }
            
            else if  (messageinput_icon.includes("cancel")) {
            imageEditor.addIcon('cancel', {
              left: value_x,
              top: value_y
              }).then(objectProps => {
                  console.log(objectProps.id);
                  lastAddedIconId = objectProps.id;
            });
            window.shared.imageEditorArray.push(imageEditor);
          }
          
            else if(messageinput_icon.includes("arrow")) {
            imageEditor.addIcon('arrow', {
              left: value_x,
              top: value_y
              }).then(objectProps => {
              console.log(objectProps.id);
              lastAddedIconId = objectProps.id;
            });
            window.shared.imageEditorArray.push(imageEditor);
          }
           
            setTimeout(() => {
              if (lastAddedIconId) {
                  imageEditor.changeIconColor(lastAddedIconId, '#000000');
              }
              window.shared.imageEditorArray.push(imageEditor);
            }, 2000);
             
          }, 2000);
        }
        
        ids = [];
        
        function addobjects() {
          const array = window.shared.imageEditorArray;
          let imageEditor = array[0];
          let input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = function(event) {
            let file = event.target.files[0];
            let reader = new FileReader();
              reader.onload = function(event) {
                let imgSrc = event.target.result;
                  imageEditor.addImageObject(imgSrc).then(objectProps => {
                    console.log(objectProps.id);
                      ids.push(objectProps.id);
                    console.log('ids :>> ', ids);
                  });
                  window.shared.imageEditorArray.push(imageEditor);
    
                };
              reader.readAsDataURL(file);
          };
          
          let clicked = false;
          document.addEventListener('click', function() {
              if (!clicked) {
              console.log('clicked :>> ', clicked);
              input.click()
              clicked = true;
              }
            });
          } 
        
        function extractNumber1(str) {
            // console.log('str :>> ', str);
            if (typeof str === 'string') {
              const num = str.replace(/[^0-9.]/g, '');
              console.log('num :>> ', num);
              return num ? parseFloat(num) : '';
            } else {
              // console.log('Error: Input is not a string');
              return '';
            }
          } 
    
        function extractTwoNumbers(str) {
      if (typeof str === 'string') {
        const matches = str.match(/\d+(\.\d+)?/g);
        if (matches) {
          if (matches.length >= 2) {
            const num1 = parseFloat(matches[0]);
            const num2 = parseFloat(matches[1]);
            return [num1, num2];
          } else if (matches.length === 1) {
            const num1 = parseFloat(matches[0]);
            return [num1];
          }
        } else {
          console.log('Error: Input string does not contain any valid numbers');
          return [];
        }
      } else {
        console.log('Error: Input is not a string');
        return [];
      }
    }
        
        function extractUpToSixNumbers(str) {
      if (typeof str === 'string') {
        const matches = str.match(/\d+(\.\d+)?/g);
        if (matches) {
          const numbers = matches.slice(0, 6).map(match => parseFloat(match));
          return numbers;
        } else {
          console.log('Error: Input string does not contain any valid numbers');
          return [];
        }
      } else {
        console.log('Error: Input is not a string');
        return [];
      }
    }
        
        function extractUpToTwelveNumbers(str) {
      if (typeof str === 'string') {
        const matches = str.match(/\d+(\.\d+)?/g);
        if (matches) {
          const numbers = matches.slice(0, 12).map(match => parseFloat(match));
          return numbers;
        } else {
          console.log('Error: Input string does not contain any valid numbers');
          return [];
        }
      } else {
        console.log('Error: Input is not a string');
        return [];
      }
    }    
        
        function scaleNumberBetween0And1(num) {
      if (typeof num === 'number') {
        let scaledNum = num;
        while (scaledNum >= 1) {
          scaledNum /= 10;
        }
        return scaledNum;
      } else {
        console.log('Error: Input is not a number');
        return '';
      }
    }
        
        function dataextraction() {
         const lexicons = nlp.model().one.lexicon;
         const stopwords = [];
    
          for(let word in lexicons) {
            if(Array.isArray(lexicons[word])) {
              if(lexicons[word].includes("Conjunction") || lexicons[word].includes("Preposition") || lexicons[word].includes("Pronoun")) {
                stopwords.push(word);
              }
            } else {
              if(lexicons[word].match("Conjunction") || lexicons[word].match("Preposition") || lexicons[word].match("Pronoun")) {
                stopwords.push(word);
              }
            }
          }
    
    console.log(stopwords)
    
    let text  = document.querySelector("#message-input").value
    console.log(text)
    let doc   = nlp(text)
    let words = text.split(' ')
    
    let filtered_words = words.filter(word => !stopwords.includes(word))
    
    let filtered_text = filtered_words.join(' ')
    
    doc = nlp(filtered_text)
    
    let x_values = []
    let y_values = []
    let width_values = []
    let height_values = []
    
    let tokens = doc.terms().data()
    
    let coordinates = text.match(/\((\d+), (\d+)\)/g)
    
    if (coordinates) {
        for (let coord of coordinates) {
            let nums = coord.match(/\d+/g)
            x_values.push(parseInt(nums[0]))
            y_values.push(parseInt(nums[1]))
        }
    }
    
    let added_nums = coordinates ? [].concat.apply([], coordinates.map(coord => coord.match(/\d+/g))) : []
    
    let value_count = 0
    let x = 0 
    let y = 0 
    let z = 0
    let w = 0
    
    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i]
        let terms = token.terms
        for (let term of terms) {
            if (term.tags && term.tags.includes('Value')) {
                let num = parseInt(term.text)
                value_count++
                if (added_nums.includes(num)) {
                    continue
                }
    
                let prev_token = i > 0 ? tokens[i - 1].text.toLowerCase() : ""
                let next_token = i < tokens.length - 1 ? tokens[i + 1].text.toLowerCase() : ""
                let total_token = prev_token + ' ' + next_token
    
                if (['x', 'left', 'corner'].some(word => total_token.includes(word)) || (total_token.includes('sides') && doc.text().includes('quadrilateral'))) {
                    x_values.push(num)
                    x++
                    // console.log(`Added ${num} to x_values: ${x_values}`);
                } else if (['y', 'top'].some(word => total_token.includes(word)) || (total_token.includes('sides') && doc.text().includes('quadrilateral'))) {
                    y_values.push(num)
                    y++
                } else if (total_token.includes('width') || (total_token.includes('sides') && doc.text().includes('quadrilateral'))) {
                    width_values.push(num)
                    z++
                } else if (total_token.includes('height') || (total_token.includes('sides') && doc.text().includes('quadrilateral'))) {
                    height_values.push(num)
                    w++
                } else if (['right', 'rhs'].some(word => total_token.includes(word))) {
                    x_values.push(num)
                } else if (['bottom', 'down'].some(word => total_token.includes(word))) {
                    y_values.push(num)
                }
            } 
        }
    }
    
    let var_counts = {
        'x': new Set(x_values).size,
        'y': new Set(y_values).size,
        'width': new Set(width_values).size,
        'height': new Set(height_values).size
    }
    
    console.log(`x: ${x_values}, y: ${y_values}, width: ${width_values}, height: ${height_values}`)
    
    console.log("var_counts",var_counts);
    
    // alert(var_counts)
    
    console.log(var_counts['x'] + var_counts['y'] + var_counts['width'] + var_counts['height']);
    
    console.log("value_count",value_count);
    
    // console.log(value_count[x]);
    
    console.log(x+y+z+w);
    
    if (x+y+z+w < value_count && value_count < 4) {
        let values = doc.values().toNumber().out('array');
          if (values.length >= 2) {
           console.log(values.length)        
            if (x_values.length === 0 && y_values.length === 0) {
                console.log('width_values :>> ', width_values);  
            console.log('height_values :>> ', height_values);
            console.log('width_values.length :>> ', width_values.length);
                console.log('height_values.length :>> ', height_values.length);
            if (width_values.length === 0 ){width_values.push(values[0]);
                console.log("width added first");}                 
            if (height_values.length === 0){height_values.push(values[1])}
                console.log(`Assumed width: ${values[ width_values.length-1]}, height: ${values[height_values.length - 1]}`);
            }
            
            else if (width_values.length === 0 && height_values.length === 0) {
                console.log("thank you")
            }
            
             }
              }
            
             if (var_counts['x'] >= 2 && var_counts['y'] >= 2) {
              let width = Math.abs(Math.max(...x_values) - Math.min(...x_values));
              let height = Math.abs(Math.max(...y_values) - Math.min(...y_values));
              console.log(Math.max(...x_values));
              console.log(Math.min(...x_values));
              console.log(Math.max(...y_values));
              console.log(Math.min(...y_values));
              width_values.push(width);
              height_values.push(height);
              console.log(`Calculated width: ${width}, height: ${height}`);
            }
    
            console.log(`x: ${x_values[0] || 0}, y: ${y_values[0] || 0}, width: ${width_values[0] || 100}, height: ${height_values[0] || 100}`)
                let value_x = window.pos_x
                let value_y = window.pos_y     
                window.pos_x = x_values[0]
                window.pos_y = y_values[0]
                window.pos_width =  width_values[0]
                window.pos_height =  height_values[0]
            }
        
        function circledataextraction() {
          
          
          
          let nlp = require('compromise')
    const lexicons = nlp.model().one.lexicon;
    const stopwords = [];
    
    for(let word in lexicons) {
      if(Array.isArray(lexicons[word])) {
        if(lexicons[word].includes("Conjunction") || lexicons[word].includes("Preposition") || lexicons[word].includes("Pronoun")) {
          stopwords.push(word);
        }
      } else {
        if(lexicons[word].match("Conjunction") || lexicons[word].match("Preposition") || lexicons[word].match("Pronoun")) {
          stopwords.push(word);
        }
      }
    }
    
    // let text = "Draw a circle in CorelDRAW using the Ellipse tool with a diameter of 5 cm.";
    let text = document.querySelector("#message-input").value
    
    let doc = nlp(text)
    let words = text.split(' ')
    let filtered_words = words.filter(word => !stopwords.includes(word))
    let filtered_text = filtered_words.join(' ')
    doc = nlp(filtered_text)
    let x_values = []
    let y_values = []
    let radius_values = []
    let tokens = doc.terms().data()
    let coordinates = text.match(/\((\d+), (\d+)\)/g)
    
    if (coordinates) {
      for (let coord of coordinates) {
        let nums = coord.match(/\d+/g)
        x_values.push(parseInt(nums[0]))
        y_values.push(parseInt(nums[1]))
      }
    }
    
    let added_nums = coordinates ? [].concat.apply([], coordinates.map(coord => coord.match(/\d+/g))) : [];
    let value_count = 0
    
    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i]
      let terms = token.terms
      for (let term of terms) {
        if (term.tags && term.tags.includes('Value')) {
          let num = parseInt(term.text)
          value_count++
          if (added_nums.includes(num)) {
            continue
          }
          let prev_token = i > 0 ? tokens[i - 1].text.toLowerCase() : ""
          let next_token = i < tokens.length - 1 ? tokens[i + 1].text.toLowerCase() : ""
          let total_token = prev_token + ' ' + next_token
          console.log(total_token)
    
          if ([' x','x ', 'left', 'center'].some(word => total_token.includes(word))) {
            x_values.push(num)
            console.log(`Added ${num} to x_values: ${x_values}`);
          } else if ([' y','y ', 'top'].some(word => total_token.includes(word))) {
            y_values.push(num)
          } else if (total_token.includes('radius')) {
            radius_values.push(num)
            console.log(num);
          }  else if (total_token.includes('diameter')) {
            radius_values.push(num/2)
            console.log(num/2);
          } 
          else if (['right', 'rhs'].some(word => total_token.includes(word))) {
            x_values.push(num)
          } else if (['bottom', 'down'].some(word => total_token.includes(word))) {
            y_values.push(num)
          }
        }
      }
    }
    
    let var_counts = {
      'x': new Set(x_values).size,
      'y': new Set(y_values).size,
      'radius': radius_values[radius_values.length - 1]
    }
    
    console.log(radius_values.length);
    console.log(var_counts)
          
          
        }
               
        function scene(){
       const array = window.shared.imageEditorArray;
        imageEditor = array[array.length - 1];
    
          let segmentationData; 
          let maskCanvases = []; 
          const labelToResult = {};
          const labelToColor = {};
    
          window.onresize = function () {
            imageEditor.ui.resizeEditor();
          };  
    
          function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
        }
    
          async function sendImageToServer(originalImageData) {
      var blob = dataURLtoBlob(originalImageData);
      var formData = new FormData();
      formData.append('image_file', blob, 'image123.jpg');
    // formData.append('file', blob, 'image123.jpg');
    
      try {
        const response = await fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/scenes', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        console.log('data :>> ', data);
        if (data.error && data.error.includes("Model is currently loading")) {
        const timeout = data.estimated_time * 1000; 
        await new Promise(resolve => setTimeout(resolve, timeout));
        console.log("Model loaded, retrying request...");
    
        const retryResponse = await fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/scenes', {
          method: 'POST',
          body: formData
        });
        const retryData = await retryResponse.json();
        console.log(retryData);
    
      } else {
        console.log(data);
    
      }
    
        if (response.ok) {
          console.log(response.ok);
          const colorPalette = [
            'rgba(0, 153, 153, 0.5)', 
            'rgba(255, 255, 0, 0.5)',
            'rgba(0, 0, 255, 0.5)', 
            'rgba(153, 0, 153, 0.5)', 
            'rgba(255, 255, 0, 0.5)', 
            'rgba(255, 192, 203, 0.5)', 
            'rgba(153, 0, 0, 0.5)' 
          ];
          const colorToLabel = {
      'rgba(0, 153, 153, 0.5)': 'Label1', 
      'rgba(255, 255, 0, 0.5)': 'Label2',
      'rgba(0, 0, 255, 0.5)': 'Label3', 
      'rgba(153, 0, 153, 0.5)': 'Label4', 
      'rgba(255, 255, 0, 0.5)': 'Label5', 
      'rgba(255, 192, 203, 0.5)': 'Label6', 
      'rgba(153, 0, 0, 0.5)': 'Label7'
    };
          segmentationData = data;
      Object.entries(segmentationData).forEach(([label, result], index) => {
        const mask = result.mask;
        console.log('mask:', mask);
        const color = colorPalette[index % colorPalette.length];
        labelToColor[label] = color;
    
        if (!labelToResult[label]) {
          labelToResult[label] = [];
        }
        labelToResult[label].push(result);
    
        console.log('label:', label);
        console.log('color:', color);
        drawMask(originalImageData, mask, color, label);
      });
    
    maskCanvases = [];
    
    
      
        } else {
          resultDiv.innerHTML = '<p>Error: ' + data.error + '</p>';
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
    
          setTimeout(() => {
    
            const originalImageData = imageEditor.toDataURL();
            sendImageToServer(originalImageData);
          }, 200);
    
    function drawMask(originalImageData, maskData, color, label) {
      if (originalImageData && maskData) {
        const img = new Image();
        img.onload = function () {
          const imgWidth = img.width;
          const imgHeight = img.height;
          const canvas = imageEditor._graphics.getCanvas();
          canvas.width = imgWidth;
          canvas.height = imgHeight;
          const ctx = canvas.getContext('2d');
    
          ctx.drawImage(img, 0, 0);
          const mask = new Image();
          mask.onload = function () {
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = canvas.width;
            maskCanvas.height = canvas.height;
            maskCanvas.title = `${label}`; // Set the canvas title to the label
            const maskCtx = maskCanvas.getContext('2d');
            maskCtx.drawImage(mask, 0, 0);
            maskCanvas.maskData = maskData;
    
            const maskImageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
            const data = maskImageData.data;
    
            ctx.fillStyle = color;
            for (let i = 0; i < data.length; i += 4) {
              const brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
              if (brightness > 128) {
                const x = (i / 4) % maskCanvas.width;
                const y = Math.floor((i / 4) / maskCanvas.width);
                ctx.fillRect(x, y, 1, 1);
              }
            }
          };
          mask.src = 'data:image/png;base64,' + maskData;
          console.log("mask", mask);
        };
        console.log("img", img);
        img.src = originalImageData;
      } else {
        console.error('Invalid image or mask data');
      }
    }
    
    function compareColors(color1, color2, tolerance = 0.01) {
      const [r1, g1, b1, a1] = color1.slice(5, -1).split(',').map(Number);
      const [r2, g2, b2, a2] = color2.slice(5, -1).split(',').map(Number);
    
      const rDiff = Math.abs(r1 - r2) <= tolerance ? 0 : Math.abs(r1 - r2);
      const gDiff = Math.abs(g1 - g2) <= tolerance ? 0 : Math.abs(g1 - g2);
      const bDiff = Math.abs(b1 - b2) <= tolerance ? 0 : Math.abs(b1 - b2);
      const aDiff = Math.abs(a1 - a2) <= tolerance ? 0 : Math.abs(a1 - a2);
    
      return rDiff + gDiff + bDiff + aDiff === 0;
    }
    
    const canvas = imageEditor._graphics.getCanvas();
    
    function getClosestColorString(color) {
      const colorValues = Object.keys(colorPalette).map(colorString => {
        const [r, g, b, a] = colorString
          .replace(/[^\d,]/g, '')
          .split(',')
          .map(Number);
    
        const distance = Math.sqrt(
          (color.r - r) ** 2 +
          (color.g - g) ** 2 +
          (color.b - b) ** 2 +
          (color.a - a) ** 2
        );
    
        return { colorString, distance };
      });
    
      const closestColor = colorValues.reduce((prev, curr) =>
        prev.distance <= curr.distance ? prev : curr
      );
    
      return closestColor.colorString;
    }
    const tooltip = document.getElementById('tooltip');
    if (window.getComputedStyle(tooltip).display === 'none') {
      tooltip.style.display = 'block';
    }
    canvas.on('mouse:move', (options) => {
      const { e, pointer } = options;
      console.log('Mouse move at:', pointer.x, pointer.y);
    
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
    
      if (pointer.x >= 0 && pointer.x < canvasWidth && pointer.y >= 0 && pointer.y < canvasHeight) {
        const pixelData = canvas.getContext('2d').getImageData(pointer.x, pointer.y, 1, 1).data;
        const color = {
          r: pixelData[0],
          g: pixelData[1],
          b: pixelData[2],
          a: pixelData[3] / 255
        };
    
        const closestColorString = getClosestColorString(color);
        const hoveredColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
        console.log('Hover color:', hoveredColor);
    
        const label = Object.entries(labelToColor).find(([_, value]) => value === closestColorString)?.[0];
        console.log(`Closest color: ${closestColorString}, Label: ${label || 'Unknown'}`);
    
        if (label) {
          const results = labelToResult[label];
          console.log('results :>> ', results);
          results.forEach(result => {
            console.log(`result.label: ${result.label}`);
          });
          const tooltipContent = results.map(result => result.label).join('<br>');
          tooltip.innerHTML = tooltipContent;
          tooltip.style.left = `${e.clientX}px`;
          tooltip.style.top = `${e.clientY}px`;
          tooltip.style.opacity = 1;
    
        } else {
          console.log('Hovering over image, but not over any color');
          tooltip.style.opacity = 0;
    
        }
      } else {
        console.log("Hovering outside the image");
        tooltip.style.opacity = 0;
    
      }
    });
    
    const colorPalette = {
      'rgba(0, 153, 153, 0.5)': 'Label1',
      'rgba(255, 255, 0, 0.5)': 'Label2',
      'rgba(0, 0, 255, 0.5)': 'Label3',
      'rgba(153, 0, 153, 0.5)': 'Label4',
      'rgba(255, 255, 0, 0.5)': 'Label5',
      'rgba(255, 192, 203, 0.5)': 'Label6',
      'rgba(153, 0, 0, 0.5)': 'Label7'
    };
        }
      
        function addShape(){
          dataextraction()
          setTimeout(() => {
          
            // window.y_pos = y_values[0] || 0
            // window.x_pos = x_values[0] || 0
            
            console.log(window.foundIcons);
            const shape_name = window.foundWord_icon;
            console.log('shape_name :>> ', shape_name);
    
            var fill_color = window.foundColors
            var stroke_color =  window.foundColors
            var stroke_Width = window.stroke_num;
          
            var direction = window.direction;
           
            if (direction === undefined || direction === null) {
               direction = 0;
            }
            console.log('direction :>> ', direction);
          
            let value_x = window.pos_x;
            let value_y = window.pos_y;
          
            console.log(value_x);
            console.log(value_y);
          
            let value_width  =   window.pos_width;
            let value_height =   window.pos_height;
    
            topbot = window.topbot;
          
          var blur_num;
          blur_num = window.blur_num;
          var icon_name = window.foundWord_icon;
          console.log(shape_name)
          if (shape_name === 'rectangle' || shape_name === 'rect') {
            console.log(value_width)
            console.log(value_height)
            console.log(value_x)
            console.log(value_y)
            
            imageEditor.addShape('rect', { 
                  fill: {
                      type: 'filter',
                      filter: [{blur: 1}, {pixelate: 1}]
                  },
                  stroke: "black",
                  strokeWidth: extractNumber1(stroke_Width),
                  // width: Math.min(500, (typeof value_x !== 'undefined' && value_x !== null) ? extractNumber1(value_x) : 100),
                  width: (value_width || 700),
                  // height: Math.min(70v0, (typeof value_y !== 'undefined' && value_y !== null) ? extractNumber1(value_y) : 100),
                  height: (value_height|| 500),
                  // left: Math.min(500, (typeof direction !== 'undefined' && direction !== null) ? extractNumber1(direction) : 0),
                 left: (value_x || 300), 
                 top: (value_y || 400), 
                  // top: Math.min(700, (typeof topbot !== 'undefined' && topbot !== null) ? extractNumber1(topbot) : 0),
                  isRegular: false
               }) 
                 .then(objectProps => {
                  console.log(objectProps.id);
                  ids.push(objectProps.id);
               }); 
            } 
            
          else if (shape_name === 'circle' || shape_name === 'oval') {
              
              circledataextraction()
              
              let value_x = window.pos_x;
              let value_y = window.pos_y;
              
              console.log(value_x)
              console.log(value_y)
              imageEditor.addShape('circle',   {  
                  // fill:   '#000000'            ,
                  // stroke: '#000000'            ,
                  strokeWidth:  extractNumber1(stroke_Width),              
                  rx: Math.min(500, (!isNaN(extractNumber1(value_x)) && typeof value_x !== 'undefined' && value_x !== null) ? extractNumber1(value_x) : 100),  
                  ry: Math.min(500, (!isNaN(extractNumber1(value_y)) && typeof value_y !== 'undefined' && value_y !== null) ? extractNumber1(value_y) : 100),
                  isRegular: false              
              }).then(objectProps => {          
                  console.log(objectProps.id);
                  ids.push(objectProps.id);      
                })                             
              }                                
            
          else {                             
              imageEditor.addShape(shape_name , {
                  fill: fill_color ,           
                  stroke: stroke_color ,       
                  strokeWidth: extractNumber1(stroke_Width),
                  width:  Math.min(500, extractNumber1(value_x) || 100)   ,
                  height: Math.min(500, extractNumber1(value_y) || 100)   ,
                  left:   Math.min(500, extractNumber1(direction) || 0)   ,
                  top:    Math.min(500, extractNumber1(topbot) || 0)      ,
                  isRegular: true              
              }).then(objectProps => {           
                  console.log(objectProps.id); 
                  ids.push(objectProps.id)     
              });
            }
          }, 10000);
        }
        
        function changeIconColor(){imageEditor.changeIconColor(id, '#000000');}
        
        function changeShape(){
    
          id = ids[0]
          var id1 = ids[0];
          var id2 = ids[1];
          
          imageEditor.changeShape(id, { 
            fill: 'red',
            stroke: 'blue',
            strokeWidth: 3,
            width: 100,
            height: 200
          });
          
          imageEditor.changeShape(id, { 
              fill: 'red',
              stroke: 'blue',
              strokeWidth: 3,
              rx: 10,
              ry: 100
          });
                window.shared.imageEditorArray.push(imageEditor);
    
        }
        
        function changeText(){
          imageEditor.changeText(id, 'change text');
          window.shared.imageEditorArray.push(imageEditor);
        }
        
        function changeTextStyle(){
          imageEditor.changeTextStyle(id, {
            fontStyle: 'italic'
        });
          window.shared.imageEditorArray.push(imageEditor);
        }
        
        function clearObjects(){
          imageEditor.clearObjects();
        }
        
        function clearRedoStack(){
          imageEditor.clearRedoStack();
        }
        
        function clearUndoStack(){
          imageEditor.clearUndoStack();
        }
        
        function changeSelectableAll(){
          imageEditor.crop(imageEditor.getCropzoneRect());
          window.shared.imageEditorArray.push(imageEditor);
        }
        
    
        function getCropzoneRect() {
      const array = window.shared.imageEditorArray;
      var imageEditor = window.shared.imageEditorArray[window.shared.imageEditorArray.length - 1];
    
      setTimeout(function() {
    
        imageEditor.startDrawingMode('CROPPER');
    
        imageEditor.setCropzoneRect(0.5, 0.5, 0.3, 0.3);
    
        var rect = imageEditor.getCropzoneRect();
    
        imageEditor.crop(rect).then(() => {
    
          imageEditor.stopDrawingMode();
        });
      }, 2000); 
    }
        
        function deactivateAll(){
          imageEditor.deactivateAll();
        }
          
        function changeSelectableAll(){
          imageEditor.changeSelectableAll(false); // or true
        }
          
        function discardSelection(){
          imageEditor.discardSelection();
        }
        
        function flipX(){
          // alert("flipx")
          imageEditor.flipX().then((status => {
            console.log('flipX: ', status.flipX);
            console.log('flipY: ', status.flipY);
            console.log('angle: ', status.angle);
        }).catch(message => {
            console.log('error: ', message);
        }));
          window.shared.imageEditorArray.push(imageEditor);
    
        }
        
        function flipY(){
          imageEditor.flipY().then(status => {
            // console.log('flipX: ', status.flipX);
            console.log('flipY: ', status.flipY);
            console.log('angle: ', status.angle);
          }).catch(message => {
            console.log('error: ', message);
          });
          window.shared.imageEditorArray.push(imageEditor);
    
        }
        
        function getCanvasSize(){
        
          var canvasSize = imageEditor.getCanvasSize();
          console.log(canvasSize.width);
          console.height(canvasSize.height);
        
        }
        
        function getimagename(){
          
          console.log(imageEditor.getImageName());
          window.shared.imageEditorArray.push(imageEditor);
    
        }
        
        function getObjectPosition(){
          // var position = imageEditor.getObjectPosition(id, 'left', 'top');
          var position = imageEditor.getObjectPosition(ids[0], 'left', 'top');
          console.log(position);
        }
          
        function getObjectProperties(){
        var props = imageEditor.getObjectProperties(id, 'left');
        console.log(props);
        var props = imageEditor.getObjectProperties(id, ['left', 'top', 'width', 'height']);
        console.log(props);
        var props = imageEditor.getObjectProperties(id, {
            left: null,
            top: null,
            width: null,
            height: null,
            opacity: null
        });
        console.log(props);
        }
          
        function loadImageFromFile(inputElement, imageName) {
          imageEditor.loadImageFromFile(file).then(result => {
            console.log('old : ' + result.oldWidth + ', ' + result.oldHeight);
            console.log('new : ' + result.newWidth + ', ' + result.newHeight);
        });
            window.shared.imageEditorArray.push(imageEditor);
    
        }
        
        function Redo(){
             imageEditor.redo();
             window.shared.imageEditorArray.push(imageEditor);
        }
          
          function removeFilter(){
        
            imageEditor.removeFilter('Grayscale').then(obj => {
                console.log('filterType: ', obj.type);
                console.log('actType: ', obj.action);
            }).catch(message => {
                console.log('error: ', message);
            });
          }
          
          function removeObject() {
            for (let i = 0; i < ids.length; i++) {
                let id = ids[i];
    
                if (id != null) {
    
                imageEditor.removeObject(id);
              }
            }
          }
          
          function resetFlip(){
            imageEditor.resetFlip().then(status => {
              console.log('flipX: ', status.flipX);
              console.log('flipY: ', status.flipY);
              console.log('angle: ', status.angle);
              }).catch(message => {
                  console.log('error: ', message);
              });
          }
          
          function rotate(){
            // alert("roattion will work")
            var rotate_num =  window.rotate_num
              console.log("window.rotate_num",window.rotate_num)
            imageEditor.rotate(extractNumber1(rotate_num) || 30)
            window.shared.imageEditorArray.push(imageEditor);
          }
          
          function setAngle(){
              var rotate_num =  window.rotate_num
              console.log("window.rotate_num",window.rotate_num)
              imageEditor.setAngle(extractNumber1(rotate_num) || 30); // angle = 10
              window.shared.imageEditorArray.push(imageEditor);
          }
        
          function setDrawingShaperect(){
        
            const shape_name = window.foundWord_icon;
            console.log('shape_name :>> ', shape_name);
            // alert(shape_name)
            var fill_color = window.foundColors
            var stroke_color =  window.foundColors
            var stroke_Width = window.stroke_num;
            
            var direction = window.direction;
            
            if (direction === undefined || direction === null) {
                direction = 0;
            }
            
            console.log('direction :>> ', direction);
          
            value_x = window.pos_x
            value_y = window.pos_y
          
            topbot = window.topbot
          
            var blur_num;
          
            blur_num = window.blur_num
            // shape_name = 'circle'
            
            var icon_name = window.foundWord_icon;
    
            imageEditor.startDrawingMode('SHAPE');
            imageEditor.setDrawingShape('rect', {
                fill: 'transparent',
                stroke: '#000000',
                strokeWidth: 10
            }); 
            window.shared.imageEditorArray.push(imageEditor);
    
          }
          function setDrawingShapecircle(){
            const shape_name = window.foundWord_icon;
            console.log('shape_name :>> ', shape_name);
            // alert(shape_name)
            var fill_color = window.foundColors
            var stroke_color =  window.foundColors
            var stroke_Width = window.stroke_num;
            
            var direction = window.direction;
            
            if (direction === undefined || direction === null) {
                direction = 0;
            }
            
            console.log('direction :>> ', direction);
          
            value_x = window.pos_x
            value_y = window.pos_y
          
            topbot = window.topbot
          
            var blur_num;
          
            blur_num = window.blur_num
    
            var icon_name = window.foundWord_icon;
          
            imageEditor.startDrawingMode('SHAPE');
            window.shared.imageEditorArray.push(imageEditor);
    
            imageEditor.setDrawingShape('circle', { // When resizing, the shape keep the 1:1 ratio
              rx: 10,
              ry: 10,
              isRegular: true
            });
              window.shared.imageEditorArray.push(imageEditor);
        
          }
          
          function setDrawingShapeoval(){
            const shape_name = window.foundWord_icon;
            console.log('shape_name :>> ', shape_name);
            // alert(shape_name)
            var fill_color = window.foundColors
            var stroke_color =  window.foundColors
            var stroke_Width = window.stroke_num;
            
            var direction = window.direction;
            
            if (direction === undefined || direction === null) {
                direction = 0;
            }
            
            console.log('direction :>> ', direction);
          
            value_x = window.pos_x
            value_y = window.pos_y
          
            topbot = window.topbot
          
            var blur_num;
            
            blur_num = window.blur_num
            
            var icon_name = window.foundWord_icon;
            
            imageEditor.setDrawingShape('circle', {
              fill: 'transparent',
              stroke: 'blue',
              strokeWidth: 3,
              rx: 10,
              ry: 100
              });
            window.shared.imageEditorArray.push(imageEditor);
              
            }
          
          function setDrawingShapetriangle(){
            
            const shape_name = window.foundWord_icon;
            console.log('shape_name :>> ', shape_name);
            // alert(shape_name)
            var fill_color = window.foundColors
            var stroke_color =  window.foundColors
            var stroke_Width = window.stroke_num;
            var direction = window.direction;
            
            if (direction === undefined || direction === null) {
                direction = 0;
            }
            
            console.log('direction :>> ', direction);
          
            var value_x = window.pos_x
            var value_y = window.pos_y
            var topbot = window.topbot
            var blur_num;
            blur_num = window.blur_num
    
            var icon_name = window.foundWord_icon;  
          
            imageEditor.setDrawingShape('triangle', {
              width: Math.min(500, extractNumber1(value_x) || 100),
              height: Math.min(500, extractNumber1(value_y) || 100),
              isRegular: true
            });
        
            window.shared.imageEditorArray.push(imageEditor);
    
          }
        
          function setObjectPosition(){
            const shape_name = window.foundWord_icon;
            console.log('shape_name :>> ', shape_name);
            var fill_color = window.foundColors;
            var stroke_color =  window.foundColors;
            var stroke_Width = window.stroke_num;
            
            var direction = window.direction;
            
            if (direction === undefined || direction === null) {
                direction = 0;
            }
            
            console.log('direction :>> ', direction);
          
            var  value_x = window.pos_x
            var  value_y = window.pos_y
          
            var   topbot = window.topbot
          
            var blur_num;
          
            blur_num = window.blur_num
            
            var icon_name = window.foundWord_icon;
        
            var canvasSize = imageEditor.getCanvasSize();
            var canvasSize = imageEditor.getCanvasSize();
            imageEditor.setObjectPosition(id, {
                x: canvasSize.width,
                y: canvasSize.height,
                originX: 'right',
                originY: 'bottom'
            });
            window.shared.imageEditorArray.push(imageEditor);
    
          }
          
          function setObjectProperties(){
            imageEditor.setObjectProperties(id, {
              left:100,
              top:100,
              width: 200,
              height: 200,
              opacity: 0.5
          }); 
              window.shared.imageEditorArray.push(imageEditor);
          }
        
          function startDrawingMode(){
            // alert("draing more ")
            const shape_name = window.foundWord_icon;
            // console.log('shape_name :>> ', shape_name);
            // alert(shape_name)
            var fill_color = window.foundColors
            var stroke_color =  window.foundColors
            var stroke_Width = window.stroke_num;
            
            var direction = window.direction;
            
            if (direction === undefined || direction === null) {
                direction = 0;
            }
            
            console.log('direction :>> ', direction);
          
            var value_x = window.pos_x;
            var value_y = window.pos_y;
          
            var topbot = window.topbot;
          
            var blur_num;
          
            blur_num = window.blur_num;
          
            var icon_name = window.foundWord_icon;
          
            const inputValue = document.querySelector("#message-input").value;
        
            if(/free/i.test(inputValue)) {
              imageEditor.startDrawingMode('FREE_DRAWING', {
                width: Math.min(500, extractNumber1(value_x) || 100), 
                color: 'rgba(255,0,0,0.5)'
              });
            }
            
            if(/line/i.test(inputValue)) {
              // Line drawing mode
              imageEditor.startDrawingMode('LINE_DRAWING', {
                width: Math.min(500, extractNumber1(value_x) || 100),
                color: 'rgba(255,0,0,0.5)',
                arrowType: { 
                  tail: 'chevron' 
                }
              });
            }
          }
        
          function stopDrawingMode(){
            imageEditor.stopDrawingMode();
            window.shared.imageEditorArray.push(imageEditor);
          }
        
          function Undo(){
            imageEditor.undo();
            window.shared.imageEditorArray.push(imageEditor);
          }
          
          function mousedown(){
            imageEditor.on('mousedown', function(event, originPointer) {
              console.log(event);
              console.log(originPointer);
              if (imageEditor.hasFilter('colorFilter')) {
                  imageEditor.applyFilter('colorFilter', {
                      x: parseInt(originPointer.x, 10),
                      y: parseInt(originPointer.y, 10)
                  });
               }
            })
            ;
            window.shared.imageEditorArray.push(imageEditor);
          }
        
          function objectActivated(){
            imageEditor.on('objectActivated', function(props) {
              console.log(props);
              console.log(props.type);
              console.log(props.id);
            });
            window.shared.imageEditorArray.push(imageEditor);
          }
        
          function Noise() {
            console.log("noise")
            
            var noise_num = window.noise_num;
            
            imageEditor.applyFilter('noise', {
              noise: Math.min(100, extractNumber1(noise_num) || 70)
            });
                      window.shared.imageEditorArray.push(imageEditor);
    
          }
          
          function textEditing(){  
            console.log("textediting")
            imageEditor.on('textEditing', function() {
              console.log('text editing part');
            });
            window.shared.imageEditorArray.push(imageEditor);
    
          }
          
          function undoStackChanged(){
            imageEditor.on('undoStackChanged', function(length) {
            console.log(length);
            });
                      window.shared.imageEditorArray.push(imageEditor);
    
          }
          
          function resizeEditor(){
            imageEditor.ui.resizeEditor({
            imageSize: {oldWidth: 100, oldHeight: 100, newWidth: 700, newHeight: 700},
            uiSize: {width: 1000, height: 1000}
          });
            window.shared.imageEditorArray.push(imageEditor);
            imageEditor.ui.resizeEditor();  
        }
        
          function Pixelate() {
            imageEditor.applyFilter('pixelate', {
            blocksize: 10 
          });
                      window.shared.imageEditorArray.push(imageEditor);
    
        }
          
          function crop(){
          setTimeout(function(){
          const shape_name = window.foundWord_icon;
          console.log('shape_name :>> ', shape_name);
          var fill_color = window.foundColors
          var stroke_color =  window.foundColors
          var stroke_Width = window.stroke_num;
          
          var direction = window.direction;
          
          if (direction === undefined || direction === null) {
              direction = 0;
          }
          
          var value_x = window.pos_x
          var value_y = window.pos_y
          
          console.log(value_x) 
          console.log(value_y) 
          
          var topbot = window.topbot
        
          var blur_num;
        
          blur_num = window.blur_num;
        
          var icon_name = window.foundWord_icon;
        
          var currentDimensions = imageEditor.getCanvasSize();
        
          imageEditor.crop({
              left: Math.min(500, extractNumber1(value_x) || 0),
              top: Math.min(500, extractNumber1(value_y) || 0),
              width:Math.min(500, extractNumber1(value_x)  || 300),
              height: Math.min(500, extractNumber1(value_y)  || 300)
          });
          window.shared.imageEditorArray.push(imageEditor);
            
             }, 2000);
        }  
    
          function Tint(){
            document.querySelector('.tie-tint').click();
          }
    
          function Multiply(){
            document.querySelector('.tie-multiply').click();
          }
    
          function  Blend(){
            document.querySelector('.tie-blend').click();
          }
    
          async function cartoonize() {  
          const myImage = imageEditor.toDataURL();
          console.log('myImage :>> ', myImage);
          let blob = await fetch(myImage).then(r => r.blob());
          console.log('blob :>> ', blob);
          let formData = new FormData();
    
          formData.append("file_cartoon", blob);
     
          fetch("http://127.0.0.1:8080/cartoonize", {  
          
          // fetch("https://shahhtejas.pythonanywhere.com/cartoonize", {
              method: "POST",
              body: formData
            })
            .then(response => {
              console.log("Received response", response);
              return response.blob();
            })
            .then(data => {
                console.log('Blob received', data);
                console.log('data :>> ', data);
                let imgBlob = new Blob([data], {type: 'image/png'});
                console.log('imgBlob :>> ', imgBlob);
                let url = URL.createObjectURL(imgBlob);
                console.log('url :>> ', url);
                let link = document.createElement('a');
                console.log('link before setting attributes :>> ', link);
                link.href = url;
                link.download = 'cartoonized_image.png';
                console.log('link after setting attributes :>> ', link);
                document.body.appendChild(link);
                console.log('link after appending to body :>> ', link);
                link.click();
                console.log("done and dusted ");
                document.body.removeChild(link);
                console.log('link after removing from body :>> ', link);
            })
            .catch(error => {
              console.log("Caught an error", error);
              console.error("Error:", error);
            });
          console.log("Fetch operation complete");
        } 
    //         function b(){
        
    //       function dataURLtoBlob(dataurl) {
    //         var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    //           bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    //         while (n--) {
    //           u8arr[n] = bstr.charCodeAt(n);
    //         }
    //         return new Blob([u8arr], { type: mime });
    //       }
      
      
    //       setTimeout(() => {
    //         const dataUrl = imageEditor.toDataURL();
    //         const formData = new FormData();
    //         const question = 'blood group?';
    
    //         const editedImageBlob = dataURLtoBlob(dataUrl);
    //         formData.append('image', editedImageBlob, 'editedImage.png');  // Change key to 'image'
    //         formData.append('question', question);
    
    //         fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/process', {
    //           method: 'POST',
    //           body: formData
    //         })
    //         .then(response => response.json())
    //         .then(data => {
    //           console.log(data);
    //           alert(data)
    //         })
    //         .catch(error => {
    //           console.error('Error:', error);
    //         });
    //       }, 200);
    //   }
          
        function dataURLtoBlob(dataurl) {
      var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    }
    
    function sendRequest(formData, retryCount = 1) {
      fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/process', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        alert(data);
      })
      .catch(error => {
        console.error('Error:', error);
        if (retryCount > 0) {
          console.log(`Retrying in 12 seconds... (${retryCount} retries left)`);
          setTimeout(() => {
            sendRequest(formData, retryCount - 1);
          }, 12000);
        }
      });
    }
    
    function b() {
      setTimeout(() => {
        const dataUrl = imageEditor.toDataURL();
        const formData = new FormData();
        const question = document.querySelector("#message-input").value;
        const editedImageBlob = dataURLtoBlob(dataUrl);
        formData.append('image', editedImageBlob, 'editedImage.png');  // Change key to 'image'
        formData.append('question', question);
    
        sendRequest(formData, 1);
    
      }, 200);
    }
      
          
    function ink(){
          
          setTimeout(() => {
            const dataUrl = imageEditor.toDataURL();
            const editedImage = new Image();
            editedImage.src = dataUrl;
            alert(dataUrl)
            const imageContainer = document.getElementById('imageid');
            imageContainer.appendChild(editedImage)      
           }, 1000);
          
        setTimeout(() => {
          const extractedNumber = extractNumber1(messageInput);
          const scaledNumber = scaleNumberBetween0And1(extractedNumber);
          alert(scaledNumber)
          var canvas_glfx = fx.canvas();
          // alert(canvas_glfx) 
          var image_glfx  = document.querySelector("#imageid > img")
          // image_glfx.style.display = "none";
          // alert(image_glfx)
          var texture_glfx  = canvas_glfx.texture(image_glfx);
          // alert(texture_glfx)
        canvas_glfx.draw(texture_glfx).ink(scaledNumber|| 0.95).update();
        // canvas_glfx.draw(texture_glfx).hueSaturation(20, 20).update();
    
        image_glfx.parentNode.insertBefore(canvas_glfx, image_glfx);
        image_glfx.parentNode.removeChild(image_glfx);
             console.log("DONE")
        // alert("DONE")
        const glfxCanvas = document.querySelector('canvas');
        const glfxDataUrl = canvas_glfx.toDataURL('image/png');
        
         imageEditor.loadImageFromURL(glfxDataUrl, "SampleImage2").then((sizeValue)=>{
                  imageEditor.ui.activeMenuEvent();
                  imageEditor.ui.resizeEditor({imageSize: sizeValue});
                  console.log("Image allegedly loaded.")
              }).catch(e=>{
                  console.error("Something went wrong:")
                  console.error(e)
              })
    
              window.onresize = function () {
                imageEditor.ui.resizeEditor();
              };
      }, 2000);
       }    
        
    function hue(){
          
          setTimeout(() => {
            const dataUrl = imageEditor.toDataURL();
            const editedImage = new Image();
            editedImage.src = dataUrl;
            alert(dataUrl)
            const imageContainer = document.getElementById('imageid');
            imageContainer.appendChild(editedImage)      
           }, 1000);
          
        setTimeout(() => {
          const extractedNumber = extractNumber1(messageInput);
          const [num1, num2] = extractTwoNumbers(messageInput);
          // alert(scaledNumber)
          var canvas_glfx = fx.canvas();
            // alert(canvas_glfx) 
          var image_glfx  = document.querySelector("#imageid > img")
    
          var texture_glfx  = canvas_glfx.texture(image_glfx);
    
          // canvas_glfx.draw(texture_glfx).hueSaturation(20, 20).update();
          canvas_glfx.draw(texture_glfx).hueSaturation(num1 || 20, num2 || 20).update();
    
          image_glfx.parentNode.insertBefore(canvas_glfx, image_glfx);
          image_glfx.parentNode.removeChild(image_glfx);
    
          const glfxCanvas = document.querySelector('canvas');
          const glfxDataUrl = canvas_glfx.toDataURL('image/png');
        
              imageEditor.loadImageFromURL(glfxDataUrl, "SampleImage2").then((sizeValue)=>{
                  imageEditor.ui.activeMenuEvent();
                  imageEditor.ui.resizeEditor({imageSize: sizeValue});
                  console.log("Image allegedly loaded.")
              }).catch(e=>{
                  console.error("Something went wrong:")
                  console.error(e)
              })
    
              window.onresize = function () {
                imageEditor.ui.resizeEditor();
              };
           }, 2000);
        }    
    
          function vibrance(){
          
          setTimeout(() => {
            const dataUrl = imageEditor.toDataURL();
            const editedImage = new Image();
            editedImage.src = dataUrl;
            alert(dataUrl)
            const imageContainer = document.getElementById('imageid');
            imageContainer.appendChild(editedImage)      
           }, 1000);
          
        setTimeout(() => {
         const extractedNumber = extractNumber1(messageInput);
          const scaledNumber = scaleNumberBetween0And1(extractedNumber);
          alert(scaledNumber)
        var canvas_glfx = fx.canvas();
            // alert(canvas_glfx) 
        var image_glfx  = document.querySelector("#imageid > img")
        // image_glfx.style.display = "none";
        
        // alert(image_glfx)
        var texture_glfx  = canvas_glfx.texture(image_glfx);
        // alert(texture_glfx)
        // canvas_glfx.draw(texture_glfx).ink(0.95).update();
          
        // canvas_glfx.draw(texture_glfx).hueSaturation(20, 20).update();
        canvas_glfx.draw(texture_glfx).vibrance(scaledNumber || 0.49).update();
    
        image_glfx.parentNode.insertBefore(canvas_glfx, image_glfx);
        image_glfx.parentNode.removeChild(image_glfx);
    
        const glfxCanvas = document.querySelector('canvas');
        const glfxDataUrl = canvas_glfx.toDataURL('image/png');
        
        imageEditor.loadImageFromURL(glfxDataUrl, "SampleImage2").then((sizeValue)=>{
                  imageEditor.ui.activeMenuEvent();
                  imageEditor.ui.resizeEditor({imageSize: sizeValue});
                  console.log("Image allegedly loaded.")
              }).catch(e=>{
                  console.error("Something went wrong:")
                  console.error(e)
              })
    
              window.onresize = function () {
                imageEditor.ui.resizeEditor();
              };
      }, 2000);
       }    
        
          function denoise(){
          
          setTimeout(() => {
            const dataUrl = imageEditor.toDataURL();
            const editedImage = new Image();
            editedImage.src = dataUrl;
            alert(dataUrl)
            const imageContainer = document.getElementById('imageid');
            imageContainer.appendChild(editedImage)      
           }, 1000);
          
        setTimeout(() => {
         const extractedNumber = extractNumber1(messageInput);
    
        var canvas_glfx = fx.canvas();
            // alert(canvas_glfx) 
        var image_glfx  = document.querySelector("#imageid > img")
        // image_glfx.style.display = "none";
        
        // alert(image_glfx)
        var texture_glfx  = canvas_glfx.texture(image_glfx);
        // alert(texture_glfx)
        // canvas_glfx.draw(texture_glfx).ink(0.95).update();
          
        canvas_glfx.draw(texture_glfx).denoise(extractedNumber || 48).update();
    //    canvas_glfx.draw(texture_glfx).unsharpMask(82, 2.14).update(); 
    //    canvas_glfx.draw(texture_glfx).vignette(0.44, 0.45).update(); 
    //    canvas_glfx.draw(texture_glfx).vignette(0.44, 0.45).update(); 
    //    canvas_glfx.draw(texture_glfx).triangleBlur(8).update();
    //    canvas_glfx.draw(texture_glfx).tiltShift(96, 359.25, 480, 287.4, 26, 271).update(); 
    //    canvas_glfx.draw(texture_glfx).lensBlur(11, -0.05, 0.45841).update(); 
    //    canvas_glfx.draw(texture_glfx).swirl(320, 239.5, 332, 0).update(); 
    //    canvas_glfx.draw(texture_glfx).bulgePinch(320, 239.5, 600, 0.34).update(); 
    //     canvas_glfx.draw(texture_glfx).perspective([175,156,496,55,161,279,504,330], [175,156,496,55.00000000000001,173,336,504,330]).update(); 
    //     canvas_glfx.draw(texture_glfx).ink(0.3).update();
    //      canvas_glfx.draw(texture_glfx).edgeWork(12).update();
    //       canvas_glfx.draw(texture_glfx).hexagonalPixelate(320, 239.5, 10).update();
    //        canvas_glfx.draw(texture_glfx).dotScreen(320, 239.5, 0.59, 4.87).update(); 
    //        canvas_glfx.draw(texture_glfx_glfx).colorHalftone(320, 239.5, 0.64, 3).update();
    
        image_glfx.parentNode.insertBefore(canvas_glfx, image_glfx);
        image_glfx.parentNode.removeChild(image_glfx);
        console.log("DONE")
        // alert("DONE")
        const glfxCanvas = document.querySelector('canvas');
        const glfxDataUrl = canvas_glfx.toDataURL('image/png');
        
         imageEditor.loadImageFromURL(glfxDataUrl, "SampleImage2").then((sizeValue)=>{
                  imageEditor.ui.activeMenuEvent();
                  imageEditor.ui.resizeEditor({imageSize: sizeValue});
                  console.log("Image allegedly loaded.")
              }).catch(e=>{
                  console.error("Something went wrong:")
                  console.error(e)
              })
    
              window.onresize = function () {
                imageEditor.ui.resizeEditor();
              };
      }, 2000);
       }    
    
          function unsharpMask(){
          setTimeout(() => {
            const dataUrl = imageEditor.toDataURL();
            const editedImage = new Image();
            editedImage.src = dataUrl;
            alert(dataUrl)
            const imageContainer = document.getElementById('imageid');
            imageContainer.appendChild(editedImage)      
          }, 1000);
          
        setTimeout(() => {
      const [num1, num2] = extractTwoNumbers(messageInput);
        var canvas_glfx = fx.canvas();
            // alert(canvas_glfx) 
        var image_glfx  = document.querySelector("#imageid > img")
        // image_glfx.style.display = "none";
        
        // alert(image_glfx)
        var texture_glfx  = canvas_glfx.texture(image_glfx);
        // alert(texture_glfx)
        // canvas_glfx.draw(texture_glfx).ink(0.95).update();
          
        // canvas_glfx.draw(texture_glfx).denoise(48).update();
       canvas_glfx.draw(texture_glfx).unsharpMask(num1 || 82,num2 || 2.14).update();   
    //    canvas_glfx.draw(texture_glfx).vignette(0.44, 0.45).update(); 
    //    canvas_glfx.draw(texture_glfx).vignette(0.44, 0.45).update(); 
    //    canvas_glfx.draw(texture_glfx).triangleBlur(8).update();       
    //    canvas_glfx.draw(texture_glfx).tiltShift(96, 359.25, 480, 287.4, 26, 271).update(); 
    //    canvas_glfx.draw(texture_glfx).lensBlur(11, -0.05, 0.45841).update(); 
    
    //    canvas_glfx.draw(texture_glfx).swirl(320, 239.5, 332, 0).update(); 
    //    canvas_glfx.draw(texture_glfx).bulgePinch(320, 239.5, 600, 0.34).update(); 
    //     canvas_glfx.draw(texture_glfx).perspective([175,156,496,55,161,279,504,330], [175,156,496,55.00000000000001,173,336,504,330]).update(); 
    //     canvas_glfx.draw(texture_glfx).ink(0.3).update();
    //      canvas_glfx.draw(texture_glfx).edgeWork(12).update();
    //       canvas_glfx.draw(texture_glfx).hexagonalPixelate(320, 239.5, 10).update();
    //        canvas_glfx.draw(texture_glfx).dotScreen(320, 239.5, 0.59, 4.87).update(); 
    //        canvas_glfx.draw(texture_glfx_glfx).colorHalftone(320, 239.5, 0.64, 3).update();
    
        image_glfx.parentNode.insertBefore(canvas_glfx, image_glfx);
        image_glfx.parentNode.removeChild(image_glfx);
        // console.log("DONE")
        // alert("DONE")
        const glfxCanvas = document.querySelector('canvas');
        const glfxDataUrl = canvas_glfx.toDataURL('image/png');
        
         imageEditor.loadImageFromURL(glfxDataUrl, "SampleImage2").then((sizeValue)=>{
                  imageEditor.ui.activeMenuEvent();
                  imageEditor.ui.resizeEditor({imageSize: sizeValue});
                  console.log("Image allegedly loaded.")
              }).catch(e=>{
                  console.error("Something went wrong:")
                  console.error(e)
              })
    
               window.onresize = function () {
                imageEditor.ui.resizeEditor();
               };
             }, 2000);
           }    
        
          function vignette(){
          
          setTimeout(() => {
            const dataUrl = imageEditor.toDataURL();
            const editedImage = new Image();
            editedImage.src = dataUrl;
            alert(dataUrl)
            const imageContainer = document.getElementById('imageid');
            imageContainer.appendChild(editedImage)      
           }, 1000);
          
          setTimeout(() => {
            
            const [num1, num2] = extractTwoNumbers(messageInput);
            var canvas_glfx = fx.canvas();
           
            var image_glfx  = document.querySelector("#imageid > img")
            var texture_glfx  = canvas_glfx.texture(image_glfx);
            // alert(texture_glfx)
            // canvas_glfx.draw(texture_glfx).ink(0.95).update();
            // canvas_glfx.draw(texture_glfx).denoise(48).update();
            
            canvas_glfx.draw(texture_glfx).vignette(0.44, 0.45).update(); 
          
            //    canvas_glfx.draw(texture_glfx).vignette(0.44, 0.45).update(); 
            //    canvas_glfx.draw(texture_glfx).triangleBlur(8).update();
            //    canvas_glfx.draw(texture_glfx).tiltShift(96, 359.25, 480, 287.4, 26, 271).update(); 
            //    canvas_glfx.draw(texture_glfx).lensBlur(11, -0.05, 0.45841).update(); 
            //    canvas_glfx.draw(texture_glfx).swirl(320, 239.5, 332, 0).update(); 
            //    canvas_glfx.draw(texture_glfx).bulgePinch(320, 239.5, 600, 0.34).update(); 
            //     canvas_glfx.draw(texture_glfx).perspective([175,156,496,55,161,279,504,330], [175,156,496,55.00000000000001,173,336,504,330]).update(); 
            //     canvas_glfx.draw(texture_glfx).ink(0.3).update();
            //      canvas_glfx.draw(texture_glfx).edgeWork(12).update();
            //       canvas_glfx.draw(texture_glfx).hexagonalPixelate(320, 239.5, 10).update();
            //        canvas_glfx.draw(texture_glfx).dotScreen(320, 239.5, 0.59, 4.87).update(); 
            //        canvas_glfx.draw(texture_glfx_glfx).colorHalftone(320, 239.5, 0.64, 3).update();
    
        image_glfx.parentNode.insertBefore(canvas_glfx, image_glfx);
        image_glfx.parentNode.removeChild(image_glfx);
             console.log("DONE")
    // alert("DONE")
        const glfxCanvas = document.querySelector('canvas');
        const glfxDataUrl = canvas_glfx.toDataURL('image/png');
        
         imageEditor.loadImageFromURL(glfxDataUrl, "SampleImage2").then((sizeValue)=>{
                  imageEditor.ui.activeMenuEvent();
                  imageEditor.ui.resizeEditor({imageSize: sizeValue});
                  console.log("Image allegedly loaded.")
              }).catch(e=>{
                  console.error("Something went wrong:")
                  console.error(e)
              })
    
              window.onresize = function () {
                imageEditor.ui.resizeEditor();
              };
      }, 2000);
       
        }    
        
      function triangleBlur(){
          
          setTimeout(() => {
            const dataUrl = imageEditor.toDataURL();
            const editedImage = new Image();
            editedImage.src = dataUrl;
            alert(dataUrl)
            const imageContainer = document.getElementById('imageid');
            imageContainer.appendChild(editedImage)      
           }, 1000);
          
    setTimeout(() => {
        const extractedNumber = extractNumber1(messageInput);
    
        var canvas_glfx = fx.canvas();
            // alert(canvas_glfx) 
        var image_glfx  = document.querySelector("#imageid > img")
        // image_glfx.style.display = "none";
        
        // alert(image_glfx)
        var texture_glfx  = canvas_glfx.texture(image_glfx);
        // alert(texture_glfx)
        // canvas_glfx.draw(texture_glfx).ink(0.95).update();
          
        // canvas_glfx.draw(texture_glfx).denoise(48).update();
       // canvas_glfx.draw(texture_glfx).unsharpMask(82, 2.14).update(); 
       // canvas_glfx.draw(texture_glfx).vignette(0.44, 0.45).update(); 
    //    canvas_glfx.draw(texture_glfx).vignette(0.44, 0.45).update(); 
          canvas_glfx.draw(texture_glfx).triangleBlur(8).update();
    //    canvas_glfx.draw(texture_glfx).tiltShift(96, 359.25, 480, 287.4, 26, 271).update(); 
    //    canvas_glfx.draw(texture_glfx).lensBlur(11, -0.05, 0.45841).update(); 
    
    //    canvas_glfx.draw(texture_glfx).swirl(320, 239.5, 332, 0).update(); 
    //    canvas_glfx.draw(texture_glfx).bulgePinch(320, 239.5, 600, 0.34).update(); 
    //     canvas_glfx.draw(texture_glfx).perspective([175,156,496,55,161,279,504,330], [175,156,496,55.00000000000001,173,336,504,330]).update(); 
    //     canvas_glfx.draw(texture_glfx).ink(0.3).update();
    //      canvas_glfx.draw(texture_glfx).edgeWork(12).update();
    //       canvas_glfx.draw(texture_glfx).hexagonalPixelate(320, 239.5, 10).update();
    //        canvas_glfx.draw(texture_glfx).dotScreen(320, 239.5, 0.59, 4.87).update(); 
    //        canvas_glfx.draw(texture_glfx_glfx).colorHalftone(320, 239.5, 0.64, 3).update();
    
        image_glfx.parentNode.insertBefore(canvas_glfx, image_glfx);
        image_glfx.parentNode.removeChild(image_glfx);
             console.log("DONE")
    // alert("DONE")
        const glfxCanvas = document.querySelector('canvas');
        const glfxDataUrl = canvas_glfx.toDataURL('image/png');
        
         imageEditor.loadImageFromURL(glfxDataUrl, "SampleImage2").then((sizeValue)=>{
                  imageEditor.ui.activeMenuEvent();
                  imageEditor.ui.resizeEditor({imageSize: sizeValue});
                  console.log("Image allegedly loaded.")
              }).catch(e=>{
                  console.error("Something went wrong:")
                  console.error(e)
              })
    
              window.onresize = function () {
                imageEditor.ui.resizeEditor();
              };
      }, 2000);
       
        }    
       
      function tiltShift_blur(){
          
          setTimeout(() => {
            const dataUrl = imageEditor.toDataURL();
            const editedImage = new Image();
            editedImage.src = dataUrl;
            alert(dataUrl)
            const imageContainer = document.getElementById('imageid');
            imageContainer.appendChild(editedImage)      
           }, 1000);
          
        setTimeout(() => {
        const extractsixnumber = extractUpToSixNumbers(messageInput)
        var canvas_glfx = fx.canvas();
          // alert(canvas_glfx) 
          var image_glfx  = document.querySelector("#imageid > img")
        // image_glfx.style.display = "none";
        // alert(image_glfx)
          var texture_glfx  = canvas_glfx.texture(image_glfx);
          // alert(texture_glfx)
          // canvas_glfx.draw(texture_glfx).ink(0.95).update();
          // canvas_glfx.draw(texture_glfx).denoise(48).update();
          // canvas_glfx.draw(texture_glfx).unsharpMask(82, 2.14).update(); 
          // canvas_glfx.draw(texture_glfx).vignette(0.44, 0.45).update(); 
          // canvas_glfx.draw(texture_glfx).vignette(0.44, 0.45).update(); 
          // canvas_glfx.draw(texture_glfx).triangleBlur(8).update();
          canvas_glfx.draw(texture_glfx).tiltShift(96, 359.25, 480, 287.4, 26, 271).update(); 
          
    //    canvas_glfx.draw(texture_glfx).lensBlur(11, -0.05, 0.45841).update(); 
    //    canvas_glfx.draw(texture_glfx).swirl(320, 239.5, 332, 0).update(); 
    //    canvas_glfx.draw(texture_glfx).bulgePinch(320, 239.5, 600, 0.34).update(); 
    //     canvas_glfx.draw(texture_glfx).perspective([175,156,496,55,161,279,504,330], [175,156,496,55.00000000000001,173,336,504,330]).update(); 
    //     canvas_glfx.draw(texture_glfx).ink(0.3).update();
    //      canvas_glfx.draw(texture_glfx).edgeWork(12).update();
    //       canvas_glfx.draw(texture_glfx).hexagonalPixelate(320, 239.5, 10).update();
    //        canvas_glfx.draw(texture_glfx).dotScreen(320, 239.5, 0.59, 4.87).update(); 
    //        canvas_glfx.draw(texture_glfx_glfx).colorHalftone(320, 239.5, 0.64, 3).update();
    
         image_glfx.parentNode.insertBefore(canvas_glfx, image_glfx);
         image_glfx.parentNode.removeChild(image_glfx);
    
         const glfxCanvas = document.querySelector('canvas');
         const glfxDataUrl = canvas_glfx.toDataURL('image/png');
        
              imageEditor.loadImageFromURL(glfxDataUrl, "SampleImage2").then((sizeValue)=>{
                  imageEditor.ui.activeMenuEvent();
                  imageEditor.ui.resizeEditor({imageSize: sizeValue});
                  console.log("Image allegedly loaded.")
              }).catch(e=>{
                  console.error("Something went wrong:")
                  console.error(e)
              })
    
              window.onresize = function () {
                imageEditor.ui.resizeEditor();
              };
            }, 2000);
       
        }    
       
      function lensBlur(){
          alert("lensblur will start")
          setTimeout(() => {
            const dataUrl = imageEditor.toDataURL();
            const editedImage = new Image();
            editedImage.src = dataUrl;
            alert(dataUrl)
            const imageContainer = document.getElementById('imageid');
            imageContainer.appendChild(editedImage)      
           }, 1000);
          
          setTimeout(() => {
          alert("alertfunction will again start")
        const extractsixnumber = extractUpToSixNumbers(messageInput)
             alert(extractsixnumber)
             alert(extractsixnumber[0])
             alert(extractsixnumber[1])
        
        var canvas_glfx = fx.canvas();
    
        var image_glfx  = document.querySelector("#imageid > img")
    
        var texture_glfx  = canvas_glfx.texture(image_glfx);
       
        canvas_glfx.draw(texture_glfx).lensBlur(extractsixnumber[0] || 11, extractsixnumber[1] || 0.05, extractsixnumber[2] || 0.45841).update(); 
    
        image_glfx.parentNode.insertBefore(canvas_glfx, image_glfx);
        image_glfx.parentNode.removeChild(image_glfx);
    
        const glfxCanvas = document.querySelector('canvas');
        const glfxDataUrl = canvas_glfx.toDataURL('image/png');
        
         imageEditor.loadImageFromURL(glfxDataUrl, "SampleImage2").then((sizeValue)=>{
                  imageEditor.ui.activeMenuEvent();
                  imageEditor.ui.resizeEditor({imageSize: sizeValue});
                  console.log("Image allegedly loaded.")
              }).catch(e=>{
                  console.error("Something went wrong:")
                  console.error(e)
              })
    
              window.onresize = function () {
                imageEditor.ui.resizeEditor();
              };
      }, 2000);
       
        }    
            
      function swirl(){
          
          setTimeout(() => {
            const dataUrl = imageEditor.toDataURL();
            const editedImage = new Image();
            editedImage.src = dataUrl;
            alert(dataUrl)
            const imageContainer = document.getElementById('imageid');
            imageContainer.appendChild(editedImage)      
           }, 1000);
          
          setTimeout(() => {
    
        var canvas_glfx = fx.canvas();
            // alert(canvas_glfx) 
        var image_glfx  = document.querySelector("#imageid > img")
        // image_glfx.style.display = "none";
        
        // alert(image_glfx)
        var texture_glfx  = canvas_glfx.texture(image_glfx);
    
       canvas_glfx.draw(texture_glfx).swirl(320, 239.5, 332, 0).update(); 
    
        image_glfx.parentNode.insertBefore(canvas_glfx, image_glfx);
        image_glfx.parentNode.removeChild(image_glfx);
             console.log("DONE")
         // alert("DONE")
        const glfxCanvas = document.querySelector('canvas');
        const glfxDataUrl = canvas_glfx.toDataURL('image/png');
        
         imageEditor.loadImageFromURL(glfxDataUrl, "SampleImage2").then((sizeValue)=>{
                  imageEditor.ui.activeMenuEvent();
                  imageEditor.ui.resizeEditor({imageSize: sizeValue});
                  console.log("Image allegedly loaded.")
              }).catch(e=>{
                  console.error("Something went wrong:")
                  console.error(e)
              })
    
              window.onresize = function () {
                imageEditor.ui.resizeEditor();
              };
      }, 2000);
       
        }    
        
       function bulgePinch(){
          
          setTimeout(() => {
            const dataUrl = imageEditor.toDataURL();
            const editedImage = new Image();
            editedImage.src = dataUrl;
            alert(dataUrl)
            const imageContainer = document.getElementById('imageid');
            imageContainer.appendChild(editedImage)      
           }, 1000);
          
        setTimeout(() => {
        const extractsixnumber = extractUpToSixNumbers(messageInput)
    
        var canvas_glfx = fx.canvas();
            // alert(canvas_glfx) 
        var image_glfx  = document.querySelector("#imageid > img")
        // image_glfx.style.display = "none";
        
        // alert(image_glfx)
        var texture_glfx  = canvas_glfx.texture(image_glfx);
          
        // alert(texture_glfx)
        // canvas_glfx.draw(texture_glfx).ink(0.95).update();
          
       canvas_glfx.draw(texture_glfx).bulgePinch(extractsixnumber[0] || 320,extractsixnumber[1] || 239.5, extractsixnumber[2] || 600,extractsixnumber[3] || 0.34).update(); 
    
        image_glfx.parentNode.insertBefore(canvas_glfx, image_glfx);
        image_glfx.parentNode.removeChild(image_glfx);
             console.log("DONE")
        // alert("DONE")
        const glfxCanvas = document.querySelector('canvas');
        const glfxDataUrl = canvas_glfx.toDataURL('image/png');
        
        imageEditor.loadImageFromURL(glfxDataUrl, "SampleImage2").then((sizeValue)=>{
                  imageEditor.ui.activeMenuEvent();
                  imageEditor.ui.resizeEditor({imageSize: sizeValue});
                  console.log("Image allegedly loaded.")
              }).catch(e=>{
                  console.error("Something went wrong:")
                  console.error(e)
              })
    
              window.onresize = function () {
                imageEditor.ui.resizeEditor();
              };
            }, 2000);
        }    
          
        function perspective(){
          setTimeout(() => {
            const dataUrl = imageEditor.toDataURL();
            const editedImage = new Image();
            editedImage.src = dataUrl;
            alert(dataUrl)
            const imageContainer = document.getElementById('imageid');
            imageContainer.appendChild(editedImage)      
           }, 1000);
          
        setTimeout(() => {
          const extracttwelvenumber = extractUpToTwelveNumbers(messageInput)
    
          var canvas_glfx = fx.canvas();
            // alert(canvas_glfx) 
          var image_glfx  = document.querySelector("#imageid > img")
            // image_glfx.style.display = "none";
        
            // alert(image_glfx)
          var texture_glfx  = canvas_glfx.texture(image_glfx);
        // alert(texture_glfx)
        // canvas_glfx.draw(texture_glfx).ink(0.95).update();
          
        // canvas_glfx.draw(texture_glfx).denoise(48).update();
       // canvas_glfx.draw(texture_glfx).unsharpMask(82, 2.14).update(); 
       // canvas_glfx.draw(texture_glfx).vignette(0.44, 0.45).update(); 
    //    canvas_glfx.draw(texture_glfx).vignette(0.44, 0.45).update(); 
       // canvas_glfx.draw(texture_glfx).triangleBlur(8).update();
       // canvas_glfx.draw(texture_glfx).tiltShift(96, 359.25, 480, 287.4, 26, 271).update(); 
       // canvas_glfx.draw(texture_glfx).lensBlur(11, -0.05, 0.45841).update(); 
    
       // canvas_glfx.draw(texture_glfx).swirl(320, 239.5, 332, 0).update(); 
       // canvas_glfx.draw(texture_glfx).bulgePinch(320, 239.5, 600, 0.34).update(); 
        canvas_glfx.draw(texture_glfx).perspective([175,156,496,55,161,279,504,330], [175,156,496,55,173,336,504,330]).update(); 
    
          //     canvas_glfx.draw(texture_glfx).ink(0.3).update();
    //      canvas_glfx.draw(texture_glfx).edgeWork(12).update();
    //       canvas_glfx.draw(texture_glfx).hexagonalPixelate(320, 239.5, 10).update();
    //        canvas_glfx.draw(texture_glfx).dotScreen(320, 239.5, 0.59, 4.87).update(); 
    //        canvas_glfx.draw(texture_glfx_glfx).colorHalftone(320, 239.5, 0.64, 3).update();
    
        image_glfx.parentNode.insertBefore(canvas_glfx, image_glfx);
        image_glfx.parentNode.removeChild(image_glfx);
             console.log("DONE")
    // alert("DONE")
        const glfxCanvas = document.querySelector('canvas');
        const glfxDataUrl = canvas_glfx.toDataURL('image/png');
        
         imageEditor.loadImageFromURL(glfxDataUrl, "SampleImage2").then((sizeValue)=>{
                  imageEditor.ui.activeMenuEvent();
                  imageEditor.ui.resizeEditor({imageSize: sizeValue});
                  console.log("Image allegedly loaded.")
              }).catch(e=>{
                  console.error("Something went wrong:")
                  console.error(e)
              })
    
              window.onresize = function () {
                imageEditor.ui.resizeEditor();
              };
      }, 2000);
       
        }    
           
        function edgeWork(){
          
          setTimeout(() => {
            const dataUrl = imageEditor.toDataURL();
            const editedImage = new Image();
            editedImage.src = dataUrl;
            alert(dataUrl)
            const imageContainer = document.getElementById('imageid');
            imageContainer.appendChild(editedImage)      
           }, 1000);
          
          setTimeout(() => {
        const extractsixnumber = extractUpToSixNumbers(messageInput)
    
        var canvas_glfx = fx.canvas();
        // alert(canvas_glfx) 
        var image_glfx  = document.querySelector("#imageid > img")
        // image_glfx.style.display = "none";
        
        // alert(image_glfx)
        var texture_glfx  = canvas_glfx.texture(image_glfx);
        // alert(texture_glfx)
        // canvas_glfx.draw(texture_glfx).ink(0.95).update();
          
        // canvas_glfx.draw(texture_glfx).denoise(48).update();
       // canvas_glfx.draw(texture_glfx).unsharpMask(82, 2.14).update(); 
       // canvas_glfx.draw(texture_glfx).vignette(0.44, 0.45).update(); 
    //    canvas_glfx.draw(texture_glfx).vignette(0.44, 0.45).update(); 
       // canvas_glfx.draw(texture_glfx).triangleBlur(8).update();
       // canvas_glfx.draw(texture_glfx).tiltShift(96, 359.25, 480, 287.4, 26, 271).update(); 
       // canvas_glfx.draw(texture_glfx).lensBlur(11, -0.05, 0.45841).update(); 
    
       // canvas_glfx.draw(texture_glfx).swirl(320, 239.5, 332, 0).update(); 
       // canvas_glfx.draw(texture_glfx).bulgePinch(320, 239.5, 600, 0.34).update(); 
        // canvas_glfx.draw(texture_glfx).perspective([175,156,496,55,161,279,504,330], [175,156,496,55.00000000000001,173,336,504,330]).update(); 
    //     canvas_glfx.draw(texture_glfx).ink(0.3).update();
         canvas_glfx.draw(texture_glfx).edgeWork(12).update();
    //       canvas_glfx.draw(texture_glfx).hexagonalPixelate(320, 239.5, 10).update();
    //        canvas_glfx.draw(texture_glfx).dotScreen(320, 239.5, 0.59, 4.87).update(); 
    //        canvas_glfx.draw(texture_glfx_glfx).colorHalftone(320, 239.5, 0.64, 3).update();
    
        image_glfx.parentNode.insertBefore(canvas_glfx, image_glfx);
        image_glfx.parentNode.removeChild(image_glfx);
             console.log("DONE")
    // alert("DONE")
        const glfxCanvas = document.querySelector('canvas');
        const glfxDataUrl = canvas_glfx.toDataURL('image/png');
        
         imageEditor.loadImageFromURL(glfxDataUrl, "SampleImage2").then((sizeValue)=>{
                  imageEditor.ui.activeMenuEvent();
                  imageEditor.ui.resizeEditor({imageSize: sizeValue});
                  console.log("Image allegedly loaded.")
              }).catch(e=>{
                  console.error("Something went wrong:")
                  console.error(e)
              })
    
              window.onresize = function () {
                imageEditor.ui.resizeEditor();
              };
      }, 2000);
       
        }    
            
        function edgeWork(){
          
          setTimeout(() => {
            const dataUrl = imageEditor.toDataURL();
            const editedImage = new Image();
            editedImage.src = dataUrl;
            alert(dataUrl)
            const imageContainer = document.getElementById('imageid');
            imageContainer.appendChild(editedImage)      
           }, 1000);
          
        setTimeout(() => {
    
        var canvas_glfx = fx.canvas();
            // alert(canvas_glfx) 
        var image_glfx  = document.querySelector("#imageid > img")
        // image_glfx.style.display = "none";
        
        // alert(image_glfx)
        var texture_glfx  = canvas_glfx.texture(image_glfx);
        // alert(texture_glfx)
        // canvas_glfx.draw(texture_glfx).ink(0.95).update();
          
        // canvas_glfx.draw(texture_glfx).denoise(48).update();
       // canvas_glfx.draw(texture_glfx).unsharpMask(82, 2.14).update(); 
       // canvas_glfx.draw(texture_glfx).vignette(0.44, 0.45).update(); 
    //    canvas_glfx.draw(texture_glfx).vignette(0.44, 0.45).update(); 
       // canvas_glfx.draw(texture_glfx).triangleBlur(8).update();
       // canvas_glfx.draw(texture_glfx).tiltShift(96, 359.25, 480, 287.4, 26, 271).update(); 
       // canvas_glfx.draw(texture_glfx).lensBlur(11, -0.05, 0.45841).update(); 
    
       // canvas_glfx.draw(texture_glfx).swirl(320, 239.5, 332, 0).update(); 
       // canvas_glfx.draw(texture_glfx).bulgePinch(320, 239.5, 600, 0.34).update(); 
        // canvas_glfx.draw(texture_glfx).perspective([175,156,496,55,161,279,504,330], [175,156,496,55.00000000000001,173,336,504,330]).update(); 
    //     canvas_glfx.draw(texture_glfx).ink(0.3).update();
         // canvas_glfx.draw(texture_glfx).edgeWork(12).update();
          canvas_glfx.draw(texture_glfx).hexagonalPixelate(320, 239.5, 10).update();
    //        canvas_glfx.draw(texture_glfx).dotScreen(320, 239.5, 0.59, 4.87).update(); 
    //        canvas_glfx.draw(texture_glfx_glfx).colorHalftone(320, 239.5, 0.64, 3).update();
    
        image_glfx.parentNode.insertBefore(canvas_glfx, image_glfx);
        image_glfx.parentNode.removeChild(image_glfx);
             console.log("DONE")
    // alert("DONE")
        const glfxCanvas = document.querySelector('canvas');
        const glfxDataUrl = canvas_glfx.toDataURL('image/png');
        
         imageEditor.loadImageFromURL(glfxDataUrl, "SampleImage2").then((sizeValue)=>{
                  imageEditor.ui.activeMenuEvent();
                  imageEditor.ui.resizeEditor({imageSize: sizeValue});
                  console.log("Image allegedly loaded.")
              }).catch(e=>{
                  console.error("Something went wrong:")
                  console.error(e)
              })
    
              window.onresize = function () {
                imageEditor.ui.resizeEditor();
              };
      }, 2000);
       
        }    
        
        function hexagonalPixelate(){
          
          setTimeout(() => {
            const dataUrl = imageEditor.toDataURL();
            const editedImage = new Image();
            editedImage.src = dataUrl;
            alert(dataUrl)
            const imageContainer = document.getElementById('imageid');
            imageContainer.appendChild(editedImage)      
           }, 1000);
          
        setTimeout(() => {
        const extractsixnumber = extractUpToSixNumbers(messageInput);
        var canvas_glfx = fx.canvas();
            // alert(canvas_glfx) 
        var image_glfx  = document.querySelector("#imageid > img")
       
        var texture_glfx  = canvas_glfx.texture(image_glfx);

          canvas_glfx.draw(texture_glfx).hexagonalPixelate(extractsixnumber[0] || 320,extractsixnumber[1] || 239.5,extractsixnumber[2] || 10).update();
    
    //        canvas_glfx.draw(texture_glfx).dotScreen(320, 239.5, 0.59, 4.87).update(); 
    //        canvas_glfx.draw(texture_glfx_glfx).colorHalftone(320, 239.5, 0.64, 3).update();
    
        image_glfx.parentNode.insertBefore(canvas_glfx, image_glfx);
        image_glfx.parentNode.removeChild(image_glfx);
        console.log("DONE")
    
        const glfxCanvas = document.querySelector('canvas');
        const glfxDataUrl = canvas_glfx.toDataURL('image/png');
        
         imageEditor.loadImageFromURL(glfxDataUrl, "SampleImage2").then((sizeValue)=>{
                  imageEditor.ui.activeMenuEvent();
                  imageEditor.ui.resizeEditor({imageSize: sizeValue});
                  console.log("Image allegedly loaded.")
              }).catch(e=>{
                  console.error("Something went wrong:")
                  console.error(e)
              })
    
              window.onresize = function () {
                imageEditor.ui.resizeEditor();
              };
      }, 2000);
       
        }    
    
        function dotScreen(){
          
          setTimeout(() => {
            const dataUrl = imageEditor.toDataURL();
            const editedImage = new Image();
            editedImage.src = dataUrl;
            alert(dataUrl)
            const imageContainer = document.getElementById('imageid');
            imageContainer.appendChild(editedImage)      
           }, 1000);
          
        setTimeout(() => {
        const extractsixnumber = extractUpToSixNumbers(messageInput)
        var canvas_glfx = fx.canvas();
    
        var image_glfx  = document.querySelector("#imageid > img")
    
        var texture_glfx  = canvas_glfx.texture(image_glfx);
    
        canvas_glfx.draw(texture_glfx).dotScreen(extractsixnumber[0] || 320,extractsixnumber[1] || 239.5, extractsixnumber[2] || 0.59,extractsixnumber[3] || 4.87).update(); 
    //  canvas_glfx.draw(texture_glfx_glfx).colorHalftone(320, 239.5, 0.64, 3).update();
    
        image_glfx.parentNode.insertBefore(canvas_glfx, image_glfx);
        image_glfx.parentNode.removeChild(image_glfx);
             console.log("DONE")
    
        const glfxCanvas = document.querySelector('canvas');
        const glfxDataUrl = canvas_glfx.toDataURL('image/png');
        
         imageEditor.loadImageFromURL(glfxDataUrl, "SampleImage2").then((sizeValue)=>{
                  imageEditor.ui.activeMenuEvent();
                  imageEditor.ui.resizeEditor({imageSize: sizeValue});
                  console.log("Image allegedly loaded.")
              }).catch(e=>{
                  console.error("Something went wrong:")
                  console.error(e)
              })
    
              window.onresize = function () {
                imageEditor.ui.resizeEditor();
              };
      }, 2000);
       
        }    
        
        function colorHalftone(){
          
          setTimeout(() => {
            const dataUrl = imageEditor.toDataURL();
            const editedImage = new Image();
            editedImage.src = dataUrl;
            alert(dataUrl)
            const imageContainer = document.getElementById('imageid');
            imageContainer.appendChild(editedImage)      
           }, 1000);
          
        setTimeout(() => {
          const extractsixnumber = extractUpToSixNumbers(messageInput)
          var canvas_glfx = fx.canvas();
          var image_glfx  = document.querySelector("#imageid > img")
    
          var texture_glfx  = canvas_glfx.texture(image_glfx);
        
          canvas_glfx.draw(texture_glfx).colorHalftone(extractsixnumber[0] || 320, extractsixnumber[1] || 239.5,extractsixnumber[2] || 0.64,extractsixnumber[3] || 3).update();
          image_glfx.parentNode.insertBefore(canvas_glfx, image_glfx);
          image_glfx.parentNode.removeChild(image_glfx);
    
          const glfxCanvas = document.querySelector('canvas');
          const glfxDataUrl = canvas_glfx.toDataURL('image/png');
        
          imageEditor.loadImageFromURL(glfxDataUrl, "SampleImage2").then((sizeValue)=>{
                  imageEditor.ui.activeMenuEvent();
                  imageEditor.ui.resizeEditor({imageSize: sizeValue});
                  console.log("Image allegedly loaded.")
              }).catch(e=>{
                  console.error("Something went wrong:")
                  console.error(e)
              })
    
        window.onresize = function () {
                imageEditor.ui.resizeEditor();
              };
      
        }, 2000);
       
        }    
        
        const imagePrompts = [
        "add",
        "include",
        "insert",
        "picture",
        "photo",
        "image",
        "graphic",
        "visual",
        "imagery",
        "depiction",
        "figure",
        "rendering",
        "portrait",
        "illustration",
        "pictorial",
        "implementation",
        "incorporation",
        "integration",
        "embed",
        "imbue",
        "interpose",
        "interject",
        "snapshot",
        "visualization",
        "file",
        "attach",
        "introduction",
        "painting",
        "drawing",
        "artwork",
        "icon",
        "sketch",
        "diagram",
        "symbol",
        "sticker",
        "emoji",
        "meme",
        "template",
        "overlay",
        "layer",
        "import",
        "paste",
        "merge",
        "blend",
        "composite",
        "montage",
        "collage",
        "splice",
        "superimpose",
        "imprint",
        "engraving",
        "trace",
        "outline",
        "represent",
        "capture",
        "shot",
        "view",
        "scene",
        "still",
        "frame",
        "print",
        "negative",
        "slide",
        "transparency",
        "jpeg",
        "tiff",
        "gif",
        "bmp",
        "png",
        "infographic",
        "chart",
        "graph",
        "insignia",
        "emblem",
        "logo",
        "badge",
        "stamp",
        "watermark",
        "exhibit",
        "display",
        "inscription",
        "id",
        "tag",
        "caption",
        "landscape",
        "scenery",
        "panorama",
        "seascape",
        "cityscape",
        "mural",
        "graffiti",
        "inscription",
        "imagery",
        "graphics",
        "visuals",
        "photographs",
        "pictures",
        "imgs",
        "shots",
        "snaps",
        "captures",
        "depictions",
        "illustrations",
        "artworks",
        "portraits",
        "figures",
        "renderings",
        "photos",
        "pics"
        ];


    function caption() {
      const imageData = getImageDataFromEditor();
      if (imageData) {
        fetchImageCaptionResult(imageData);
      } else {
        displayError("No image loaded in the editor.");
      }
    }
    
    function drawBoundingBoxes(predictions) {
      const canvas = imageEditor._graphics.getCanvas();
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    
      const imageData = imageEditor.toDataURL();
      const img = new Image();
      img.src = imageData;
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
    
        if (Array.isArray(predictions)) {
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'red';
    
          predictions.forEach(({ label, box }) => {
            const { xmin, ymin, xmax, ymax } = box;
            ctx.beginPath();
            ctx.rect(xmin, ymin, xmax - xmin, ymax - ymin);
            ctx.stroke();
            ctx.fillStyle = 'white';
            ctx.fillText(label, xmin, ymin - 10);
          });
        }
      };
    }
    
    function getImageDataFromEditor() {
      const canvas = imageEditor._graphics.getCanvas();
      if (canvas) {
        const dataURL = canvas.toDataURL("image/png");
        const blobBin = atob(dataURL.split(',')[1]);
        const array = [];
        for (let i = 0; i < blobBin.length; i++) {
          array.push(blobBin.charCodeAt(i));
        }
        const blob = new Blob([new Uint8Array(array)], { type: 'image/png' });
        const formData = new FormData();
        formData.append('file', blob, 'image.png');
        return formData;
      }
      return null;
    }
    
    async function fetchImageCaptionResult(imageData) {
      try {
        const caption = await queryImageCaptioning(imageData);
        displayImageCaptionResult(caption);
      } catch (error) {
        console.log(error);
      }
    }
    
    async function fetchObjectDetectionResult(imageData) {
      try {
        const predictions = await queryObjectDetection(imageData);
        displayObjectDetectionResult(predictions);
        drawBoundingBoxes(predictions);
      } catch (error) {
        console.log(error);
      }
    }
    
    function displayImageCaptionResult(caption) {
      let captionResultDiv = document.getElementById("caption-result");
    
      if (!captionResultDiv) {
        captionResultDiv = document.createElement("div");
        captionResultDiv.id = "caption-result";
        document.body.appendChild(captionResultDiv);
      }
    
      captionResultDiv.textContent = "";
    
      if (caption) {
        captionResultDiv.textContent = caption;
        console.log(caption);
      } else {
        captionResultDiv.textContent = "No caption available.";
      }
    }
    
    function displayObjectDetectionResult(predictions) {
      let resultDiv = document.getElementById("result");
    
      if (!resultDiv) {
        resultDiv = document.createElement("div");
        resultDiv.id = "result";
        document.body.appendChild(resultDiv);
      }
    
      resultDiv.innerHTML = "";
    
      if (!Array.isArray(predictions)) {
        resultDiv.textContent = "Unexpected response format.";
        return;
      }
    
      predictions.forEach(({ label, box }) => {
        const { xmin, ymin, xmax, ymax } = box;
        console.log(box);
        const boxDiv = document.createElement("div");
        boxDiv.textContent = `${label}: (${xmin}, ${ymin}) (${xmax}, ${ymax})`;
        resultDiv.appendChild(boxDiv);
      });
      console.log(predictions);
    }
    
    function displayError(errorMessage) {
      let errorDiv = document.getElementById("error");
    
      if (!errorDiv) {
        errorDiv = document.createElement("div");
        errorDiv.id = "error";
        document.body.appendChild(errorDiv);
      }
      errorDiv.textContent = "";
    
      if (errorMessage) {
        errorDiv.textContent = errorMessage;
        console.log(errorMessage);
      }
    }
    
    function detect() {
      const imageData = getImageDataFromEditor();
      if (imageData) {
        fetchObjectDetectionResult(imageData);
      } else {
        displayError("No image loaded in the editor.");
      }
    }
    

        // dialog.innerHTML = `
        //     <div class="flex items-center justify-between p-4 border-b border-gray-200">
        //         <h3 class="text-xl font-semibold text-gray-900">Console Output</h3>
        //         <button data-dialog-close="true" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center">
        //             <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
        //         </button>
        //     </div>
        //     <div id="modal-content" class="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
        //         <div id="loading-indicator" class="flex justify-center items-center">
        //             <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        //         </div>
        //     </div>
        // `;

    async function queryObjectDetection(imageData) {
      try {
        const response = await fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/detect', {
          method: 'POST',
          body: imageData
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.json();
        return data.text;
      } catch (error) {
        console.error('Error generating object detection:', error);
        throw error;
      }
    }
    
    async function queryImageCaptioning(imageData) {
      try {
        const response = await fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/caption', {
          method: 'POST',
          body: imageData
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.json();
        return data.text;
      } catch (error) {
        console.error('Error generating image caption:', error);
        throw error;
      }
    }
    
    async function classifyText(payload) {
      try {
        console.log(payload)
        const response = await fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/classify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error classifying text:', error);
        throw error;
      }
    }
    
    function classify(textInput) {
      const payload = {
        inputs: textInput,
        parameters: {
          candidate_labels: ["top", "bottom", "left", "right"]
        }
      };fetchClassificationResult(payload)
        .then(data => displayClassificationResult(data))
        .catch(error => displayError(error.message));
    
      const payload_dim = {
        inputs: textInput,
        parameters: {
          candidate_labels: ["height", "width"]
        }
      };
    
      fetchClassificationResult(payload_dim)
        .then(data_dim => {
          let resultDiv = document.getElementById("result");
          if (resultDiv) {
            resultDiv.textContent += "\n\n" + JSON.stringify(data_dim, null, 2);
          }
        })
        .catch(error => displayError(error.message));
    }
        
    async function classify(payload) {
      try {
        const response = await fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/classify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error classifying text:', error);
        throw error;
      }
    }
    
    function displayClassificationResult(classificationResult) {
      let resultDiv = document.getElementById("result");
    
      if (!resultDiv) {
        resultDiv = document.createElement("div");
        resultDiv.id = "result";
        document.body.appendChild(resultDiv);
      }
    
      resultDiv.innerHTML = "";
    
      if (classificationResult && classificationResult.answer) {
        resultDiv.textContent = `Predicted classification: ${classificationResult.answer}`;
      } else {
        resultDiv.textContent = "Unable to classify the text.";
      }
    }
    
    async function fetchClassificationResult(payload) {
      try {
        const response = await fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/classify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error classifying text:', error);
        throw error;
      }
    }
    
    function displayClassificationResult(data) {
      let resultDiv = document.getElementById("result");
    
      if (!resultDiv) {
        resultDiv = document.createElement("div");
        resultDiv.id = "result";
        document.body.appendChild(resultDiv);
      }
    
      resultDiv.innerHTML = "";
    
      if (data.labels && data.scores) {
        const labels = data.labels;
        const scores = data.scores;
        const topIndex = labels.indexOf('top');
        const bottomIndex = labels.indexOf('bottom');
        const leftIndex = labels.indexOf('left');
        const rightIndex = labels.indexOf('right');
        const topBottom = Math.max(scores[topIndex], scores[bottomIndex]);
        const leftRight = Math.max(scores[leftIndex], scores[rightIndex]);
        const greaterTopBottom = topBottom === scores[topIndex] ? 'top' : 'bottom';
        const greaterLeftRight = leftRight === scores[leftIndex] ? 'left' : 'right';
        greaterTopBottomValue = greaterTopBottom;
        greaterLeftRightValue = greaterLeftRight;
        console.log(`Greater value for top/bottom: ${topBottom} (${greaterTopBottom})`);
        console.log(`Greater value for left/right: ${leftRight} (${greaterLeftRight})`);
        resultDiv.textContent = JSON.stringify(data, null, 2);
      } else {
        resultDiv.textContent = "Labels and scores not found in the response data.";
      }
    }
    
    let verticalLabels = [];
    let horizontalLabels = [];
    
    async function classify() {
     var  textInput = document.querySelector("#message-input").value
      const payload = {
        inputs: textInput,
        parameters: {
          candidate_labels: ["top", "bottom", "left", "right"]
        }
      };
    
      try {
        const response = await fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/classify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
    
        const data = await response.json();
        console.log(data);
    
        const topIndex = data.labels.indexOf('top');
        const bottomIndex = data.labels.indexOf('bottom');
        const leftIndex = data.labels.indexOf('left');
        const rightIndex = data.labels.indexOf('right');
    
        const topScore = data.scores[topIndex];
        const bottomScore = data.scores[bottomIndex];
        const leftScore = data.scores[leftIndex];
        const rightScore = data.scores[rightIndex];
    
        const maxVerticalScore = Math.max(topScore, bottomScore);
        const maxHorizontalScore = Math.max(leftScore, rightScore);
    
        const verticalLabel = maxVerticalScore === topScore ? 'top' : 'bottom';
        const horizontalLabel = maxHorizontalScore === leftScore ? 'left' : 'right';
    
        console.log(`The vertical label with the highest score is: ${verticalLabel}`);
        console.log(`The horizoal label with the highest score is: ${horizontalLabel}`);
        textInput  = document.querySelector("#message-input");
        alert(textInput.value)
        console.log(textInput.value)
        verticalLabels.push(verticalLabel);
        horizontalLabels.push(horizontalLabel);
        
       console.log(verticalLabels[verticalLabels.length - 1])
        console.log(horizontalLabels[horizontalLabels.length - 1])
            const directionPayload = {
                inputs: {
                    question: verticalLabels[verticalLabels.length - 1] ,
                    context: textInput.value
                }
            };
    
            try {
              const directionResponse = await fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/direction', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(directionPayload)
              });
    
              if (!directionResponse.ok) {
                throw new Error(`HTTP error ${directionResponse.status}`);
              }
    
              const directionData = await directionResponse.json();
              console.log('Direction data:', directionData);
            } catch (error) {
              console.error('Error:', error);
              throw error;
            }
            const directionPayload1 = {
                inputs: {
                    question:  horizontalLabels[horizontalLabels.length - 1]    ,
                    context: textInput.value
                }
            };
    
            try {
              const directionResponse1 = await fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/direction', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(directionPayload1)
              });
    
              if (!directionResponse1.ok) {
                throw new Error(`HTTP error ${directionResponse1.status}`);
              }
    
              const directionData1 = await directionResponse1.json();
              console.log('Direction data:', directionData1);
            } catch (error) {
              console.error('Error:', error);
              throw error;
            }
        return data;
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    }
          
    function c() {
               const array = window.shared.imageEditorArray;
      let imageEditor = array[0];
    
    window.onresize = function () {
      imageEditor.ui.resizeEditor();
    };
    
    function dataURLtoBlob(dataurl) {
      var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    }
    
    setTimeout(() => {
      const dataUrl = imageEditor.toDataURL();
      const formData = new FormData();
      const candidateLabels = 'men,women'; // Replace with actual labels
    
      const editedImageBlob = dataURLtoBlob(dataUrl);
      formData.append('image_file', editedImageBlob, 'editedImage.png');  // Keep the key as 'image_file'
      formData.append('candidate_labels', candidateLabels);
    
      fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/laionclip', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        console.log(data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }, 200);  
    }
        
    function d() {
               const array = window.shared.imageEditorArray;
      let imageEditor = array[0];
    
    window.onresize = function () {
      imageEditor.ui.resizeEditor();
    };
    
    function dataURLtoBlob(dataurl) {
      var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    }
    
    setTimeout(() => {
      const dataUrl = imageEditor.toDataURL();
      const formData = new FormData();
      const candidateLabels = 'men,women'; // Replace with actual labels
    
      const editedImageBlob = dataURLtoBlob(dataUrl);
      formData.append('image_file', editedImageBlob, 'editedImage.png');  // Keep the key as 'image_file'
      formData.append('candidate_labels', candidateLabels);
    
      fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/openaiclip', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        console.log(data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }, 200);
    
      
      
    }
      
    function face(){
       const array = window.shared.imageEditorArray;
        imageEditor = array[array.length - 1];
          
          let segmentationData; 
          let maskCanvases = []; 
          const labelToResult = {};
          const labelToColor = {};
    
          // var imageEditor = new tui.ImageEditor('#tui-image-editor-container', {
          // includeUI: {
          //   loadImage: {
          //       path: 'imageface1.jpg',
          //       name: 'SampleImage',
          //     },
          //     // theme: blackTheme,
          //     initMenu: 'filter',
          //     menuBarPosition: 'bottom',
          //   },
          //   cssMaxWidth: 700,
          //   cssMaxHeight: 500,
          //   usageStatistics: false,
          // });
          
          window.onresize = function () {
            imageEditor.ui.resizeEditor();
          };  
    
          function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
        }
    
      async function sendImageToServer(originalImageData) {
      var blob = dataURLtoBlob(originalImageData);
      var formData = new FormData();
      formData.append('image_file', blob, 'image123.jpg');
    // formData.append('file', blob, 'image123.jpg');
    
      try {
        const response = await fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/faces', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        console.log('data :>> ', data);
        if (data.error && data.error.includes("Model is currently loading")) {
        const timeout = data.estimated_time * 1000; 
        await new Promise(resolve => setTimeout(resolve, timeout));
        console.log("Model loaded, retrying request...");
    
        const retryResponse = await fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/faces', {
          method: 'POST',
          body: formData
        });
        const retryData = await retryResponse.json();
        console.log(retryData);
    
      } else {
        console.log(data);
    
      }
    
        if (response.ok) {
          console.log(response.ok);
          const colorPalette = [
            'rgba(0, 153, 153, 0.5)', 
            'rgba(255, 255, 0, 0.5)',
            'rgba(0, 0, 255, 0.5)', 
            'rgba(153, 0, 153, 0.5)', 
            'rgba(255, 255, 0, 0.5)', 
            'rgba(255, 192, 203, 0.5)', 
            'rgba(153, 0, 0, 0.5)' 
          ];
          const colorToLabel = {
      'rgba(0, 153, 153, 0.5)': 'Label1', 
      'rgba(255, 255, 0, 0.5)': 'Label2',
      'rgba(0, 0, 255, 0.5)': 'Label3', 
      'rgba(153, 0, 153, 0.5)': 'Label4', 
      'rgba(255, 255, 0, 0.5)': 'Label5', 
      'rgba(255, 192, 203, 0.5)': 'Label6', 
      'rgba(153, 0, 0, 0.5)': 'Label7'
    };
          segmentationData = data;
      Object.entries(segmentationData).forEach(([label, result], index) => {
        const mask = result.mask;
        console.log('mask:', mask);
        const color = colorPalette[index % colorPalette.length];
        labelToColor[label] = color;
    
        if (!labelToResult[label]) {
          labelToResult[label] = [];
        }
        labelToResult[label].push(result);
    
        console.log('label:', label);
        console.log('color:', color);
        drawMask(originalImageData, mask, color, label);
      });
    
    maskCanvases = [];
    
    
      
        } else {
          resultDiv.innerHTML = '<p>Error: ' + data.error + '</p>';
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
    
          setTimeout(() => {
    
            const originalImageData = imageEditor.toDataURL();
            sendImageToServer(originalImageData);
          }, 200);
    
    function drawMask(originalImageData, maskData, color, label) {
      if (originalImageData && maskData) {
        const img = new Image();
        img.onload = function () {
          const imgWidth = img.width;
          const imgHeight = img.height;
          const canvas = imageEditor._graphics.getCanvas();
          canvas.width = imgWidth;
          canvas.height = imgHeight;
          const ctx = canvas.getContext('2d');
    
          ctx.drawImage(img, 0, 0);
          const mask = new Image();
          mask.onload = function () {
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = canvas.width;
            maskCanvas.height = canvas.height;
            maskCanvas.title = `${label}`; // Set the canvas title to the label
            const maskCtx = maskCanvas.getContext('2d');
            maskCtx.drawImage(mask, 0, 0);
            maskCanvas.maskData = maskData;
    
            const maskImageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
            const data = maskImageData.data;
    
            ctx.fillStyle = color;
            for (let i = 0; i < data.length; i += 4) {
              const brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
              if (brightness > 128) {
                const x = (i / 4) % maskCanvas.width;
                const y = Math.floor((i / 4) / maskCanvas.width);
                ctx.fillRect(x, y, 1, 1);
              }
            }
          };
          mask.src = 'data:image/png;base64,' + maskData;
          console.log("mask", mask);
        };
        console.log("img", img);
        img.src = originalImageData;
      } else {
        console.error('Invalid image or mask data');
      }
    }
    
    function compareColors(color1, color2, tolerance = 0.01) {
      const [r1, g1, b1, a1] = color1.slice(5, -1).split(',').map(Number);
      const [r2, g2, b2, a2] = color2.slice(5, -1).split(',').map(Number);
    
      const rDiff = Math.abs(r1 - r2) <= tolerance ? 0 : Math.abs(r1 - r2);
      const gDiff = Math.abs(g1 - g2) <= tolerance ? 0 : Math.abs(g1 - g2);
      const bDiff = Math.abs(b1 - b2) <= tolerance ? 0 : Math.abs(b1 - b2);
      const aDiff = Math.abs(a1 - a2) <= tolerance ? 0 : Math.abs(a1 - a2);
    
      return rDiff + gDiff + bDiff + aDiff === 0;
    }
    
    const canvas = imageEditor._graphics.getCanvas();
    
    function getClosestColorString(color) {
      const colorValues = Object.keys(colorPalette).map(colorString => {
        const [r, g, b, a] = colorString
          .replace(/[^\d,]/g, '')
          .split(',')
          .map(Number);
    
        const distance = Math.sqrt(
          (color.r - r) ** 2 +
          (color.g - g) ** 2 +
          (color.b - b) ** 2 +
          (color.a - a) ** 2
        );
    
        return { colorString, distance };
      });
    
      const closestColor = colorValues.reduce((prev, curr) =>
        prev.distance <= curr.distance ? prev : curr
      );
    
      return closestColor.colorString;
    }
    const tooltip = document.getElementById('tooltip');
    if (window.getComputedStyle(tooltip).display === 'none') {
      tooltip.style.display = 'block';
    }
    canvas.on('mouse:move', (options) => {
      const { e, pointer } = options;
      console.log('Mouse move at:', pointer.x, pointer.y);
    
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
    
      if (pointer.x >= 0 && pointer.x < canvasWidth && pointer.y >= 0 && pointer.y < canvasHeight) {
        const pixelData = canvas.getContext('2d').getImageData(pointer.x, pointer.y, 1, 1).data;
        const color = {
          r: pixelData[0],
          g: pixelData[1],
          b: pixelData[2],
          a: pixelData[3] / 255
        };
    
        const closestColorString = getClosestColorString(color);
        const hoveredColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
        console.log('Hover color:', hoveredColor);
    
        const label = Object.entries(labelToColor).find(([_, value]) => value === closestColorString)?.[0];
        console.log(`Closest color: ${closestColorString}, Label: ${label || 'Unknown'}`);
    
        if (label) {
          const results = labelToResult[label];
          console.log('results :>> ', results);
          results.forEach(result => {
            console.log(`result.label: ${result.label}`);
          });
          const tooltipContent = results.map(result => result.label).join('<br>');
          tooltip.innerHTML = tooltipContent;
          tooltip.style.left = `${e.clientX}px`;
          tooltip.style.top = `${e.clientY}px`;
          tooltip.style.opacity = 1;
                tooltip.style.display = 'block'; // Show the tooltip
    
    
        } else {
          console.log('Hovering over image, but not over any color');
          tooltip.style.opacity = 0;
    
        }
      } else {
        console.log("Hovering outside the image");
        tooltip.style.opacity = 0;
    
      }
    });
    
    const colorPalette = {
      'rgba(0, 153, 153, 0.5)': 'Label1',
      'rgba(255, 255, 0, 0.5)': 'Label2',
      'rgba(0, 0, 255, 0.5)': 'Label3',
      'rgba(153, 0, 153, 0.5)': 'Label4',
      'rgba(255, 255, 0, 0.5)': 'Label5',
      'rgba(255, 192, 203, 0.5)': 'Label6',
      'rgba(153, 0, 0, 0.5)': 'Label7'
    };
        }
          
    function displayError(errorMessage) {
      let errorDiv = document.getElementById("error");
      if (!errorDiv) {
        errorDiv = document.createElement("div");
        errorDiv.id = "error";
        document.body.appendChild(errorDiv);
      }
      errorDiv.textContent = "";
      if (errorMessage) {
        errorDiv.textContent = errorMessage;
        console.log(errorMessage)
      }
    }
             
    function ocr() {
            const array = window.shared.imageEditorArray;
            imageEditor = array[array.length - 1];
    
            window.onresize = function () {
              imageEditor.ui.resizeEditor();
            };
    
            function dataURLtoBlob(dataurl) {
              var arr = dataurl.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              return new Blob([u8arr], { type: mime });
            }
    
            async function sendImageToServer(originalImageData) {
              var blob = dataURLtoBlob(originalImageData);
              var formData = new FormData();
              formData.append('image_file', blob, 'image123.jpg');
    
              try {
                const response = await fetch(
                  'https://ciasimbaya-objectdetection-anushreep774.glitch.me/ocr',
                  {
                    method: 'POST',
                    body: formData,
                  }
                );
                const data = await response.json();
                console.log('data :>> ', data);
    
                if (data.error && data.error.includes('Model is currently loading')) {
                  const timeout = data.estimated_time * 1000;
                  await new Promise((resolve) => setTimeout(resolve, timeout));
                  console.log('Model loaded, retrying request...');
    
                  const retryResponse = await fetch(
                    'https://ciasimbaya-objectdetection-anushreep774.glitch.me/ocr',
                    {
                      method: 'POST',
                      body: formData,
                    }
                  );
                  const retryData = await retryResponse.json();
                  console.log(retryData);
                  displayTextContent(retryData[0].generated_text);
                } else {
                  console.log(data);
                  displayTextContent(data[0].generated_text);
                }
              } catch (error) {
                console.error('Error:', error);
              }
            }
    
            function displayTextContent(generatedText) {
                let textContainer = document.getElementById('text-container');
                if (!textContainer) {
    
                textContainer = document.createElement('div');
                textContainer.id = 'text-container';
    
                document.body.appendChild(textContainer);
    
            }
    
              const textContent = generatedText.replace(/<\/?[^>]+(>|$)/g, ''); // Remove HTML tags
              textContainer.textContent = textContent;
            }
    
            setTimeout(() => {
              const originalImageData = imageEditor.toDataURL();
              sendImageToServer(originalImageData);
            }, 200);
          }
      
    function e(){
    
         
          function initImageEditor() {
            
            const array = window.shared.imageEditorArray;
            console.log('array :>> ', array);
            let imageEditor = array[0];
    
            
            window.onresize = function () {
              imageEditor.ui.resizeEditor();
            };
    
            // Send the image to the server after 300 milliseconds
            setTimeout(sendImageToServer, 300);
          }
         
          function dataURLtoBlob(dataurl) {
            var arr = dataurl.split(','),
              mime = arr[0].match(/:(.*?);/)[1],
              bstr = atob(arr[1]),
              n = bstr.length,
              u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
          }
         
          function sendImageToServer() {
            // Get the image data from the TUI Image Editor
            const imageData = imageEditor.toDataURL();
    
            // Convert the image data to a Blob
            const imageBlob = dataURLtoBlob(imageData);
    
            // Create a FormData object
            const formData = new FormData();
            formData.append('file', imageBlob);
    
            // Send the POST request to the server
            fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/image_classification', {
              method: 'POST',
              body: formData,
            })
              .then(response => response.json())
              .then(data => {
                console.log('data :>> ', data);
                if (data.error) {
                  // Handle error
                  document.getElementById('result').textContent = `Error: ${data.error}`;
                } else {
                  // Display the classification result
                  document.getElementById('result').textContent = `Classification: ${data.text}`;
                }
              })
              .catch(error => {
    
                  document.getElementById('result').textContent = `Error: ${error}`;
              });
          }
         
          initImageEditor();
        
        }    
       
          
        function f() {
            var imageEditor;
            function initImageEditor() {
        
                    const array = window.shared.imageEditorArray;
            console.log('array :>> ', array);
            let imageEditor = array[0];
    
              window.onresize = function () {
                imageEditor.ui.resizeEditor();
              };
    
              // Send the image to the server after 300 milliseconds
              setTimeout(sendImageToServer, 300);
            }
    
            function dataURLtoBlob(dataurl) {
              var arr = dataurl.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              return new Blob([u8arr], { type: mime });
            }
    
            function sendImageToServer() {
              // Get the image data from the TUI Image Editor
              const imageData = imageEditor.toDataURL();
    
              // Convert the image data to a Blob
              const imageBlob = dataURLtoBlob(imageData);
    
              // Create a FormData object
              const formData = new FormData();
              formData.append('file', imageBlob);
    
              // Send the POST request to the server
              fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/human_or_artificial', {
                method: 'POST',
                body: formData,
              })
                .then(response => response.json())
                .then(data => {
                  console.log('data :>> ', data);
                  if (data.error) {
                    // Handle error
                    document.getElementById('result').textContent = `Error: ${data.error}`;
                  } else {
                    // Display the classification result
                    document.getElementById('result').textContent = `Classification: ${data.text}`;
                  }
                })
                .catch(error => {
    
                    document.getElementById('result').textContent = `Error: ${error}`;
                });
            }
    
            initImageEditor();
          }
         
            function looksaethitc_or_nonaethethic() {
        
                 const array = window.shared.imageEditorArray;
          console.log('array :>> ', array);
          let imageEditor = array[0];
              
              
            function dataURLtoBlob(dataurl) {
              var arr = dataurl.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              return new Blob([u8arr], { type: mime });
            }
    
           function sendImageToServer() {
              const imageData = imageEditor.toDataURL();
    
              const imageBlob = dataURLtoBlob(imageData);
    
              const formData = new FormData();
              formData.append('image_file', imageBlob);
    
              fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/looks', {
                method: 'POST',
                body: formData,
              })
                .then(response => response.json())
                .then(data => {
                  console.log('data :>> ', data);
                  if (data.error) {
                    // Handle error
                    document.getElementById('result').textContent = `Error: ${data.error}`;
                  } else {
                    // Display the OCR result
                    document.getElementById('result').textContent = `OCR Result: ${JSON.stringify(data)}`;
                  }
                })
                .catch(error => {
                  // Handle network error
                  document.getElementById('result').textContent = `Error: ${error}`;
                });
            }
    
            initImageEditor();
           }
          
           function f() {
            var imageEditor;
            function initImageEditor() {
            
              
              
              window.onresize = function () {
                imageEditor.ui.resizeEditor();
              };
    
              // Send the image to the server after 300 milliseconds
              setTimeout(sendImageToServer, 300);
            }
    
            function dataURLtoBlob(dataurl) {
              var arr = dataurl.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              return new Blob([u8arr], { type: mime });
            }
    
            function sendImageToServer() {
              // Get the image data from the TUI Image Editor
              const imageData = imageEditor.toDataURL();
    
              // Convert the image data to a Blob
              const imageBlob = dataURLtoBlob(imageData);
    
              // Create a FormData object
              const formData = new FormData();
              formData.append('file', imageBlob);
    
              // Send the POST request to the server
              fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/human_or_artificial', {
                method: 'POST',
                body: formData,
              })
                .then(response => response.json())
                .then(data => {
                  console.log('data :>> ', data);
                  if (data.error) {
                    // Handle error
                    document.getElementById('result').textContent = `Error: ${data.error}`;
                  } else {
                    // Display the classification result
                    document.getElementById('result').textContent = `Classification: ${data.text}`;
                  }
                })
                .catch(error => {
                  // Handle network error
                  document.getElementById('result').textContent = `Error: ${error}`;
                });
            }
    
            initImageEditor();
          }
        
           function detect_face_express() {
            var imageEditor;
            function initImageEditor() {
              const array = window.shared.imageEditorArray;
          console.log('array :>> ', array);
          let imageEditor = array[0];
                
              window.onresize = function () {
                imageEditor.ui.resizeEditor();
              };
    
              // Send the image to the server after 300 milliseconds
              setTimeout(sendImageToServer, 300);
            }
    
            function dataURLtoBlob(dataurl) {
              var arr = dataurl.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              return new Blob([u8arr], { type: mime });
            }
    
            function sendImageToServer() {
              // Get the image data from the TUI Image Editor
              const imageData = imageEditor.toDataURL();
    
              // Convert the image data to a Blob
              const imageBlob = dataURLtoBlob(imageData);
    
              // Create a FormData object
              const formData = new FormData();
              formData.append('file', imageBlob);
    
              // Send the POST request to the server
              fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/detect_face_express', {
                method: 'POST',
                body: formData,
              })
                .then(response => response.json())
                .then(data => {
                  console.log('data :>> ', data);
                  if (data.error) {
                    // Handle error
                    document.getElementById('result').textContent = `Error: ${data.error}`;
                  } else {
                    // Display the classification result
                    document.getElementById('result').textContent = `Face Expression: ${data.result}`;
                  }
                })
                .catch(error => {
                  // Handle network error
                  document.getElementById('result').textContent = `Error: ${error}`;
                });
            }
    
            initImageEditor();
          }
    
           function quality_how_lq_or_hq() {
            var imageEditor;
            function initImageEditor() {
                  const array = window.shared.imageEditorArray;
          console.log('array :>> ', array);
          let imageEditor = array[0];
                
              window.onresize = function () {
                imageEditor.ui.resizeEditor();
              };
    
              // Send the image to the server after 300 milliseconds
              setTimeout(sendImageToServer, 300);
            }
    
            function dataURLtoBlob(dataurl) {
              var arr = dataurl.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              return new Blob([u8arr], { type: mime });
            }
    
            function sendImageToServer() {
              // Get the image data from the TUI Image Editor
              const imageData = imageEditor.toDataURL();
    
              // Convert the image data to a Blob
              const imageBlob = dataURLtoBlob(imageData);
    
              // Create a FormData object
              const formData = new FormData();
              formData.append('file', imageBlob);
    
              // Send the POST request to the server
              fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/quality_how_lq_or_hq', {
                method: 'POST',
                body: formData,
              })
                .then(response => response.json())
                .then(data => {
                  console.log('data :>> ', data);
                  if (data.error) {
                    // Handle error
                    document.getElementById('result').textContent = `Error: ${data.error}`;
                  } else {
                    // Display the classification result
                    document.getElementById('result').textContent = `Emotion: ${data.text}`;
                  }
                })
                .catch(error => {
                  // Handle network error
                  document.getElementById('result').textContent = `Error: ${error}`;
                });
            }
    
            initImageEditor();
          }
    
           function face_happy_sad() {
            var imageEditor;
            function initImageEditor() {
              imageEditor = new tui.ImageEditor('#tui-image-editor-container', {
                includeUI: {
                  loadImage: {
                    path: 'image2.png',
                    name: 'SampleImage',
                  },
                  initMenu: 'filter',
                  menuBarPosition: 'bottom',
                },
                cssMaxWidth: 700,
                cssMaxHeight: 500,
                usageStatistics: false,
              });
              window.onresize = function () {
                imageEditor.ui.resizeEditor();
              };
    
              // Send the image to the server after 300 milliseconds
              setTimeout(sendImageToServer, 300);
            }
    
            function dataURLtoBlob(dataurl) {
              var arr = dataurl.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              return new Blob([u8arr], { type: mime });
            }
    
            function sendImageToServer() {
              // Get the image data from the TUI Image Editor
              const imageData = imageEditor.toDataURL();
    
              // Convert the image data to a Blob
              const imageBlob = dataURLtoBlob(imageData);
    
              // Create a FormData object
              const formData = new FormData();
              formData.append('file', imageBlob);
    
              // Send the POST request to the server
              fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/face_happy_sad', {
                method: 'POST',
                body: formData,
              })
                .then(response => response.json())
                .then(data => {
                  console.log('data :>> ', data);
                  if (data.error) {
                    // Handle error
                    document.getElementById('result').textContent = `Error: ${data.error}`;
                  } else {
                    // Display the classification result
                    document.getElementById('result').textContent = `Emotion: ${data.text}`;
                  }
                })
                .catch(error => {
                  // Handle network error
                  document.getElementById('result').textContent = `Error: ${error}`;
                });
            }
    
            initImageEditor();
          }
    
          function content_in_img() {
            var imageEditor;
          
            function initImageEditor() {
              const array = window.shared.imageEditorArray;
              console.log("array :>> ", array);
              imageEditor = array[0];
              window.onresize = function () {
                imageEditor.ui.resizeEditor();
              };
              // Increase initial delay to 2 seconds
              setTimeout(() => sendImageToServer(0), 2000);
            }
          
            function dataURLtoBlob(dataurl) {
              var arr = dataurl.split(","),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              return new Blob([u8arr], { type: mime });
            }
          
            function showModal(content) {
              const modal = document.createElement('div');
              modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full';
              modal.id = 'my-modal';
          
              modal.innerHTML = `
                <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                  <div class="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 class="text-xl font-semibold text-gray-900">Content in Image</h3>
                    <button id="close-modal" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                    </button>
                  </div>
                  <div id="modal-content" class="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                    ${content}
                  </div>
                </div>
              `;
          
              document.body.appendChild(modal);
          
              document.getElementById('close-modal').addEventListener('click', () => {
                document.body.removeChild(modal);
              });
            }
            function sendImageToServer(retryCount) {
              const imageData = imageEditor.toDataURL();
              const imageBlob = dataURLtoBlob(imageData);
              const formData = new FormData();
              formData.append("image_file", imageBlob);
            
              showModal('<div id="loading-indicator" class="flex justify-center items-center"><div class="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div></div><p class="text-center mt-4">Analyzing image...</p>');
            
              fetch(
                "https://ciasimbaya-objectdetection-anushreep774.glitch.me/content_in_img",
                {
                  method: "POST",
                  body: formData,
                }
              )
                .then((response) => response.json())
                .then((data) => {
                  console.log("data :>> ", data);
                  if (data.error && data.error.includes("Model") && data.error.includes("loading")) {
                    const estimatedTime = data.estimated_time || 20;
                    showModal(`
                      <p class="text-center">The image analysis model is still initializing.</p>
                      <p class="text-center mt-2">Estimated time: ${estimatedTime} seconds.</p>
                      <p class="text-center mt-2">The request will automatically retry.</p>
                      <div class="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                        <div class="bg-blue-600 h-2.5 rounded-full" style="width: 0%" id="progress-bar"></div>
                      </div>
                    `);
                    
                    let progress = 0;
                    const interval = setInterval(() => {
                      progress += 100 / estimatedTime;
                      if (progress >= 100) {
                        clearInterval(interval);
                        progress = 100;
                      }
                      document.getElementById('progress-bar').style.width = `${progress}%`;
                    }, 1000);
            
                    setTimeout(() => {
                      clearInterval(interval);
                      sendImageToServer(retryCount + 1);
                    }, estimatedTime * 1000);
                  } else if (data.error) {
                    showModal(`<p class="text-center text-red-500">Error: ${data.error}</p>`);
                  } else {
                    const contentHtml = `
                      <h4 class="font-bold mb-2 text-center">Detected Objects:</h4>
                      <ul class="list-disc pl-5">
                        ${data.objects ? data.objects.map(obj => `<li>${obj.name}: ${obj.confidence.toFixed(2)}%</li>`).join('') : 'No objects detected'}
                      </ul>
                    `;
                    showModal(contentHtml);
                  }
                })
                .catch((error) => {
                  if (retryCount < 3) {
                    const backoffTime = Math.pow(2, retryCount) * 1000;
                    showModal(`
                      <p class="text-center">An error occurred while analyzing the image.</p>
                      <p class="text-center mt-2">Retrying in ${backoffTime/1000} seconds...</p>
                      <div class="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                        <div class="bg-blue-600 h-2.5 rounded-full" style="width: 0%" id="progress-bar"></div>
                      </div>
                    `);
                    
                    let progress = 0;
                    const interval = setInterval(() => {
                      progress += 100 / (backoffTime / 1000);
                      if (progress >= 100) {
                        clearInterval(interval);
                        progress = 100;
                      }
                      document.getElementById('progress-bar').style.width = `${progress}%`;
                    }, 1000);
            
                    setTimeout(() => {
                      clearInterval(interval);
                      sendImageToServer(retryCount + 1);
                    }, backoffTime);
                  } else {
                    showModal(`<p class="text-center text-red-500">Error: ${error}. Max retries reached.</p>`);
                  }
                });
            }
            initImageEditor();
          }
          function age() {
            var imageEditor;
            function initImageEditor() {
            
              
              
              window.onresize = function () {
                imageEditor.ui.resizeEditor();
              };
    
              setTimeout(sendImageToServer, 300);
            }
    
            function dataURLtoBlob(dataurl) {
              var arr = dataurl.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              return new Blob([u8arr], { type: mime });
            }
    
            function sendImageToServer() {
    
              const imageData = imageEditor.toDataURL();
              
              const imageBlob = dataURLtoBlob(imageData);
    
              const formData = new FormData();
              formData.append('image_file', imageBlob);
              
              fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/age', {
                method: 'POST',
                body: formData,
              })
                .then(response => response.json())
                .then(data => {
                  console.log('data :>> ', data);
                  if (data.error) {
                    // Handle error
                    document.getElementById('result').textContent = `Error: ${data.error}`;
                  } else {
                    // Display the OCR result
                    document.getElementById('result').textContent = `OCR Result: ${JSON.stringify(data)}`;
                  }
                })
                .catch(error => {
                  // Handle network error
                  document.getElementById('result').textContent = `Error: ${error}`;
                });
            }
    
            initImageEditor();
          }
          
          function human_or_artificial() {
            var imageEditor;
            function initImageEditor() {
                  const array = window.shared.imageEditorArray;
          console.log('array :>> ', array);
          let imageEditor = array[0];
                
              
              window.onresize = function () {
                imageEditor.ui.resizeEditor();
              };
    
              // Send the image to the server after 300 milliseconds
              setTimeout(sendImageToServer, 300);
            }
    
            function dataURLtoBlob(dataurl) {
              var arr = dataurl.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              return new Blob([u8arr], { type: mime });
            }
    
            function sendImageToServer() {
              // Get the image data from the TUI Image Editor
              const imageData = imageEditor.toDataURL();
    
              // Convert the image data to a Blob
              const imageBlob = dataURLtoBlob(imageData);
    
              // Create a FormData object
              const formData = new FormData();
              formData.append('file', imageBlob);
    
              // Send the POST request to the server
              fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/human_or_artificial', {
                method: 'POST',
                body: formData,
              })
                .then(response => response.json())
                .then(data => {
                  console.log('data :>> ', data);
                  if (data.error) {
                    // Handle error
                    document.getElementById('result').textContent = `Error: ${data.error}`;
                  } else {
                    // Display the classification result
                    document.getElementById('result').textContent = `Classification: ${data.text}`;
                  }
                })
                .catch(error => {
                  // Handle network error
                  document.getElementById('result').textContent = `Error: ${error}`;
                });
            }
    
            initImageEditor();
          }
    
           function detect() {
              const imageData = getImageDataFromEditor();
              if (imageData) {
                fetchObjectDetectionResult(imageData);
              } else {
                displayError("No image loaded in the editor.");
              }
            }
    
           function looksaethitc_or_nonaethethic() {
     
           function dataURLtoBlob(dataurl) {
              var arr = dataurl.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              return new Blob([u8arr], { type: mime });
            }
    
           function sendImageToServer() {
    
             const imageData = imageEditor.toDataURL();
    
              // Convert the image data to a Blob
              const imageBlob = dataURLtoBlob(imageData);
    
              // Create a FormData object
              const formData = new FormData();
              formData.append('image_file', imageBlob);
    
              // Send the POST request to the server
              fetch('https://ciasimbaya-objectdetection-anushreep774.glitch.me/looks', {
                method: 'POST',
                body: formData,
              })
                .then(response => response.json())
                .then(data => {
                  console.log('data :>> ', data);
                  if (data.error) {
                    // Handle error
                    document.getElementById('result').textContent = `Error: ${data.error}`;
                  } else {
                    // Display the OCR result
                    document.getElementById('result').textContent = `OCR Result: ${JSON.stringify(data)}`;
                  }
                })
                .catch(error => {
                  // Handle network error
                  document.getElementById('result').textContent = `Error: ${error}`;
                });
            }
    
           initImageEditor();
           
           }  
    
      function direction() {
        const context = messageInput; 
        const payload = {
          inputs: {
            question: "top value", 
            context: context
          }
        };
        fetchDirectionResult(payload);
      }
    
      const keywordsActions = [
        ["text to image",text_to_image],
        ["text_to_image",text_to_image],
        ["content_in_img",content_in_img],
        ["age",age],
        ["looksaethitc_or_nonaethethic",looksaethitc_or_nonaethethic],
        ["detect_face_express",detect_face_express],
        ["face_happy_sad",face_happy_sad],
        ["quality_how_lq_or_hq", quality_how_lq_or_hq]
        ["human_or_artificical", human_or_artificial],
        ["e",e],
            ["c",c],
              ["d",d],
            ["b",b],
            ["ocr",ocr],
            ['scene',scene],
            ['face',face],
            ["cloth",cloth],
            ["classify",classify],
            ["direction",direction],
            ["caption", caption],
            ["detect", detect],
            ["ink", ink],
            ["add image", imageEditors],
            ["include picture", imageEditors], 
            ["add visual", imageEditors],
            ["attach image file", imageEditors],
            ["include graphic", imageEditors],
            ["insert picture", imageEditors],
            ["embed imagery", imageEditors],
            ["incorporate visualization", imageEditors],
            ["integrate pictorial", imageEditors],
            ["implement illustration", imageEditors],
            ["input graphic", imageEditors],
            ["introduce depiction", imageEditors],
            ["ingest figure", imageEditors],
            ["input portrayal", imageEditors],
            ["integrate rendering", imageEditors],
            ["imbed imagery", imageEditors], 
            ["introduce photo", imageEditors],
            ["interpose photograph", imageEditors],
            ["interject snapshot", imageEditors],
            ["grayscale", Grayscale],
            ["monochrome", Grayscale],
            ["black-and-white", Grayscale],
            ["black and white", Grayscale],
            ["monotone", Grayscale],
            ["neutral", Grayscale],
            ["colorless", Grayscale],
            ["unsaturated", Grayscale],
            ["washed out", Grayscale],
            ["pale", Grayscale],
            ["faded", Grayscale],
            ["muted", Grayscale],
            ["bleached", Grayscale],
            ["ashen", Grayscale],
            ["dreary", Grayscale],
            ["drab", Grayscale],
            ["lusterless", Grayscale],
            ["lackluster", Grayscale],
            ["dun", Grayscale],
            ["leaden", Grayscale],
            ["invert", Invert],
            // ["invert", Invert],
            ["inverse", Invert],
            ["embed imagery", imageEditors],
            ["include graphic", imageEditors],
            ["embed imagery", imageEditors],
            ["incorporate visualization", imageEditors],
            ["integrate pictorial", imageEditors],
            ["inverted", Invert],
            ["inverting", Invert],
            ["inversion", Invert],
            ["invertable", Invert],
            ["inverter", Invert],
            ["invertible", Invert],
            ["inversely", Invert],
            ["invertibility", Invert],
                  ["Vivid", vibrance],
            ["Saturated", vibrance],
            ["Intense", vibrance],
                  ["Sharp", unsharpMask],
            ["Crisp", unsharpMask],
            ["Defined", unsharpMask],
            ["Distinct", unsharpMask],
            ["Focused", unsharpMask],
            ["Keen", unsharpMask],
            ["Clarified", unsharpMask],
            ["Accentuated", unsharpMask],
            ["Emphasized", unsharpMask],
            ["Heightened", unsharpMask],
            ["Intensified", unsharpMask],
            ["Pronounced", unsharpMask],
            ["Delineated", unsharpMask],
            ["Etched", unsharpMask],
            ["Chiseled", unsharpMask],
            ["Sculpted", unsharpMask],
            ["Incisive", unsharpMask],
      ["Acute", unsharpMask],
      ["Precise", unsharpMask],
      ["Framed", vignette],
      ["Focused", vignette],
      ["Centered", vignette],
      ["Feathered", vignette],
      ["Faded", vignette],
      ["Darkened", vignette],
      ["Shaded", vignette],
      ["Graduated", vignette],
      ["Tapered", vignette],
      ["Vignettted", vignette],
      ["Bordered", vignette],
      ["Encircled", vignette],
      ["Encapsulated", vignette],
      ["Enveloped", vignette],
      ["Softened", triangleBlur],
      ["Diffused", triangleBlur],
      ["Blurred", triangleBlur],
      // ["Hazy", triangleBlur],
      ["Obscured", triangleBlur],
      ["Subdued", triangleBlur],
      ["Fuzzed", triangleBlur],
      ["Smudged", triangleBlur],
      ["Defocused", triangleBlur],
      ["Blended", triangleBlur],
      ["Smoothed", triangleBlur],
      ["Feathered", triangleBlur],
      ["Dreamy", triangleBlur],
      ["Ethereal", triangleBlur],
      ["Gauzy", triangleBlur],
      ["Misty", triangleBlur],
      ["Nebulous", triangleBlur],
      ["Veiled", triangleBlur],
      ["Miniaturized", tiltShift_blur],
      ["Dioramic", tiltShift_blur],
      ["Selective", tiltShift_blur],
      ["Shallow", tiltShift_blur],
      ["Concentrated", tiltShift_blur],
      ["Isolated", tiltShift_blur],
      ["Highlighted", tiltShift_blur],
      ["Accented", tiltShift_blur],
      ["Spotlighted", tiltShift_blur],
      ["Bokeh", tiltShift_blur],
      ["Dreamy", tiltShift_blur],
      ["Whimsical", tiltShift_blur],
      ["Toylike", tiltShift_blur],
      ["Miniature", tiltShift_blur],
      ["Diorama", tiltShift_blur],
      ["Faux-perspective", tiltShift_blur],
      ["lensblur", lensBlur],
      ["Diffused", lensBlur],
      // ["Hazy", lensBlur],
      ["Obscured", lensBlur],
      // ["Subdued", lensBlur],
      ["Indistinct", lensBlur],
      ["Rich", vibrance],
      ["Brilliant", vibrance],
      ["Radiant", vibrance],
      ["Lustrous", vibrance],
      ["Vibrant", vibrance],
      ["Glowing", vibrance],
      ["Pulsating", vibrance],
      ["Lively", vibrance],
      ["Ebullient", vibrance],
      ["Resplendent", vibrance],
      ["Luminous", vibrance],
      ["Scintillating", vibrance],
      ["Dazzling", vibrance],
      ["Effulgent", vibrance],
      ["Chromatic", vibrance],
      ["Prismatic", vibrance],
      ["Kinetic", vibrance],      
      ["Clean", denoise],
      ["Smooth", denoise],
      ["Refined", denoise],
      ["Polished", denoise],
      ["Pristine", denoise],
      ["Crisp", denoise],
      ["Clear", denoise],
      ["Purified", denoise],
      ["Unblemished", denoise],
      ["Flawless", denoise],
      ["Immaculate", denoise],
      ["Spotless", denoise],
      ["Untainted", denoise],
      ["Clarified", denoise],
      ["Unmuddied", denoise],
      ["Unsullied", denoise],
      ["Depurated", denoise],
      ["Stainless", denoise],
      ["Unblemished", denoise],
      ["Impeccable", denoise],
      ["swirl", swirl],
      ["Twisted", swirl],
      ["Whirled", swirl],
      ["Spiraled", swirl],
      ["Vortexed", swirl],
      ["Cyclonic", swirl],
      ["Eddied", swirl],
      ["Helical", swirl],
      ["Curled", swirl],
      ["Contorted", swirl],
      ["Distorted", swirl],
      ["Warped", swirl],
      ["Funnel", swirl],
      ["Maelstrom", swirl],
      ["Whirlpool", swirl],
      ["Twirled", swirl],
      ["Spinning", swirl],
      ["Revolving", swirl],
      ["Centrifugal", swirl],
      ["Gyrating", swirl],
      ["Rotational", swirl],
      ["Inflated", bulgePinch],
      ["Swollen", bulgePinch],
      ["Bloated", bulgePinch],
      ["Bulged", bulgePinch],
      ["Distended", bulgePinch],
      ["Puffed", bulgePinch],
      ["Protuberant", bulgePinch],
      ["Convex", bulgePinch],
      ["Protruding", bulgePinch],
      ["Embossed", bulgePinch],
      ["Pinched", bulgePinch],
      ["Constricted", bulgePinch],
      ["Squeezed", bulgePinch],
      ["Compressed", bulgePinch],
      ["Narrowed", bulgePinch],
      ["Cinched", bulgePinch],
      ["Tightened", bulgePinch],
      ["Contracted", bulgePinch],
      ["Wrinkled", bulgePinch],
      ["Distorted", bulgePinch],
      ["Skewed", perspective],
      ["Angled", perspective],
      ["Tilted", perspective],
      ["Slanted", perspective],
      ["Inclined", perspective],
      ["Oblique", perspective],
      ["Crooked", perspective],
      ["Aslant", perspective],
      ["Askew", perspective],
      ["Canted", perspective],
      ["Lopsided", perspective],
      ["Uneven", perspective],
      ["Distorted", perspective],
      ["Warped", perspective],
      ["Deformed", perspective],
      ["Transformed", perspective],
      ["Altered", perspective],
      ["Morphed", perspective],
      ["Metamorphosed", perspective],
      ["Transmuted", perspective],
      ["Outlined", edgeWork],
      ["Delineated", edgeWork],
      ["Contoured", edgeWork],
      ["Bordered", edgeWork],
      ["Rimmed", edgeWork],
      ["Edged", edgeWork],
      ["Margined", edgeWork],
      ["Fringed", edgeWork],
      ["Bounded", edgeWork],
      ["Circumscribed", edgeWork],
      ["Lineated", edgeWork],
      ["Silhouetted", edgeWork],
      ["Profiled", edgeWork],
      ["Traced", edgeWork],
      ["Sketched", edgeWork],
      ["Etched", edgeWork],
      ["Chiseled", edgeWork],
      ["Carved", edgeWork],
      ["Engraved", edgeWork],
      ["Inscribed", edgeWork],
      ["Pixelated", hexagonalPixelate],
      ["Blocky", hexagonalPixelate],
      ["Chunky", hexagonalPixelate],
      ["Mosaic", hexagonalPixelate],
      ["Tiled", hexagonalPixelate],
      ["Tessellated", hexagonalPixelate],
      ["Gridded", hexagonalPixelate],
      ["Honeycomb", hexagonalPixelate],
      ["Cellular", hexagonalPixelate],
      ["Hexagonal", hexagonalPixelate],
      ["Polygonal", hexagonalPixelate],
      ["Fragmented", hexagonalPixelate],
      ["Segmented", hexagonalPixelate],
      ["Partitioned", hexagonalPixelate],
      ["Divided", hexagonalPixelate],
      ["Compartmentalized", hexagonalPixelate],
      ["Crystallized", hexagonalPixelate],
      ["Faceted", hexagonalPixelate],
      ["Geometric", hexagonalPixelate],
      ["Modular", hexagonalPixelate],
      ["Halftone", dotScreen],
      ["Stippled", dotScreen],
      ["Dotted", dotScreen],
      ["Speckled", dotScreen],
      // ["Pointillistic", dotScreen],
      ["Screened", dotScreen],
      ["Patterned", dotScreen],
      ["Textured", dotScreen],
      ["Grained", dotScreen],
      // ["Mottled", dotScreen],
      // ["Dappled", dotScreen],
      ["Flecked", dotScreen],
      ["Spattered", dotScreen],
      // ["Sprinkled", dotScreen],
      // ["Peppered", dotScreen],
      ["Spotted", dotScreen],
      // ["Freckled", dotScreen],
      ["Punctuated", dotScreen],
      // ["Perforated", dotScreen],
      ["Stippled", dotScreen],
            ["Halftone", colorHalftone],
      ["Screened", colorHalftone],
      ["Printed", colorHalftone],
      ["Patterned", colorHalftone],
      // ["Textured", colorHalftone],
      // ["Grained", colorHalftone],
      ["Mottled", colorHalftone],
      ["Dappled", colorHalftone],
      // ["Flecked", colorHalftone],
      // ["Spattered", colorHalftone],
      ["Sprinkled", colorHalftone],
      ["Peppered", colorHalftone],
      // ["Spotted", colorHalftone],
      ["Freckled", colorHalftone],
      // ["Punctuated", colorHalftone],
      ["Perforated", colorHalftone],
      ["Stippled", colorHalftone],
      ["Dotted", colorHalftone],
      ["Pointillistic", colorHalftone],
      ["Chromatic", colorHalftone],
      ["upend",Invert],
      ["overturn", Invert],
      ["flip", Invert],
      ["reverse", Invert],
      ["opposite", Invert],
      ["contradict",Invert],
      ["counter", Invert],
      ["antithesis", Invert],
      ["converse", Invert],
      ["reciprocal", Invert],
      ["transpose", Invert],
      ["rearrange",Invert],
      ["back to front", Invert],
      ["inside out",Invert],
      ["upside down",Invert],
      ["negative",Invert],
      ["retrograde",Invert],
      ["complement", Invert],
      ["contraposition", Invert],
      ["antipode",Invert],
      // ["blur", Blur],
      ["fuzzy", Blur],
      ["obscure", Blur],
      ["hazy",Blur],
      ["indistinct", Blur],
      ["cloudy", Blur],
      ["unclear", Blur],
      ["misted", Blur],
      ["foggy", Blur],
      ["smudged", Blur],
      ["dim", Blur],
      ["vague",Blur],
      ["misty", Blur],
      ["murky", Blur],
      ["opaque",Blur],
      ["muddled", Blur],
      ["bleary", Blur],
      ["dull", Blur],
      ["shadowy", Blur],
      ["nebulous", Blur],
      ["shaded", Blur],
      ["faint", Blur],
      ["ambiguous",Blur],
      ["softened", Blur],
      ["diffused", Blur],
      ["veiled",Blur],
      ["shrouded", Blur],
      ["blurred", Blur],
      ["uncertain", Blur],
      ["lurid", Blur],
      ["gauzy", Blur],
      ["blur", Blur],
      ["sharpen", Sharpen],
      ["crisp", Sharpen],
      ["implement illustration", imageEditors],
      ["input graphic", imageEditors],
      ["introduce depiction", imageEditors],
      ["ingest figure", imageEditors],
      ["input portrayal", imageEditors],
      ["integrate rendering", imageEditors],
      ["imbed imagery", imageEditors], 
      ["introduce photo", imageEditors],
      ["interpose photograph", imageEditors],
      ["interject snapshot", imageEditors],
      ["grayscale", Grayscale],
      // [  "monochrome", Grayscale],
      ["black-and-white", Grayscale],
      ["clear", Sharpen],
      ["distinct", Sharpen],
      ["focused", Sharpen],
      ["sharp", Sharpen],
      ["keen", Sharpen],
      ["acute", Sharpen],
      ["cutting", Sharpen],
      ["piercing", Sharpen],
      ["defined", Sharpen],
      ["honed", Sharpen],
      ["refined",Sharpen],
      ["keen-edged", Sharpen],
      ["well-defined",Sharpen],
      ["fine-tuned", Sharpen],
      ["enhanced", Sharpen],
      ["intensified",Sharpen],
      ["magnified", Sharpen],
      ["amplified", Sharpen],
      ["precise",Sharpen],
      ["exact",Sharpen],
      ["vivid",Sharpen],
      ["lucid", Sharpen],
      ["graphic", Sharpen],
      ["bold", Sharpen],
      ["emboss", Emboss],
      ["sepia", Sepia],
      ["brightness", Brightness],
      ["light", Brightness],
      ["luminous", Brightness],
      ["radiant", Brightness],
      ["shining", Brightness],
      ["gleaming", Brightness],
      ["glossy", Brightness],
      ["glittering", Brightness],
      ["glowing", Brightness],
      ["incandescent", Brightness],
      ["bright", Brightness],
      ["illuminated",Brightness],
      ["lit",Brightness],
      ["lusterous", Brightness],
      ["lustrous",Brightness],
      ["shimmering", Brightness],
      ["sparkling", Brightness],
      ["twinkling", Brightness],
      ["vivid", Brightness],
      ["brilliant", Brightness],
      ["dazzling", Brightness],
      ["fluent",Brightness],
      ["lucid",Brightness],
      ["vibrant",Brightness],
      ["vivid",Brightness],
      ["vivid", Brightness],
      ["ablaze",Brightness],
      ["alive", Brightness],
      ["beaming", Brightness],
      ["effulgent", Brightness],
      ["fulgent", Brightness],
      ["glorious",Brightness],
      ["refulgent", Brightness],
      ["rich", Brightness],
      ["splendid",Brightness],
      ["brightness", Brightness],
      ["saturation", Saturation], 
      ["cartoonize", cartoonize], 
      ["animated", cartoonize],
      ["caricatured",cartoonize ],
      ["comic", cartoonize],
      ["exaggerated",cartoonize],
      ["humorous", cartoonize],
      ["simplistic", cartoonize],
      ["whimsical", cartoonize],
      ["playful", cartoonize],
      ["silly",cartoonize],
      ["zany", cartoonize],
      ["wacky", cartoonize],
      ["slapstick", cartoonize],
      ["quirky",cartoonize],
              ["hue", hue],
              ["saturate", hue],
              ["monotone", hue],
              ["monotone", hue],
            ["Color", hue],
      ["Shade", hue],
      ["Tint", hue],
      ["Tone", hue],
      ["Chroma", hue],
      ["Pigment", hue],
      ["Dye", hue],
      ["Stain", hue],
      ["Tinge", hue],
      ["Wash", hue],
      ["Glaze", hue],
      ["Haze", hue],
      ["Veil", hue],
      ["Filter", hue],
      ["Tint", hue],
      ["Blush", hue],
      ["Flush", hue],
      ["Glow", hue],
      ["Radiance", hue],
      ["Luminance", hue],
      ["monotone", Grayscale],
      ["hueless", Grayscale],
      ["achromatic", Grayscale],
      ["neutral", Grayscale],
      ["colorless", Grayscale],
      ["unsaturated", Grayscale],
      ["washed out", Grayscale],
      ["pale", Grayscale],
      ["faded", Grayscale],
      ["muted", Grayscale],
      ["bleached", Grayscale],
      ["ashen", Grayscale],
      ["dreary", Grayscale],
      ["kooky", cartoonize],
      ["looney", cartoonize],
      ["goofy",cartoonize],
      ["mask", Mask],
      ["mask", Mask],
      ["conceal", Mask],
      ["hide", Mask],
      ["disguise", Mask],
      ["cover", Mask],
      ["cloak", Mask],
      ["camouflage", Mask],
      ["veil", Mask],
      ["curtain", Mask],
      ["shield", Mask],
      ["facade", Mask],
      ["front", Mask],
      ["veneer", Mask],
      ["blanket", Mask],
      ["shroud", Mask],
      ["overlay", Mask],
      ["film", Mask],
      ["filter", Mask],
      ["mute", Mask],
      ["muffle", Mask],
      ["garble", Mask],
      ["scramble", Mask],
      ["jam", Mask],
      ["interfere with", Mask],
      ["distort", Mask],
      ["startdrawingmode", startDrawingMode],
      ["begindrawing", startDrawingMode],
      ["startdrawing", startDrawingMode],
      ["opendrawingmode", startDrawingMode],
      ["activatedrawing", startDrawingMode],
      ["enabledrawingmode", startDrawingMode],
      ["drawmodeon", startDrawingMode],
      ["drawingmodeon", startDrawingMode],
      ["turnondrawing", startDrawingMode],
      ["commencedrawing", startDrawingMode],
      ["initiatedrawing", startDrawingMode],
      ["launchdrawing", startDrawingMode],
      ["startsketching", startDrawingMode],
      ["beginillustrating", startDrawingMode],
      ["startdoodling", startDrawingMode],
      ["firedrawingup", startDrawingMode],
      ["bootupdrawing", startDrawingMode],
      ["powerupdrawing", startDrawingMode],
      ["drawwarning", startDrawingMode],
      ["drawwarningup", startDrawingMode],
      ["drawwarningon", startDrawingMode],
      ["sketchmodestart", startDrawingMode],
      ["sketchmodeon", startDrawingMode],
      ["drab", Grayscale],
      ["lusterless", Grayscale],
      ["lackluster", Grayscale],
      ["dun", Grayscale],
      ["leaden", Grayscale],
      // ["invert", Invert],
      ["blur", Blur],
      ["illustrationon", startDrawingMode],
      ["illustrationstart", startDrawingMode],
      ["doodlemodego", startDrawingMode],
      ["doodlemodebegin", startDrawingMode],
      ["doodlemodeactivate", startDrawingMode],
      ["creativedrawstart", startDrawingMode],
      ["creativedrawbegin", startDrawingMode],
      ["startdrawingmode", startDrawingMode],
      ["noise", Noise],
      ["pixelate", Pixelate],
      ["pixelize", Pixelate],
      ["rasterize", Pixelate],
      ["bitmatize", Pixelate],
      ["blockify", Pixelate],
      ["boxify", Pixelate],
      ["chunkify", Pixelate],
      ["cubicize", Pixelate],
      ["dice", Pixelate],
      ["digitize", Pixelate],
      ["dot", Pixelate],
      ["dramatize", Pixelate],
      ["grid", Pixelate],
      ["macroblock", Pixelate],
      ["minecraft", Pixelate],
      ["mosaic", Pixelate],
      ["multiply", Pixelate],
      ["pixel", Pixelate],
      ["quadrate", Pixelate],
      ["quantify", Pixelate],
      ["square", Pixelate],
      ["tesselate", Pixelate],
      ["voxelate", Pixelate],
      ["tint", Tint],
      ["multiply", Multiply],
      ["multiply", Multiply],
      ["increase", Multiply],
      ["grow", Multiply],
      ["expand", Multiply],
      ["double", Multiply],
      ["triple", Multiply],
      ["quadruple", Multiply],
      ["quintuple", Multiply],
      ["boost", Multiply],
      ["rise", Multiply],
      ["surge", Multiply],
      ["snowball", Multiply],
      ["proliferate", Multiply],
      ["propagate", Multiply],
      ["spread", Multiply],
      ["mushroom", Multiply],
      ["escalate", Multiply],
      ["amplify", Multiply],
      ["augment", Multiply],
      ["enhance", Multiply],
      ["extend", Multiply],
      ["magnify", Multiply],
      ["raise", Multiply],
      ["maximize", Multiply],
      ["duplicate", Multiply],
      ["replicate", Multiply],
      ["reproduce", Multiply],
            ["blend", Blend],
            ["mix", Blend],
            ["combine", Blend],
            ["merge", Blend],
            ["meld", Blend],
            ["fuse", Blend],
            ["integrate", Blend],
            ["amalgamate", Blend],
            ["coalesce", Blend],
            ["conflate", Blend],
            ["intermix", Blend],
            ["interleave", Blend],
            ["interlace", Blend],
            ["interweave", Blend],
            ["knead", Blend],
            ["stir together", Blend],
            ["fold", Blend],
            ["homogenize", Blend],
            ["emulsify", Blend],
            ["alloy", Blend],
            ["synthesize", Blend],
            ["mesh", Blend],
            ["intermingle", Blend],
            ["interdigitate", Blend],
            ["interthread", Blend],
            ["interknit", Blend],
            ["colordodge", ColorDodge], 
            ["vintage", Vintage],
            ["addicon", addicon],
            ["addicon", addicon],
      ["inserticon", addicon],
      ["includeicon", addicon],
      ["addimage", addicon],
      ["insertimage", addicon],
      ["includeimage", addicon],
      ["addsymbol", addicon],
      ["insertsymbol", addicon],
      ["includesymbol", addicon],
      ["addart", addicon],
      ["insertart", addicon],
      ["includeart", addicon],
      ["addgraphic", addicon],
      ["insertgraphic", addicon],
      ["includegraphic", addicon],
      ["addelement", addicon],
      ["insertelement", addicon],
      ["includeelement", addicon],
      ["addvisual", addicon],
      ["insertvisual", addicon],
      ["includevisual", addicon],
      ["addfigure", addicon],
      ["insertfigure", addicon],
      ["includefigure", addicon],
            ["addobjects", addobjects],
            ["addobjects", addobjects],
      ["insertobjects", addobjects],
      ["includeobjects", addobjects],
      ["additems", addobjects],
      ["insertitems", addobjects],
      ["includeitems", addobjects],
      ["addelements", addobjects],
      ["insertelements", addobjects],
      ["includeelements", addobjects],
      ["addcomponents", addobjects],
      ["insertcomponents", addobjects],
      ["includecomponents", addobjects],
      ["addentities", addobjects],
      ["insertentities", addobjects],
      ["includeentities", addobjects],
      ["addarticles", addobjects],
      ["insertarticles", addobjects],
      ["includearticles", addobjects],
      ["addpieces", addobjects],
      ["insertpieces", addobjects],
      ["includepieces", addobjects],
      ["addunits", addobjects],
      ["insertunits", addobjects],
      ["includeunits", addobjects],
      ["addartifacts", addobjects],
      ["insertartifacts", addobjects],
            ["addshape", addShape], 
            ["insertshape", addShape],
      ["includeshape", addShape],
      ["addform", addShape],
      ["insertform", addShape],
      ["includeform", addShape],
      ["addfigure", addShape],
      ["insertfigure", addShape],
      ["includefigure", addShape],
      ["addoutline", addShape],
      ["insertoutline", addShape],
      ["includeoutline", addShape],
      ["addcontour", addShape],
      ["insertcontour", addShape],
      ["includecontour", addShape],
      ["addprofile", addShape],
      ["insertprofile", addShape],
      ["includeprofile", addShape],
      ["addmold", addShape],
      ["insertmold", addShape],
      ["includemold", addShape],
      ["addpattern", addShape],
      ["insertpattern", addShape],
      ["includepattern", addShape],
      ["addstructure", addShape],
      ["insertstructure", addShape],
      ["includestructure", addShape],
      ["addframework", addShape],
      ["insertframework", addShape],
            ["changeshape", changeShape],
            ["clearobjects", clearObjects],
            ["clearredostack", clearRedoStack],
            ["crop", crop],
            ["crop", crop],
      ["trim", crop],
      ["cut", crop],
      ["slice", crop],
      ["snip", crop],
      ["clip", crop],
      ["shear", crop],
      ["prune", crop],
      ["truncate", crop],
      ["pare", crop],
      ["shave", crop],
      ["remove", crop],
      ["excise", crop],
      ["delete", crop],
      ["chop", crop],
      ["lop", crop],
      ["sever", crop],
      ["detach", crop],
      ["isolate", crop],
      ["extract", crop],
      ["trim away", crop],
      ["cut out", crop],
      ["slice off", crop],
      ["snip out", crop],
      ["clip off", crop],
      ["shear away", crop],
      ["prune off", crop],
      ["truncate away", crop],
      ["pare away", crop],
            ["sharpen", Sharpen],
            ["emboss", Emboss],
            ["shave off", crop],
            ["getCropzoneRect", getCropzoneRect],
            ["switchx", flipX],
      ["turnx", flipX],
      ["reversex", flipX],
      ["rotate180x", flipX],
      ["upendx", flipX],
      ["transposex", flipX],
      ["flip horizontally", flipX],
      ["mirror horizontally", flipX],
      ["reverse horizontally", flipX],
      ["invert horizontally", flipX],
      ["swap horizontally", flipX],
      ["switch horizontally", flipX],
      ["turn horizontally", flipX],
      ["reverse horizontally", flipX],
      ["rotate 180 degrees horizontally", flipX],
      ["upend horizontally", flipX],
      ["transpose horizontally", flipX],
            ["mirrory", flipY],
            ["reversedy", flipY],
            ["inverty", flipY],
            ["swapy", flipY],
            ["switchy", flipY],
            ["turny", flipY],
            ["reversey", flipY],
            ["rotate180y", flipY],
            ["upendy", flipY],
            ["transposey", flipY],
            ["flip vertically", flipY],
            ["mirror vertically", flipY],
            ["reverse vertically", flipY],
            ["invert vertically", flipY],
            ["swap vertically", flipY],
            ["switch vertically", flipY],
            ["turn vertically", flipY],
            ["reverse vertically", flipY],
            ["rotate 180 degrees vertically", flipY],
            ["upend vertically", flipY],
            ["transpose vertically", flipY],
            ["getCanvasSize", getCanvasSize],
            ["getobjectposition", getObjectPosition],
            ["getObjectProperties", getObjectProperties],
            ["removeobject", removeObject],
            ["flipx", flipX],
            ["mirrorx", flipX],
            ["reversedx", flipX],
            ["invertx", flipX],
            ["swapx", flipX],
            ["switchx", flipX],
            ["turnx", flipX],
            ["reversex", flipX],
            ["rotate180x", flipX],
            ["upendx", flipX],
            ["transposex", flipX],
            ["flip horizontally", flipX],
            ["mirror horizontally", flipX],
            ["reverse horizontally", flipX],
            ["invert horizontally", flipX],
            ["swap horizontally", flipX],
            ["switch horizontally", flipX],
            ["turn horizontally", flipX],
            ["reverse horizontally", flipX],
            ["rotate 180 degrees horizontally", flipX],
            ["upend horizontally", flipX],
            ["transpose horizontally", flipX],
            ["mirrory", flipY],
            ["reversedy", flipY],
            ["inverty", flipY],
            ["swapy", flipY],
            ["switchy", flipY],
            ["turny", flipY],
            ["reversey", flipY],
            ["rotate180y", flipY],
            ["upendy", flipY],
            ["transposey", flipY],
            ["flip vertically", flipY],
            ["mirror vertically", flipY],
            ["reverse vertically", flipY],
            ["invert vertically", flipY],
            ["swap vertically", flipY],
            ["switch vertically", flipY],
            ["turn vertically", flipY],
            ["reverse vertically", flipY],
            ["rotate 180 degrees vertically", flipY],
            ["upend vertically", flipY],
            ["transpose vertically", flipY],
            ["getCanvasSize", getCanvasSize],
            ["getobjectposition", getObjectPosition],
            ["getObjectProperties", getObjectProperties],
            ["removeobject", removeObject],
            ["sepia", Sepia],
            ["brightness", Brightness],
            ["saturation", Saturation], 
            ["cartoonize", cartoonize], 
            ["mask", Mask],
            ["startdrawingmode", startDrawingMode],
            ["noise", Noise],
            ["pixelate", Pixelate],
            ["tint", Tint],
            ["multiply", Multiply],
            ["blend", Blend],
            ["colordodge", ColorDodge], 
            ["vintage", Vintage],
            ["addicon", addicon],
            ["addobjects", addobjects],
            ["addshape", addShape], 
            ["changeshape", changeShape],
            ["clearobjects", clearObjects],
            ["clearredostack", clearRedoStack],
            ["crop", crop],
            ["getCropzoneRect", getCropzoneRect],
            ["flipx", flipX],
            ["flipy", flipY],
            ["get02CanvasSize", getCanvasSize],
            ["getobjectposition", getObjectPosition],
            ["getObjectProperties", getObjectProperties],
            ["removeobject", removeObject],
            ["rotate", rotate],
            ["setangle", setAngle],
            ["setdrawingshaperect", setDrawingShaperect],
            ["setdrawingdhapecircle", setDrawingShapecircle],
            ["setdrawingshapeoval", setDrawingShapeoval],
            ["setdrawingshapetriangle", setDrawingShapetriangle], 
            ["setobjectposition", setObjectPosition],
            ["setobjectproperties", setObjectProperties],               
            ["mousedown", mousedown],         
            ["textediting", textEditing],   
            ["undo", Undo],
            ...getPromptPermutations(imagePrompts)
            ] 
    
      function getPromptPermutations(prompts) {
            const permutations = [];
            prompts.forEach(a => {
              prompts.forEach(b => {
                if(a !== b) {
                  permutations.push([a + " " + b, imageEditors]);  
                   }
              });
            });
    
              return permutations;
            }
    
      async function executeActions(messageInput, keywordsActions) {
              for (let i = 0; i < keywordsActions.length; i++) {
    
                const keyword = keywordsActions[i][0];
                // console.log('keyword:', keyword); // Check if the keyword is defined
    
                const action = keywordsActions[i][1];      
                // console.log('action:', action); // Check if the action is defined
                // console.log(messageInput.includes(keyword))
                if (messageInput.includes(keyword)){
                    // console.log(`Found keyword: ${keyword}`);
                    // console.log(messageInput.includes(keyword))
                    await action();
                    await new Promise(resolve => setTimeout(resolve, 1000)); 
                  }
               }
            }
    
      executeActions(messageInput, keywordsActions);
    
        
    }
          // handleInputChange();
        
          document.querySelector("input[type='submit']").addEventListener('click', handleInputChange);
          
        });