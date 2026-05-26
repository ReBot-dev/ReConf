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
  import { HMK_SwitchType } from "$lib/libhmk/switch-types"
  import { m } from "$lib/paraglide/messages.js"
  import { setToIntervals } from "$lib/utils"
  import {
    displayLayoutContext,
    switchProfileStateContext,
  } from "../context.svelte"
  import { switchMapQueryContext } from "../queries/switch-map-query.svelte"

  const switchProfileState = switchProfileStateContext.get()
  const { keys } = $derived(switchProfileState)
  const allKeys = $derived(
    displayLayoutContext.get().displayKeys.map(({ key }) => key),
  )

  const switchMapQuery = switchMapQueryContext.get()
</script>

<KeyboardEditor.Menubar>
  <div class="flex items-center gap-2">
    <Button
      disabled={allKeys.every((key) => keys.has(key))}
      onclick={() => allKeys.forEach((key) => keys.add(key))}
      size="sm"
      variant="outline">{m.switch_profile_select_all()}</Button
    >
    <Button
      disabled={keys.size === 0}
      onclick={() => switchProfileState.keys.clear()}
      size="sm"
      variant="outline"
    >
      {m.switch_profile_deselect_all()}
    </Button>
  </div>
  <div class="flex items-center gap-2">
    <Button
      disabled={keys.size === 0}
      onclick={() => {
        setToIntervals(keys).map(([offset, len]) =>
          switchMapQuery.set({
            offset,
            data: Array(len).fill(HMK_SwitchType.AUTO),
          }),
        )
        switchProfileState.keys.clear()
      }}
      size="sm"
      variant="destructive"
    >
      {m.switch_profile_reset_selected()}
    </Button>
    <KeyboardEditor.LayoutDialog />
  </div>
</KeyboardEditor.Menubar>
