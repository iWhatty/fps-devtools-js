export class FPSMonitor {
    constructor({ threshold = 60, interval = 1000, historySize = 100, smoother, memSmoother, onUpdate }) {
      this.threshold = threshold;
      this.interval = interval;
      this.historySize = historySize;
      this.smoother = smoother;
      this.memSmoother = memSmoother;
      this.onUpdate = onUpdate;
  
      this.frames = 0;
      this.frameCount = 0;
      this.stutterCount = 0;
      this.fpsHistory = [];
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
  
      if (fps < 20) this.stutterCount++;
  
      this.fpsHistory.push(fps);
      if (this.fpsHistory.length > this.historySize) this.fpsHistory.shift();
  
      const sorted = [...this.fpsHistory].sort((a, b) => a - b);
      const cutoff = Math.max(1, Math.floor(sorted.length * 0.01));
      const onePercentLow = sorted.slice(0, cutoff).reduce((a, b) => a + b, 0) / cutoff;
  
      const smoothedFPS = this.smoother.update(fps);
      const mem = performance.memory?.usedJSHeapSize / 1048576 || 0;
      const smoothedMem = this.memSmoother.update(mem);
      const stutterRate = (this.stutterCount / this.frameCount) * 100;
  
      if (typeof this.onUpdate === 'function') {
        this.onUpdate({
          raw: fps,
          smoothed: smoothedFPS,
          onePercentLow,
          stutterRate,
          memory: mem,
          memoryAvg: smoothedMem,
        });
      }
    }
  }
  