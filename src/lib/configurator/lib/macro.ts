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

import { Keycode } from "$lib/libhmk/keycodes"
import type { HMK_MacroEvent } from "$lib/libhmk/macro"

type CharKey = { keycode: number; shift?: boolean }

// US-ASCII → keycode (+shift) map for the "insert text" helper. Characters not
// in the map are skipped. Note that produced taps follow the US layout.
const charMap: Record<string, CharKey> = (() => {
  const map: Record<string, CharKey> = {}

  // Letters
  for (let i = 0; i < 26; i++) {
    const keycode = Keycode.KC_A + i
    map[String.fromCharCode(97 + i)] = { keycode }
    map[String.fromCharCode(65 + i)] = { keycode, shift: true }
  }

  // Digits (1-9, 0) and their shifted symbols
  const digits = "1234567890"
  const shiftedDigits = "!@#$%^&*()"
  for (let i = 0; i < 10; i++) {
    map[digits[i]] = { keycode: Keycode.KC_1 + i }
    map[shiftedDigits[i]] = { keycode: Keycode.KC_1 + i, shift: true }
  }

  // Whitespace
  map[" "] = { keycode: Keycode.KC_SPACE }
  map["\n"] = { keycode: Keycode.KC_ENTER }
  map["\t"] = { keycode: Keycode.KC_TAB }

  // Punctuation (US layout)
  const unshifted: [string, number][] = [
    ["-", Keycode.KC_MINUS],
    ["=", Keycode.KC_EQUAL],
    ["[", Keycode.KC_LEFT_BRACKET],
    ["]", Keycode.KC_RIGHT_BRACKET],
    ["\\", Keycode.KC_BACKSLASH],
    [";", Keycode.KC_SEMICOLON],
    ["'", Keycode.KC_QUOTE],
    ["`", Keycode.KC_GRAVE],
    [",", Keycode.KC_COMMA],
    [".", Keycode.KC_DOT],
    ["/", Keycode.KC_SLASH],
  ]
  for (const [ch, keycode] of unshifted) map[ch] = { keycode }

  const shifted: [string, number][] = [
    ["_", Keycode.KC_MINUS],
    ["+", Keycode.KC_EQUAL],
    ["{", Keycode.KC_LEFT_BRACKET],
    ["}", Keycode.KC_RIGHT_BRACKET],
    ["|", Keycode.KC_BACKSLASH],
    [":", Keycode.KC_SEMICOLON],
    ['"', Keycode.KC_QUOTE],
    ["~", Keycode.KC_GRAVE],
    ["<", Keycode.KC_COMMA],
    [">", Keycode.KC_DOT],
    ["?", Keycode.KC_SLASH],
  ]
  for (const [ch, keycode] of shifted) map[ch] = { keycode, shift: true }

  return map
})()

// Convert a string into a sequence of macro events (tapping each character,
// wrapping shifted characters with Left Shift). Unsupported characters are
// skipped.
export function textToMacroEvents(text: string): HMK_MacroEvent[] {
  const events: HMK_MacroEvent[] = []
  for (const ch of text) {
    const entry = charMap[ch]
    if (!entry) continue
    if (entry.shift) {
      events.push({ type: "down", keycode: Keycode.KC_LEFT_SHIFT })
      events.push({ type: "tap", keycode: entry.keycode })
      events.push({ type: "up", keycode: Keycode.KC_LEFT_SHIFT })
    } else {
      events.push({ type: "tap", keycode: entry.keycode })
    }
  }
  return events
}
