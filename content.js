let overlay;
let actions;

function ensureOverlay() {
  if (overlay) return;

  overlay = document.createElement("div");
  overlay.className = "ff-overlay";

  const dot = document.createElement("button");
  dot.className = "ff-dot";
  dot.title = "Camera running — click to open or stop";

  actions = document.createElement("div");
  actions.className = "ff-actions";
  actions.innerHTML = `
    <button data-act="open" class="ff-action">Open Preview</button>
    <button data-act="stop" class="ff-action danger">Stop</button>
  `;

  overlay.appendChild(dot);
  overlay.appendChild(actions);
  document.body.appendChild(overlay);

  // Drag
  let dragging = false, sx=0, sy=0, ox=0, oy=0;
  overlay.addEventListener("mousedown", (e) => {
    if (e.target !== dot) return;
    dragging = true; sx = e.clientX; sy = e.clientY;
    const r = overlay.getBoundingClientRect(); ox = r.left; oy = r.top;
    e.preventDefault();
  });
  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const nx = ox + (e.clientX - sx);
    const ny = oy + (e.clientY - sy);
    overlay.style.left = Math.max(4, Math.min(window.innerWidth - 44, nx)) + "px";
    overlay.style.top  = Math.max(4, Math.min(window.innerHeight - 44, ny)) + "px";
  });
  document.addEventListener("mouseup", () => dragging = false);

  dot.addEventListener("click", () => {
    actions.classList.toggle("show");
  });

  actions.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const act = btn.dataset.act;
    if (act === "open") chrome.runtime.sendMessage({ type: "REOPEN_CAMERA" });
    if (act === "stop") chrome.runtime.sendMessage({ type: "STOP_CAMERA" });
    actions.classList.remove("show");
  });
}

function showOverlay(active) {
  ensureOverlay();
  overlay.style.display = active ? "block" : "none";
  if (!active) actions.classList.remove("show");
}

// messages from background
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "OVERLAY_PREP") ensureOverlay();
  if (msg.type === "OVERLAY_SHOW") showOverlay(!!msg.active);
});

// show dot if already active when page loads
chrome.runtime.sendMessage({ type: "CHECK_STATUS" }, (res) => {
  if (res?.active) showOverlay(true);
});
