from ultralytics import YOLO

# 1. Point it to your saved weights from Epoch 32
model = YOLO('runs/detect/train5/weights/last.pt') 

# 2. Tell the model to pick up right where it left off
model.train(resume=True)