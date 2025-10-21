let stream = null;
let active = false;

async function startCamera() {
  if (active) return;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    active = true;
    console.log("[FocusFrame] Camera started");
  } catch (err) {
    console.error("Camera error (offscreen):", err);

    // Windows fallback — request camera permission in a visible context
    if (err.name === "NotAllowedError" || err.name === "NotFoundError") {
      console.log("[FocusFrame] Retrying camera in visible context…");
      await chrome.windows.create({
        url: chrome.runtime.getURL("cam.html") + "?permission_request=true",
        type: "popup",
        width: 400,
        height: 300
      });
    }

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
