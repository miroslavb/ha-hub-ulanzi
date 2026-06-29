// HA Hub for UlanziDeck - Home Assistant standard icon resolver.
//
// Resolves the Material Design Icon (MDI) name that Home Assistant would show
// for an entity, then looks up its SVG path from window.MDI_ICONS (mdi-icons.js).
//
// Resolution order (mirrors the HA frontend):
//   1. entity.attributes.icon, if explicitly set (e.g. "mdi:washing-machine").
//   2. domain + device_class + state default, from HA core's component
//      icons.json data baked into DEFAULTS below.
//   3. a domain-level fallback, then a generic bookmark glyph.
//
// DEFAULTS is generated from home-assistant/core component icons.json
// (the "entity_component" section: domain -> deviceClass|"_" -> {default,state}).

(function () {
  const DEFAULTS = {"air_quality":{"_":{"default":"mdi:air-filter"}},"alarm_control_panel":{"_":{"default":"mdi:shield","state":{"armed_away":"mdi:shield-lock","armed_custom_bypass":"mdi:security","armed_home":"mdi:shield-home","armed_night":"mdi:shield-moon","armed_vacation":"mdi:shield-airplane","disarmed":"mdi:shield-off","pending":"mdi:shield-outline","triggered":"mdi:bell-ring"}}},"automation":{"_":{"default":"mdi:robot","state":{"off":"mdi:robot-off","unavailable":"mdi:robot-confused"}}},"binary_sensor":{"_":{"default":"mdi:radiobox-blank","state":{"on":"mdi:checkbox-marked-circle"}},"battery":{"default":"mdi:battery","state":{"on":"mdi:battery-outline"}},"battery_charging":{"default":"mdi:battery","state":{"on":"mdi:battery-charging"}},"carbon_monoxide":{"default":"mdi:smoke-detector","state":{"on":"mdi:smoke-detector-alert"}},"cold":{"default":"mdi:thermometer","state":{"on":"mdi:snowflake"}},"connectivity":{"default":"mdi:close-network-outline","state":{"on":"mdi:check-network-outline"}},"door":{"default":"mdi:door-closed","state":{"on":"mdi:door-open"}},"garage_door":{"default":"mdi:garage","state":{"on":"mdi:garage-open"}},"gas":{"default":"mdi:check-circle","state":{"on":"mdi:alert-circle"}},"heat":{"default":"mdi:thermometer","state":{"on":"mdi:fire"}},"light":{"default":"mdi:brightness-5","state":{"on":"mdi:brightness-7"}},"lock":{"default":"mdi:lock","state":{"on":"mdi:lock-open"}},"moisture":{"default":"mdi:water-off","state":{"on":"mdi:water"}},"motion":{"default":"mdi:motion-sensor-off","state":{"on":"mdi:motion-sensor"}},"moving":{"default":"mdi:octagon","state":{"on":"mdi:arrow-right"}},"occupancy":{"default":"mdi:home-outline","state":{"on":"mdi:home"}},"opening":{"default":"mdi:square","state":{"on":"mdi:square-outline"}},"plug":{"default":"mdi:power-plug-off","state":{"on":"mdi:power-plug"}},"power":{"default":"mdi:power-plug-off","state":{"on":"mdi:power-plug"}},"presence":{"default":"mdi:home-outline","state":{"on":"mdi:home"}},"problem":{"default":"mdi:check-circle","state":{"on":"mdi:alert-circle"}},"running":{"default":"mdi:stop","state":{"on":"mdi:play"}},"safety":{"default":"mdi:check-circle","state":{"on":"mdi:alert-circle"}},"smoke":{"default":"mdi:smoke-detector-variant","state":{"on":"mdi:smoke-detector-variant-alert"}},"sound":{"default":"mdi:music-note-off","state":{"on":"mdi:music-note"}},"tamper":{"default":"mdi:check-circle","state":{"on":"mdi:alert-circle"}},"update":{"default":"mdi:package","state":{"on":"mdi:package-up"}},"vibration":{"default":"mdi:crop-portrait","state":{"on":"mdi:vibrate"}},"window":{"default":"mdi:window-closed","state":{"on":"mdi:window-open"}}},"button":{"_":{"default":"mdi:button-pointer"},"identify":{"default":"mdi:crosshairs-question"},"restart":{"default":"mdi:restart"},"update":{"default":"mdi:package-up"}},"calendar":{"_":{"default":"mdi:calendar","state":{"off":"mdi:calendar-blank","on":"mdi:calendar-check"}}},"camera":{"_":{"default":"mdi:video","state":{"off":"mdi:video-off"}}},"climate":{"_":{"default":"mdi:thermostat"}},"conversation":{"_":{"default":"mdi:forum-outline"}},"cover":{"_":{"default":"mdi:window-open","state":{"closed":"mdi:window-closed","closing":"mdi:arrow-down-box","opening":"mdi:arrow-up-box"}},"blind":{"default":"mdi:blinds-horizontal","state":{"closed":"mdi:blinds-horizontal-closed","closing":"mdi:arrow-down-box","opening":"mdi:arrow-up-box"}},"curtain":{"default":"mdi:curtains","state":{"closed":"mdi:curtains-closed","closing":"mdi:arrow-collapse-horizontal","opening":"mdi:arrow-split-vertical"}},"damper":{"default":"mdi:circle","state":{"closed":"mdi:circle-slice-8"}},"door":{"default":"mdi:door-open","state":{"closed":"mdi:door-closed"}},"garage":{"default":"mdi:garage-open","state":{"closed":"mdi:garage","closing":"mdi:arrow-down-box","opening":"mdi:arrow-up-box"}},"gate":{"default":"mdi:gate-open","state":{"closed":"mdi:gate","closing":"mdi:arrow-right","opening":"mdi:arrow-right"}},"shade":{"default":"mdi:roller-shade","state":{"closed":"mdi:roller-shade-closed","closing":"mdi:arrow-down-box","opening":"mdi:arrow-up-box"}},"shutter":{"default":"mdi:window-shutter-open","state":{"closed":"mdi:window-shutter","closing":"mdi:arrow-down-box","opening":"mdi:arrow-up-box"}},"window":{"default":"mdi:window-open","state":{"closed":"mdi:window-closed","closing":"mdi:arrow-down-box","opening":"mdi:arrow-up-box"}}},"date":{"_":{"default":"mdi:calendar"}},"datetime":{"_":{"default":"mdi:calendar-clock"}},"device_tracker":{"_":{"default":"mdi:account","state":{"not_home":"mdi:account-arrow-right"}}},"event":{"_":{"default":"mdi:eye-check"},"button":{"default":"mdi:gesture-tap-button"},"doorbell":{"default":"mdi:doorbell"},"motion":{"default":"mdi:motion-sensor"}},"fan":{"_":{"default":"mdi:fan","state":{"off":"mdi:fan-off"}}},"humidifier":{"_":{"default":"mdi:air-humidifier","state":{"off":"mdi:air-humidifier-off"}}},"image":{"_":{"default":"mdi:image"}},"input_boolean":{"_":{"default":"mdi:check-circle-outline","state":{"off":"mdi:close-circle-outline"}}},"lawn_mower":{"_":{"default":"mdi:robot-mower"}},"light":{"_":{"default":"mdi:lightbulb","state":{"off":"mdi:lightbulb-off"}}},"lock":{"_":{"default":"mdi:lock","state":{"jammed":"mdi:lock-alert","locking":"mdi:lock-clock","open":"mdi:lock-open-variant","opening":"mdi:lock-clock","unlocked":"mdi:lock-open-variant","unlocking":"mdi:lock-clock"}}},"media_player":{"_":{"default":"mdi:cast","state":{"off":"mdi:cast-off","paused":"mdi:cast-connected","playing":"mdi:cast-connected"}},"projector":{"default":"mdi:projector","state":{"off":"mdi:projector-off"}},"receiver":{"default":"mdi:audio-video","state":{"off":"mdi:audio-video-off"}},"speaker":{"default":"mdi:speaker","state":{"off":"mdi:speaker-off","paused":"mdi:speaker-pause","playing":"mdi:speaker-play"}},"tv":{"default":"mdi:television","state":{"off":"mdi:television-off","paused":"mdi:television-pause","playing":"mdi:television-play"}}},"notify":{"_":{"default":"mdi:message"}},"number":{"_":{"default":"mdi:ray-vertex"},"absolute_humidity":{"default":"mdi:water-opacity"},"apparent_power":{"default":"mdi:flash"},"aqi":{"default":"mdi:air-filter"},"area":{"default":"mdi:texture-box"},"atmospheric_pressure":{"default":"mdi:thermometer-lines"},"battery":{"default":"mdi:battery"},"blood_glucose_concentration":{"default":"mdi:spoon-sugar"},"carbon_dioxide":{"default":"mdi:molecule-co2"},"carbon_monoxide":{"default":"mdi:molecule-co"},"conductivity":{"default":"mdi:sprout-outline"},"current":{"default":"mdi:current-ac"},"data_rate":{"default":"mdi:transmission-tower"},"data_size":{"default":"mdi:database"},"distance":{"default":"mdi:arrow-left-right"},"duration":{"default":"mdi:progress-clock"},"energy":{"default":"mdi:lightning-bolt"},"energy_storage":{"default":"mdi:car-battery"},"frequency":{"default":"mdi:sine-wave"},"gas":{"default":"mdi:meter-gas"},"humidity":{"default":"mdi:water-percent"},"illuminance":{"default":"mdi:brightness-5"},"irradiance":{"default":"mdi:sun-wireless"},"moisture":{"default":"mdi:water-percent"},"monetary":{"default":"mdi:cash"},"nitrogen_dioxide":{"default":"mdi:molecule"},"nitrogen_monoxide":{"default":"mdi:molecule"},"nitrous_oxide":{"default":"mdi:molecule"},"ozone":{"default":"mdi:molecule"},"ph":{"default":"mdi:ph"},"pm1":{"default":"mdi:molecule"},"pm10":{"default":"mdi:molecule"},"pm25":{"default":"mdi:molecule"},"power":{"default":"mdi:flash"},"power_factor":{"default":"mdi:angle-acute"},"precipitation":{"default":"mdi:weather-rainy"},"precipitation_intensity":{"default":"mdi:weather-pouring"},"pressure":{"default":"mdi:gauge"},"reactive_energy":{"default":"mdi:lightning-bolt"},"reactive_power":{"default":"mdi:flash"},"signal_strength":{"default":"mdi:wifi"},"sound_pressure":{"default":"mdi:ear-hearing"},"speed":{"default":"mdi:speedometer"},"sulfur_dioxide":{"default":"mdi:molecule"},"temperature":{"default":"mdi:thermometer"},"temperature_delta":{"default":"mdi:thermometer"},"volatile_organic_compounds":{"default":"mdi:molecule"},"volatile_organic_compounds_parts":{"default":"mdi:molecule"},"voltage":{"default":"mdi:sine-wave"},"volume":{"default":"mdi:car-coolant-level"},"volume_flow_rate":{"default":"mdi:pipe-valve"},"volume_storage":{"default":"mdi:storage-tank"},"water":{"default":"mdi:water"},"weight":{"default":"mdi:weight"},"wind_direction":{"default":"mdi:compass-rose"},"wind_speed":{"default":"mdi:weather-windy"}},"person":{"_":{"default":"mdi:account","state":{"not_home":"mdi:account-arrow-right"}}},"remote":{"_":{"default":"mdi:remote","state":{"off":"mdi:remote-off"}}},"scene":{"_":{"default":"mdi:palette"}},"script":{"_":{"default":"mdi:script-text","state":{"on":"mdi:script-text-play"}}},"select":{"_":{"default":"mdi:format-list-bulleted"}},"sensor":{"_":{"default":"mdi:eye"},"absolute_humidity":{"default":"mdi:water-opacity"},"apparent_power":{"default":"mdi:flash"},"aqi":{"default":"mdi:air-filter"},"area":{"default":"mdi:texture-box"},"atmospheric_pressure":{"default":"mdi:thermometer-lines"},"battery":{"default":"mdi:battery-unknown"},"blood_glucose_concentration":{"default":"mdi:spoon-sugar"},"carbon_dioxide":{"default":"mdi:molecule-co2"},"carbon_monoxide":{"default":"mdi:molecule-co"},"conductivity":{"default":"mdi:sprout-outline"},"current":{"default":"mdi:current-ac"},"data_rate":{"default":"mdi:transmission-tower"},"data_size":{"default":"mdi:database"},"date":{"default":"mdi:calendar"},"distance":{"default":"mdi:arrow-left-right"},"duration":{"default":"mdi:progress-clock"},"energy":{"default":"mdi:lightning-bolt"},"energy_storage":{"default":"mdi:car-battery"},"enum":{"default":"mdi:eye"},"frequency":{"default":"mdi:sine-wave"},"gas":{"default":"mdi:meter-gas"},"humidity":{"default":"mdi:water-percent"},"illuminance":{"default":"mdi:brightness-5"},"irradiance":{"default":"mdi:sun-wireless"},"moisture":{"default":"mdi:water-percent"},"monetary":{"default":"mdi:cash"},"nitrogen_dioxide":{"default":"mdi:molecule"},"nitrogen_monoxide":{"default":"mdi:molecule"},"nitrous_oxide":{"default":"mdi:molecule"},"ozone":{"default":"mdi:molecule"},"ph":{"default":"mdi:ph"},"pm1":{"default":"mdi:molecule"},"pm10":{"default":"mdi:molecule"},"pm25":{"default":"mdi:molecule"},"pm4":{"default":"mdi:molecule"},"power":{"default":"mdi:flash"},"power_factor":{"default":"mdi:angle-acute"},"precipitation":{"default":"mdi:weather-rainy"},"precipitation_intensity":{"default":"mdi:weather-pouring"},"pressure":{"default":"mdi:gauge"},"reactive_energy":{"default":"mdi:lightning-bolt"},"reactive_power":{"default":"mdi:flash"},"signal_strength":{"default":"mdi:wifi"},"sound_pressure":{"default":"mdi:ear-hearing"},"speed":{"default":"mdi:speedometer"},"sulphur_dioxide":{"default":"mdi:molecule"},"temperature":{"default":"mdi:thermometer"},"temperature_delta":{"default":"mdi:thermometer"},"timestamp":{"default":"mdi:clock"},"uptime":{"default":"mdi:clock-start"},"volatile_organic_compounds":{"default":"mdi:molecule"},"volatile_organic_compounds_parts":{"default":"mdi:molecule"},"voltage":{"default":"mdi:sine-wave"},"volume":{"default":"mdi:car-coolant-level"},"volume_flow_rate":{"default":"mdi:pipe-valve"},"volume_storage":{"default":"mdi:storage-tank"},"water":{"default":"mdi:water"},"weight":{"default":"mdi:weight"},"wind_direction":{"default":"mdi:compass-rose"},"wind_speed":{"default":"mdi:weather-windy"}},"siren":{"_":{"default":"mdi:bullhorn"}},"stt":{"_":{"default":"mdi:microphone-message"}},"switch":{"_":{"default":"mdi:toggle-switch-variant","state":{"off":"mdi:toggle-switch-variant-off"}},"outlet":{"default":"mdi:power-plug","state":{"off":"mdi:power-plug-off"}},"switch":{"default":"mdi:toggle-switch-variant","state":{"off":"mdi:toggle-switch-variant-off"}}},"text":{"_":{"default":"mdi:form-textbox"}},"time":{"_":{"default":"mdi:clock"}},"todo":{"_":{"default":"mdi:clipboard-list"}},"tts":{"_":{"default":"mdi:speaker-message"}},"update":{"_":{"default":"mdi:package-up","state":{"off":"mdi:package"}}},"vacuum":{"_":{"default":"mdi:robot-vacuum"}},"valve":{"_":{"default":"mdi:valve-open","state":{"closed":"mdi:valve-closed","closing":"mdi:valve","opening":"mdi:valve"}},"gas":{"default":"mdi:meter-gas"},"water":{"default":"mdi:valve-open","state":{"closed":"mdi:valve-closed","closing":"mdi:valve","opening":"mdi:valve"}}},"wake_word":{"_":{"default":"mdi:chat-sleep"}},"water_heater":{"_":{"default":"mdi:water-boiler","state":{"off":"mdi:water-boiler-off"}}},"weather":{"_":{"default":"mdi:weather-partly-cloudy","state":{"clear-night":"mdi:weather-night","cloudy":"mdi:weather-cloudy","exceptional":"mdi:alert-circle-outline","fog":"mdi:weather-fog","hail":"mdi:weather-hail","lightning":"mdi:weather-lightning","lightning-rainy":"mdi:weather-lightning-rainy","pouring":"mdi:weather-pouring","rainy":"mdi:weather-rainy","snowy":"mdi:weather-snowy","snowy-rainy":"mdi:weather-snowy-rainy","sunny":"mdi:weather-sunny","windy":"mdi:weather-windy","windy-variant":"mdi:weather-windy-variant"}}}};

  // Domain-level fallbacks for domains HA core does not ship entity_component
  // icon data for (helpers, groups, etc.).
  const DOMAIN_FALLBACK = {"input_number":"ray-vertex","input_select":"format-list-bulleted","input_text":"form-textbox","input_datetime":"calendar-clock","input_button":"gesture-tap-button","counter":"counter","timer":"timer-outline","schedule":"calendar-clock","group":"google-circles-communities","sun":"white-balance-sunny","zone":"map-marker-radius","plant":"flower","persistent_notification":"bell"};

  // HA's ultimate generic entity icon.
  const GENERIC = 'bookmark';

  // "mdi:lightbulb" / "hass:lightbulb" -> "lightbulb"
  function stripPrefix(icon) {
    const s = String(icon);
    const i = s.indexOf(':');
    return (i >= 0 ? s.slice(i + 1) : s).trim();
  }

  // Resolve the MDI icon NAME (no "mdi:" prefix) HA would display for an entity.
  function resolveIconName(entity) {
    if (!entity) return GENERIC;
    const attrs = entity.attributes || {};

    // 1. Explicit icon set on the entity always wins.
    if (typeof attrs.icon === 'string' && attrs.icon) {
      const name = stripPrefix(attrs.icon);
      if (name) return name;
    }

    const entityId = entity.entity_id || '';
    const domain = entityId.split('.')[0];
    const dc = attrs.device_class;
    const state = entity.state;

    // 2. domain + device_class + state default.
    const comp = DEFAULTS[domain];
    if (comp) {
      const entry = (dc && comp[dc]) || comp['_'];
      if (entry) {
        if (entry.state && state != null && entry.state[state]) {
          return stripPrefix(entry.state[state]);
        }
        if (entry.default) return stripPrefix(entry.default);
      }
    }

    // 3. domain fallback, then generic.
    if (DOMAIN_FALLBACK[domain]) return DOMAIN_FALLBACK[domain];
    return GENERIC;
  }

  // Resolve an icon name (with or without "mdi:") to its SVG path "d" string,
  // or null if the bundle does not contain it.
  function getPath(name) {
    if (!name) return null;
    const clean = stripPrefix(name);
    const icons = window.MDI_ICONS || {};
    return icons[clean] || null;
  }

  // Convenience: entity -> SVG path, falling back to the generic glyph so a
  // renderable path is (almost) always returned.
  function pathForEntity(entity) {
    const path = getPath(resolveIconName(entity));
    return path || getPath(GENERIC);
  }

  window.HAIcons = { resolveIconName, getPath, pathForEntity, GENERIC_ICON: GENERIC };
})();
