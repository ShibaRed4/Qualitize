from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import uvicorn
import json
from PIL import Image
import io
import torch
import numpy as np
import cv2
from depth_anything_v2.dpt import DepthAnythingV2
from ultralytics import RTDETR

# Set device
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {DEVICE}")

# Initialize models
model_configs = {
    'vits': {'encoder': 'vits', 'features': 64, 'out_channels': [48, 96, 192, 384]},
    'vitb': {'encoder': 'vitb', 'features': 128, 'out_channels': [96, 192, 384, 768]},
    'vitl': {'encoder': 'vitl', 'features': 256, 'out_channels': [256, 512, 1024, 1024]},
    'vitg': {'encoder': 'vitg', 'features': 384, 'out_channels': [1536, 1536, 1536, 1536]}
}
encoder = 'vits'  # Options: 'vits', 'vitb', 'vitl', 'vitg'

# Load depth estimation model
depth_model = DepthAnythingV2(**model_configs[encoder])
depth_model.load_state_dict(torch.load(f'depth_anything_v2_{encoder}.pth', map_location=DEVICE))
depth_model = depth_model.to(DEVICE).eval()

# Load object detection model
model = RTDETR("rtdetr-l.pt")

app = FastAPI()

def calculate_object_distance(depth_map, bbox):
    """
    Calculate the median depth value within a bounding box.
    
    Args:
        depth_map: The depth map from DepthAnythingV2
        bbox: Bounding box coordinates [x_min, y_min, x_max, y_max]
    
    Returns:
        Distance in meters (approximate)
    """
    # Convert to integers and ensure within bounds
    height, width = depth_map.shape
    x_min = max(0, int(bbox[0]))
    y_min = max(0, int(bbox[1]))
    x_max = min(width-1, int(bbox[2]))
    y_max = min(height-1, int(bbox[3]))
    
    # Check if we have a valid box
    if x_max <= x_min or y_max <= y_min:
        return float("inf")
    
    # Extract the region of interest
    roi_depth = depth_map[y_min:y_max, x_min:x_max]
    
    if roi_depth.size == 0:
        return float("inf")
    
    # Calculate the median depth in the ROI (more robust than mean)
    median_depth = np.median(roi_depth)
    
    # INVERT the depth value (since the model seems to use opposite convention)
    depth_min = depth_map.min()
    depth_max = depth_map.max()
    inverted_depth = depth_max - median_depth + depth_min
    
    # Convert to approximate meters
    depth_scale = 1.0  # Adjust this based on testing
    distance_in_meters = inverted_depth * depth_scale
    
    return distance_in_meters

# WebSocket endpoint
@app.websocket("/detect")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()  # Accept the WebSocket connection
    print("Client connected.")

    try:
        while True:
            # Receive a message from the client
            data = await websocket.receive_bytes()
            
            # Convert bytes to PIL Image for object detection
            pil_image = Image.open(io.BytesIO(data))
            
            # Convert bytes to OpenCV image for depth estimation
            nparr = np.frombuffer(data, np.uint8)
            cv_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if cv_image is None:
                raise ValueError("Failed to load image with OpenCV")

            # Perform object detection with PIL image
            results = model(pil_image)
            object_classes = results[0].boxes.cls.to("cpu").tolist()
            bboxes_xyxy = results[0].boxes.xyxy.to("cpu").tolist()
            confidences = results[0].boxes.conf.to("cpu").tolist()
            
            # Get depth map from DepthAnythingV2 with OpenCV image
            with torch.no_grad():
                depth_map = depth_model.infer_image(cv_image)
            
            # Convert depth map to numpy array if it's a tensor
            if isinstance(depth_map, torch.Tensor):
                depth_map = depth_map.cpu().numpy()
            
            # Calculate distance for each detected object
            detected_objects = []
            for idx, (box, class_id, conf) in enumerate(zip(bboxes_xyxy, object_classes, confidences)):
                if conf < 0.5:  # Skip low confidence detections
                    continue
                
                # Calculate distance
                distance = calculate_object_distance(depth_map, box)
                
                # Store object info
                obj_info = {
                    "class_name": results[0].names[class_id],
                    "bounding_box": box,
                    "confidence": conf,
                    "distance": distance
                }
                detected_objects.append(obj_info)
            
            # Sort objects by distance
            detected_objects.sort(key=lambda x: x["distance"])
            
            # Format response
            response = {}
            if detected_objects:
                closest_object = detected_objects[0]
                response["closest_distance"] = closest_object["distance"]
                response["closest_object"] = {
                    "class_name": closest_object["class_name"],
                    "bounding_box": closest_object["bounding_box"],
                    "confidence": closest_object["confidence"]
                }
                response["all_objects"] = detected_objects
            else:
                response["closest_distance"] = None
                response["closest_object"] = None
                response["all_objects"] = []

            # Send JSON response
            await websocket.send_text(json.dumps(response))

    except WebSocketDisconnect:
        print("Client disconnected.")
    except Exception as e:
        print(f"Error: {str(e)}")
        await websocket.send_text(json.dumps({"error": str(e)}))
        await websocket.close()


# A simple HTTP route
@app.get("/")
async def read_root():
    return {"message": "Object detection with depth estimation service"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
