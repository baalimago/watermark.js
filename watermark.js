// Creates a configurable watermark overlay controlled via script query parameters.
//
//   <script src="https://watermark.wasmer.app/watermark.js?url=logo.png&position=SE"></script>
//
// Optional link: add href=https://example.com to make the watermark clickable
// (only the image itself catches clicks; the rest of the page is untouched).
(function () {
  const CONTAINER_ID = 'watermarkjs-container';

  // Badges hosted next to this script. Paths are resolved against the script's own URL,
  // so presets work from any page that embeds the script.
  const PRESETS = {
    'powered-by-wasmer': {
      url: 'powered-by-wasmer.svg',
      href: 'https://wasmer.io',
      alt: 'Powered by Wasmer',
      title: 'Powered by Wasmer',
      'max-width': '120',
    },
    'powered-by-wasmer-light': {
      url: 'powered-by-wasmer-light.svg',
      href: 'https://wasmer.io',
      alt: 'Powered by Wasmer',
      title: 'Powered by Wasmer',
      'max-width': '120',
    },
  };

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

  // Only allow ordinary links. Blocks javascript:, data: and similar schemes, since the
  // href arrives through a URL anyone could construct.
  function safeHref(value) {
    const raw = String(value || '').trim();
    if (!raw) return null;
    try {
      const url = new URL(raw, window.location.href);
      if (url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'mailto:') {
        return url.href;
      }
    } catch (error) {
      /* fall through */
    }
    console.warn(`[watermark] Ignoring link "${raw}": only http(s) and mailto links are allowed.`);
    return null;
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
    const href = safeHref(params.href || params.link);

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

    if (href) {
      // The container stays click-through; only the link (the image area) is clickable.
      const link = document.createElement('a');
      link.href = href;
      const target = (params.target || '_blank').trim();
      if (/^_(blank|self|parent|top)$/.test(target)) link.target = target;
      link.rel = (params.rel || 'noopener noreferrer').trim();
      if (params.title) link.title = params.title;
      link.setAttribute('aria-label', params.title || params.alt || 'Watermark link');
      link.style.pointerEvents = 'auto';
      link.style.display = 'block';
      link.style.cursor = 'pointer';
      link.style.borderRadius = '6px';
      link.style.outlineOffset = '3px';
      link.style.transition = 'opacity .15s ease, transform .15s ease';
      link.addEventListener('mouseenter', () => { link.style.opacity = '0.88'; });
      link.addEventListener('mouseleave', () => { link.style.opacity = ''; });
      link.appendChild(img);
      container.appendChild(link);
    } else {
      container.appendChild(img);
    }

    document.body.appendChild(container);
  }

  function parseParams(scriptEl) {
    try {
      const scriptUrl = new URL(scriptEl.src, window.location.href);
      const given = {};
      scriptUrl.searchParams.forEach((value, key) => {
        given[key] = value;
      });

      if (!given.preset) return given;

      const preset = PRESETS[given.preset];
      if (!preset) {
        console.warn(`[watermark] Unknown preset "${given.preset}". Available: ${Object.keys(PRESETS).join(', ')}.`);
        return given;
      }
      const merged = Object.assign({}, preset, given);
      // Preset images live next to the script, whatever page embeds it.
      if (!given.url) merged.url = new URL(preset.url, scriptUrl).href;
      return merged;
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
