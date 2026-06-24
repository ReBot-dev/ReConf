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

import { DataViewReader } from "$lib/data-view-reader"
import type { Commander } from "$lib/keyboard/commander"
import { HMK_MACRO_BUFFER_SIZE } from "../macro"
import { HMK_Command } from "."

const GET_MACRO_MAX_ENTRIES = 63

export async function getMacroBuffer(
  commander: Commander,
): Promise<Uint8Array> {
  const buffer = new Uint8Array(HMK_MACRO_BUFFER_SIZE)

  for (let i = 0; i < HMK_MACRO_BUFFER_SIZE; i += GET_MACRO_MAX_ENTRIES) {
    const reader = new DataViewReader(
      await commander.sendCommand({
        command: HMK_Command.GET_MACRO,
        // 16-bit little-endian offset
        payload: [i & 0xff, (i >> 8) & 0xff],
      }),
    )

    for (
      let j = 0;
      j < GET_MACRO_MAX_ENTRIES && i + j < HMK_MACRO_BUFFER_SIZE;
      j++
    ) {
      buffer[i + j] = reader.uint8()
    }
  }

  return buffer
}

const SET_MACRO_MAX_ENTRIES = 60

export async function setMacroBuffer(
  commander: Commander,
  buffer: Uint8Array,
): Promise<void> {
  for (let i = 0; i < buffer.length; i += SET_MACRO_MAX_ENTRIES) {
    const part = buffer.slice(i, i + SET_MACRO_MAX_ENTRIES)
    await commander.sendCommand({
      command: HMK_Command.SET_MACRO,
      // 16-bit little-endian offset, length, then the chunk
      payload: [i & 0xff, (i >> 8) & 0xff, part.length, ...part],
    })
  }
}
