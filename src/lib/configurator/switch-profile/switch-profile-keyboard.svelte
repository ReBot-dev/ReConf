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
  import AreaSelect from "$lib/components/area-select.svelte"
  import { KeyboardEditorKeyboard } from "$lib/components/keyboard-editor"
  import * as KeycodeButton from "$lib/components/keycode-button"
  import { ToggleGroup } from "bits-ui"
  import { switchProfileStateContext } from "../context.svelte"
  import { switchMapQueryContext } from "../queries/switch-map-query.svelte"
  import SwitchProfileKeyButton from "./switch-profile-key-button.svelte"

  const switchProfileState = switchProfileStateContext.get()
  const { keys } = $derived(switchProfileState)

  const { current: switchMap } = $derived(switchMapQueryContext.get().switchMap)

  let isDragging = $state(false)
</script>

<svelte:document onmouseup={() => (isDragging = false)} />

<ToggleGroup.Root
  bind:value={() => [...keys].map(String), () => {}}
  type="multiple"
>
  {#snippet child({ props })}
    <AreaSelect
      bind:selections={
        () => switchProfileState.keys, (v) => (switchProfileState.keys = v)
      }
      class="flex flex-1 flex-col"
      {...props}
    >
      <KeyboardEditorKeyboard {...props}>
        {#snippet keyGenerator(key)}
          {#if !switchMap}
            <KeycodeButton.Skeleton />
          {:else}
            <ToggleGroup.Item
              data-selectable
              data-selectable-index={key}
              onmousedown={(e) => {
                e.stopPropagation()
                isDragging = true
                if (keys.has(key)) switchProfileState.keys.delete(key)
                else switchProfileState.keys.add(key)
              }}
              onmouseenter={(e) => {
                e.stopPropagation()
                if (isDragging) switchProfileState.keys.add(key)
              }}
              value={String(key)}
            >
              {#snippet child({ props })}
                <SwitchProfileKeyButton
                  switchType={switchMap[key]}
                  {...props}
                />
              {/snippet}
            </ToggleGroup.Item>
          {/if}
        {/snippet}
      </KeyboardEditorKeyboard>
    </AreaSelect>
  {/snippet}
</ToggleGroup.Root>
