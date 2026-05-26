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
  baseLocale,
  locales,
  overwriteGetLocale,
  overwriteSetLocale,
} from "$lib/paraglide/runtime.js"

type Locale = (typeof locales)[number]

function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return baseLocale
  const stored = localStorage.getItem("PARAGLIDE_LOCALE")
  if (stored && isLocale(stored)) return stored
  const browserLang = navigator.language.split("-")[0]
  if (browserLang && isLocale(browserLang)) return browserLang
  return baseLocale
}

class I18nState {
  locale: Locale = $state(detectInitialLocale())

  setLocale(newLocale: Locale) {
    this.locale = newLocale
    localStorage.setItem("PARAGLIDE_LOCALE", newLocale)
  }
}

export const i18n = new I18nState()

overwriteGetLocale(() => i18n.locale)
overwriteSetLocale((newLocale) => {
  if (isLocale(newLocale)) i18n.setLocale(newLocale)
})
