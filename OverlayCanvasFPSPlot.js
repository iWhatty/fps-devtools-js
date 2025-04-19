export class OverlayCanvasFPSPlot {
    constructor({ width = 200, height = 80, maxFPS = 100 } = {}) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = width;
      this.canvas.height = height;
      Object.assign(this.canvas.style, {
        position: 'fixed',
        right: '10px',
        bottom: '10px',
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.75)',
        border: '1px solid #888',
        pointerEvents: 'none'
      });
      document.body.appendChild(this.canvas);
  
      this.ctx = this.canvas.getContext('2d');
      this.maxFPS = maxFPS;
      this.history = new Array(width).fill(0);
      this.smoothHistory = new Array(width).fill(0);
      this.memHistory = new Array(width).fill(0);
  
      this.latestRaw = 0;
      this.latestSmoothed = 0;
      this.latest1Pct = 0;
      this.latestStutter = 0;
      this.latestMem = 0;
    }
  
    push(fps, smoothedFPS, onePercentLow = 0, stutterRate = 0, memoryMB = 0) {
      this.latestRaw = fps;
      this.latestSmoothed = smoothedFPS;
      this.latest1Pct = onePercentLow;
      this.latestStutter = stutterRate;
      this.latestMem = memoryMB;
  
      this.history.push(fps);
      this.smoothHistory.push(smoothedFPS);
      this.memHistory.push(memoryMB);
  
      if (this.history.length > this.canvas.width) {
        this.history.shift();
        this.smoothHistory.shift();
        this.memHistory.shift();
      }
  
      this.render();
    }
  
    render() {
      const { ctx, canvas, maxFPS } = this;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      // FPS lines
      ctx.strokeStyle = '#0f0';
      ctx.beginPath();
      this.history.forEach((v, x) => ctx.lineTo(x, canvas.height - (v / maxFPS) * canvas.height));
      ctx.stroke();
  
      ctx.strokeStyle = '#ff0';
      ctx.beginPath();
      this.smoothHistory.forEach((v, x) => ctx.lineTo(x, canvas.height - (v / maxFPS) * canvas.height));
      ctx.stroke();
  
      // Memory line
      ctx.strokeStyle = '#f66';
      ctx.beginPath();
      this.memHistory.forEach((mb, x) => ctx.lineTo(x, canvas.height - (mb / 200) * canvas.height));
      ctx.stroke();
  
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText(`FPS: ${this.latestRaw.toFixed(1)} | Avg: ${this.latestSmoothed.toFixed(1)}`, 4, 10);
      ctx.fillText(`Min FPS: ${fpsSmoother.min.toFixed(1)} | Max: ${fpsSmoother.max.toFixed(1)}`, 4, 22);
      ctx.fillText(`1% Low: ${this.latest1Pct.toFixed(1)} FPS`, 4, 34);
      ctx.fillText(`Stutter Rate: ${this.latestStutter.toFixed(1)}%`, 4, 46);
      ctx.fillText(`Heap: ${this.latestMem.toFixed(1)} MB`, 4, 58);
    }
  
    destroy() {
      this.canvas.remove();
    }
  }
  