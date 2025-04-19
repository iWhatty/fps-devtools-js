import { OverlayCanvasFPSPlot } from "./OverlayCanvasFPSPlot.js"
import { Smoother } from "./Smoother.js"


// === FPS Monitor Core ===
class FPSMonitor {
    #frames = 0;
    #fps = 0;
    #lastTick = 0;
    #rafId = null;
    #fpsIntervalId = null;
    #dropCallback = null;
    #plotter = null;
    #smoother = null;
    #threshold;
    #interval;
    #debug;

    constructor({ threshold = 60, interval = 1000, debug = true, plotter = null, smoother = null } = {}) {
        this.#threshold = threshold;
        this.#interval = interval;
        this.#debug = debug;
        this.#plotter = plotter;
        this.#smoother = smoother;
    }

    start() {
        if (this.#rafId) return;
        this.#frames = 0;
        this.#lastTick = performance.now();
        this.#rafId = requestAnimationFrame(this.#trackFrame);
        this.#fpsIntervalId = setInterval(this.#updateFPS, this.#interval);
    }

    stop() {
        cancelAnimationFrame(this.#rafId);
        clearInterval(this.#fpsIntervalId);
        this.#rafId = null;
        this.#fpsIntervalId = null;
    }

    getFPS() {
        return this.#fps;
    }

    onDrop(callback) {
        this.#dropCallback = callback;
    }

    configure({ threshold, interval, debug, lag }) {
        if (threshold != null) this.#threshold = threshold;
        if (interval != null) {
            this.#interval = interval;
            clearInterval(this.#fpsIntervalId);
            this.#fpsIntervalId = setInterval(this.#updateFPS, this.#interval);
        }
        if (debug != null) this.#debug = debug;
        if (lag != null) this.#smoother?.setLagFactor(lag);
    }

    #trackFrame = (timestamp) => {
        const delta = timestamp - this.#lastTick;
        if (delta > this.#threshold) this.#handleDrop(timestamp, delta);
        this.#frames++;
        this.#lastTick = timestamp;
        this.#rafId = requestAnimationFrame(this.#trackFrame);
    };

    #updateFPS = () => {
        this.#fps = this.#frames;
        this.#frames = 0;

        const smoothed = this.#smoother?.update(this.#fps) ?? this.#fps;
        this.#plotter?.push(this.#fps, smoothed);

        if (this.#debug) {
            console.log(`[FPSMonitor] Raw: ${this.#fps.toFixed(1)} | Smoothed: ${smoothed.toFixed(1)}`);
        }
    };

    #handleDrop(timestamp, delta) {
        if (this.#debug) {
            console.warn(`[FPSMonitor] Frame drop: ${delta.toFixed(1)}ms at ${timestamp.toFixed(1)}ms`);
        }
        this.#dropCallback?.({ timestamp, delta });
    }
}

// === UI: Lag Slider ===
const lagSlider = document.createElement('input');
lagSlider.type = 'range';
lagSlider.min = '0.01';
lagSlider.max = '0.99';
lagSlider.step = '0.01';
lagSlider.value = '0.5';
Object.assign(lagSlider.style, {
    position: 'fixed',
    right: '10px',
    bottom: '80px',
    zIndex: 9999
});
document.body.appendChild(lagSlider);

// === Init ===
const plotter = new OverlayCanvasFPSPlot();
const smoother = new Smoother(parseFloat(lagSlider.value));
const fpsMonitor = new FPSMonitor({ plotter, smoother });

fpsMonitor.onDrop(({ delta }) => {
    console.log(`!! Frame dropped: ${delta.toFixed(1)}ms`);
});

lagSlider.addEventListener('input', () => {
    const lag = parseFloat(lagSlider.value);
    smoother.setLagFactor(lag);
});

fpsMonitor.start();

// Expose for manual control
window.fpsMonitor = fpsMonitor;



// === SHIFT+F TOGGLE ===

let isVisible = true;

function toggleOverlay() {
    isVisible = !isVisible;
    plotter.canvas.style.display = isVisible ? 'block' : 'none';
    lagSlider.style.display = isVisible ? 'block' : 'none';

    if (isVisible) {
        fpsMonitor.start();
    } else {
        fpsMonitor.stop();
    }
}

window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'f' && e.shiftKey) {
        toggleOverlay();
    }
});


// === Drag & Pin Logic ===
let isPinned = false;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

plotter.canvas.addEventListener('mousedown', (e) => {
  if (isPinned) return;
  isDragging = true;
  const rect = plotter.canvas.getBoundingClientRect();
  dragOffset.x = e.clientX - rect.left;
  dragOffset.y = e.clientY - rect.top;
  e.preventDefault();
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  plotter.canvas.style.right = 'auto';
  plotter.canvas.style.bottom = 'auto';
  plotter.canvas.style.left = `${e.clientX - dragOffset.x}px`;
  plotter.canvas.style.top = `${e.clientY - dragOffset.y}px`;

  lagSlider.style.right = 'auto';
  lagSlider.style.bottom = 'auto';
  lagSlider.style.left = `${e.clientX - dragOffset.x}px`;
  lagSlider.style.top = `${e.clientY - dragOffset.y + 70}px`;
});

window.addEventListener('mouseup', () => {
  isDragging = false;
});

plotter.canvas.addEventListener('dblclick', () => {
  isPinned = !isPinned;
  plotter.canvas.style.borderColor = isPinned ? '#f00' : '#888';
});
