const OFFSCREEN_URL = chrome.runtime.getURL("offscreen.html");
const INDICATOR_URL = chrome.runtime.getURL("indicator.html");

let cameraActive = false;
let indicatorWindowId = null;

/** Check if offscreen document exists */
async function hasOffscreen() {
  return chrome.offscreen.hasDocument
    ? await chrome.offscreen.hasDocument()
    : false;
}

/** Create offscreen document */
async function ensureOffscreen() {
  if (await hasOffscreen()) return;
  await chrome.offscreen.createDocument({
    url: OFFSCREEN_URL,
    reasons: ["IFRAME_SCRIPTING"],
    justification: "Maintain camera stream while popup is closed",
  });
}

/** Send a message to offscreen document */
async function sendToOffscreen(msg) {
  chrome.runtime.sendMessage(msg);
}

/** Create small green indicator window (top-right corner) */
async function showIndicator() {
  if (indicatorWindowId) return; // already open
  const win = await chrome.windows.create({
    url: INDICATOR_URL,
    type: "popup",
    width: 60,
    height: 60,
    top: 50,
    left: screen.availWidth - 100, // near top-right corner
    focused: false,
  });
  indicatorWindowId = win.id;
}

/** Remove indicator window */
async function hideIndicator() {
  if (indicatorWindowId) {
    try {
      await chrome.windows.remove(indicatorWindowId);
    } catch (e) {
      // already closed or invalid
    }
    indicatorWindowId = null;
  }
}

/** Background message listener */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    switch (msg.type) {
      case "START_CAMERA":
        await ensureOffscreen();
        await sendToOffscreen({ type: "OFFSCREEN_START" });
        cameraActive = true;
        await showIndicator(); // show green dot
        sendResponse({ ok: true });
        break;

      case "STOP_CAMERA":
        await sendToOffscreen({ type: "OFFSCREEN_STOP" });
        cameraActive = false;
        if (await hasOffscreen()) await chrome.offscreen.closeDocument();
        await hideIndicator(); // hide green dot
        sendResponse({ ok: true });
        break;

      case "STATUS":
        sendResponse({ active: cameraActive });
        break;
    }
  })();
  return true; // keep service worker alive for async ops
});
