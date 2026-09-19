from ultralytics import YOLO

def main():
    # 1. Load the model
    model = YOLO('yolov8n.pt') 

    # 2. Paste your COPIED PATH here between the quotes
    # Make sure there is an 'r' before the first quote!
    data_path = r'C:\Users\shind\OneDrive\Desktop\CTP\LEOPard-1\data.yaml'

    # 3. Start Training
    try:
        print(f"Attempting to start training with: {data_path}")
        model.train(data=data_path, epochs=10, imgsz=640, device='cpu')
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == '__main__':
    main()