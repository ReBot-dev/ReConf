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

import {
  CpuIcon,
  CrosshairIcon,
  Gamepad2Icon,
  GaugeIcon,
  Grid2X2Icon,
  PencilIcon,
  SettingsIcon,
  SquareChevronUpIcon,
  ZapIcon,
} from "@lucide/svelte"
import { m } from "$lib/paraglide/messages.js"
import type { Component } from "svelte"
import type { ConfiguratorTabs } from "../context.svelte"

export const MIN_WINDOW_WIDTH = 1024
export const MIN_WINDOW_HEIGHT = 768

export type SidebarTabGroup = {
  group: () => string
  tabs: {
    label: () => string
    value: ConfiguratorTabs
    icon: Component
  }[]
}

export function getSidebarTabGroups(): SidebarTabGroup[] {
  return [
    {
      group: () => m.sidebar_profiles(),
      tabs: [
        {
          label: () => m.sidebar_profiles(),
          value: "profiles",
          icon: Grid2X2Icon,
        },
      ],
    },
    {
      group: () => m.sidebar_keyboard_configuration(),
      tabs: [
        { label: () => m.sidebar_remap(), value: "remap", icon: PencilIcon },
        {
          label: () => m.sidebar_actuation_point(),
          value: "actuation-point",
          icon: GaugeIcon,
        },
        {
          label: () => m.sidebar_rapid_trigger(),
          value: "rapid-trigger",
          icon: ZapIcon,
        },
        {
          label: () => m.sidebar_advanced_keys(),
          value: "advanced-keys",
          icon: SquareChevronUpIcon,
        },
        {
          label: () => m.sidebar_gamepad(),
          value: "gamepad",
          icon: Gamepad2Icon,
        },
        {
          label: () => m.sidebar_switch_profile(),
          value: "switch-profile",
          icon: CpuIcon,
        },
        {
          label: () => m.sidebar_calibration(),
          value: "calibration",
          icon: CrosshairIcon,
        },
      ],
    },
    {
      group: () => m.sidebar_settings(),
      tabs: [
        {
          label: () => m.sidebar_settings(),
          value: "settings",
          icon: SettingsIcon,
        },
      ],
    },
  ]
}
