
// controller.js

import { Smoother } from './smoother.js';
import { FPSMonitor } from './fpsMonitor.js';
import { OverlayPlotRenderer } from './overlayPlot.js';
import { savePosition, loadPosition, setOverlayPosition } from './utils.js';

export function createPerformanceHUD() {
  const fpsSmoother = new Smoother(0.5);
  const memSmoother = new Smoother(0.5);
  const view = new OverlayPlotRenderer();
  const monitor = new FPSMonitor({
    smoother: fpsSmoother,
    memSmoother,
    onUpdate: snapshot => view.render(snapshot)
  });

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
function initDragAndPin(canvas, slider, monitor) {
    let isPinned = false;
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
  
    canvas.addEventListener('mousedown', e => {
      if (isPinned) return;
      isDragging = true;
      dragOffset = { x: e.offsetX, y: e.offsetY };
    });
  
    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const x = e.clientX - dragOffset.x;
      const y = e.clientY - dragOffset.y;
      setOverlayPosition(canvas, x, y);
      setOverlayPosition(slider, x, y + 90);
      savePosition(x, y);
    });
  
    window.addEventListener('mouseup', () => isDragging = false);
  
    canvas.addEventListener('dblclick', () => {
      isPinned = !isPinned;
      canvas.style.borderColor = isPinned ? 'red' : '#888';
    });
  
    const saved = loadPosition();
    if (saved) {
      setOverlayPosition(canvas, saved.x, saved.y);
      setOverlayPosition(slider, saved.x, saved.y + 90);
    }
  }


function initToggleHotkey(canvas, slider, monitor, key = 'f') {
    window.addEventListener('keydown', e => {
      if (e.shiftKey && e.key.toLowerCase() === key) {
        const visible = canvas.style.display !== 'none';
        canvas.style.display = visible ? 'none' : 'block';
        slider.style.display = visible ? 'none' : 'block';
        visible ? monitor.stop() : monitor.start();
      }
    });
  }
  
  initDragAndPin(view.canvas, slider, monitor);
  initToggleHotkey(view.canvas, slider, monitor, key = 'f');
  

  monitor.start();

  return { monitor, view };
}
