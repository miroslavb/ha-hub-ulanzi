# Changelog

## [0.13.2] - 2026-09-04

### Fixed
- Adding and editing multiple Light Selector entities no longer loses later
  field changes. Saving now preserves the row objects captured by DOM handlers.

### Added
- **Wide-screen feedback** checkbox. Disable it to keep the D200X encoder slot
  blank while retaining all encoder controls.

## [0.13.1] - 2026-09-03

### Fixed
- D200X now lists the light controller in the encoder tab. Studio receives two
  dedicated, unfiltered actions: **HA Light Selector** for keys and **HA Light
  Controller** for encoders. They still share one entity list and selection.
- The shared Property Inspector now connects with Studio's current action UUID,
  so it opens correctly from either surface.

## [0.13.0] - 2026-09-03

### Added
- **HA Light Controller** for D200X, usable on both an LCD key and an encoder.
  The key cycles a Studio-configured list of lights; the encoder rotates the
  active value and its press cycles only supported channels in this order:
  brightness, colour temperature, hue.
- Shared light/entity/icon configuration with searchable HA entities and the
  bundled offline MDI catalogue. `HA auto` follows the entity's explicit or
  state-dependent Home Assistant icon.
- Lovelace-style live feedback: off/unavailable state, actual RGB/HS/CCT colour,
  brightness percentage, Kelvin/hue value, and selected entity position.

### Changed
- Light colour-temperature calls now use Home Assistant's preferred
  `color_temp_kelvin` service field; legacy mired attributes remain readable.

All notable changes to HA Hub for UlanziDeck.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.12.1] - 2026-06-29

### Fixed
- **"Test connection" no longer fails with `Unreachable — Failed to fetch` on a
  stock HA install.** The Property Inspector test previously made a cross-origin
  REST call (`GET /api/`) with an `Authorization` header, which triggers a CORS
  preflight that Home Assistant rejects unless `cors_allowed_origins` is
  configured — so the button reported failure even when the plugin's runtime
  (which uses the WebSocket API) connected fine. The test now connects over the
  same HA **WebSocket API** the runtime uses (`auth` handshake →
  `get_states`), which has no CORS preflight, so it succeeds out of the box. A
  REST attempt remains only as a fallback if the socket can't be opened.

## [0.12.0] - 2026-06-29

### Added
- **Standard Home Assistant entity icons.** Keys can now render the same
  Material Design Icon that Home Assistant shows for an entity, instead of (or
  alongside) the status text. A new **Icon** option in the Property Inspector
  offers `Text only` (default, unchanged), `HA icon`, and `HA icon + label`.
  Available on **HA Toggle**, **HA Smart Toggle**, **HA Scene**, and
  **HA Sensor** actions.
  - Icon resolution mirrors the HA frontend: an explicit `icon:` on the entity
    wins (e.g. `mdi:washing-machine`), otherwise the domain / device-class /
    state default is used (e.g. `binary_sensor` with `device_class: door`
    shows an open vs. closed door as state changes), with a generic glyph as
    fallback.
  - The complete Material Design Icons set (v7.4.x, via `@mdi/js`) is bundled
    (`plugin/mdi-icons.js`), so icons render fully offline — no network calls.
  - Default icon mappings (`plugin/ha-icons.js`) are generated from Home
    Assistant core component `icons.json` data (43 domains, plus device
    classes and state variants).
  - Icons are drawn on the canvas via `Path2D`; the background still conveys
    on/off state and pulse, exactly as before.

### Notes
- Existing keys are unaffected — the icon option defaults to `Text only`, so
  upgrading changes nothing until you opt in per key.

## [0.11.13] - 2026-05-04

### Fixed
- Property Inspector form now correctly repopulates with stored config when
  a tile is re-clicked. Previously, the SDK's `onAdd` event with empty
  param caused the form to look empty, even though the action was still
  working correctly. Now the PI explicitly queries the main service for
  current settings via `get-key-settings` round-trip.

## [0.11.12] - 2026-05-04

### Fixed
- Pulse with custom color no longer flickers between state color and pulse
  color. When `pulseColor` is configured, the pulse now varies intensity
  of that single color (dim → bright) instead of mixing with the state
  color.
- Added smart-merge in main service config flow: incoming settings with
  empty critical fields no longer wipe previously-stored values. Phantom
  change events from programmatic form fills can no longer corrupt
  config.

### Added
- HA Smart Toggle: optional "Show ⚡ FORCED badge when action entity is on"
  checkbox. Default off. Useful for force-override patterns
  (`input_boolean.deferrable_*_forced`), hidden by default for other use
  cases.

## [0.11.11] - 2026-05-04

### Fixed
- Cache busters added to all PI HTML script and stylesheet imports
  (`_shared.js?v=X.Y.Z`). Ulanzi Studio's webview caches aggressively;
  without this, plugin updates required manual cache wipes.

## [0.11.9] - 2026-05-04

### Added
- **Pulse color** configurable in HA Toggle, HA Smart Toggle, and HA
  Aggregate. Visual color picker + hex text input + 5 quick-pick presets
  (red, amber, green, cyan, purple).

### Fixed
- Mode selection (Per-tile flip / Puzzle reveal) now uses JS-managed text
  indicators (●/○) for reliability across Electron versions.

## [0.11.7] - 2026-05-04

### Added
- Reveal mode is now a clean radio-button choice between **Per-tile flip**
  and **🧪 Puzzle reveal** (experimental).

### Fixed
- Tile config no longer wipes when toggling reveal options. Safety guard
  in `sendConfig` refuses to send a partial config if previously-set
  critical fields would become empty.

## [0.11.4] - 2026-05-03

### Added
- **Coordinated puzzle reveal** (experimental, opt-in): all HA Hub keys
  collectively render ONE giant HA-style logo at page-switch, then each
  tile flips to its own content. Auto-detects deck dimensions from
  observed `key: "row_col"` strings.

## [0.11.3] - 2026-05-03

### Added
- **HA logo reveal animation** on page switch. Each key briefly shows the
  HA-style logo on a brand-blue background, then crossfades to its normal
  content. Per-key independent timing.

## [0.11.0] - 2026-05-03

### Added
- **HA Smart Dialer** — universal encoder action. Long-press any HA Toggle
  / Smart Toggle bound to a light/climate/cover/media_player/fan to
  activate Edit Mode; rotate Smart Dialer to adjust brightness /
  temperature / volume / position / percentage. Auto-power-on when off.
  Auto-exits after 15s idle.
- **Long-press edit mode** on Toggle and Smart Toggle. Source key pulses
  cyan and shows live value while dialing.
- **Custom on/off text** on HA Toggle.

### Changed
- Long-press timing 700ms (was 500ms).
- All UI text translated to English.

## [0.10.0] - 2026-05-03

### Added
- HA Smart Toggle — separate display + action entity.
- HA Aggregate — count multi-entity active states with pulse.
- Pulse animation on HA Toggle.

## [0.9.0 → 0.9.8] - 2026-05-03

Initial public beta. Five action types (Toggle, Scene, Service Call,
Sensor, Encoder), live state via WebSocket, entity picker with
friendly-name search, six themes, global connection settings, "Test
connection" button. Worked through ~6 SDK quirks during initial
development.
