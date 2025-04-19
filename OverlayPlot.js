export class OverlayCanvasFPSPlot {
  constructor({ width = 200, height = 80, maxFPS = 100 } = {}) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    Object.assign(this.canvas.style, {
      position: 'fixed',
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.75)',
      border: '1px solid #888',
      pointerEvents: 'none'
    });
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.maxFPS = maxFPS;
    this.resetHistory(width);
  }

  resetHistory(size) {
    this.history = new Array(size).fill(0);
    this.smoothHistory = new Array(size).fill(0);
    this.memHistory = new Array(size).fill(0);
  }

  push(raw, smooth, onePct = 0, stutter = 0, mem = 0) {
    this.history.push(raw); this.history.shift();
    this.smoothHistory.push(smooth); this.smoothHistory.shift();
    this.memHistory.push(mem); this.memHistory.shift();

    this.latest = { raw, smooth, onePct, stutter, mem };
    this.render();
  }

  renderLine(data, color, scale = this.maxFPS) {
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    data.forEach((val, x) => {
      const y = this.canvas.height - (val / scale) * this.canvas.height;
      this.ctx.lineTo(x, y);
    });
    this.ctx.stroke();
  }

  render() {
    const { ctx, canvas, latest } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.renderLine(this.history, '#0f0');
    this.renderLine(this.smoothHistory, '#ff0');
    this.renderLine(this.memHistory, '#f66', 200);

    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    const lines = [
      `FPS: ${latest.raw.toFixed(1)} | Avg: ${latest.smooth.toFixed(1)}`,
      `Min FPS: ${fpsSmoother.min.toFixed(1)} | Max: ${fpsSmoother.max.toFixed(1)}`,
      `1% Low: ${latest.onePct.toFixed(1)} FPS`,
      `Stutter Rate: ${latest.stutter.toFixed(1)}%`,
      `Heap: ${latest.mem.toFixed(1)} MB | Avg: ${memSmoother.smoothed.toFixed(1)} MB`,
    ];
    lines.forEach((text, i) => ctx.fillText(text, 4, 10 + i * 12));
  }

  destroy() {
    this.canvas.remove();
  }
}
