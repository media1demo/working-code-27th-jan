
let models = {};
console.log("qqq");
// Function to load .bin and .param files
async function loadModel() {
    // const binResponse = await fetch(`realesr-animevideov3-x${scale}.bin`);
    const paramResponse = await fetch(`realesr-animevideov3-x2.param`);
    const binResponse = await fetch(`realesr-animevideov3-x2.bin`);

    const binBuffer = await binResponse.arrayBuffer();
    const paramText = await paramResponse.text();

    return {
        bin: new Uint8Array(binBuffer),
        param: paramText
    };
}

async function initializeModels() {
    models[2] = await loadModel(2);
    models[3] = await loadModel(3);
    models[4] = await loadModel(4);
    console.log("Models loaded");
}

initializeModels();

async function upscaleImage() {
    const imageInput = document.getElementById('imageInput');
    const scaleFactor = document.getElementById('scaleFactor').value;
    const file = imageInput.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            document.getElementById('originalImage').src = e.target.result;
            

            const upscaledDataUrl = await simulateUpscaling(e.target.result, scaleFactor);
            
            document.getElementById('upscaledImage').src = upscaledDataUrl;
        };
        reader.readAsDataURL(file);
    }
}

async function simulateUpscaling(imageDataUrl) {

    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width ;
            canvas.height = img.height ;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL());
        };
        img.src = imageDataUrl;
    });
}