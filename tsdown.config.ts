import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    target: 'esnext',
    entry: {
      'top-fetch': 'src/index.ts',
    },
    sourcemap: false,
    minify: true,
    clean: true,
    dts: false,
    format: ['esm', 'cjs'],
  },
  {
    target: 'esnext',
    entry: {
      'top-fetch.min': 'src/index.ts',
    },
    sourcemap: false,
    minify: true,
    clean: false,
    dts: false,
    format: ['iife'],
    globalName: 'topFetch',
    outExtensions() {
      return { js: '.js' };
    },
  },
  {
    entry: {
      'top-fetch': 'src/index.ts',
    },
    outDir: 'dist/@types',
    dts: {
      emitDtsOnly: true,
    },
  },
]);
