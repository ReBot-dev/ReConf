<!--
This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
details.

You should have received a copy of the GNU General Public License along with
this program. If not, see <https://www.gnu.org/licenses/>.
-->

<script lang="ts">
  import { LanguagesIcon } from "@lucide/svelte"
  import { i18n } from "$lib/i18n.svelte"
  import { buttonVariants } from "./ui/button"
  import * as DropdownMenu from "./ui/dropdown-menu"

  const localeLabels: Record<string, string> = {
    en: "English",
    ja: "日本語",
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger
    class={buttonVariants({ variant: "outline", size: "icon" })}
  >
    <LanguagesIcon class="h-[1.2rem] w-[1.2rem]" />
    <span class="sr-only">Language</span>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end">
    {#each Object.entries(localeLabels) as [locale, label] (locale)}
      <DropdownMenu.Item
        onclick={() => i18n.setLocale(locale as "en" | "ja")}
        class={i18n.locale === locale ? "font-bold" : ""}
      >
        {label}
      </DropdownMenu.Item>
    {/each}
  </DropdownMenu.Content>
</DropdownMenu.Root>
