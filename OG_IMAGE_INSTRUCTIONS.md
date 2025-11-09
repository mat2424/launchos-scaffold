# How to Create the Open Graph PNG Image

## Problem
Discord and iMessage don't support SVG images for Open Graph previews. They need PNG format.

## Quick Solution (5 minutes)

### Option 1: Use the HTML Generator (Already Created)
1. Open `create-og-image.html` in your browser (located in the root folder)
2. Click "Download og-image.png"
3. Save the file as `public/og-image.png`
4. Let Claude know it's ready, and I'll update the HTML

### Option 2: Use Online Tool (Recommended if Option 1 doesn't work)
1. Visit: https://www.ogimagegenerator.net/
2. Create an image with these settings:
   - Size: 1200 x 630 pixels
   - Background: Dark gradient (#0f172a to #1e293b) or solid dark color
   - Text 1: "LaunchOS" (large, white, bold)
   - Text 2: "All-in-One AI Platform" (smaller, gray)
3. Download as PNG
4. Save to: `public/og-image.png`5. Let Claude know it's ready

### Option 3: Simple Canva Template
1. Go to: https://www.canva.com/
2. Search for "Open Graph" or use dimensions 1200x630
3. Design with:
   - Dark background
   - "LaunchOS" title
   - "All-in-One AI Platform" subtitle
   - Optional: Add a rocket emoji 🚀 or icon
4. Download as PNG
5. Save to: `public/og-image.png`

### Option 4: Convert the SVG we created
1. Visit: https://cloudconvert.com/svg-to-png
2. Upload: `public/og-image.svg`
3. Set width to 1200px (height will auto-scale to 630)
4. Convert and download
5. Save as: `public/og-image.png`

## After Creating the PNG
Once you have `public/og-image.png`, Claude will:
1. Update `index.html` to reference the PNG instead of SVG
2. Commit and push to trigger Vercel deployment
3. Clear the cache for Discord/iMessage

## Why This Is Needed
- SVG works in browsers but not in social media crawlers
- Discord, iMessage, WhatsApp, and most platforms require PNG/JPEG
- The current og-image.svg is being ignored, causing fallback to placeholder
