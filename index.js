
import { OverlayCanvasFPSPlot } from './overlayPlot.js';
import { FPSMonitor } from './fpsMonitor.js';
import { Smoother } from './smoother.js';

const fpsSmoother = new Smoother(0.5);
const memSmoother = new Smoother(0.5);
const plotter = new OverlayCanvasFPSPlot();

const monitor = new FPSMonitor({
  smoother: fpsSmoother,
  memSmoother,
  plotter,
});

monitor.start();

window.fpsMonitor = monitor;

// Lag slider
const slider = document.createElement('input');
slider.type = 'range';
slider.min = '0.01';
slider.max = '0.99';
slider.step = '0.01';
slider.value = '0.5';
Object.assign(slider.style, {
  position: 'fixed',
  right: '10px',
  bottom: '100px',
  zIndex: 9999,
});
document.body.appendChild(slider);
slider.addEventListener('input', () => fpsSmoother.setLagFactor(parseFloat(slider.value)));

// Drag + Pin + Hotkey
let isPinned = false, isDragging = false, dragOffset = { x: 0, y: 0 };
plotter.canvas.addEventListener('mousedown', e => {
  if (isPinned) return;
  isDragging = true;
  dragOffset.x = e.offsetX;
  dragOffset.y = e.offsetY;
});
window.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const x = e.clientX - dragOffset.x;
  const y = e.clientY - dragOffset.y;
  plotter.canvas.style.left = `${x}px`;
  plotter.canvas.style.top = `${y}px`;
  plotter.canvas.style.right = 'auto';
  plotter.canvas.style.bottom = 'auto';
  slider.style.left = `${x}px`;
  slider.style.top = `${y + 90}px`;
  slider.style.right = 'auto';
  slider.style.bottom = 'auto';
  localStorage.setItem('fpsOverlayPosition', JSON.stringify({ x, y }));
});
window.addEventListener('mouseup', () => isDragging = false);
plotter.canvas.addEventListener('dblclick', () => {
  isPinned = !isPinned;
  plotter.canvas.style.borderColor = isPinned ? 'red' : '#888';
});

const saved = JSON.parse(localStorage.getItem('fpsOverlayPosition') || null);
if (saved) {
  plotter.canvas.style.left = `${saved.x}px`;
  plotter.canvas.style.top = `${saved.y}px`;
  plotter.canvas.style.right = 'auto';
  plotter.canvas.style.bottom = 'auto';
  slider.style.left = `${saved.x}px`;
  slider.style.top = `${saved.y + 90}px`;
  slider.style.right = 'auto';
  slider.style.bottom = 'auto';
}

window.addEventListener('keydown', e => {
  if (e.shiftKey && e.key === 'F') {
    const visible = plotter.canvas.style.display !== 'none';
    plotter.canvas.style.display = visible ? 'none' : 'block';
    slider.style.display = visible ? 'none' : 'block';
    visible ? monitor.stop() : monitor.start();
  }
});
