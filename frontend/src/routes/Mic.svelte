<script lang="ts">
  import { onMount } from "svelte";
  import { checkToken } from "../lib/checkToken";
  let mediaRecorder;
  let audioChunks = [];
  let isRecording = false;

  onMount(() => {
    
    checkToken()

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: "audio/webm;codecs=opus",
            audioBitsPerSecond: 64000,
        });
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };
      })
      .catch((err) => {
        console.error("Error accessing microphone:", err);
      });
  });

  function startRecording() {
    if (!mediaRecorder) return;
    audioChunks = [];
    mediaRecorder.start();
    console.log(`Started recording...`)
    isRecording = true;
  }

  async function stopRecording() {
  console.log(`Stopping recording...`);

  if (!mediaRecorder) {
    console.error("MediaRecorder is not initialized.");
    return;
  }

  if (mediaRecorder.state !== "recording") {
    console.error("MediaRecorder is not in a recording state.");
    return;
  }

  mediaRecorder.onstop = async () => {
    console.log("MediaRecorder stopped.");

    if (audioChunks.length === 0) {
      console.error("No audio chunks recorded.");
      return;
    }

    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    console.log(`Audio blob created:`, audioBlob);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Audio = (reader.result as string).split(",")[1];
      console.log(`Base64 audio data:`, base64Audio);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Authorization": `Bearer: ${localStorage.getItem('token')}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ payload: base64Audio }),
        });

        if (!response.ok) {
          console.error("Failed to send audio data:", response.statusText);
        } else {
          console.log("Audio data sent successfully.");
        }

        const data = await response.json()
        console.log(data)
      } catch (err) {
        console.error("Error sending audio data:", err);
      }
    };

    reader.readAsDataURL(audioBlob);
  };

  mediaRecorder.stop();
  isRecording = false;
}


</script>

<main>
  <h1>Audio Recorder</h1>
  <button on:click={startRecording} disabled={isRecording}
    >Start Recording</button
  >
  <button style="background-color:#171717" on:click={stopRecording} disabled={!isRecording}
    >Stop Recording</button
  >
</main>

<style>
  button {
    margin: 10px;
    padding: 10px;
    font-size: 16px;
    cursor: pointer;
  }

  button:disabled {
    background-color: lightgray;
    cursor: not-allowed;
  }
</style>
