import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';

global.window = {};
global.CustomEvent = class CustomEvent extends Event {
  constructor(type, options = {}) { super(type); this.detail = options.detail; }
};
global.$UD = {
  icons: [], alerts: 0,
  setBaseDataIcon(context, data) { this.icons.push({ context, data }); },
  showAlert() { this.alerts++; }
};

for (const file of ['plugin/light-controller-store.js', 'plugin/action-light-controller.js']) {
  vm.runInThisContext(fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8'), { filename: file });
}

window.HAIcons = { resolveIconName: entity => entity?.state === 'on' ? 'lightbulb' : 'lightbulb-off' };
window.IconRenderer = { renderLightController: options => JSON.stringify(options) };

let passed = 0;
async function test(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); passed++; }
  catch (error) { console.error(`  ✗ ${name}\n    ${error.stack || error}`); process.exitCode = 1; }
}

const rgbLight = {
  entity_id: 'light.desk', state: 'on',
  attributes: {
    friendly_name: 'Desk', brightness: 128, color_temp_kelvin: 3000,
    min_color_temp_kelvin: 2000, max_color_temp_kelvin: 6500,
    hs_color: [350, 75], rgb_color: [255, 80, 40],
    supported_color_modes: ['color_temp', 'hs']
  }
};
const dimmer = {
  entity_id: 'light.ceiling', state: 'on',
  attributes: { friendly_name: 'Ceiling', brightness: 255, supported_color_modes: ['brightness'] }
};

function fixture(ActionClass = window.LightControllerAction, config = {}) {
  const store = new window.LightControllerStore();
  store.configure({
    items: [
      { entityId: 'light.desk', label: 'Desk lamp', icon: 'auto' },
      { entityId: 'light.ceiling', label: 'Ceiling', icon: 'ceiling-light' }
    ], brightnessStep: 5, temperatureStep: 250, hueStep: 10,
    ...config
  });
  const entities = new Map([[rgbLight.entity_id, structuredClone(rgbLight)], [dimmer.entity_id, structuredClone(dimmer)]]);
  const cache = new EventTarget();
  cache.get = id => entities.get(id) || null;
  const client = {
    calls: [],
    async callService(domain, service, data, target) {
      this.calls.push({ domain, service, data, target });
      return true;
    }
  };
  const action = new ActionClass('ctx');
  action.attach({ lightController: store, cache, client });
  return { store, entities, cache, client, action };
}

await test('capability channels follow HA supported_color_modes order', () => {
  const { store } = fixture();
  assert.deepEqual(store.modesFor(rgbLight), ['brightness', 'color_temp', 'color']);
  assert.deepEqual(store.modesFor(dimmer), ['brightness']);
});

await test('global configuration round-trips the selected entity and step sizes', () => {
  const { store } = fixture();
  store.selectNext();
  const restored = new window.LightControllerStore();
  restored.configure(store.serialize());
  assert.equal(restored.currentItem().entityId, 'light.ceiling');
  assert.equal(restored.brightnessStep, 5);
  assert.equal(restored.temperatureStep, 250);
  assert.equal(restored.hueStep, 10);
});

await test('encoder feedback preference round-trips as disabled', () => {
  const { store } = fixture(window.LightControllerAction, { showEncoderFeedback: false });
  assert.equal(store.showEncoderFeedback, false);
  assert.equal(store.serialize().showEncoderFeedback, false);
});

await test('host refresh preserves channel when selected entity is unchanged', () => {
  const { store } = fixture();
  store.cycleMode(rgbLight);
  assert.equal(store.currentMode(rgbLight), 'color_temp');
  store.configure(store.serialize(), { preserveMode: true });
  assert.equal(store.currentMode(rgbLight), 'color_temp');
});

await test('key press selects the next configured light', () => {
  const { store, action } = fixture();
  assert.equal(store.currentItem().entityId, 'light.desk');
  action.onTap();
  assert.equal(store.currentItem().entityId, 'light.ceiling');
});

await test('encoder press cycles only channels supported by the selected light', () => {
  const { store, action } = fixture();
  assert.equal(store.currentMode(rgbLight), 'brightness');
  action.onDialDown();
  assert.equal(store.currentMode(rgbLight), 'color_temp');
  action.onDialDown();
  assert.equal(store.currentMode(rgbLight), 'color');
  action.onDialDown();
  assert.equal(store.currentMode(rgbLight), 'brightness');
});

await test('encoder changes brightness using brightness_pct', async () => {
  const { client, action } = fixture();
  await action.onDialRotateRight();
  assert.deepEqual(client.calls.at(-1), {
    domain: 'light', service: 'turn_on', data: { brightness_pct: 55 },
    target: { entity_id: 'light.desk' }
  });
});

await test('encoder refreshes host-global selection before control', async () => {
  const { store, client, action } = fixture(window.LightControllerEncoderAction);
  let refreshed = false;
  action.deps.refreshLightController = async () => {
    refreshed = true;
    store.selectNext();
  };
  await action.onDialRotateRight();
  assert.equal(refreshed, true);
  assert.equal(client.calls.at(-1).target.entity_id, 'light.ceiling');
});

await test('temperature channel uses Kelvin and entity bounds', async () => {
  const { store, client, action } = fixture();
  store.cycleMode(rgbLight);
  await action.onDialRotateRight();
  assert.deepEqual(client.calls.at(-1).data, { color_temp_kelvin: 3250 });
});

await test('colour channel rotates hue and preserves saturation', async () => {
  const { store, client, action } = fixture();
  store.cycleMode(rgbLight);
  store.cycleMode(rgbLight);
  await action.onDialRotateRight();
  assert.deepEqual(client.calls.at(-1).data, { hs_color: [0, 75] });
});

await test('render includes entity position and selected channel value', () => {
  const { action } = fixture();
  action.render();
  const rendered = JSON.parse($UD.icons.at(-1).data);
  assert.equal(rendered.label, 'Desk lamp');
  assert.equal(rendered.mode, 'brightness');
  assert.equal(rendered.value, 50);
  assert.equal(rendered.position, 1);
  assert.equal(rendered.total, 2);
});

await test('disabled encoder feedback clears the wide-screen slot', () => {
  $UD.icons.length = 0;
  const { action } = fixture(window.LightControllerEncoderAction, { showEncoderFeedback: false });
  action.render();
  const pngBase64 = window.LightControllerEncoderAction.BLANK_FEEDBACK;
  assert.equal($UD.icons.at(-1).data, pngBase64);
  const png = Buffer.from(pngBase64, 'base64');
  let offset = 8;
  const idat = [];
  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString('ascii', offset + 4, offset + 8);
    if (type === 'IDAT') idat.push(png.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  assert.deepEqual([...zlib.inflateSync(Buffer.concat(idat))], [0, 0, 0, 0, 0],
    'blank frame must be one transparent RGBA pixel');
});

await test('manifest exposes separate unfiltered key and encoder actions', () => {
  const manifest = JSON.parse(fs.readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));
  assert.equal(manifest.Version, '0.13.3');
  const keyAction = manifest.Actions.find(item => item.UUID.endsWith('.lightcontroller'));
  const encoderAction = manifest.Actions.find(item => item.UUID.endsWith('.lightcontrollerencoder'));
  assert.deepEqual(keyAction.Controllers, ['Keypad']);
  assert.ok(!keyAction.Devices || keyAction.Devices.length === 0);
  assert.deepEqual(encoderAction.Controllers, ['Encoder']);
  assert.ok(!encoderAction.Devices || encoderAction.Devices.length === 0);
  assert.equal(encoderAction.Encoder.layout, '$UA1');
});

await test('shared Property Inspector uses current action UUID and hotfix cache buster', () => {
  const html = fs.readFileSync(new URL('../property-inspector/light-controller.html', import.meta.url), 'utf8');
  const script = fs.readFileSync(new URL('../property-inspector/light-controller.js', import.meta.url), 'utf8');
  assert.ok(!html.includes('v=0.13.1'));
  assert.match(html, /light-controller\.js\?v=0\.13\.2/);
  assert.match(script, /\$UD\.connect\(\);/);
});

await test('PI save-state sync preserves row object identity', () => {
  const helperUrl = new URL('../property-inspector/light-controller-state.js', import.meta.url);
  assert.ok(fs.existsSync(helperUrl), 'PI state helper must exist');
  vm.runInThisContext(fs.readFileSync(helperUrl, 'utf8'), { filename: 'light-controller-state.js' });
  const row = { entityId: '', label: '', icon: 'auto' };
  const state = { items: [row], selectedIndex: 0 };
  window.LightControllerPIState.applyScalarConfig(state, {
    items: [{ entityId: 'light.desk', label: 'Desk', icon: 'auto' }],
    selectedIndex: 0, brightnessStep: 7, temperatureStep: 300, hueStep: 15,
    showEncoderFeedback: false
  });
  assert.equal(state.items[0], row, 'save must not replace objects captured by row listeners');
  assert.equal(state.brightnessStep, 7);
  assert.equal(state.showEncoderFeedback, false);
});

console.log(`\n${passed} checks passed`);
