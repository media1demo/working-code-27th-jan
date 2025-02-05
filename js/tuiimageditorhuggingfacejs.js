import Replicate from 'replicate';
const replicate = new Replicate();

const input = {
  image: "https://replicate.delivery/pbxt/IBnrzJD8Vvz3rD7yF5W8ODnpeA5wcoNpP1RRiDutqW1nG8eF/example.jpeg",
  prompt: "turn him into cyborg"
};

const output = await replicate.run("timothybrooks/instruct-pix2pix:30c1d0b916a6f8efce20493f5d61ee27491ab2a60437c13c588468b9810ec23f", { input });
console.log(output);
