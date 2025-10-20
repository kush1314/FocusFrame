const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const statusEl = document.getElementById("status");

function setStatus(text, color = "#374151") {
  statusEl.textContent = text;
  statusEl.style.color = color;
}

startBtn.addEventListener("click", () => {
  setStatus("Starting camera…");
  chrome.runtime.sendMessage({ type: "START_CAMERA" }, (res) => {
    if (res?.ok) {
      setStatus("Camera active ✅", "#047857");
      startBtn.style.display = "none";
      stopBtn.style.display = "block";
      window.close(); // auto close popup so it doesn’t linger
    } else {
      setStatus("Error starting camera", "#b91c1c");
    }
  });
});

stopBtn.addEventListener("click", () => {
  setStatus("Stopping camera…");
  chrome.runtime.sendMessage({ type: "STOP_CAMERA" }, (res) => {
    if (res?.ok) {
      setStatus("Camera stopped", "#374151");
      startBtn.style.display = "block";
      stopBtn.style.display = "none";
    } else {
      setStatus("Error stopping camera", "#b91c1c");
    }
  });
});

// Update on open
chrome.runtime.sendMessage({ type: "STATUS" }, (res) => {
  if (res?.active) {
    setStatus("Camera active ✅", "#047857");
    startBtn.style.display = "none";
    stopBtn.style.display = "block";
  } else {
    setStatus("Camera inactive");
    startBtn.style.display = "block";
    stopBtn.style.display = "none";
  }
});
