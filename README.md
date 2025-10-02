# watermark.js

<p align="center">
  <img src="watermark.png" height="300px" />
</p>

Drop-in browser script that overlays an image watermark on any web page using query-string parameters for configuration.

## Files

- `watermark.js` – self-initialising script that parses its own URL parameters and injects the watermark element.
- `index.html` – documentation page with live iframe demos.
- `watermark.png` – sample watermark image used across the examples.

## Quick Start

1. Copy `watermark.js` into your project and host it alongside your pages (or serve it from a CDN).
2. Add a script tag that points at the file and pass configuration values via the query string:
   ```html
   <script src="/path/to/watermark.js?url=watermark.png&position=SE&margin=24&max-width=220"></script>
   ```
3. Open the page – the script loads the image and pins it according to the supplied parameters.

### Parameters

| Name         | Required | Description                                                                                     |
| ------------ | -------- | ----------------------------------------------------------------------------------------------- |
| `url`        | Yes      | Relative or absolute path to the watermark image (for example `watermark.png`).                 |
| `position`   | No       | Compass location (`N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`, `C`, `CENTER`). Defaults to `SE`. |
| `max-width`  | No       | Maximum width for the image. Plain numbers are treated as pixels. Defaults to `240px`.          |
| `max-height` | No       | Maximum height for the image. Plain numbers are treated as pixels. Defaults to `240px`.         |
| `margin`     | No       | CSS distance from the chosen edges. Accepts any CSS length. Defaults to `16px`.                 |
| `id`         | No       | Optional element id if you need multiple independent watermarks on the same page.               |

## Demo

Open `index.html` in a browser to view a mini guide plus live examples. Each iframe demonstrates a different configuration while reusing the local `watermark.png` asset.

## Notes

- The script waits for `DOMContentLoaded` if necessary, so you can include it anywhere in the page head or body.
- The watermark uses `pointer-events: none` to avoid intercepting clicks.
- On image load failure the script logs an error and removes the overlay.
