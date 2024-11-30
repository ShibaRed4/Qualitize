from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import uvicorn
import json
from PIL import Image
import io
import json
from ultralytics import RTDETR

model = RTDETR("rtdetr-l.pt")

app = FastAPI()

# WebSocket endpoint
@app.websocket("/detect")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()  # Accept the WebSocket connection
    print("Client connected.")
    
    try:
        while True:
            # Receive a message from the client
            data = await websocket.receive_bytes()

            image = Image.open(io.BytesIO(data))

            results = model(image)
            object_classes = results[0].boxes.cls.to('cpu').tolist()
            class_name = results[0].names[object_classes[0]]
            bboxes_xyxy = results[0].boxes.xyxy.to('cpu').tolist()

            # Initialize an empty list to store the detected object class names
            detected_class_names = []

            # Iterate over the detected object class IDs
            for class_id in object_classes:
                # Map each class ID to its corresponding class name
                class_name = results[0].names[class_id]
                detected_class_names.append(class_name)

            # Prepare the bounding boxes and other details (e.g., confidence scores, if needed)
            detections = []
            for idx, box in enumerate(bboxes_xyxy):
                # Assuming confidence scores are available (if not, remove it)
                detection = {
                    "class_name": detected_class_names[idx],
                    "bounding_box": box,
                }
                detections.append(detection)

            # Now detections contains all the object data

            # Send the detection results back to the client as JSON
            await websocket.send_json(json.dumps({"detections": detections}))
    
    except WebSocketDisconnect:
        print("Client disconnected.")
        await websocket.close()  # Close the WebSocket connection

# A simple HTTP route
@app.get("/")
async def read_root():
    return {"message": "Welcome to FastAPI WebSocket example!"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)