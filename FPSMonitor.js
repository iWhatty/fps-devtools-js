import { OverlayCanvasFPSPlot } from "./OverlayCanvasFPSPlot.js"
import { Smoother } from "./Smoother.js"



const POSITION_KEY = 'fpsOverlayPosition';

function savePosition(left, top) {
    localStorage.setItem(POSITION_KEY, JSON.stringify({ left, top }));
}

function loadPosition() {
    const raw = localStorage.getItem(POSITION_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}




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
    #memSmoother = null;
    #threshold;
    #interval;
    #debug;

    constructor({ threshold = 60, interval = 1000, debug = true, plotter = null, smoother = null, memSmoother = null } = {}) {
        this.#threshold = threshold;
        this.#interval = interval;
        this.#debug = debug;
        this.#plotter = plotter;
        this.#smoother = smoother;
        this.#memSmoother = memSmoother;
        this.load();
    }

    load() {

        const saved = loadPosition();
        if (saved) {
            this.#plotter.canvas.style.left = `${saved.left}px`;
            this.#plotter.canvas.style.top = `${saved.top}px`;
            this.#plotter.canvas.style.right = 'auto';
            this.#plotter.canvas.style.bottom = 'auto';

            lagSlider.style.left = `${saved.left}px`;
            lagSlider.style.top = `${saved.top + 70}px`;
            lagSlider.style.right = 'auto';
            lagSlider.style.bottom = 'auto';
        }


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

        this.#frames = 0;
        this.#fps = this.#frames;
        const smoothed = this.#smoother?.update(this.#fps) ?? this.#fps;

        let memoryMB = 0;
        let smoothedMem = 0;
        if (performance.memory?.usedJSHeapSize) {
            memoryMB = performance.memory.usedJSHeapSize / 1048576;
            smoothedMem = this.#memSmoother?.update(memoryMB) ?? memoryMB;
        }

        this.#plotter?.push(this.#fps, smoothedFPS, smoothedMem);

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
const memSmoother = new Smoother(0.5);
const fpsMonitor = new FPSMonitor({
    plotter,
    smoother: fpsSmoother,
    memSmoother: memSmoother
});
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

    savePosition(
        e.clientX - dragOffset.x,
        e.clientY - dragOffset.y
    );


});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

plotter.canvas.addEventListener('dblclick', () => {
    isPinned = !isPinned;
    plotter.canvas.style.borderColor = isPinned ? '#f00' : '#888';
});
