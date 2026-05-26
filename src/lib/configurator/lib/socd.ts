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

import { HMK_NullBindBehavior } from "$lib/libhmk/advanced-keys"
import { m } from "$lib/paraglide/messages.js"

export type SOCDBehaviorMetadata = {
  behavior: HMK_NullBindBehavior
  title: () => string
  description: () => string
}

export const socdBehaviorMetadata: SOCDBehaviorMetadata[] = [
  {
    behavior: HMK_NullBindBehavior.LAST,
    title: () => m.socd_last_input_wins(),
    description: () => m.socd_last_input_wins_description(),
  },
  {
    behavior: HMK_NullBindBehavior.NEUTRAL,
    title: () => m.socd_neutral(),
    description: () => m.socd_neutral_description(),
  },
  {
    behavior: HMK_NullBindBehavior.PRIMARY,
    title: () => m.socd_key1_priority(),
    description: () => m.socd_key1_priority_description(),
  },
  {
    behavior: HMK_NullBindBehavior.SECONDARY,
    title: () => m.socd_key2_priority(),
    description: () => m.socd_key2_priority_description(),
  },
  {
    behavior: HMK_NullBindBehavior.DISTANCE,
    title: () => m.socd_distance_priority(),
    description: () => m.socd_distance_priority_description(),
  },
]

export function getSOCDBehaviorMetadata(
  behavior: HMK_NullBindBehavior,
): SOCDBehaviorMetadata {
  const metadata = socdBehaviorMetadata.find((md) => md.behavior === behavior)
  return (
    metadata ?? {
      behavior,
      title: () => m.ak_unknown({ type: "" }),
      description: () => m.ak_unknown_description(),
    }
  )
}
