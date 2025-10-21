const video = document.getElementById("video");
let stream = null;

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    console.error("Error accessing camera:", err);
    alert("Unable to access camera. Check permissions.");
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
}

// Stop camera when window closes
window.addEventListener("unload", stopCamera);

startCamera();
