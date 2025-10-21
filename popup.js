let cameraWindowId = null;

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

startBtn.addEventListener("click", async () => {
  if (cameraWindowId) return;

  // Create small camera window without focus (prevents mac fullscreen)
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

  // ---- NEW FIX: Immediately minimize window (works on mac + windows) ----
  try {
    await new Promise(r => setTimeout(r, 150)); // brief delay ensures creation
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
      await chrome.windows.remove(cameraWindowId);
    } catch (e) {
      console.warn("Camera window already closed");
    }
    cameraWindowId = null;
  }
  startBtn.style.display = "block";
  stopBtn.style.display = "none";
});
