let stream = null;
let active = false;

async function startCamera() {
  if (active) return;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    active = true;
    console.log("[FocusFrame] Camera started");
    // You don’t display the video — just hold the stream reference to keep it alive
  } catch (err) {
    console.error("Camera error:", err);
    active = false;
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
  active = false;
  console.log("[FocusFrame] Camera stopped");
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {
    case "OFFSCREEN_START":
      startCamera().then(() => sendResponse({ ok: active }));
      break;
    case "OFFSCREEN_STOP":
      stopCamera();
      sendResponse({ ok: true });
      break;
  }
  return true;
});

self.addEventListener("unload", stopCamera);
