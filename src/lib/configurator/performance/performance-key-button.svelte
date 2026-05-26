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
  import { distanceDisplayContext } from "$lib/distance-display.svelte"
  import type { HMK_Actuation } from "$lib/libhmk/actuation"
  import type { WithoutChildrenOrChild } from "$lib/utils"
  import type { ComponentProps } from "svelte"

  const {
    actuation,
    strokeMm,
    ...props
  }: WithoutChildrenOrChild<ComponentProps<typeof KeyButton>> & {
    actuation: HMK_Actuation
    strokeMm?: number
  } = $props()

  const distanceDisplay = distanceDisplayContext.get()
  const { actuationPoint, rtDown, rtUp, continuous } = $derived(actuation)
  const continuousLabel = $derived(continuous ? "C" : "")
</script>

<KeyButton size="sm" {...props}>
  <span
    >{distanceDisplay.formatCompact(
      actuationPoint,
      strokeMm,
    )}{continuousLabel}</span
  >
  {#if rtDown > 0}
    <span
      >{distanceDisplay.formatCompact(rtDown, strokeMm)}{continuousLabel}</span
    >
  {/if}
  {#if rtUp > 0}
    <span>{distanceDisplay.formatCompact(rtUp, strokeMm)}{continuousLabel}</span
    >
  {/if}
</KeyButton>
