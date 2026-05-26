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

  // Use the self-contained IIFE bundle -- no import statements
  const mindarSrc = fs.readFileSync(
    path.join(__dirname, 'node_modules/mind-ar/dist/mindar-image-aframe.prod.js'),
    'utf8'
  );
  const imgBase64 = fs.readFileSync(path.join(__dirname, 'target.png')).toString('base64');

  await page.setContent(`<!DOCTYPE html><html><head></head><body><canvas id="c"></canvas></body></html>`);

  // Inject the IIFE bundle via addScriptTag content
  await page.addScriptTag({ content: mindarSrc });

  await page.waitForFunction(() => typeof window.MINDAR !== 'undefined', { timeout: 15000 });
  console.log('MindAR ready. Compiling target image...');

  const result = await page.evaluate(async (base64) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const compiler = new MINDAR.IMAGE.Compiler();
          await compiler.compileImageTargets([img], (progress) => {
            window.__progress = Math.round(progress);
          });
          const buf = await compiler.exportData();
          const bytes = new Uint8Array(buf);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          resolve(btoa(binary));
        } catch(e) {
          reject(e.message);
        }
      };
      img.onerror = () => reject('Image failed to load');
      img.src = 'data:image/png;base64,' + base64;
    });
  }, imgBase64);

  const buffer = Buffer.from(result, 'base64');
  fs.writeFileSync(path.join(__dirname, 'target.mind'), buffer);
  console.log('Done! target.mind written -- ' + buffer.length + ' bytes');
  await browser.close();
})();
