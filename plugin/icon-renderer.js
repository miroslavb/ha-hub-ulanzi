// Icon renderer — produces base64 PNGs from canvas.
// All rendering modes go through render(opts).

const ICON_SIZE = 144;

function makeCanvas() {
  const c = document.createElement('canvas');
  c.width = ICON_SIZE;
  c.height = ICON_SIZE;
  return c;
}

function fillBackground(ctx, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, ICON_SIZE, ICON_SIZE);
}

function drawCenteredText(ctx, text, y, color, size, weight) {
  ctx.fillStyle = color;
  ctx.font = `${weight || 'normal'} ${size}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, ICON_SIZE / 2, y);
}

// Draw a Material Design Icon (by HA icon name, e.g. "lightbulb" or "mdi:lightbulb")
// centered at (cx, cy) inside a sizePx box. MDI paths use a 24x24 viewBox, so we
// scale accordingly. Returns true if an icon was actually drawn, false otherwise
// (no Path2D support, icon name unknown, or HAIcons not loaded) — callers fall
// back to their text layout in that case.
function drawMdiIcon(ctx, iconName, cx, cy, sizePx, color, opacity) {
  if (!iconName || typeof Path2D === 'undefined') return false;
  const d = (window.HAIcons && window.HAIcons.getPath(iconName)) || null;
  if (!d) return false;
  let path;
  try { path = new Path2D(d); } catch (e) { return false; }
  const scale = sizePx / 24;
  ctx.save();
  if (opacity != null) ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.translate(cx - sizePx / 2, cy - sizePx / 2);
  ctx.scale(scale, scale);
  ctx.fill(path);
  ctx.restore();
  return true;
}

// True when the caller asked for an icon layout and provided an icon name.
function wantsIcon(opts) {
  const m = opts && opts.iconMode;
  return (m === 'icon' || m === 'iconlabel') && !!opts.iconName;
}

// Render a state-toggle icon (toggle / scene / service result).
function renderState(opts) {
  const { state, label, sublabel, theme, intensity, pulseColor } = opts;
  const t = window.HAThemes.getTheme(theme);

  let palette, status;
  if (state === 'on' || state === 'home' || state === 'open' || state === 'unlocked' || state === 'playing') {
    palette = t.on;
    status = (opts.onText || 'AAN');
  } else if (state === 'off' || state === 'away' || state === 'closed' || state === 'locked' || state === 'idle' || state === 'paused') {
    palette = t.off;
    status = (opts.offText || 'UIT');
  } else if (state == null || state === 'unavailable' || state === 'unknown') {
    palette = t.error;
    status = '?';
  } else {
    palette = t.on;
    status = state.toUpperCase().slice(0, 8);
  }

  // Apply pulse intensity if provided.
  // - Without pulseColor: pulse from base palette toward brighter version (subtle).
  // - With pulseColor: pulse the specified color from dim to bright (no state-color
  //   mixing — that previously caused green↔red flickering when state was on but
  //   pulseColor was red).
  let bg = palette.bg;
  if (intensity != null) {
    if (pulseColor) {
      const dim = mixColors(pulseColor, '#000000', 0.5);  // 50% darker
      bg = mixColors(dim, pulseColor, intensity);
    } else {
      const bright = mixColors(palette.bg, '#ffffff', 0.35);
      bg = mixColors(palette.bg, bright, intensity);
    }
  }

  const c = makeCanvas();
  const ctx = c.getContext('2d');
  fillBackground(ctx, bg);

  // Icon mode: draw the entity's standard HA icon instead of the status word.
  // State is still conveyed by the background colour (and pulse). Falls through
  // to the text layout if the icon can't be drawn.
  if (wantsIcon(opts)) {
    const withLabel = opts.iconMode === 'iconlabel';
    const drawn = drawMdiIcon(
      ctx, opts.iconName,
      ICON_SIZE / 2,
      withLabel ? ICON_SIZE * 0.42 : ICON_SIZE / 2,
      withLabel ? 64 : 78,
      palette.fg
    );
    if (drawn) {
      if (withLabel && label) {
        drawCenteredText(ctx, label.slice(0, 12), ICON_SIZE * 0.84, palette.fg, 18, 'bold');
      }
      return c.toDataURL('image/png').split(',')[1];
    }
  }

  if (label && sublabel) {
    drawCenteredText(ctx, status, ICON_SIZE * 0.30, palette.fg, 32, 'bold');
    drawCenteredText(ctx, label.slice(0, 12), ICON_SIZE * 0.58, palette.fg, 18);
    drawCenteredText(ctx, sublabel.slice(0, 14), ICON_SIZE * 0.78, palette.fg, 14);
  } else if (label) {
    drawCenteredText(ctx, status, ICON_SIZE * 0.36, palette.fg, 38, 'bold');
    drawCenteredText(ctx, label.slice(0, 12), ICON_SIZE * 0.72, palette.fg, 20);
  } else {
    drawCenteredText(ctx, status, ICON_SIZE / 2, palette.fg, 44, 'bold');
  }

  return c.toDataURL('image/png').split(',')[1];
}

// Render a sensor display — large value, small unit, label.
function renderSensor(opts) {
  const { value, unit, label, theme } = opts;
  const t = window.HAThemes.getTheme(theme || 'cool');

  const c = makeCanvas();
  const ctx = c.getContext('2d');

  let palette = t.on;
  if (opts.warning) palette = t.error;
  else if (opts.muted) palette = t.off;

  fillBackground(ctx, palette.bg);

  const display = (value == null) ? '?' : String(value);

  // Icon mode: small icon on top, value below, optional name label.
  if (wantsIcon(opts)) {
    const drawn = drawMdiIcon(ctx, opts.iconName, ICON_SIZE / 2, ICON_SIZE * 0.27, 46, palette.fg);
    if (drawn) {
      const vSize = display.length > 5 ? 22 : (display.length > 3 ? 28 : 36);
      drawCenteredText(ctx, display, ICON_SIZE * 0.60, palette.fg, vSize, 'bold');
      if (unit) drawCenteredText(ctx, unit, ICON_SIZE * 0.78, palette.fg, 13);
      if (opts.iconMode === 'iconlabel' && label) {
        drawCenteredText(ctx, label.slice(0, 14), ICON_SIZE * 0.92, palette.fg, 12);
      }
      return c.toDataURL('image/png').split(',')[1];
    }
  }

  const valueSize = display.length > 5 ? 26 : (display.length > 3 ? 32 : 42);

  drawCenteredText(ctx, display, ICON_SIZE * 0.42, palette.fg, valueSize, 'bold');
  if (unit) drawCenteredText(ctx, unit, ICON_SIZE * 0.62, palette.fg, 16);
  if (label) drawCenteredText(ctx, label.slice(0, 14), ICON_SIZE * 0.85, palette.fg, 14);

  return c.toDataURL('image/png').split(',')[1];
}

function hsToRgb(h, s) {
  const sat = Math.max(0, Math.min(100, Number(s) || 0)) / 100;
  const hue = ((Number(h) || 0) % 360 + 360) % 360;
  const c = sat;
  const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
  let rgb = hue < 60 ? [c, x, 0] : hue < 120 ? [x, c, 0] :
    hue < 180 ? [0, c, x] : hue < 240 ? [0, x, c] :
    hue < 300 ? [x, 0, c] : [c, 0, x];
  const m = 1 - c;
  return rgb.map(v => Math.round((v + m) * 255));
}

// Approximation used only for on-deck feedback when HA exposes a CCT light.
function kelvinToRgb(kelvin) {
  const t = Math.max(1000, Math.min(40000, Number(kelvin) || 4000)) / 100;
  let r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592);
  let g = t <= 66
    ? 99.4708025861 * Math.log(t) - 161.1195681661
    : 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  let b = t >= 66 ? 255 : (t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.044792731);
  return [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))));
}

function lightColor(entity) {
  const attrs = entity?.attributes || {};
  if (Array.isArray(attrs.rgb_color)) return attrs.rgb_color.slice(0, 3);
  if (Array.isArray(attrs.hs_color)) return hsToRgb(attrs.hs_color[0], attrs.hs_color[1]);
  const kelvin = attrs.color_temp_kelvin || (attrs.color_temp ? 1000000 / attrs.color_temp : null);
  return kelvin ? kelvinToRgb(kelvin) : [250, 204, 21];
}

// Lovelace-style light feedback: state-aware icon shape, actual light colour
// while on, neutral icon while off, live channel value, and brightness bar.
function renderLightController(opts) {
  const c = makeCanvas();
  const ctx = c.getContext('2d');
  const entity = opts.entity;
  const unavailable = !entity || ['unavailable', 'unknown'].includes(entity.state);
  const on = entity?.state === 'on';
  const rgb = on ? lightColor(entity) : [100, 116, 139];
  const accent = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
  fillBackground(ctx, '#111827');

  ctx.fillStyle = unavailable ? '#3f1d27' : (on ? `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.18)` : '#1f2937');
  ctx.beginPath();
  ctx.arc(ICON_SIZE / 2, 49, 38, 0, Math.PI * 2);
  ctx.fill();

  const drawn = drawMdiIcon(ctx, opts.iconName || 'lightbulb', ICON_SIZE / 2, 49, 58,
    unavailable ? '#f87171' : accent, on ? 1 : 0.72);
  if (!drawn) drawCenteredText(ctx, on ? 'ON' : 'OFF', 49, accent, 28, 'bold');

  drawCenteredText(ctx, String(opts.label || '').slice(0, 15), 96, '#f8fafc', 15, 'bold');
  const modeNames = { brightness: 'BRI', color_temp: 'TEMP', color: 'HUE' };
  let value = 'NO CONTROL';
  if (unavailable) value = 'UNAVAILABLE';
  else if (opts.mode === 'brightness') value = `${Math.round(opts.value || 0)}%`;
  else if (opts.mode === 'color_temp') value = `${Math.round(opts.value || 0)}K`;
  else if (opts.mode === 'color') value = `${Math.round(opts.value || 0)}°`;
  const pos = opts.total ? `  ${opts.position}/${opts.total}` : '';
  drawCenteredText(ctx, `${modeNames[opts.mode] || ''} ${value}${pos}`.trim(), 117,
    unavailable ? '#f87171' : '#cbd5e1', 12, 'bold');

  if (opts.mode === 'brightness' && !unavailable) {
    const pct = Math.max(0, Math.min(100, Number(opts.value) || 0));
    ctx.fillStyle = '#334155';
    ctx.fillRect(10, 133, 124, 5);
    ctx.fillStyle = accent;
    ctx.fillRect(10, 133, 124 * pct / 100, 5);
  }
  return c.toDataURL('image/png').split(',')[1];
}

// Render a scene/script trigger icon (no toggle state, just label).
function renderTrigger(opts) {
  const { label, theme, color } = opts;
  const t = window.HAThemes.getTheme(theme);
  const palette = color ? { bg: color, fg: '#ffffff' } : t.on;

  const c = makeCanvas();
  const ctx = c.getContext('2d');
  fillBackground(ctx, palette.bg);

  // Icon mode: draw the entity's HA icon (scene/script/automation) instead of
  // the generic play triangle. Falls through to the triangle if not drawable.
  if (wantsIcon(opts)) {
    const withLabel = opts.iconMode === 'iconlabel';
    const drawn = drawMdiIcon(
      ctx, opts.iconName,
      ICON_SIZE / 2,
      withLabel ? ICON_SIZE * 0.42 : ICON_SIZE / 2,
      withLabel ? 60 : 76,
      palette.fg
    );
    if (drawn) {
      if (withLabel && label) {
        drawCenteredText(ctx, label.slice(0, 14), ICON_SIZE * 0.84, palette.fg, 18, 'bold');
      }
      return c.toDataURL('image/png').split(',')[1];
    }
  }

  // Draw a simple play/trigger glyph (triangle) above label
  ctx.fillStyle = palette.fg;
  ctx.beginPath();
  ctx.moveTo(60, 35);
  ctx.lineTo(60, 75);
  ctx.lineTo(95, 55);
  ctx.closePath();
  ctx.fill();

  if (label) drawCenteredText(ctx, label.slice(0, 14), ICON_SIZE * 0.78, palette.fg, 18, 'bold');

  return c.toDataURL('image/png').split(',')[1];
}

// ─── Pulse helpers ────────────────────────────────────────────────
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16)
  };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}

// Linearly mix two hex colors: amount=0 returns colorA, amount=1 returns colorB.
function mixColors(colorA, colorB, amount) {
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);
  return rgbToHex(
    a.r + (b.r - a.r) * amount,
    a.g + (b.g - a.g) * amount,
    a.b + (b.b - a.b) * amount
  );
}

// Render an aggregate count icon — count of active items, pulse-aware.
function renderAggregate(opts) {
  const { count, total, label, theme, intensity, activeColor } = opts;
  const t = window.HAThemes.getTheme(theme || 'warm');

  const c = makeCanvas();
  const ctx = c.getContext('2d');

  let bg, fg;
  if (count > 0) {
    // Active: pulse between dim and bright variant of the active color
    const base = activeColor || t.error.bg;
    const dim = mixColors(base, '#000000', 0.4);
    const i = (intensity != null) ? intensity : 1;
    bg = mixColors(dim, base, i);
    fg = '#ffffff';
  } else {
    bg = t.off.bg;
    fg = t.off.fg;
  }

  fillBackground(ctx, bg);

  drawCenteredText(ctx, count + '/' + total, ICON_SIZE * 0.42, fg, 38, 'bold');
  if (label) drawCenteredText(ctx, label.slice(0, 14), ICON_SIZE * 0.78, fg, 16);

  return c.toDataURL('image/png').split(',')[1];
}

window.IconRenderer = { renderState, renderSensor, renderTrigger, renderAggregate, renderEditMode, mixColors };

// Render an "edit mode" icon — cyan background, pulsing, with live value.
function renderEditMode(opts) {
  const { label, value, intensity } = opts;
  const baseColor = '#06b6d4';
  const brightColor = '#22d3ee';
  const i = (intensity != null) ? intensity : 0.5;
  const bg = mixColors(baseColor, brightColor, i);

  const c = makeCanvas();
  const ctx = c.getContext('2d');
  fillBackground(ctx, bg);

  drawCenteredText(ctx, '✏ EDIT', ICON_SIZE * 0.22, '#ffffff', 14, 'bold');
  drawCenteredText(ctx, value || '—', ICON_SIZE * 0.50, '#ffffff', 36, 'bold');
  if (label) drawCenteredText(ctx, label.slice(0, 12), ICON_SIZE * 0.82, '#ecfeff', 16);

  return c.toDataURL('image/png').split(',')[1];
}


// ─── HA logo + reveal animation ───────────────────────────────────

// Draws a recognisable Home-Assistant-style logo (house with antenna)
// onto the FULL given canvas region. Inspired by HA's brand style but
// not a 1:1 reproduction — built from primitives so it's clearly our own.
//
// ctx: canvas context
// cx, cy: center of where to draw
// size: half-size of the bounding box (full size = 2*size)
// fg: line color
function drawHALogoAt(ctx, cx, cy, size, fg) {
  ctx.strokeStyle = fg;
  ctx.fillStyle = fg;
  ctx.lineWidth = Math.max(2, size * 0.10);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Pentagon house outline — proportions approximate HA's classic house
  ctx.beginPath();
  ctx.moveTo(cx - size, cy + size * 0.65);
  ctx.lineTo(cx - size, cy - size * 0.15);
  ctx.lineTo(cx, cy - size);
  ctx.lineTo(cx + size, cy - size * 0.15);
  ctx.lineTo(cx + size, cy + size * 0.65);
  ctx.closePath();
  ctx.stroke();

  // Antenna base — small filled circle
  const dotR = size * 0.15;
  ctx.beginPath();
  ctx.arc(cx, cy + size * 0.15, dotR, 0, Math.PI * 2);
  ctx.fill();

  // Three antenna stalks radiating from base
  ctx.lineWidth = Math.max(2, size * 0.07);
  // Vertical (center)
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx, cy - size * 0.55);
  ctx.stroke();
  // Right diagonal
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.10, cy + size * 0.05);
  ctx.lineTo(cx + size * 0.55, cy - size * 0.30);
  ctx.stroke();
  // Left diagonal
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.10, cy + size * 0.05);
  ctx.lineTo(cx - size * 0.55, cy - size * 0.30);
  ctx.stroke();

  // Three small dots at antenna tips (the "nodes")
  const nodeR = size * 0.08;
  ctx.beginPath();
  ctx.arc(cx, cy - size * 0.62, nodeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + size * 0.60, cy - size * 0.34, nodeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx - size * 0.60, cy - size * 0.34, nodeR, 0, Math.PI * 2);
  ctx.fill();
}

// Draws a single "piece" of a giant logo that spans an entire deck grid.
// gridRow, gridCol: this key's position on the deck (0-indexed)
// totalRows, totalCols: deck dimensions
// progress: 0..1 of the reveal animation
//
// We render the full giant logo onto an off-screen canvas the size of
// the entire deck, then crop the relevant tile region. This guarantees
// pieces line up perfectly when viewed across keys.
function renderPuzzlePiece(opts) {
  const { gridRow, gridCol, totalRows, totalCols, progress } = opts;
  const TILE = 144;

  // Fade background from HA brand blue to dark
  const bgStart = '#03A9F4';
  const bgEnd = '#0f1419';
  const bg = mixColors(bgStart, bgEnd, Math.min(progress * 1.4, 1));
  // Logo opacity fades out in second half
  const logoOpacity = Math.max(0, 1 - progress * 1.5);

  const c = document.createElement('canvas');
  c.width = TILE;
  c.height = TILE;
  const ctx = c.getContext('2d');

  // Fill this tile's bg
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, TILE, TILE);

  if (logoOpacity < 0.05) {
    return c.toDataURL('image/png').split(',')[1];
  }

  // Compute where the giant logo center is in deck coords, and draw the
  // portion that lies within this tile. The logo is sized to fit the
  // smaller of (deck width, deck height) with some padding.
  const deckW = totalCols * TILE;
  const deckH = totalRows * TILE;
  const logoSize = Math.min(deckW, deckH) * 0.35;
  const deckCx = deckW / 2;
  const deckCy = deckH / 2;

  // This tile's offset on the deck
  const tileX = gridCol * TILE;
  const tileY = gridRow * TILE;

  // Translate so the logo centers at deck-center, but our tile is at origin
  ctx.save();
  ctx.translate(-tileX, -tileY);

  // Apply opacity by drawing logo with alpha
  ctx.globalAlpha = logoOpacity;
  const logoColor = '#ffffff';
  drawHALogoAt(ctx, deckCx, deckCy, logoSize, logoColor);
  ctx.globalAlpha = 1;

  ctx.restore();

  return c.toDataURL('image/png').split(',')[1];
}

// Render a "reveal-frame" that smoothly transitions from HA logo to dark.
// Phase 1 of crossfade: progress 0 → 1 fades logo out + bg blue → dark.
// This is the per-key version (each key shows a complete logo).
function renderRevealFrame(progress) {
  const c = document.createElement('canvas');
  c.width = 144;
  c.height = 144;
  const ctx = c.getContext('2d');

  const bgStart = '#03A9F4';
  const bgEnd = '#0f1419';
  const bg = mixColors(bgStart, bgEnd, Math.min(progress * 1.4, 1));
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 144, 144);

  const logoOpacity = Math.max(0, 1 - progress * 1.5);
  if (logoOpacity > 0.05) {
    ctx.globalAlpha = logoOpacity;
    drawHALogoAt(ctx, 72, 72, 50, '#ffffff');
    ctx.globalAlpha = 1;
  }

  return c.toDataURL('image/png').split(',')[1];
}

// Re-export with reveal added
window.IconRenderer = { renderState, renderSensor, renderLightController, renderTrigger, renderAggregate, renderEditMode, renderRevealFrame, renderPuzzlePiece, mixColors };
