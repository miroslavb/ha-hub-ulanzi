(function () {
  // Update scalar settings after a save without replacing state.items. Each
  // rendered row listener closes over its item object; replacing the array with
  // cloned objects makes subsequent edits update stale, unsaved objects.
  function applyScalarConfig(state, config) {
    state.selectedIndex = Number.parseInt(config.selectedIndex, 10) || 0;
    state.brightnessStep = Number.parseInt(config.brightnessStep, 10) || 5;
    state.temperatureStep = Number.parseInt(config.temperatureStep, 10) || 250;
    state.hueStep = Number.parseInt(config.hueStep, 10) || 10;
    state.showEncoderFeedback = !(
      config.showEncoderFeedback === false ||
      config.showEncoderFeedback === 'false' ||
      config.showEncoderFeedback === 'off'
    );
    return state;
  }

  window.LightControllerPIState = { applyScalarConfig };
})();
