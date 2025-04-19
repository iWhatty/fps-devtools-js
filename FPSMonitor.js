export class FPSMonitor {
    #frames = 0;
    #lastFrameTime = performance.now();
    #fps = 0;
    #running = false;
    #callback = null;
  
    constructor({ threshold = 50, interval = 1000 } = {}) {
      this.threshold = threshold;
      this.interval = interval;
    }
  
    start() {
      if (this.#running) return;
      this.#running = true;
      this.#frames = 0;
      this.#lastFrameTime = performance.now();
      this.#loop();
      this.#tickFPS();
    }
  
    stop() {
      this.#running = false;
      cancelAnimationFrame(this.#raf);
      clearInterval(this.#fpsInterval);
    }
  
    #loop = () => {
      this.#raf = requestAnimationFrame(() => {
        this.#frames++;
        const now = performance.now();
        const delta = now - this.#lastFrameTime;
        if (delta > this.threshold && this.#callback) {
          this.#callback({ dropAt: now, delta });
        }
        this.#lastFrameTime = now;
        if (this.#running) this.#loop();
      });
    };
  
    #tickFPS() {
      this.#fpsInterval = setInterval(() => {
        this.#fps = this.#frames;
        this.#frames = 0;
      }, this.interval);
    }
  
    getFPS() {
      return this.#fps;
    }
  
    onDrop(callback) {
      this.#callback = callback;
    }
  
    configure({ threshold, interval }) {
      if (threshold != null) this.threshold = threshold;
      if (interval != null) this.interval = interval;
    }
  }
  