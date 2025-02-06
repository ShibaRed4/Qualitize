const { createWorker } = require("tesseract.js");

function createImageFromBase64(base64Data, outputFilePath) {
  // Remove base64 prefix if it exists
  const base64String = base64Data.replace(/^data:image\/\w+;base64,/, "");

  // Decode the base64 string to a buffer
  const imageBuffer = Buffer.from(base64String, "base64");

  // Save the image buffer to a file
  fs.writeFile(outputFilePath, imageBuffer, (err) => {
    if (err) {
      console.error("Error writing image file:", err);
    } else {
      console.log("Image saved successfully to", outputFilePath);
    }
  });
}

module.exports = {
  name: "action.readPage",
  initFunction: async (req) => {
    const image = createImageFromBase64(req.body.payload)
    const worker = await createWorker("eng");
    const ret = await worker.recognize(image);
    await worker.terminate();
    return ret.data.text
  },
};
