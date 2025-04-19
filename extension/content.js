// extension/content.js

(function () {
    // Load the bundled monitor HUD
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('assets/monitor.bundle.js');
    script.onload = () => {
      script.remove();
      if (typeof window.createPerformanceHUD === 'function') {
        window.createPerformanceHUD(); // boom
      }
    };
    document.documentElement.appendChild(script);
  })();
  