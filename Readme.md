# 🎯 FPS & Memory Monitor – DevTools Extension

**Real-time performance diagnostics inside Chrome DevTools.**  
Track FPS, memory, 1% lows, stutters — all in a smooth, interactive overlay.

![FPS Monitor Screenshot](https://user-images.githubusercontent.com/your-image.png)  
*(Mock-up placeholder: drop in your real canvas overlay screenshot)*

---

## 🚀 Features

- 🎞️ **Real-World FPS** — not synthetic
- 📉 **1% Lows** — capture real dips in framerate
- 📋 **Stutter Detection** — % of frames < 20 FPS
- 🧠 **Heap Memory Usage** — via `performance.memory`
- 📊 **Canvas Overlay UI**
  - Raw FPS (green), Smoothed (yellow), Heap (red)
  - Label overlays for key metrics
- 🎛️ **Interactive Controls**
  - Click + drag to move
  - Double-click to pin
  - Shift + F toggles visibility
  - Slider adjusts smoothing lag
- 💾 **Persistent Layout** — remembers position across reloads
- 🧹 **Chrome DevTools Panel** — runs in its own tab

---

## 💠 Quick Start

```
git clone https://github.com/yourname/fps-monitor-devtools.git
cd fps-monitor-devtools
npm install
npm run build
```

Then:

1. Go to `chrome://extensions`
2. Enable **Developer Mode**
3. Click **Load Unpacked**
4. Select the extension folder

Open DevTools → **Performance HUD** tab

---

## 🧠 How It Works

Built around a modern modular architecture:

- `FPSMonitor.js` — tracks and emits performance snapshots
- `Smoother.js` — handles geometric smoothing with min/max
- `OverlayPlotRenderer.js` — draws dynamic canvas overlay
- `controller.js` — connects UI, hotkeys, slider, dragging

All bundled via [esbuild](https://esbuild.dev) into a single minified file for blazing-fast DevTools use.

---

## ✅ Why Use This?

Compared to `stats.js`, this tool adds:

- 1% Lows
- Stutter rate %
- Memory metrics
- Adjustable smoothing
- Full DevTools integration
- Draggable, pinnable overlay with persistence

---

## 📦 Folder Structure

```
fps-monitor-devtools/
├── src/                     ← Modular source code
│   ├── FPSMonitor.js
│   ├── OverlayPlotRenderer.js
│   ├── controller.js
│   └── Smoother.js
├── assets/monitor.bundle.js
├── manifest.json
├── panel.html / panel.js
└── devtools.html / devtools.js
```

---

## 📘 License

MIT — free to use, hack, remix, and ship in your own tools.

Made with ❤️ for performance nerds.

---

## 🙌 Contribute

Got ideas? Found bugs? Want to theme the overlay?

- Submit an issue or PR
- Drop a star ⭐ if you find it useful
- Share your own forks + dashboards!

