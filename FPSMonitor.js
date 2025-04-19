export class FPSMonitor {
    constructor({ smoother, memSmoother, plotter, threshold = 60, interval = 1000 } = {}) {
      this.smoother = smoother;
      this.memSmoother = memSmoother;
      this.plotter = plotter;
      this.threshold = threshold;
      this.interval = interval;
      this.frames = 0;
      this.frameCount = 0;
      this.stutterCount = 0;
      this.fpsHistory = [];
      this.fpsHistorySize = 100;
    }
  
    start() {
      this.lastTick = performance.now();
      this.rafId = requestAnimationFrame(this.trackFrame.bind(this));
      this.intervalId = setInterval(this.updateFPS.bind(this), this.interval);
    }
  
    stop() {
      cancelAnimationFrame(this.rafId);
      clearInterval(this.intervalId);
    }
  
    trackFrame(timestamp) {
      const delta = timestamp - this.lastTick;
      if (delta > this.threshold) this.stutterCount++;
      this.frames++;
      this.lastTick = timestamp;
      this.rafId = requestAnimationFrame(this.trackFrame.bind(this));
    }
  
    updateFPS() {
      const fps = this.frames;
      this.frames = 0;
      this.frameCount++;
  
      const smoothed = this.smoother.update(fps);
      if (fps < 20) this.stutterCount++;
  
      this.fpsHistory.push(fps);
      if (this.fpsHistory.length > this.fpsHistorySize) this.fpsHistory.shift();
  
      let onePct = 0;
      if (this.fpsHistory.length >= 10) {
        const sorted = [...this.fpsHistory].sort((a, b) => a - b);
        const cutoff = Math.max(1, Math.floor(sorted.length * 0.01));
        onePct = sorted.slice(0, cutoff).reduce((a, b) => a + b, 0) / cutoff;
      }
  
      let memMB = 0;
      if (performance.memory?.usedJSHeapSize) {
        memMB = performance.memory.usedJSHeapSize / 1048576;
      }
  
      const smoothedMem = this.memSmoother.update(memMB);
      const stutterRate = (this.stutterCount / this.frameCount) * 100;
  
      this.plotter.push(fps, smoothed, onePct, stutterRate, smoothedMem);
    }
  }
  