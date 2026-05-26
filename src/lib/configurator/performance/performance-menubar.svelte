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
  import * as KeyboardEditor from "$lib/components/keyboard-editor"
  import { Button } from "$lib/components/ui/button"
  import { Toggle } from "$lib/components/ui/toggle"
  import * as ToggleGroup from "$lib/components/ui/toggle-group"
  import {
    distanceDisplayContext,
    type DistanceDisplayMode,
  } from "$lib/distance-display.svelte"
  import { defaultActuation } from "$lib/libhmk/actuation"
  import { m } from "$lib/paraglide/messages.js"
  import { setToIntervals } from "$lib/utils"
  import {
    displayLayoutContext,
    performanceStateContext,
  } from "../context.svelte"
  import { actuationQueryContext } from "../queries/actuation-query.svelte"

  const performanceState = performanceStateContext.get()
  const { keys } = $derived(performanceState)
  const allKeys = $derived(
    displayLayoutContext.get().displayKeys.map(({ key }) => key),
  )

  const actuationQuery = actuationQueryContext.get()
  const distanceDisplay = distanceDisplayContext.get()
</script>

<KeyboardEditor.Menubar>
  <div class="flex items-center gap-2">
    <Button
      disabled={allKeys.every((key) => keys.has(key))}
      onclick={() => allKeys.forEach((key) => keys.add(key))}
      size="sm"
      variant="outline">{m.performance_select_all()}</Button
    >
    <Button
      disabled={keys.size === 0}
      onclick={() => performanceState.keys.clear()}
      size="sm"
      variant="outline"
    >
      {m.performance_deselect_all()}
    </Button>
    <Toggle
      bind:pressed={performanceState.showKeymap}
      size="sm"
      variant="outline"
    >
      {m.performance_show_keymap()}
    </Toggle>
    <ToggleGroup.Root
      bind:value={
        () => distanceDisplay.mode,
        (v) => {
          if (v) distanceDisplay.setMode(v as DistanceDisplayMode)
        }
      }
      size="sm"
      type="single"
      variant="outline"
    >
      <ToggleGroup.Item value="mm">mm</ToggleGroup.Item>
      <ToggleGroup.Item value="pct">%</ToggleGroup.Item>
      <ToggleGroup.Item value="raw">raw</ToggleGroup.Item>
    </ToggleGroup.Root>
  </div>
  <div class="flex items-center gap-2">
    <Button
      disabled={keys.size === 0}
      onclick={() => {
        setToIntervals(keys).map(([offset, len]) =>
          actuationQuery.set({
            offset,
            data: [...Array(len)].map(() => ({ ...defaultActuation })),
          }),
        )
        performanceState.keys.clear()
      }}
      size="sm"
      variant="destructive"
    >
      {m.performance_reset_selected()}
    </Button>
    <KeyboardEditor.LayoutDialog />
  </div>
</KeyboardEditor.Menubar>
