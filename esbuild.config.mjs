import { build } from 'esbuild';

build({
  entryPoints: ['src/index.js'],
  outfile: 'assets/monitor.bundle.js',
  bundle: true,
  minify: true,
  format: 'iife', // expose to window
  globalName: 'createPerformanceHUD',
  target: ['chrome58'], // or ['esnext'] if needed
  sourcemap: false
}).catch(() => process.exit(1));
