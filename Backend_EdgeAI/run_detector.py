import firebase_admin
from firebase_admin import credentials, db
from ultralytics import YOLO
import cv2
import time

# 1. Connect to your Firebase Database
cred = credentials.Certificate("C:\\Users\\shind\\OneDrive\\Attachments\\Desktop\\CTP\\LEOPard-1\\leopard-detection-and-alert-sy-firebase-adminsdk-fbsvc-4d116f9609.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://leopard-detection-and-alert-sy-default-rtdb.asia-southeast1.firebasedatabase.app/'
})

alert_ref = db.reference('alert')

# Load your best YOLO model
model = YOLO('runs/detect/train5/weights/last.pt') 
cap = cv2.VideoCapture(0)

last_state = "none" 
print("System Active... Monitoring for Leopards.")

while True:
    ret, frame = cap.read()
    if not ret: break
    
    # AI scans the frame
    results = model(frame)
    leopard_detected = False
    
    # --- NEW VISUALIZATION CODE ---
    # This line tells YOLO to draw the boxes, labels, and confidence scores on the frame
    annotated_frame = results[0].plot()
    # ------------------------------
    
    # Check if AI sees a leopard with high confidence
    for r in results:
        for box in r.boxes:
            confidence = box.conf[0]
            if confidence > 0.75:  
                leopard_detected = True
                
    current_state = "leopard" if leopard_detected else "none"
                
    # 3. ONLY update Firebase if the state CHANGED
    if current_state != last_state:
        alert_ref.set(current_state)
        
        if current_state == "leopard":
            print("🚨 LEOPARD DETECTED! Sent 'leopard' to Firebase.")
        else:
            print("✅ Area Secure. Sent 'none' to Firebase.")
            
            
        last_state = current_state
        time.sleep(0.5) 

    # --- NEW VISUALIZATION CODE ---
    # Show the 'annotated_frame' (with boxes) instead of the raw 'frame'
    cv2.imshow('Leopard Detection Node', annotated_frame)
    # ------------------------------
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()