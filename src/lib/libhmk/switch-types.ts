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

import { m } from "$lib/paraglide/messages.js"

export enum HMK_SwitchType {
  AUTO = 0,
  RED_GHOST = 1,
  GREEN_GHOST = 2,
  STAR = 3,
  AMETHYST = 4,
  PURPLE_WHITE = 5,
  JADE = 6,
}

export type SwitchTypeMetadata = {
  type: HMK_SwitchType
  name: () => string
  stroke: string
  description: () => string
  footprint: string
  colorTop: string
  colorBottom: string
}

export const switchTypeMetadata: SwitchTypeMetadata[] = [
  {
    type: HMK_SwitchType.AUTO,
    name: () => m.switch_type_auto(),
    stroke: "—",
    description: () => m.switch_type_auto_description(),
    footprint: "—",
    colorTop: "var(--muted-foreground)",
    colorBottom: "var(--muted-foreground)",
  },
  {
    type: HMK_SwitchType.RED_GHOST,
    name: () => "Red Ghost",
    stroke: "1.5mm",
    description: () => m.switch_type_red_ghost_description(),
    footprint: "ChocV2",
    colorTop: "#ef4444",
    colorBottom: "#000000",
  },
  {
    type: HMK_SwitchType.GREEN_GHOST,
    name: () => "Green Ghost",
    stroke: "2.0mm",
    description: () => m.switch_type_green_ghost_description(),
    footprint: "ChocV2",
    colorTop: "#22c55e",
    colorBottom: "#000000",
  },
  {
    type: HMK_SwitchType.STAR,
    name: () => "Star",
    stroke: "2.8mm",
    description: () => m.switch_type_star_description(),
    footprint: "Arcade",
    colorTop: "#ffffff",
    colorBottom: "#3b82f6",
  },
  {
    type: HMK_SwitchType.AMETHYST,
    name: () => "Amethyst",
    stroke: "3.0mm",
    description: () => m.switch_type_amethyst_description(),
    footprint: "ChocV2",
    colorTop: "#ef4444",
    colorBottom: "#a855f7",
  },
  {
    type: HMK_SwitchType.PURPLE_WHITE,
    name: () => "PurpleWhite",
    stroke: "3.0mm",
    description: () => m.switch_type_purple_white_description(),
    footprint: "Arcade",
    colorTop: "#ffffff",
    colorBottom: "#a855f7",
  },
  {
    type: HMK_SwitchType.JADE,
    name: () => "Jade",
    stroke: "3.5mm",
    description: () => m.switch_type_jade_description(),
    footprint: "Arcade",
    colorTop: "#ffffff",
    colorBottom: "#14b8a6",
  },
]

export function getSwitchTypeMetadata(
  type: HMK_SwitchType,
): SwitchTypeMetadata {
  return (
    switchTypeMetadata.find((m) => m.type === type) ?? switchTypeMetadata[0]
  )
}
