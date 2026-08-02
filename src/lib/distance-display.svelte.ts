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

import { HMK_MAX_DISTANCE } from "$lib/libhmk"
import { HMK_SwitchType, switchTypeMetadata } from "$lib/libhmk/switch-types"
import { Context } from "runed"

export type DistanceDisplayMode = "mm" | "pct" | "raw"

const STORAGE_KEY = "hmk-distance-display-mode"
const DEFAULT_STROKE_MM = 4.0

export class DistanceDisplay {
  mode: DistanceDisplayMode = $state("mm")

  constructor() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === "mm" || stored === "pct" || stored === "raw") {
        this.mode = stored
      }
    } catch {
      // localStorage can be unavailable (private mode, blocked storage)
    }
  }

  setMode(mode: DistanceDisplayMode) {
    this.mode = mode
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // Persisting the preference is best-effort
    }
  }

  format(v: number, strokeMm?: number): string {
    return formatDistance(v, this.mode, strokeMm)
  }

  formatCompact(v: number, strokeMm?: number): string {
    return formatDistanceCompact(v, this.mode, strokeMm)
  }
}

export const distanceDisplayContext = new Context<DistanceDisplay>(
  "hmk-distance-display",
)

export function getSwitchStrokeMm(type: HMK_SwitchType): number {
  if (type === HMK_SwitchType.AUTO) return DEFAULT_STROKE_MM
  const meta = switchTypeMetadata.find((m) => m.type === type)
  if (!meta || meta.stroke === "—") return DEFAULT_STROKE_MM
  return parseFloat(meta.stroke)
}

export function getKeyStrokeMm(
  key: number,
  switchMap: number[] | undefined,
): number {
  if (!switchMap) return DEFAULT_STROKE_MM
  return getSwitchStrokeMm(switchMap[key] as HMK_SwitchType)
}

export function formatDistance(
  v: number,
  mode: DistanceDisplayMode,
  strokeMm: number = DEFAULT_STROKE_MM,
): string {
  switch (mode) {
    case "mm":
      return `${((strokeMm * v) / HMK_MAX_DISTANCE).toFixed(2)}mm`
    case "pct":
      return `${((v / HMK_MAX_DISTANCE) * 100).toFixed(1)}%`
    case "raw":
      return `${v}`
  }
}

export function formatDistanceCompact(
  v: number,
  mode: DistanceDisplayMode,
  strokeMm: number = DEFAULT_STROKE_MM,
): string {
  switch (mode) {
    case "mm":
      return ((strokeMm * v) / HMK_MAX_DISTANCE).toFixed(2)
    case "pct":
      return `${((v / HMK_MAX_DISTANCE) * 100).toFixed(0)}%`
    case "raw":
      return `${v}`
  }
}
