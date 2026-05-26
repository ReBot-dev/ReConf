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

import { keyboardContext, type SetSwitchMapParams } from "$lib/keyboard"
import { Context, resource, type ResourceReturn } from "runed"
import { optimisticUpdate } from "."

export class SwitchMapQuery {
  switchMap: ResourceReturn<number[]>

  #keyboard = keyboardContext.get()

  constructor() {
    this.switchMap = resource(
      () => ({}),
      () => this.#keyboard.getSwitchMap(),
    )
  }

  async set(params: SetSwitchMapParams) {
    const { offset, data } = params
    await optimisticUpdate({
      resource: this.switchMap,
      optimisticFn: (current) => {
        const ret = [...current]
        for (let i = 0; i < data.length; i++) {
          ret[offset + i] = data[i]
        }
        return ret
      },
      updateFn: () => this.#keyboard.setSwitchMap(params),
    })
  }
}

export const switchMapQueryContext = new Context<SwitchMapQuery>(
  "hmk-switch-map-query",
)
