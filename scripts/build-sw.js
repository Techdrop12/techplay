// scripts/build-sw.js
const esbuild = require('esbuild')
const workbox = require('workbox-build')
;(async () => {
  // 1) bundle TS -> temp
  await esbuild.build({
    entryPoints: ['src/sw.ts'],
    outfile: '.sw-tmp.js',
    bundle: true,
    format: 'esm',
    target: 'es2020',
    minify: true,
  })
  // 2) inject manifest -> public/sw.js
  await workbox.injectManifest({
    swSrc: '.sw-tmp.js',
    swDest: 'public/sw.js',
    globDirectory: '.next',
    globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
    maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
  })
  console.log('✔ SW ready -> public/sw.js')
})()
