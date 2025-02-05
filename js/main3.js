var fastText = new FastText({
    serializeTo: './band_model',
    trainFile: './band_train.txt'
});
fastText.train()
.then(done=> {
    console.log("train done.");
})
.catch(error => {
    console.error(error);
})