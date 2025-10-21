const v       = document.getElementById("v");
const startBt = document.getElementById("start");
const stopBt  = document.getElementById("stop");
const minBt   = document.getElementById("min");
const status  = document.getElementById("status");

let stream = null;

// --- NEW: detect if this is a one-time permission request window ---
const urlParams = new URLSearchParams(window.location.search);
const isPermissionRequest = urlParams.get("permission_request") === "true";

// Try to auto-start; if Chrome requires a gesture, the Start button is there.
(async function autoTry() {
  try {
    // Small delay to ensure the window has focus (helps some platforms)
    await new Promise(r => setTimeout(r, 80));
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    v.srcObject = stream;
    startBt.disabled = true;
    stopBt.disabled = false;
    status.textContent = "Camera active ✅";

    // --- NEW: if opened just to request permission, close after success ---
    if (isPermissionRequest) {
      console.log("[FocusFrame] Permission window opened for camera access");
      setTimeout(() => {
        window.close();
      }, 2000);
    }
  } catch (e) {
    console.warn("Auto start failed (will require button):", e);
    status.textContent = "Click Start and allow camera.";
  }
})();

startBt.addEventListener("click", async () => {
  status.textContent = "Requesting camera…";
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    v.srcObject = stream;
    startBt.disabled = true;
    stopBt.disabled = false;
    status.textContent = "Camera active ✅";
  } catch (e) {
    console.error("Camera error:", e);
    status.textContent = "Permission denied ❌";
    alert("Please allow camera access in Chrome’s prompt.");
  }
});

stopBt.addEventListener("click", () => {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  v.srcObject = null;
  startBt.disabled = false;
  stopBt.disabled = true;
  status.textContent = "Stopped.";
});

minBt.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "MINIMIZE_CAM" });
});

// Clean shutdown if this window is closed
window.addEventListener("unload", () => {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
});
