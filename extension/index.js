// extension/index.js

// Import from your core module
import { createPerformanceHUD } from '../src/controller.js';

// Attach it to window for the DevTools panel to call
window.createPerformanceHUD = createPerformanceHUD;
