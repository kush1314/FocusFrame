const video = document.getElementById("video");
let stream = null;

// Start the camera
async function startCamera() {
  
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    console.log("[FocusFrame] Camera started");
    setInterval(() => sendToBackend(video), 15000);
  } catch (err) {
    console.error("Error accessing camera:", err);
    alert("Unable to access camera. Check permissions.");
  }
}
// Send frame to YOLO + DeepFace backend
async function sendToBackend(video) {
  if (!stream) return;

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);
  const frameData = canvas.toDataURL("image/jpeg").split(",")[1];

  try {
    const res = await fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frame: frameData }),
    });

    const data = await res.json();
    console.log("Backend response:", data);

    // Show feedback messages (you can replace alerts with something nicer later)
    alert(data.recommendation);
  } catch (err) {
    console.error("Error sending frame:", err);
  }
}
// Stop the camera
function stopCamera() {
  if (stream) {
    console.log("[FocusFrame] Stopping camera");
    stream.getTracks().forEach(track => track.stop());
    stream = null;
    video.srcObject = null;
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "CLOSE_CAMERA") {
    stopCamera();
    window.close(); // safely close window
  }
  sendResponse({ ok: true });
});

// Stop camera on page unload
window.addEventListener("unload", stopCamera);

startCamera();
