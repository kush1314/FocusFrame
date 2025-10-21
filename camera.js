const video = document.getElementById("video");
let stream = null;

// Start the camera
async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    console.log("[FocusFrame] Camera started");
  } catch (err) {
    console.error("Error accessing camera:", err);
    alert("Unable to access camera. Check permissions.");
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
