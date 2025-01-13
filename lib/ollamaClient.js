const { Buffer } = require("node:buffer");

const Prompt = `
    Act as an OCR assistant. Analyze the provided image and:

    1. Recognize all visible text in the image with the highest accuracy possible.
    2. Maintain the original structure, formatting, and alignment of the text exactly as it appears in the image.
    3. Preserve any bullet points, numbered lists, headings, underlines, and spacing from the original text.
    4. If any text is unclear or unreadable, replace it with [unclear] in your transcription. Provide only the transcription without any additional comments or explanations.
`;

class OllamaClient {
  static async chat(data) {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: data.model,
        messages: data.message,
        stream: false,
      }),
    });

    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      return;
    }

    const data = await response.json();
    return data.message.content;
  }
  static async transcribeText(imageData){
    try {
        const base64EncodedData = Buffer.from(imageData).toString("base64");
        const response = await fetch("http://localhost:11434/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "aiden_lu/minicpm-v2.6:Q4_K_M",
            messages: [
              {
                role: "user",
                content: Prompt,
                images: [base64EncodedData],
              },
            ],
            stream: false
          }),
        });
    
        if (!response.ok) {
          console.error(`Error: ${response.status} - ${response.statusText}`);
          return;
        }

        const data = await response.json()
        return data.message.content
        
      } catch (error) {
        console.error("Error making request:", error);
      }
  }
}


module.exports = OllamaClient;
