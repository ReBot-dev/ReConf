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
  import { getKeyStrokeMm } from "$lib/distance-display.svelte"
  import {
    DEFAULT_ACTUATION_POINT,
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

  const { disabled, currentActuation, rtEnabled, firstKey } = $derived.by(
    () => {
      if (keys.size === 0 || !actuationMap) {
        return { disabled: true } as const
      }

      const [firstKey] = keys
      const currentActuation = actuationMap[firstKey]
      return {
        disabled: false,
        currentActuation,
        rtEnabled: currentActuation.rtDown > 0,
        firstKey,
      } as const
    },
  )

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

<FixedScrollArea class="flex flex-col gap-4 p-4">
  <DistanceSlider
    bind:committed={
      () => currentActuation?.actuationPoint ?? DEFAULT_ACTUATION_POINT,
      (v) =>
        updateActuation((actuation) => ({ ...actuation, actuationPoint: v }))
    }
    description={rtEnabled ? m.ap_description_rt() : m.ap_description_normal()}
    {disabled}
    {strokeMm}
    title={m.ap_title()}
  />
</FixedScrollArea>
