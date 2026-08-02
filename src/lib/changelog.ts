/*
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { getLocale } from "$lib/paraglide/runtime"

// A single firmware release entry. `changes` holds the user-facing change list
// in each supported locale. Keep entries newest-first.
export type FirmwareChangelogEntry = {
  // Firmware version as the 16-bit value returned by COMMAND_FIRMWARE_VERSION
  // (e.g. 0x0107 == v1.7).
  version: number
  date: string
  changes: { en: string[]; ja: string[] }
}

export const firmwareChangelog: FirmwareChangelogEntry[] = [
  {
    version: 0x010c,
    date: "2026-08",
    changes: {
      en: [
        "Grave Escape key (Esc/~): ` and ~ now require Shift only, and Ctrl always sends Escape. GUI+Esc and Ctrl+Shift+Esc work again (lock screen, Force Quit, Task Manager)",
      ],
      ja: [
        "Grave Escape キー（Esc/~）：` / ~ の入力を Shift 押下時のみに変更し、Ctrl 押下中は常に Escape を送るよう修正。GUI+Esc と Ctrl+Shift+Esc が再び動作します（画面ロック、強制終了、タスクマネージャー）",
      ],
    },
  },
  {
    version: 0x010b,
    date: "2026-07",
    changes: {
      en: [
        "Grave Escape key (Esc/~): Escape normally, ` or ~ while Shift or GUI is held",
      ],
      ja: [
        "Grave Escape キー（Esc/~）：通常は Escape、Shift または GUI 押下中は ` / ~ を入力",
      ],
    },
  },
  {
    version: 0x010a,
    date: "2026-06",
    changes: {
      en: ["Macros: play a recorded sequence of keys from a single key"],
      ja: ["マクロ：1キーから記録したキー操作の並びを再生"],
    },
  },
  {
    version: 0x0109,
    date: "2026-06",
    changes: {
      en: [
        "Configurable bottom-out dead zone to prevent input drop-out when bottoming out",
      ],
      ja: [
        "底打ち時の入力抜けを防ぐ、調整可能なボトムアウトデッドゾーンを追加",
      ],
    },
  },
  {
    version: 0x0108,
    date: "2026-06",
    changes: {
      en: [
        "Automatic rest baseline (noise floor) calibration",
        "Thermal drift compensation",
      ],
      ja: [
        "ノイズフロア（rest 基準）の自動キャリブレーションを追加",
        "熱ドリフト補正を追加",
      ],
    },
  },
  {
    version: 0x0107,
    date: "2026-05",
    changes: {
      en: ["Per-key switch profile", "Fix bottom-row key mapping"],
      ja: ["キーごとのスイッチプロファイルを追加", "最下段キー割当を修正"],
    },
  },
]

// A single ReConf application release entry. `version` is the semver string
// from package.json (e.g. "0.0.1"). Keep entries newest-first.
export type AppChangelogEntry = {
  version: string
  date: string
  changes: { en: string[]; ja: string[] }
}

export const appChangelog: AppChangelogEntry[] = [
  {
    version: "1.3.1",
    date: "2026-07",
    changes: {
      en: ["Add Grave Escape (Esc/~) to the remap key list (firmware v1.11+)"],
      ja: [
        "リマップのキー一覧に Grave Escape（Esc/~）を追加（ファーム v1.11 以降）",
      ],
    },
  },
  {
    version: "1.3.0",
    date: "2026-06",
    changes: {
      en: ["Add macro editor (firmware v1.10+)"],
      ja: ["マクロエディタを追加（ファーム v1.10 以降）"],
    },
  },
  {
    version: "1.2.0",
    date: "2026-06",
    changes: {
      en: ["Add bottom-out dead zone control (firmware v1.9+)"],
      ja: ["ボトムアウトデッドゾーンの調整機能を追加（ファーム v1.9 以降）"],
    },
  },
  {
    version: "1.1.1",
    date: "2026-06",
    changes: {
      en: [
        "Fix Web DFU firmware update for AT32 keyboards (DfuSe support)",
        "Keep the update dialog alive when the keyboard reboots into DFU",
      ],
      ja: [
        "Web DFU を AT32 キーボードで書き込めるよう修正（DfuSe 対応）",
        "DFU 再起動時に更新ダイアログが閉じないよう修正",
      ],
    },
  },
  {
    version: "1.1.0",
    date: "2026-06",
    changes: {
      en: ["Firmware version display and update notification"],
      ja: ["ファームウェアバージョン表示・更新通知を追加"],
    },
  },
  {
    version: "1.0.0",
    date: "2026-05",
    changes: {
      en: [
        "Switch profile configuration",
        "Web DFU firmware update",
        "Internationalization (English / Japanese)",
      ],
      ja: [
        "スイッチプロファイル設定",
        "Web DFU によるファームウェア更新",
        "多言語対応（英語 / 日本語）",
      ],
    },
  },
]

// Returns the change list for the given entry in the active locale. Works for
// both firmware and app changelog entries since they share the `changes` shape.
export function changelogChanges(entry: {
  changes: { en: string[]; ja: string[] }
}): string[] {
  return getLocale() === "ja" ? entry.changes.ja : entry.changes.en
}
