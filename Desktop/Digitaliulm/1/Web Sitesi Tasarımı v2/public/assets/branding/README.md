DigitaliUlm Branding Assets
===========================

Location: `public/assets/branding/`

Included files
- `digitaliulm-logo.svg` — master SVG logo
- `digitaliulm-logo-256x80.png`, `digitaliulm-logo-512x160.png`, `digitaliulm-logo-768x240.png`, `digitaliulm-logo-640x200.png` — raster exports
- `favicon-16.png`, `favicon-32.png` — small favicons
- `apple-touch-180.png`, `android-chrome-192.png`, `android-chrome-512.png` — platform icons
- `og-image-1200x630.png` — Open Graph / social share image

Usage
- HTML logo example:
  ```html
  <img src="/assets/branding/digitaliulm-logo-512x160.png" alt="digitaliulm" />
  ```
- Open Graph meta (already added to `index.html`):
  ```html
  <meta property="og:image" content="/assets/branding/og-image-1200x630.png" />
  ```
- Link favicons in `<head>` (already added to `index.html`):
  ```html
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/branding/favicon-32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/branding/favicon-16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/branding/apple-touch-180.png" />
  <link rel="manifest" href="/manifest.json" />
  ```

Attribution & license
- These assets are provided for your project. If you share externally, a short attribution is appreciated.

Need changes?
- I can regenerate PNGs with transparent background, tweak the OG image copy/position, or create additional sizes.
