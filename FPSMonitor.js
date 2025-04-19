import { OverlayCanvasFPSPlot } from "./OverlayCanvasFPSPlot.js"

class FPSMonitor {
    #frames = 0;
    #fps = 0;
    #lastTick = 0;
    #rafId = null;
    #fpsIntervalId = null;
    #dropCallback = null;
    #plotter = null;
    #threshold;
    #interval;
    #debug;

    constructor({ threshold = 50, interval = 1000, debug = false, plotter = null } = {}) {
        this.#threshold = threshold;
        this.#interval = interval;
        this.#debug = debug;
        this.#plotter = plotter;
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

    configure({ threshold, interval, debug }) {
        if (threshold != null) this.#threshold = threshold;
        if (interval != null) {
            this.#interval = interval;
            if (this.#fpsIntervalId) {
                clearInterval(this.#fpsIntervalId);
                this.#fpsIntervalId = setInterval(this.#updateFPS, this.#interval);
            }
        }
        if (debug != null) this.#debug = debug;
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
        this.#plotter?.push(this.#fps);
        if (this.#debug) console.log(`[FPSMonitor] FPS: ${this.#fps}`);
    };

    #handleDrop(timestamp, delta) {
        if (this.#debug) {
            console.warn(`[FPSMonitor] Frame drop: ${delta.toFixed(2)}ms at ${timestamp.toFixed(2)}ms`);
        }
        this.#dropCallback?.({ timestamp, delta });
    }
}




// === Auto-init ===
const plotter = new OverlayCanvasFPSPlot();
const fpsMonitor = new FPSMonitor({
    debug: true,
    plotter,
    threshold: 60
});
fpsMonitor.onDrop(({ delta }) => {
    console.log(`!! Frame drop: ${delta.toFixed(1)}ms`);
});
fpsMonitor.start();

// Optional: expose for debugging
window.fpsMonitor = fpsMonitor;