from flask import Flask, request, jsonify
from ultralytics import YOLO
from deepface import DeepFace
from flask_cors import CORS
import numpy as np, cv2, base64

app = Flask(__name__)
CORS(app)

# Load YOLOv8 pose model
yolo_model = YOLO("yolov8n-pose.pt")

@app.route("/analyze", methods=["POST"])
def analyze():
    # Decode the frame from base64
    data = request.json
    img_data = base64.b64decode(data["frame"])
    img = cv2.imdecode(np.frombuffer(img_data, np.uint8), cv2.IMREAD_COLOR)

    # -------- YOLO POSTURE DETECTION --------
    results = yolo_model.predict(img, verbose=False)
    posture = "good"

    if results[0].keypoints is not None:
        k = results[0].keypoints.xy.cpu().numpy()[0]
        shoulder_y = np.mean([k[5][1], k[6][1]])
        nose_y = k[0][1]
        if nose_y > shoulder_y + 30:
            posture = "slouching"

    # -------- DEEPFACE EMOTION ANALYSIS --------
    try:
        faces = DeepFace.analyze(img, actions=["emotion"], enforce_detection=False)
        emotion = faces[0]["dominant_emotion"] if isinstance(faces, list) and len(faces) > 0 else "neutral"

        # Optionally filter top emotions for better precision
        emotion_scores = faces[0].get("emotion", {})
        filtered_emotions = {key: emotion_scores[key] for key in ["happy", "neutral", "sad", "surprise"] if key in emotion_scores}
        print("Filtered emotions:", filtered_emotions)

        # Draw emotion label on frame (for debugging if needed)
        cv2.putText(img, f"Emotion: {emotion}", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    except Exception as e:
        print(f"Error analyzing emotion: {e}")
        emotion = "neutral"

    # -------- COMBINE FEEDBACK LOGIC --------
    if emotion in ["sad", "tired"]:
        rec = "You look tired 💤 Take a short break."
    elif posture == "slouching":
        rec = "Sit up straight 💪"
    else:
        rec = "You’re doing great! Keep it up 😊"

    # Optional debug visualization (if you want to test standalone)
    # cv2.imshow("FocusFrame Emotion Detector", img)
    # if cv2.waitKey(1) & 0xFF == ord('q'):
    #     cv2.destroyAllWindows()

    # Return result to Chrome extension
    return jsonify({
        "emotion": emotion,
        "posture": posture,
        "recommendation": rec
    })

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)

# from flask import Flask, request, jsonify
# from ultralytics import YOLO
# from deepface import DeepFace
# from flask_cors import CORS
# import numpy as np, cv2, base64

# app = Flask(__name__)
# CORS(app)
# yolo_model = YOLO("yolov8n-pose.pt")  # use your model path if different

# @app.route("/analyze", methods=["POST"])
# def analyze():
#     data = request.json
#     img_data = base64.b64decode(data["frame"])
#     img = cv2.imdecode(np.frombuffer(img_data, np.uint8), cv2.IMREAD_COLOR)

#     results = yolo_model.predict(img, verbose=False)
#     posture = "good"
#     if results[0].keypoints is not None:
#         k = results[0].keypoints.xy.cpu().numpy()[0]
#         shoulder_y = np.mean([k[5][1], k[6][1]])
#         nose_y = k[0][1]
#         if nose_y > shoulder_y + 30:
#             posture = "slouching"

#     faces = DeepFace.analyze(img, actions=["emotion"], enforce_detection=False)
#     emotion = faces[0]["dominant_emotion"] if faces else "neutral"

#     if emotion in ["sad", "tired"]:
#         rec = "You look tired 😴 Take a short break."
#     elif posture == "slouching":
#         rec = "Sit up straight 💪"
#     else:
#         rec = "You’re doing great! Keep it up 😊"

#     return jsonify({"emotion": emotion, "posture": posture, "recommendation": rec})

# if __name__ == "__main__":
#     app.run(host="127.0.0.1", port=5000)