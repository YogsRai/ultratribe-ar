const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const mindarSrc = fs.readFileSync(
    path.join(__dirname, 'node_modules/mind-ar/dist/mindar-image-aframe.prod.js'),
    'utf8'
  );

  // Read both target images as base64
  const img1Base64 = fs.readFileSync(path.join(__dirname, 'target.png')).toString('base64');
  const img2Base64 = fs.readFileSync(path.join(__dirname, 'target2.png')).toString('base64');

  await page.setContent(`<!DOCTYPE html><html><head></head><body><canvas id="c"></canvas></body></html>`);
  await page.addScriptTag({ content: mindarSrc });
  await page.waitForFunction(() => typeof window.MINDAR !== 'undefined', { timeout: 15000 });

  console.log('MindAR ready. Compiling both targets...');
  console.log('This will take 30-60 seconds...');

  const result = await page.evaluate(async (b64_1, b64_2) => {
    return new Promise((resolve, reject) => {
      // Load both images
      const img1 = new Image();
      const img2 = new Image();
      let loaded = 0;

      function onLoad() {
        loaded++;
        if (loaded < 2) return;

        // Both loaded -- compile together
        const compiler = new MINDAR.IMAGE.Compiler();
        compiler.compileImageTargets([img1, img2], (progress) => {
          window.__progress = Math.round(progress);
        }).then(async () => {
          const buf = await compiler.exportData();
          const bytes = new Uint8Array(buf);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          resolve(btoa(binary));
        }).catch(e => reject(e.message));
      }

      img1.onload = onLoad;
      img2.onload = onLoad;
      img1.onerror = () => reject('Image 1 failed to load');
      img2.onerror = () => reject('Image 2 failed to load');
      img1.src = 'data:image/png;base64,' + b64_1;
      img2.src = 'data:image/png;base64,' + b64_2;
    });
  }, img1Base64, img2Base64);

  const buffer = Buffer.from(result, 'base64');
  fs.writeFileSync(path.join(__dirname, 'target.mind'), buffer);
  console.log('Done! target.mind written with 2 targets -- ' + buffer.length + ' bytes');
  await browser.close();
})();
