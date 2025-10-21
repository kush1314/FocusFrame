let cameraWindowId = null;
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

startBtn.addEventListener("click", async () => {
  if (cameraWindowId) return;

  const screenWidth = screen.availWidth;
  const screenHeight = screen.availHeight;

  const win = await chrome.windows.create({
    url: "camera.html",
    type: "popup",
    width: 500,
    height: 400,
    left: screenWidth - 520,
    top: screenHeight - 460,
    focused: false
  });

  cameraWindowId = win.id;

  try {
    await new Promise(r => setTimeout(r, 150)); // allow window creation
    await chrome.windows.update(cameraWindowId, { state: "minimized" });
    console.log("[FocusFrame] Camera window minimized on start");
  } catch (e) {
    console.warn("Minimize failed:", e);
  }

  startBtn.style.display = "none";
  stopBtn.style.display = "block";
});

stopBtn.addEventListener("click", async () => {
  if (cameraWindowId) {
    try {
      // ✅ Send stop signal to camera window
      chrome.runtime.sendMessage({ type: "CLOSE_CAMERA" });

      // Wait a moment for camera to stop
      await new Promise(r => setTimeout(r, 200));

      await chrome.windows.remove(cameraWindowId);
      console.log("[FocusFrame] Camera window closed cleanly");
    } catch (e) {
      console.warn("Camera window already closed:", e);
    }
    cameraWindowId = null;
  }

  startBtn.style.display = "block";
  stopBtn.style.display = "none";
});
