export class OverlayPlotRenderer {
  constructor({ width = 200, height = 80, maxFPS = 100 } = {}) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');

    Object.assign(this.canvas.style, {
      position: 'fixed',
      right: '10px',
      bottom: '10px',
      zIndex: 9999,
      background: 'rgba(0,0,0,0.75)',
      border: '1px solid #888',
      pointerEvents: 'none'
    });

    document.body.appendChild(this.canvas);

    this.history = [];
    this.smoothHistory = [];
    this.memHistory = [];
    this.maxFPS = maxFPS;
  }

  render(snapshot) {
    const { raw, smoothed, onePercentLow, stutterRate, memory, memoryAvg } = snapshot;
    const { ctx, canvas } = this;

    this.history.push(raw); if (this.history.length > canvas.width) this.history.shift();
    this.smoothHistory.push(smoothed); if (this.smoothHistory.length > canvas.width) this.smoothHistory.shift();
    this.memHistory.push(memory); if (this.memHistory.length > canvas.width) this.memHistory.shift();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.plotLine(this.history, '#0f0', this.maxFPS);
    this.plotLine(this.smoothHistory, '#ff0', this.maxFPS);
    this.plotLine(this.memHistory, '#f66', 200); // mem in MB

    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';

    ctx.fillText(`FPS: ${raw.toFixed(1)} | Avg: ${smoothed.toFixed(1)}`, 4, 10);
    ctx.fillText(`1% Low: ${onePercentLow.toFixed(1)} | Stutter: ${stutterRate.toFixed(1)}%`, 4, 22);
    ctx.fillText(`Heap: ${memory.toFixed(1)} MB | Avg: ${memoryAvg.toFixed(1)} MB`, 4, 34);
  }

  plotLine(data, color, scale) {
    const { ctx, canvas } = this;
    ctx.strokeStyle = color;
    ctx.beginPath();
    data.forEach((v, x) => {
      const y = canvas.height - (v / scale) * canvas.height;
      ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  destroy() {
    this.canvas.remove();
  }
}
