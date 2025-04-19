export class OverlayCanvasFPSPlot {
    constructor({ width = 200, height = 60, maxFPS = 100 } = {}) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        Object.assign(this.canvas.style, {
            position: 'fixed',
            right: '10px',
            bottom: '10px',
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid #888',
            pointerEvents: 'none'
        });
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.maxFPS = maxFPS;
        this.history = new Array(width).fill(0);
    }

    push(fps) {
        this.history.push(fps);
        this.history.shift();
        this.render();
    }

    render() {
        const { ctx, canvas, history, maxFPS } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#0f0';
        ctx.beginPath();
        history.forEach((fps, x) => {
            const y = canvas.height - (fps / maxFPS) * canvas.height;
            ctx.lineTo(x, y);
        });
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.fillText(`FPS: ${history.at(-1)}`, 4, 10);
    }

    destroy() {
        this.canvas.remove();
    }
}
