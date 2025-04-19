import { build } from 'esbuild';

build({
    entryPoints: ['extension/index.js'],
    outfile: 'extension/assets/monitor.bundle.js',
    bundle: true,
    minify: true,
    format: 'iife', // expose to window
    // globalName: 'createPerformanceHUD',
    target: ['chrome58'], // or ['esnext'] if needed
    sourcemap: 'inline',
    sourcesContent: true,
}).catch(() => process.exit(1));
