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
  import { distanceDisplayContext } from "$lib/distance-display.svelte"
  import { HMK_MAX_DISTANCE } from "$lib/libhmk"
  import type { ComponentProps } from "svelte"
  import CommitSlider from "./commit-slider.svelte"

  let {
    committed = $bindable(),
    min = 1,
    max = HMK_MAX_DISTANCE,
    strokeMm,
    onCommit,
    ...props
  }: ComponentProps<typeof CommitSlider> & { strokeMm?: number } = $props()

  const distanceDisplay = distanceDisplayContext.get()
</script>

<CommitSlider
  bind:committed
  display={(v) => distanceDisplay.format(v, strokeMm)}
  {min}
  {max}
  {onCommit}
  {...props}
/>
