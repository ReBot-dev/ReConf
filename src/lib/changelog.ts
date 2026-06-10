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
