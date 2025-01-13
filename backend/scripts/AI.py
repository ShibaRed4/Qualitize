import torch
import sys
import io
import json
import base64
from PIL import Image
from ultralytics import RTDETR

torch.cuda.set_device(0)

model = RTDETR('./backend/models/rtdetr-l.pt')

while True:
    try:
        # Read input from stdin
        input_line = sys.stdin.readline()

        if not input_line:
            continue


        # Parse the input

       
        image_buffer = io.BytesIO(base64.b64decode(input_line))
        image = Image.open(image_buffer)
        results = model(image, verbose=False)
        
        object_classes = results[0].boxes.cls.to('cpu').tolist()
        class_names = results[0].names[object_classes[0]]
        boxes_xyxy = results[0].boxes.xyxy.to('cpu').tolist()

        detected_class_names = []
        detections = []

        for class_id in object_classes:
            class_name = results[0].names[class_id]
            detected_class_names.append(class_name)

        for idx, box in enumerate(boxes_xyxy):
            detection = {
                    "class_name": detected_class_names[idx],
                    "bounding_box": box,
            }
            detections.append(detection)

        print(json.dumps({"detections": detections}))
        sys.stdout.flush()

    except Exception as e:
        print(e)
        sys.stdout.flush()
