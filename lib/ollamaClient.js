const { Buffer } = require("node:buffer");

const Prompt = `
    Act as an OCR assistant. Analyze the provided image and:

    1. Recognize all visible text in the image with the highest accuracy possible.
    2. Maintain the original structure, formatting, and alignment of the text exactly as it appears in the image.
    3. Preserve any bullet points, numbered lists, headings, underlines, and spacing from the original text.
    4. If any text is unclear or unreadable, replace it with [unclear] in your transcription. Provide only the transcription without any additional comments or explanations.
`;

const AI_AGENT_HEAD = `
You are an AI_Agent. The following are your available list of commands. If an input from the user is similar to the example input associated with a command, respond with its name and include the parameters/arguments formatted as they appear in the input. 

If there is no match whatsoever with the user input and the available list of commands, respond normally like you are having a conversation.

Here is an example:

Name: Hello_World
Arguments: ["message"]
Example Input:
"Hey print hello world for me!"
Example Response:
"Hello_World(message: 'hello world')"

List of Commands:

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

    const responseData = await response.json();
    return responseData.message.content;
  }

  static async command(data) {
    var message = AI_AGENT_HEAD;

    for (const commands of data.list_of_commands) {
      message += `${commands} \n\n`
    }

    const most_recent_input = data.input[data.input.length - 1].content;

    data.input[data.input.length - 1].content = `${message} \n Here is your user input: \n ${most_recent_input}`;
    
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: data.model,
        messages: data.input,
        stream: false,
      }),
    });

    

    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      return;
    }

    const responseData = await response.json();
    return responseData.message.content;
  }

  static async transcribeText(imageData) {
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
          stream: false,
        }),
      });

      if (!response.ok) {
        console.error(`Error: ${response.status} - ${response.statusText}`);
        return;
      }

      const data = await response.json();
      return data.message.content;
    } catch (error) {
      console.error("Error making request:", error);
    }
  }
}

module.exports = OllamaClient;
