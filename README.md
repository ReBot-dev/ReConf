# ReConf — Web Configurator for ReLow Series Keyboards

ReConf is a web-based configurator for [ReLow](https://rebotlab.net/products/relow60) series magnetic hall-effect keyboards. Built on top of [hmkconf](https://github.com/peppapighs/hmkconf) (GPL-3.0).

**Live app: [reconf.rebotlab.net](https://reconf.rebotlab.net/)** — no installation required.

## Features

- **Remap** — Reassign keys per layer with full keycode support
- **Actuation Point** — Set per-key actuation points, displayed in mm, % or raw values
- **Rapid Trigger** — Configure per-key rapid trigger sensitivity
- **Advanced Keys** — SOCD null-bind, Dynamic Keystroke (DKS), Tap-Hold, Toggle
- **Macros** — Record a sequence of key events and replay it from a single key
- **Gamepad** — XInput gamepad emulation with analog curve editor
- **Switch Profile** — Per-key switch type assignment for mixed-switch builds
- **Calibration** — Per-key bottom-out threshold calibration
- **Firmware Update** — Flash firmware from the browser over Web DFU (DfuSe / AT32)
- **i18n** — Japanese / English

The in-app changelog lists both configurator and firmware releases.

## Tech Stack

- [SvelteKit](https://kit.svelte.dev/) + [Svelte 5](https://svelte.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Paraglide JS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) (i18n)
- [WebHID API](https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API) for device communication
- [WebUSB API](https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API) for firmware updates over Web DFU
- Deployed on [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [Bun](https://bun.sh/) or npm

### Development

```bash
bun install
bun dev
```

Open [http://localhost:5173](http://localhost:5173) in a Chromium-based browser (WebHID and WebUSB are required, and are not available in Firefox or Safari).

### Build

```bash
bun run build
bun run preview
```

## Demo Mode

Visit `/demo` to explore the UI without a physical keyboard connected.

## License

GPL-3.0 — See [LICENSE](./LICENSE) for details.

Based on [hmkconf](https://github.com/peppapighs/hmkconf) by peppapighs.
