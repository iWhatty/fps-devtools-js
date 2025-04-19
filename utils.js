export function savePosition(x, y) {
    localStorage.setItem('fpsOverlayPosition', JSON.stringify({ x, y }));
  }
  
  export function loadPosition() {
    try {
      return JSON.parse(localStorage.getItem('fpsOverlayPosition')) || null;
    } catch {
      return null;
    }
  }
  
  export function setOverlayPosition(elem, x, y) {
    Object.assign(elem.style, {
      left: `${x}px`,
      top: `${y}px`,
      right: 'auto',
      bottom: 'auto',
    });
  }
  