(function () {
  const PI = window.HAHubPI;
  const MDI = window.MDI_ICONS || {};
  const state = {
    items: [], selectedIndex: 0, brightnessStep: 5, temperatureStep: 250, hueStep: 10
  };
  let pickerIndex = null;
  let availableLights = [];

  // Use the UUID provided by Studio so this shared PI works for both the
  // keypad selector and the dedicated encoder action.
  $UD.connect();
  PI.renderConnectionFields(document.getElementById('conn-fields'));

  function iconSvg(name) {
    const path = MDI[String(name || '').replace(/^mdi:/, '')] || MDI.lightbulb;
    return path ? `<svg viewBox="0 0 24 24"><path d="${path}"></path></svg>` : '·';
  }

  function renderRows() {
    const root = document.getElementById('lc-rows');
    root.innerHTML = '';
    state.items.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'lc-row';

      const label = document.createElement('input');
      label.placeholder = 'label';
      label.value = item.label || '';
      label.addEventListener('input', () => { item.label = label.value; saveDebounced(); });

      const entity = document.createElement('input');
      entity.placeholder = 'light.entity';
      entity.setAttribute('list', 'lc-entities');
      entity.value = item.entityId || '';
      entity.addEventListener('input', () => { item.entityId = entity.value; saveDebounced(); });

      const icon = document.createElement('button');
      icon.type = 'button';
      icon.className = 'lc-icon';
      icon.title = item.icon === 'auto' ? 'HA auto' : `mdi:${item.icon}`;
      icon.innerHTML = iconSvg(item.icon === 'auto' ? 'lightbulb' : item.icon);
      icon.addEventListener('click', () => openPicker(index));

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'lc-delete';
      del.textContent = '✕';
      del.addEventListener('click', () => {
        state.items.splice(index, 1);
        renderRows();
        saveNow();
      });
      row.append(label, entity, icon, del);
      root.appendChild(row);
    });
  }

  function renderEntityList() {
    const list = document.getElementById('lc-entities');
    list.innerHTML = '';
    availableLights.forEach(light => {
      const option = document.createElement('option');
      option.value = light.entity_id;
      option.label = light.friendly_name || light.entity_id;
      list.appendChild(option);
    });
  }

  function openPicker(index) {
    pickerIndex = index;
    document.getElementById('lc-icon-search').value = '';
    renderIconGrid('');
    document.getElementById('lc-icon-panel').classList.remove('hidden');
    document.getElementById('lc-icon-panel').scrollIntoView({ block: 'nearest' });
  }

  function closePicker() {
    pickerIndex = null;
    document.getElementById('lc-icon-panel').classList.add('hidden');
  }

  function renderIconGrid(filter) {
    const grid = document.getElementById('lc-icon-grid');
    const query = String(filter || '').trim().toLowerCase();
    const selected = pickerIndex == null ? '' : state.items[pickerIndex]?.icon;
    const names = Object.keys(MDI).filter(name => !query || name.includes(query)).slice(0, 120);
    grid.innerHTML = '';
    names.forEach(name => {
      const button = document.createElement('button');
      button.type = 'button';
      button.title = `mdi:${name}`;
      button.className = name === selected ? 'selected' : '';
      button.innerHTML = iconSvg(name);
      button.addEventListener('click', () => chooseIcon(name));
      grid.appendChild(button);
    });
  }

  function chooseIcon(name) {
    if (pickerIndex == null || !state.items[pickerIndex]) return;
    state.items[pickerIndex].icon = name || 'auto';
    closePicker();
    renderRows();
    saveNow();
  }

  function numeric(name, fallback) {
    const n = Number.parseInt(document.querySelector(`[name="${name}"]`).value, 10);
    return Number.isFinite(n) ? n : fallback;
  }

  function configFromUi() {
    return {
      items: state.items.map(item => ({
        label: String(item.label || '').trim(),
        entityId: String(item.entityId || '').trim(),
        icon: item.icon || 'auto'
      })),
      selectedIndex: state.selectedIndex,
      brightnessStep: numeric('brightnessStep', 5),
      temperatureStep: numeric('temperatureStep', 250),
      hueStep: numeric('hueStep', 10)
    };
  }

  function saveNow() {
    const form = document.getElementById('light-controller-form');
    const config = configFromUi();
    Object.assign(state, config);
    $UD.sendToPlugin({
      __type: 'set-light-controller',
      config,
      haUrl: form.querySelector('[name="haUrl"]')?.value || '',
      token: form.querySelector('[name="token"]')?.value || ''
    });
  }
  const saveDebounced = Utils.debounce(saveNow);

  function load(config, lights) {
    const c = config || {};
    state.items = Array.isArray(c.items)
      ? c.items.map(item => ({ entityId: item.entityId || '', label: item.label || '', icon: item.icon || 'auto' }))
      : [];
    state.selectedIndex = Number.parseInt(c.selectedIndex, 10) || 0;
    state.brightnessStep = Number.parseInt(c.brightnessStep, 10) || 5;
    state.temperatureStep = Number.parseInt(c.temperatureStep, 10) || 250;
    state.hueStep = Number.parseInt(c.hueStep, 10) || 10;
    document.querySelector('[name="brightnessStep"]').value = state.brightnessStep;
    document.querySelector('[name="temperatureStep"]').value = state.temperatureStep;
    document.querySelector('[name="hueStep"]').value = state.hueStep;
    availableLights = Array.isArray(lights) ? lights : availableLights;
    renderEntityList();
    renderRows();
  }

  $UD.onConnected(() => {
    document.getElementById('lc-add').addEventListener('click', () => {
      state.items.push({ entityId: '', label: '', icon: 'auto' });
      renderRows();
    });
    document.getElementById('lc-icon-search').addEventListener('input', event => renderIconGrid(event.target.value));
    document.getElementById('lc-icon-close').addEventListener('click', closePicker);
    document.getElementById('lc-icon-auto').addEventListener('click', () => chooseIcon('auto'));
    document.getElementById('light-controller-form').addEventListener('input', event => {
      if (event.target.id !== 'lc-icon-search') saveDebounced();
    });
  });

  $UD.onAdd(message => {
    PI.requestGlobalConnection('light-controller-form');
    $UD.sendToPlugin({ __type: 'get-light-controller' });
  });

  $UD.onSendToPropertyInspector(message => {
    const data = message.payload || message.param || message;
    if (data.__type === 'light-controller') load(data.config, data.lights);
  });
})();
