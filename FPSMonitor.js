export class FPSMonitor {
    #frames = 0;
    #fps = 0;
    #lastTick = 0;
    #rafId = null;
    #fpsIntervalId = null;
    #dropCallback = null;
  
    #threshold;
    #interval;
    #debug;
  
    constructor({ threshold = 50, interval = 1000, debug = false } = {}) {
      this.#threshold = threshold;
      this.#interval = interval;
      this.#debug = debug;
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
      if (!this.#rafId) return;
  
      const delta = timestamp - this.#lastTick;
      if (delta > this.#threshold) this.#handleDrop(timestamp, delta);
  
      this.#frames++;
      this.#lastTick = timestamp;
      this.#rafId = requestAnimationFrame(this.#trackFrame);
    };
  
    #updateFPS = () => {
      this.#fps = this.#frames;
      this.#frames = 0;
      if (this.#debug) {
        console.log(`[FPSMonitor] FPS: ${this.#fps}`);
      }
    };
  
    #handleDrop(timestamp, delta) {
      if (this.#debug) {
        console.warn(`[FPSMonitor] Frame drop detected: ${delta.toFixed(2)}ms at ${timestamp.toFixed(2)}ms`);
      }
      this.#dropCallback?.({ timestamp, delta });
    }
  }
  