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
  import DistanceSlider from "$lib/components/distance-slider.svelte"
  import Switch from "$lib/components/switch.svelte"
  import { actuationQueryContext } from "$lib/configurator/queries/actuation-query.svelte"
  import { switchMapQueryContext } from "$lib/configurator/queries/switch-map-query.svelte"
  import { getKeyStrokeMm } from "$lib/distance-display.svelte"
  import { HMK_MAX_DISTANCE } from "$lib/libhmk"
  import {
    DEFAULT_ACTUATION_POINT,
    DEFAULT_RT_SENSITIVITY,
    type HMK_Actuation,
  } from "$lib/libhmk/actuation"
  import type { HMK_AKNullBind } from "$lib/libhmk/advanced-keys"
  import { m } from "$lib/paraglide/messages.js"
  import { cn, optMap, setToIntervals, type WithoutChildren } from "$lib/utils"
  import type { HTMLAttributes } from "svelte/elements"
  import { configMenuStateContext } from "../context.svelte"

  const {
    class: className,
    ...props
  }: WithoutChildren<HTMLAttributes<HTMLDivElement>> = $props()

  const configMenuState = configMenuStateContext.get()
  const { key } = $derived(configMenuState.advancedKey)
  const action = $derived(configMenuState.advancedKey.action as HMK_AKNullBind)

  const actuationQuery = actuationQueryContext.get()
  const { current: actuationMap } = $derived(actuationQuery.actuationMap)
  const { current: switchMap } = $derived(switchMapQueryContext.get().switchMap)

  const { disabled, currentActuation, rtEnabled } = $derived.by(() => {
    if (!actuationMap) {
      return { disabled: true } as const
    }

    const currentActuation = actuationMap[key]
    return {
      disabled: false,
      currentActuation,
      rtEnabled: currentActuation.rtDown > 0,
    }
  })

  const strokeMm = $derived(getKeyStrokeMm(key, switchMap))

  const updateActuation = (f: (actuation: HMK_Actuation) => HMK_Actuation) =>
    !disabled &&
    setToIntervals(new Set([key, action.secondaryKey])).map(([offset, len]) =>
      actuationQuery.set({
        offset,
        data: Array(len).fill(f(currentActuation)),
      }),
    )
</script>

<div class={cn("flex flex-col gap-4", className)} {...props}>
  <Switch
    bind:checked={
      () => rtEnabled ?? false,
      (v) =>
        updateActuation((actuation) => ({
          ...actuation,
          rtDown: v ? DEFAULT_RT_SENSITIVITY : 0,
          rtUp: 0,
          continuous: false,
        }))
    }
    {disabled}
    description={m.socd_perf_enable_rt_description()}
    id="rapid-trigger"
    title={m.socd_perf_enable_rt()}
  />
  <DistanceSlider
    bind:committed={
      () => currentActuation?.actuationPoint ?? DEFAULT_ACTUATION_POINT,
      (v) =>
        updateActuation((actuation) => ({
          ...actuation,
          actuationPoint: v,
        }))
    }
    description={m.socd_perf_ap_description()}
    {disabled}
    max={action.bottomOutPoint > 0 ? action.bottomOutPoint : HMK_MAX_DISTANCE}
    {strokeMm}
    title={m.socd_perf_ap()}
  />
  {#if action.bottomOutPoint > 0}
    <DistanceSlider
      bind:committed={
        () => action.bottomOutPoint,
        (v) => configMenuState.updateAction({ ...action, bottomOutPoint: v })
      }
      description={m.socd_perf_bop_description()}
      {disabled}
      min={currentActuation?.actuationPoint}
      {strokeMm}
      title={m.socd_perf_bop()}
    />
  {/if}
</div>
