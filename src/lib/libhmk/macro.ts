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

// Mirrors the firmware: `MACRO_COUNT`, `MACRO_BUFFER_SIZE`, `MACRO_DELAY_UNIT_MS`
// and the `macro_op_t` encoding in `include/macro.h`.
export const HMK_MACRO_COUNT = 16
export const HMK_MACRO_BUFFER_SIZE = 1024
export const HMK_MACRO_DELAY_UNIT_MS = 10
export const HMK_MACRO_MAX_DELAY_MS = 0xff * HMK_MACRO_DELAY_UNIT_MS

export enum HMK_MacroOp {
  END = 0x00,
  TAP = 0x01,
  DOWN = 0x02,
  UP = 0x03,
  DELAY = 0x04,
}

export type HMK_MacroEvent =
  | { type: "tap" | "down" | "up"; keycode: number }
  | { type: "delay"; delay: number } // milliseconds

export type HMK_Macro = HMK_MacroEvent[]

// Encode all macros into the flat firmware buffer. Each macro is a sequence of
// 2-byte events terminated by a single END (0x00) byte; macros are stored
// back-to-back. Unused trailing space stays zero (empty macros).
export function encodeMacros(macros: HMK_Macro[]): Uint8Array {
  const buffer = new Uint8Array(HMK_MACRO_BUFFER_SIZE)
  let pos = 0

  for (let m = 0; m < HMK_MACRO_COUNT; m++) {
    for (const event of macros[m] ?? []) {
      // Stop if there is no room for another 2-byte event plus a terminator.
      if (pos + 3 > HMK_MACRO_BUFFER_SIZE) break

      if (event.type === "delay") {
        const units = Math.max(
          0,
          Math.min(0xff, Math.round(event.delay / HMK_MACRO_DELAY_UNIT_MS)),
        )
        buffer[pos++] = HMK_MacroOp.DELAY
        buffer[pos++] = units
      } else {
        buffer[pos++] =
          event.type === "tap"
            ? HMK_MacroOp.TAP
            : event.type === "down"
              ? HMK_MacroOp.DOWN
              : HMK_MacroOp.UP
        buffer[pos++] = event.keycode & 0xff
      }
    }
    // Terminate the macro (always fits: the loop above reserves room for it).
    buffer[pos++] = HMK_MacroOp.END
  }

  return buffer
}

// Decode the flat firmware buffer into `HMK_MACRO_COUNT` macros.
export function decodeMacros(buffer: Uint8Array): HMK_Macro[] {
  const macros: HMK_Macro[] = []
  let pos = 0

  for (let m = 0; m < HMK_MACRO_COUNT; m++) {
    const macro: HMK_Macro = []
    while (pos < buffer.length) {
      const op = buffer[pos]
      if (op === HMK_MacroOp.END) {
        pos += 1
        break
      }
      if (pos + 1 >= buffer.length) {
        pos = buffer.length
        break
      }
      const arg = buffer[pos + 1]
      pos += 2
      switch (op) {
        case HMK_MacroOp.TAP:
          macro.push({ type: "tap", keycode: arg })
          break
        case HMK_MacroOp.DOWN:
          macro.push({ type: "down", keycode: arg })
          break
        case HMK_MacroOp.UP:
          macro.push({ type: "up", keycode: arg })
          break
        case HMK_MacroOp.DELAY:
          macro.push({ type: "delay", delay: arg * HMK_MACRO_DELAY_UNIT_MS })
          break
        default:
          break
      }
    }
    macros.push(macro)
  }

  return macros
}

// Number of bytes a macro occupies in the buffer (events + terminator).
export function macroEncodedSize(macro: HMK_Macro): number {
  return macro.length * 2 + 1
}

// Total bytes used by all macros, including each terminator.
export function macrosEncodedSize(macros: HMK_Macro[]): number {
  let total = 0
  for (let m = 0; m < HMK_MACRO_COUNT; m++)
    total += macroEncodedSize(macros[m] ?? [])
  return total
}
