# Changelog

All notable changes to HA Hub for UlanziDeck.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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
