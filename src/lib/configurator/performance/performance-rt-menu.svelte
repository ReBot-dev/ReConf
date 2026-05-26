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
  import FixedScrollArea from "$lib/components/fixed-scroll-area.svelte"
  import Switch from "$lib/components/switch.svelte"
  import { getKeyStrokeMm } from "$lib/distance-display.svelte"
  import {
    DEFAULT_RT_SENSITIVITY,
    type HMK_Actuation,
  } from "$lib/libhmk/actuation"
  import { m } from "$lib/paraglide/messages.js"
  import { setToIntervals } from "$lib/utils"
  import { performanceStateContext } from "../context.svelte"
  import { actuationQueryContext } from "../queries/actuation-query.svelte"
  import { switchMapQueryContext } from "../queries/switch-map-query.svelte"

  const { keys } = $derived(performanceStateContext.get())

  const actuationQuery = actuationQueryContext.get()
  const { current: actuationMap } = $derived(actuationQuery.actuationMap)
  const { current: switchMap } = $derived(switchMapQueryContext.get().switchMap)

  const { disabled, currentActuation, rtEnabled, separatedRT, firstKey } =
    $derived.by(() => {
      if (keys.size === 0 || !actuationMap) {
        return { disabled: true } as const
      }

      const [firstKey] = keys
      const currentActuation = actuationMap[firstKey]
      return {
        disabled: false,
        currentActuation,
        rtEnabled: currentActuation.rtDown > 0,
        separatedRT: currentActuation.rtUp > 0,
        firstKey,
      } as const
    })

  const strokeMm = $derived(
    disabled ? undefined : getKeyStrokeMm(firstKey, switchMap),
  )

  const updateActuation = (f: (actuation: HMK_Actuation) => HMK_Actuation) =>
    !disabled &&
    setToIntervals(keys).map(([offset, len]) =>
      actuationQuery.set({
        offset,
        data: Array(len).fill(f(currentActuation)),
      }),
    )
</script>

<div class="grid size-full grid-cols-[minmax(0,1fr)_24rem]">
  <FixedScrollArea class="flex flex-col gap-4 p-4">
    <DistanceSlider
      bind:committed={
        () => currentActuation?.rtDown ?? DEFAULT_RT_SENSITIVITY,
        (v) => updateActuation((actuation) => ({ ...actuation, rtDown: v }))
      }
      description={separatedRT
        ? m.rt_press_sensitivity_description()
        : m.rt_sensitivity_description()}
      disabled={disabled || !rtEnabled}
      {strokeMm}
      title={separatedRT ? m.rt_press_sensitivity() : m.rt_sensitivity()}
    />
    {#if separatedRT}
      <DistanceSlider
        bind:committed={
          () => currentActuation?.rtUp ?? DEFAULT_RT_SENSITIVITY,
          (v) => updateActuation((actuation) => ({ ...actuation, rtUp: v }))
        }
        description={m.rt_release_sensitivity_description()}
        disabled={disabled || !rtEnabled}
        {strokeMm}
        title={m.rt_release_sensitivity()}
      />
    {/if}
  </FixedScrollArea>
  <FixedScrollArea class="flex flex-col gap-4 p-4">
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
      description={m.rt_description()}
      {disabled}
      id="rapid-trigger"
      title={m.rt_enable()}
    />
    <Switch
      bind:checked={
        () => separatedRT ?? false,
        (v) =>
          updateActuation((actuation) => ({
            ...actuation,
            rtUp: v ? DEFAULT_RT_SENSITIVITY : 0,
          }))
      }
      description={m.rt_separate_sensitivity_description()}
      disabled={disabled || !rtEnabled}
      id="separate-rt"
      title={m.rt_separate_sensitivity()}
    />
    <Switch
      bind:checked={
        () => currentActuation?.continuous ?? false,
        (v) =>
          updateActuation((actuation) => ({
            ...actuation,
            continuous: v,
          }))
      }
      description={m.rt_continuous_description()}
      disabled={disabled || !rtEnabled}
      id="continuous-rapid-trigger"
      title={m.rt_continuous()}
    />
  </FixedScrollArea>
</div>
