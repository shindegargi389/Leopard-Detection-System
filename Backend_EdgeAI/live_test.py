from ultralytics import YOLO
import cv2

# 1. Load your trained model from the train4 folder
model = YOLO(r'runs\detect\train4\weights\best.pt')

# 2. Open the Laptop Webcam (source 0)
cap = cv2.VideoCapture(0)

while cap.isOpened():
    success, frame = cap.read()
    if success:
        # Run YOLO detection on the current frame
        # We use a low confidence (0.25) to catch any leopard-like patterns
        results = model(frame, conf=0.25)

        # Visualize the results on the frame
        annotated_frame = results[0].plot()

        # Display the live feed
        cv2.imshow("Leopard Detection Live Test", annotated_frame)

        # Break the loop if 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    else:
        break

cap.release()
cv2.destroyAllWindows()