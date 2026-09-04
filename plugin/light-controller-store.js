// Shared D200X light-controller state. One configuration is used by every
// Light Controller key/encoder instance so a key can select the entity while
// the encoder controls it.

class LightControllerStore extends EventTarget {
  constructor() {
    super();
    this.items = [];
    this.selectedIndex = 0;
    this.modeIndex = 0;
    this.brightnessStep = 5;
    this.temperatureStep = 250;
    this.hueStep = 10;
    this.showEncoderFeedback = true;
    this.optimistic = null;
  }

  configure(config, options) {
    const c = config || {};
    const opts = options || {};
    const previousEntityId = this.currentItem()?.entityId || null;
    const previousModeIndex = this.modeIndex;
    const previousOptimistic = this.optimistic;
    this.items = (Array.isArray(c.items) ? c.items : [])
      .map(item => ({
        entityId: String(item?.entityId || '').trim(),
        label: String(item?.label || '').trim(),
        icon: String(item?.icon || 'auto').replace(/^mdi:/, '') || 'auto'
      }))
      .filter(item => item.entityId.startsWith('light.'))
      .slice(0, 32);
    this.selectedIndex = this.items.length
      ? Math.max(0, Math.min(this.items.length - 1, Number.parseInt(c.selectedIndex, 10) || 0))
      : 0;
    this.brightnessStep = this._bounded(c.brightnessStep, 1, 25, 5);
    this.temperatureStep = this._bounded(c.temperatureStep, 50, 1000, 250);
    this.hueStep = this._bounded(c.hueStep, 1, 90, 10);
    this.showEncoderFeedback = !(
      c.showEncoderFeedback === false ||
      c.showEncoderFeedback === 'false' ||
      c.showEncoderFeedback === 'off'
    );
    const sameEntity = previousEntityId && previousEntityId === this.currentItem()?.entityId;
    const preserveTransient = !!opts.preserveMode && !!sameEntity;
    this.modeIndex = preserveTransient ? previousModeIndex : 0;
    this.optimistic = preserveTransient ? previousOptimistic : null;
    this._emit('changed');
  }

  _bounded(value, min, max, fallback) {
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
  }

  serialize() {
    return {
      items: this.items.map(item => ({ ...item })),
      selectedIndex: this.selectedIndex,
      brightnessStep: this.brightnessStep,
      temperatureStep: this.temperatureStep,
      hueStep: this.hueStep,
      showEncoderFeedback: this.showEncoderFeedback
    };
  }

  currentItem() { return this.items[this.selectedIndex] || null; }

  selectNext() {
    if (!this.items.length) return null;
    this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
    this.modeIndex = 0;
    this.optimistic = null;
    this._emit('selection-changed');
    this._emit('changed');
    return this.currentItem();
  }

  modesFor(entity) {
    if (!entity) return [];
    const attrs = entity.attributes || {};
    const supported = Array.isArray(attrs.supported_color_modes)
      ? attrs.supported_color_modes : [];
    const modes = [];
    const dimmable = supported.some(mode => mode !== 'onoff') || attrs.brightness != null;
    if (dimmable) modes.push('brightness');
    if (supported.includes('color_temp') || attrs.color_temp_kelvin != null || attrs.color_temp != null) {
      modes.push('color_temp');
    }
    if (supported.some(mode => ['hs', 'xy', 'rgb', 'rgbw', 'rgbww'].includes(mode)) || attrs.hs_color) {
      modes.push('color');
    }
    return modes;
  }

  currentMode(entity) {
    const modes = this.modesFor(entity);
    if (!modes.length) return null;
    if (this.modeIndex >= modes.length) this.modeIndex = 0;
    return modes[this.modeIndex];
  }

  cycleMode(entity) {
    const modes = this.modesFor(entity);
    if (!modes.length) return null;
    this.modeIndex = (this.modeIndex + 1) % modes.length;
    this.optimistic = null;
    this._emit('changed');
    return modes[this.modeIndex];
  }

  currentValue(entity, mode) {
    const item = this.currentItem();
    if (!item || !entity || !mode) return null;
    if (this.optimistic && this.optimistic.entityId === item.entityId &&
        this.optimistic.mode === mode && this.optimistic.until > Date.now()) {
      return this.optimistic.value;
    }
    const attrs = entity.attributes || {};
    if (mode === 'brightness') {
      if (entity.state !== 'on') return 0;
      return attrs.brightness == null ? 100 : Math.round(attrs.brightness / 255 * 100);
    }
    if (mode === 'color_temp') {
      if (attrs.color_temp_kelvin != null) return Number(attrs.color_temp_kelvin);
      if (attrs.color_temp) return Math.round(1000000 / Number(attrs.color_temp));
      const lo = Number(attrs.min_color_temp_kelvin) || 2000;
      const hi = Number(attrs.max_color_temp_kelvin) || 6500;
      return Math.round((lo + hi) / 2);
    }
    if (mode === 'color') return Number(attrs.hs_color?.[0]) || 0;
    return null;
  }

  setOptimistic(entityId, mode, value) {
    this.optimistic = { entityId, mode, value, until: Date.now() + 1500 };
    this._emit('changed');
  }

  _emit(name) { this.dispatchEvent(new CustomEvent(name)); }
}

window.LightControllerStore = LightControllerStore;
