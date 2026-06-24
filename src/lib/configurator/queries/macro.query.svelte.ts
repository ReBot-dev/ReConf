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

import { keyboardContext, type SetMacrosParams } from "$lib/keyboard"
import type { HMK_Macro } from "$lib/libhmk/macro"
import { Context, resource, type ResourceReturn } from "runed"
import { optimisticUpdate } from "."

export class MacroQuery {
  macros: ResourceReturn<HMK_Macro[]>

  #keyboard = keyboardContext.get()

  constructor() {
    this.macros = resource(
      () => ({}),
      () => this.#keyboard.getMacros(),
    )
  }

  async set(params: SetMacrosParams) {
    const { data } = params
    await optimisticUpdate({
      resource: this.macros,
      optimisticFn: () => data,
      updateFn: () => this.#keyboard.setMacros(params),
    })
  }
}

export const macroQueryContext = new Context<MacroQuery>("hmk-macro-query")
