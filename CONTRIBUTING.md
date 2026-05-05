# Contributing to HA Hub for UlanziDeck

Thanks for considering a contribution. This is a small plugin maintained on
volunteer time, so the process is light:

## Reporting issues

Please include:

- Plugin version (from `manifest.json` Version field)
- Ulanzi Studio version
- Home Assistant version
- Your OS (Windows 10/11, macOS version)
- Concrete reproduction steps
- DevTools console output (open `localhost:9292` → click on the relevant
  HTML entry → Console tab → copy)

For visual issues, a screenshot speaks a thousand words.

## Submitting a pull request

1. Fork the repo, branch from `main`
2. Keep changes scoped — one feature or fix per PR
3. Update `CHANGELOG.md` under an `## [Unreleased]` section
4. Verify the plugin loads in Studio without errors before submitting
5. Run a syntax check: `for f in plugin/*.js property-inspector/*.js; do
   node -c "$f" || echo "FAIL: $f"; done`

## Code style

- 2-space indentation
- Semicolons required
- ES6+ (target Electron Chromium runtime)
- No build step — plain `.js` and `.html` shipped as-is
- Functions live in `window.*` namespaces (no module bundler)

## Known SDK quirks

These bit me during development. Documenting so future contributors
don't repeat:

- `$UD` is a module-scope const, **not** `window.$UD`. Don't redeclare
  with `const $UD` in your own code — it crashes the plugin.
- `sendToPlugin` events arrive with payload under `message.payload`,
  while `paramfromplugin` uses `message.param`. Read both as fallback.
- Service calls with `target: null` are rejected by HA — omit `target`
  if you don't have a valid object.
- Property Inspector runs from `file://` origin. CORS settings in HA
  config are needed for direct REST fetch from PI (only used for Test
  connection button).
- SDK fires `onAdd` with empty `param` when re-clicking a configured
  key. Use `__type: 'get-key-settings'` round-trip to repopulate the
  form.
- Cache buster `?v=X.Y.Z` on script/stylesheet imports is required
  because Studio's webview caches aggressively.

## License

By contributing, you agree your code will be released under AGPL-3.0
(same as the rest of the project).
