import { client } from "@gradio/client";

const response_0 = await fetch("https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png");
const exampleImage = await response_0.blob();

const app = await client("yisol/IDM-VTON");
const result = await app.predict("/tryon", [
  {
    "background": "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png",
    "layers": [],
    "composite": null
  }, // undefined  in 'Human. Mask with pen or use auto-masking' Imageeditor component
  exampleImage, // blob in 'Garment' Image component
  "Hello!!", // string  in 'parameter_17' Textbox component
  true, // boolean  in 'Yes' Checkbox component
  true, // boolean  in 'Yes' Checkbox component
  3, // number  in 'Denoising Steps' Number component
  3, // number  in 'Seed' Number component
]);

console.log(result.data);