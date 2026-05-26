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
  import { KeyButton } from "$lib/components/key-button"
  import { getSwitchTypeMetadata } from "$lib/libhmk/switch-types"
  import type { WithoutChildrenOrChild } from "$lib/utils"
  import type { ComponentProps } from "svelte"

  const {
    switchType,
    ...props
  }: WithoutChildrenOrChild<ComponentProps<typeof KeyButton>> & {
    switchType: number
  } = $props()

  const metadata = $derived(getSwitchTypeMetadata(switchType))
</script>

<KeyButton
  size="sm"
  style="--switch-color: {metadata.colorTop}"
  class={switchType > 0
    ? "border-[var(--switch-color)] bg-[color-mix(in_oklab,var(--switch-color)_15%,transparent)]"
    : ""}
  {...props}
>
  <span>{metadata.name()}</span>
  {#if metadata.stroke !== "—"}
    <span class="text-muted-foreground">{metadata.stroke}</span>
  {/if}
</KeyButton>
