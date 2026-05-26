# UltraTribe AR Demo

WebAR image-tracking experience built with MindAR + A-Frame + Three.js.

## Files

- `index.html` - The complete AR experience (single file)
- `target.png` - The t-shirt graphic used as the tracking target

## How to deploy

### Option A: Cloudflare Pages (recommended, free)
1. Push both files to a GitHub repo
2. Connect repo to Cloudflare Pages
3. No build step, deploy as static site
4. Share the URL with UltraTribe

### Option B: Any static host
Upload both files to the same folder on any web server.
The site must be served over HTTPS for camera access to work.

## How it works

1. User opens the URL on their phone
2. Taps "Activate AR"
3. MindAR compiles the tracking target in the browser (~10 seconds on first load)
4. Camera opens
5. User points camera at the t-shirt print
6. Psychedelic particle effects, sacred geometry, and shader overlays animate on the shirt

## Notes

- Works in Chrome and Safari on iOS and Android
- No app install required
- Camera permission is required
- First load compiles the target (10-15 sec). Subsequent loads are instant if cached.

