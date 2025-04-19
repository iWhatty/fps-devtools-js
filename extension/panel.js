// extension/panel.js

// ✅ DevTools panel entry point
// Waits for the DOM and invokes the global HUD loader

window.addEventListener('DOMContentLoaded', () => {
  if (typeof window.createPerformanceHUD === 'function') {
    window.createPerformanceHUD();
  } else {
    console.error('createPerformanceHUD is not available on window');
  }
});
