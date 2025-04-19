


// === Canvas Plotter ===
class OverlayCanvasFPSPlot {
    constructor({ width = 200, height = 60, maxFPS = 100 } = {}) {
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
      this.latestRaw = 0;
      this.latestSmoothed = 0;
    }
  
    push(raw, smoothed) {
      this.latestRaw = raw;
      this.latestSmoothed = smoothed;
      this.history.push(raw);
      this.smoothHistory.push(smoothed);
      this.history.shift();
      this.smoothHistory.shift();
      this.render();
    }
  
    render() {
      const { ctx, canvas, history, smoothHistory, maxFPS } = this;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      // Raw FPS line
      ctx.strokeStyle = '#0f0';
      ctx.beginPath();
      history.forEach((fps, x) => {
        const y = canvas.height - (fps / maxFPS) * canvas.height;
        ctx.lineTo(x, y);
      });
      ctx.stroke();
  
      // Smoothed FPS line
      ctx.strokeStyle = '#ff0';
      ctx.beginPath();
      smoothHistory.forEach((fps, x) => {
        const y = canvas.height - (fps / maxFPS) * canvas.height;
        ctx.lineTo(x, y);
      });
      ctx.stroke();
  
      // Text
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText(`Raw: ${this.latestRaw.toFixed(1)} FPS`, 4, 12);
      ctx.fillText(`Smooth: ${this.latestSmoothed.toFixed(1)} FPS`, 4, 24);
    }
  
    destroy() {
      this.canvas.remove();
    }
  }