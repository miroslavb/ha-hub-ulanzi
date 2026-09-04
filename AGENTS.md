# HA Hub Ulanzi operating notes

- Keep Home Assistant communication on the WebSocket API; the Property
  Inspector's `file://` origin makes authenticated REST probes hit CORS.
- The D200X Light Controller configuration is plugin-global so a keypad action
  and an encoder action always operate on the same selected entity.
- Keep keypad and encoder controls as separate manifest actions without a
  `Devices` filter. D200X Studio drops filtered/dual-surface custom actions from
  the encoder action list even though the public SDK describes that shape.
- PI save logic must preserve `state.items` object identity between renders;
  row listeners close over those objects. Replace scalar settings only.
- Disabling encoder feedback must actively paint the slot transparent; merely
  skipping future renders leaves the previously drawn frame visible.
- Derive available light channels from `supported_color_modes`; never offer
  colour temperature or hue to entities that do not advertise them.
- Use modern Kelvin service data (`color_temp_kelvin`) while accepting legacy
  mired state attributes for display compatibility.
- `auto` icons resolve through HA's entity/device-class/state mapping. Custom
  icons must remain local MDI names; no network icon dependency is allowed.
- Run `node test/test-light-controller.mjs` and validate `manifest.json` after
  controller, rendering, event-routing, or settings changes.
