// Creates a configurable watermark overlay controlled via script query parameters.
(function () {
  const CONTAINER_ID = 'watermarkjs-container';

  function parseSize(value, fallback) {
    if (value == null || value === '') return fallback;
    if (/^\d+(\.\d+)?$/.test(value)) {
      return `${value}px`;
    }
    return value;
  }

  function resolveScriptElement() {
    if (document.currentScript) return document.currentScript;
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i -= 1) {
      const script = scripts[i];
      if (script.dataset.watermark === 'true') return script;
      if (script.src && script.src.includes('watermark.js')) return script;
    }
    return null;
  }

  function buildPositionStyles(position, margin) {
    const normalized = (position || 'SE').toUpperCase();
    const styles = {};

    switch (normalized) {
      case 'N':
        styles.top = margin;
        styles.left = '50%';
        styles.transform = 'translateX(-50%)';
        break;
      case 'NE':
        styles.top = margin;
        styles.right = margin;
        break;
      case 'E':
        styles.top = '50%';
        styles.right = margin;
        styles.transform = 'translateY(-50%)';
        break;
      case 'SE':
        styles.bottom = margin;
        styles.right = margin;
        break;
      case 'S':
        styles.bottom = margin;
        styles.left = '50%';
        styles.transform = 'translateX(-50%)';
        break;
      case 'SW':
        styles.bottom = margin;
        styles.left = margin;
        break;
      case 'W':
        styles.top = '50%';
        styles.left = margin;
        styles.transform = 'translateY(-50%)';
        break;
      case 'NW':
        styles.top = margin;
        styles.left = margin;
        break;
      case 'C':
      case 'CENTER':
        styles.top = '50%';
        styles.left = '50%';
        styles.transform = 'translate(-50%, -50%)';
        break;
      default:
        console.warn(`[watermark] Unknown position "${position}", defaulting to SE.`);
        return buildPositionStyles('SE', margin);
    }

    return styles;
  }

  function applyPositionStyles(element, styles) {
    element.style.top = '';
    element.style.bottom = '';
    element.style.left = '';
    element.style.right = '';
    element.style.transform = '';

    Object.keys(styles).forEach((key) => {
      element.style[key] = styles[key];
    });
  }

  function createWatermark(params) {
    const imageUrl = params.url;
    if (!imageUrl) {
      console.warn('[watermark] Missing required "url" parameter.');
      return;
    }

    const containerId = params.id || CONTAINER_ID;

    if (document.getElementById(containerId)) {
      console.warn(`[watermark] Watermark already exists for id "${containerId}".`);
      return;
    }

    const margin = parseSize(params.margin, '16px');
    const positionStyles = buildPositionStyles(params.position, margin);
    const maxWidth = parseSize(params['max-width'] || params.maxWidth, '240px');
    const maxHeight = parseSize(params['max-height'] || params.maxHeight, '240px');
    const background = (params.background || params['background-color'] || '').trim() || 'transparent';

    const container = document.createElement('div');
    container.id = containerId;
    container.style.position = 'fixed';
    container.style.zIndex = '2147483647';
    container.style.pointerEvents = 'none';
    container.style.boxSizing = 'border-box';
    container.style.display = 'inline-block';
    container.style.backgroundColor = background;

    applyPositionStyles(container, positionStyles);

    const img = new Image();
    img.alt = params.alt || 'Watermark';
    img.src = imageUrl;
    img.style.maxWidth = maxWidth;
    img.style.maxHeight = maxHeight;
    img.style.width = '100%';
    img.style.height = 'auto';
    img.style.display = 'block';

    img.addEventListener('error', () => {
      console.error(`[watermark] Failed to load watermark image from ${imageUrl}.`);
      container.remove();
    });

    container.appendChild(img);
    document.body.appendChild(container);
  }

  function parseParams(scriptEl) {
    try {
      const { searchParams } = new URL(scriptEl.src);
      const result = {};
      searchParams.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    } catch (error) {
      console.error('[watermark] Unable to parse script parameters:', error);
      return {};
    }
  }

  function init() {
    const scriptEl = resolveScriptElement();
    if (!scriptEl) {
      console.error('[watermark] Unable to locate script element.');
      return;
    }

    scriptEl.dataset.watermark = 'true';
    const params = parseParams(scriptEl);

    const start = () => createWatermark(params);

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
      start();
    }
  }

  init();
}());
