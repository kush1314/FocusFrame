const OFFSCREEN_URL = chrome.runtime.getURL("offscreen.html");

let cameraActive = false;

/** Check if offscreen document exists */
async function hasOffscreen() {
  return chrome.offscreen.hasDocument ? await chrome.offscreen.hasDocument() : false;
}

/** Create offscreen document */
async function ensureOffscreen() {
  if (await hasOffscreen()) return;
  await chrome.offscreen.createDocument({
    url: OFFSCREEN_URL,
    reasons: ["IFRAME_SCRIPTING"],
    justification: "Maintain camera stream while popup is closed"
  });
}

/** Send a message to offscreen document */
async function sendToOffscreen(msg) {
  chrome.runtime.sendMessage(msg);
}

/** Background message listener */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    switch (msg.type) {
      case "START_CAMERA":
        await ensureOffscreen();
        await sendToOffscreen({ type: "OFFSCREEN_START" });
        cameraActive = true;
        sendResponse({ ok: true });
        break;

      case "STOP_CAMERA":
        await sendToOffscreen({ type: "OFFSCREEN_STOP" });
        cameraActive = false;
        if (await hasOffscreen()) await chrome.offscreen.closeDocument();
        sendResponse({ ok: true });
        break;

      case "STATUS":
        sendResponse({ active: cameraActive });
        break;
    }
  })();
  return true;
});
