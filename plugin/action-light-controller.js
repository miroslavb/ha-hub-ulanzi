// D200X light controller shared by two manifest actions: a keypad selector and
// an encoder control. Key press selects the next configured light; encoder
// press cycles brightness -> colour temperature -> hue; rotation adjusts it.

class LightControllerAction {
  constructor(ctx) {
    this.context = ctx;
    this._renderListener = null;
    this._cacheListener = null;
    this._lastTapAt = 0;
  }

  static type() { return 'com.ulanzi.ulanzistudio.hahub.lightcontroller'; }

  attach(deps) {
    this.deps = deps;
    this._renderListener = () => this.render();
    this._cacheListener = (event) => {
      const item = this.deps.lightController.currentItem();
      if (item && event.detail.entityId === item.entityId) this.render();
    };
    deps.lightController.addEventListener('changed', this._renderListener);
    deps.cache.addEventListener('entity-changed', this._cacheListener);
    deps.cache.addEventListener('refreshed', this._renderListener);
  }

  detach() {
    if (!this._renderListener) return;
    this.deps.lightController.removeEventListener('changed', this._renderListener);
    this.deps.cache.removeEventListener('entity-changed', this._cacheListener);
    this.deps.cache.removeEventListener('refreshed', this._renderListener);
  }

  configure() { this.render(); }

  entity() {
    const item = this.deps.lightController.currentItem();
    return item ? this.deps.cache.get(item.entityId) : null;
  }

  render() {
    const store = this.deps.lightController;
    const item = store.currentItem();
    const entity = this.entity();
    const mode = store.currentMode(entity);
    const iconName = item && item.icon !== 'auto'
      ? item.icon : window.HAIcons.resolveIconName(entity);
    const data = window.IconRenderer.renderLightController({
      entity,
      label: item?.label || entity?.attributes?.friendly_name || item?.entityId || 'Add lights',
      iconName,
      mode,
      value: store.currentValue(entity, mode),
      position: store.items.length ? store.selectedIndex + 1 : 0,
      total: store.items.length
    });
    $UD.setBaseDataIcon(this.context, data, '');
  }

  onTap() {
    const now = Date.now();
    if (now - this._lastTapAt < 250) return;
    this._lastTapAt = now;
    this.deps.lightController.selectNext();
  }

  onDialDown() {
    this.deps.lightController.cycleMode(this.entity());
  }

  async adjust(direction) {
    const store = this.deps.lightController;
    const item = store.currentItem();
    const entity = this.entity();
    const mode = store.currentMode(entity);
    if (!item || !entity || !mode || ['unavailable', 'unknown'].includes(entity.state)) return false;

    const attrs = entity.attributes || {};
    const current = store.currentValue(entity, mode);
    let target;
    let data;

    if (mode === 'brightness') {
      target = Math.max(0, Math.min(100, current + direction * store.brightnessStep));
      store.setOptimistic(item.entityId, mode, target);
      if (target === 0) {
        const ok = await this.deps.client.callService('light', 'turn_off', null, { entity_id: item.entityId });
        if (!ok) $UD.showAlert(this.context);
        return ok;
      }
      data = { brightness_pct: target };
    } else if (mode === 'color_temp') {
      const min = Number(attrs.min_color_temp_kelvin) || 2000;
      const max = Number(attrs.max_color_temp_kelvin) || 6500;
      target = Math.max(min, Math.min(max, current + direction * store.temperatureStep));
      store.setOptimistic(item.entityId, mode, target);
      data = { color_temp_kelvin: target };
    } else if (mode === 'color') {
      target = (current + direction * store.hueStep + 360) % 360;
      store.setOptimistic(item.entityId, mode, target);
      data = { hs_color: [target, Number(attrs.hs_color?.[1]) || 100] };
    }

    const ok = await this.deps.client.callService(
      'light', 'turn_on', data, { entity_id: item.entityId }
    );
    if (!ok) $UD.showAlert(this.context);
    return ok;
  }

  onDialRotateLeft() { return this.adjust(-1); }
  onDialRotateRight() { return this.adjust(1); }
}

window.LightControllerAction = LightControllerAction;

// Ulanzi Studio discovers encoder actions reliably only as a dedicated
// Encoder-only manifest entry. Behaviour and global light selection stay shared.
class LightControllerEncoderAction extends LightControllerAction {
  static type() { return 'com.ulanzi.ulanzistudio.hahub.lightcontrollerencoder'; }
}

window.LightControllerEncoderAction = LightControllerEncoderAction;
