# ReConf — Web Configurator for ReLow Series Keyboards

ReConf は、[ReLow](https://rebotlab.net/products/relow60) シリーズ（磁気ホール効果キーボード）用の Web ベースのコンフィギュレータです。[hmkconf](https://github.com/peppapighs/hmkconf)（GPL-3.0）をベースにしています。

ReConf is a web-based configurator for [ReLow](https://rebotlab.net/products/relow60) series magnetic hall-effect keyboards. Built on top of [hmkconf](https://github.com/peppapighs/hmkconf) (GPL-3.0).

**公開アプリ / Live app: [reconf.rebotlab.net](https://reconf.rebotlab.net/)** — インストール不要 / no installation required.

## 機能 / Features

- **リマップ / Remap** — レイヤーごとにキーを再割り当て（全キーコード対応） / Reassign keys per layer with full keycode support
- **アクチュエーションポイント / Actuation Point** — キーごとの作動点を mm・%・生値で設定 / Set per-key actuation points, displayed in mm, % or raw values
- **ラピッドトリガー / Rapid Trigger** — キーごとの感度を設定 / Configure per-key rapid trigger sensitivity
- **高度なキー / Advanced Keys** — SOCD ヌルバインド・DKS・タップホールド・トグル / SOCD null-bind, Dynamic Keystroke (DKS), Tap-Hold, Toggle
- **マクロ / Macros** — キーイベント列を記録して1キーで再生 / Record a sequence of key events and replay it from a single key
- **ゲームパッド / Gamepad** — XInput エミュレーションとアナログカーブエディタ / XInput gamepad emulation with analog curve editor
- **スイッチプロファイル / Switch Profile** — キーごとのスイッチ種別割り当て（スイッチ混載ビルド向け） / Per-key switch type assignment for mixed-switch builds
- **キャリブレーション / Calibration** — キーごとの底打ちしきい値の校正 / Per-key bottom-out threshold calibration
- **ファームウェア更新 / Firmware Update** — ブラウザから Web DFU で書き込み（DfuSe / AT32） / Flash firmware from the browser over Web DFU (DfuSe / AT32)
- **i18n** — 日本語 / 英語 — Japanese / English

アプリ内のチェンジログには、コンフィギュレータとファームウェア両方のリリースを記載しています。

The in-app changelog lists both configurator and firmware releases.

## 技術スタック / Tech Stack

- [SvelteKit](https://kit.svelte.dev/) + [Svelte 5](https://svelte.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Paraglide JS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs)（i18n）
- [WebHID API](https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API) — デバイス通信 / device communication
- [WebUSB API](https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API) — Web DFU によるファームウェア更新 / firmware updates over Web DFU
- [Vercel](https://vercel.com/) にデプロイ / Deployed on Vercel

## はじめる / Getting Started

### 必要環境 / Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [Bun](https://bun.sh/) または / or npm

### 開発 / Development

```bash
bun install
bun dev
```

Chromium 系ブラウザで [http://localhost:5173](http://localhost:5173) を開いてください（WebHID / WebUSB が必要なため、Firefox / Safari では動作しません）。

Open [http://localhost:5173](http://localhost:5173) in a Chromium-based browser (WebHID and WebUSB are required, and are not available in Firefox or Safari).

### ビルド / Build

```bash
bun run build
bun run preview
```

## デモモード / Demo Mode

実機のキーボードを接続せずに UI を試すには `/demo` にアクセスしてください。

Visit `/demo` to explore the UI without a physical keyboard connected.

## ライセンス / License

GPL-3.0 — 詳細は [LICENSE](./LICENSE) を参照 / See [LICENSE](./LICENSE) for details.

peppapighs 氏の [hmkconf](https://github.com/peppapighs/hmkconf) をベースにしています。

Based on [hmkconf](https://github.com/peppapighs/hmkconf) by peppapighs.
