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
  import FixedScrollArea from "$lib/components/fixed-scroll-area.svelte"
  import { switchTypeMetadata } from "$lib/libhmk/switch-types"
  import { m } from "$lib/paraglide/messages.js"
  import { cn, setToIntervals } from "$lib/utils"
  import { switchProfileStateContext } from "../context.svelte"
  import { switchMapQueryContext } from "../queries/switch-map-query.svelte"

  const { keys } = $derived(switchProfileStateContext.get())

  const switchMapQuery = switchMapQueryContext.get()
  const { current: switchMap } = $derived(switchMapQuery.switchMap)

  const { disabled, currentType } = $derived.by(() => {
    if (keys.size === 0 || !switchMap) {
      return { disabled: true } as const
    }

    const [firstKey] = keys
    return {
      disabled: false,
      currentType: switchMap[firstKey],
    } as const
  })

  const updateSwitchType = (type: number) =>
    !disabled &&
    setToIntervals(keys).map(([offset, len]) =>
      switchMapQuery.set({
        offset,
        data: Array(len).fill(type),
      }),
    )
</script>

<FixedScrollArea class="flex flex-col gap-4 p-4">
  <div class="grid text-sm text-wrap">
    <span class="font-medium">{m.switch_profile_title()}</span>
    <span class="text-muted-foreground">
      {m.switch_profile_description()}
    </span>
  </div>
  <div class="grid grid-cols-2 gap-2">
    {#each switchTypeMetadata as { type, name, stroke, description, footprint, colorTop, colorBottom } (type)}
      <button
        class={cn(
          "flex flex-col items-start gap-1 rounded-lg border border-input bg-background p-3 text-left text-sm transition-colors hover:bg-accent",
          "disabled:pointer-events-none disabled:opacity-50",
          currentType === type &&
            "bg-[color-mix(in_oklab,var(--switch-color)_10%,transparent)] ring-2 ring-ring",
        )}
        {disabled}
        onclick={() => updateSwitchType(type)}
        style="--switch-color: {colorTop}"
      >
        <span class="flex items-center gap-2 font-medium">
          <span
            class="inline-block size-3 rounded-full"
            style="background: linear-gradient(to bottom, {colorTop} 50%, {colorBottom} 50%)"
          ></span>
          {name()}
        </span>
        {#if stroke !== "—"}
          <span class="text-xs text-muted-foreground">
            {stroke} · {footprint}
          </span>
        {/if}
        <span class="text-xs leading-snug text-muted-foreground">
          {description()}
        </span>
      </button>
    {/each}
  </div>
</FixedScrollArea>
