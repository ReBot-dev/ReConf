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
  import {
    ArrowDownIcon,
    ArrowUpIcon,
    PlusIcon,
    Trash2Icon,
  } from "@lucide/svelte"
  import FixedScrollArea from "$lib/components/fixed-scroll-area.svelte"
  import * as KeyboardEditor from "$lib/components/keyboard-editor"
  import KeycodeAccordion from "$lib/components/keycode-accordion.svelte"
  import { KeycodeButton } from "$lib/components/keycode-button"
  import { Button } from "$lib/components/ui/button"
  import * as Dialog from "$lib/components/ui/dialog"
  import { Input } from "$lib/components/ui/input"
  import { keyboardContext } from "$lib/keyboard"
  import { Keycode } from "$lib/libhmk/keycodes"
  import {
    HMK_MACRO_BUFFER_SIZE,
    HMK_MACRO_MAX_DELAY_MS,
    macrosEncodedSize,
    type HMK_Macro,
    type HMK_MacroEvent,
  } from "$lib/libhmk/macro"
  import { m } from "$lib/paraglide/messages.js"
  import { unitToStyle } from "$lib/ui"
  import { isFeatureAvailable, type WithoutChildren } from "$lib/utils"
  import type { ComponentProps } from "svelte"
  import { textToMacroEvents } from "../lib/macro"
  import { macroQueryContext } from "../queries/macro.query.svelte"

  const {
    ...props
  }: WithoutChildren<ComponentProps<typeof KeyboardEditor.Root>> = $props()

  const { demo, version } = keyboardContext.get()
  const available = $derived(demo || isFeatureAvailable("macro", version))

  const macroQuery = macroQueryContext.get()
  const { current: macros } = $derived(macroQuery.macros)

  let selectedMacro = $state(0)
  let selectedEvent = $state<number | null>(null)
  let textInput = $state("")

  // Deferred deletion: when removing one half of a key press would leave a key
  // held down, we hold the index here and ask the user to confirm first.
  let stuckWarnOpen = $state(false)
  let pendingRemove = $state<number | null>(null)

  const currentEvents = $derived(macros?.[selectedMacro] ?? [])
  const usedBytes = $derived(macros ? macrosEncodedSize(macros) : 0)

  function commit(mutate: (events: HMK_MacroEvent[]) => HMK_MacroEvent[]) {
    if (!macros) return
    // Build plain (non-proxied) copies so we never pass a $state proxy to the
    // mutation or the command layer.
    const next: HMK_Macro[] = macros.map((events) =>
      events.map((event) => ({ ...event })),
    )
    next[selectedMacro] = mutate(next[selectedMacro])
    macroQuery.set({ data: next })
  }

  function addEvent(event: HMK_MacroEvent, selectAfter = false) {
    const index = currentEvents.length
    commit((events) => [...events, event])
    if (selectAfter) selectedEvent = index
  }

  // Add a key as a balanced pair of steps (press then release) so the key never
  // stays held by accident. The two steps can still be reordered or edited
  // independently afterwards.
  function addKeyPair() {
    const downIndex = currentEvents.length
    commit((events) => [
      ...events,
      { type: "down", keycode: Keycode.KC_NO },
      { type: "up", keycode: Keycode.KC_NO },
    ])
    selectedEvent = downIndex
  }

  // True if some keycode is pressed (down) more often than it is released (up),
  // i.e. it would still be held when the macro finishes.
  function hasStuckKey(events: HMK_MacroEvent[]): boolean {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- local tally, discarded before returning
    const balance = new Map<number, number>()
    for (const event of events) {
      if (event.type === "down")
        balance.set(event.keycode, (balance.get(event.keycode) ?? 0) + 1)
      else if (event.type === "up")
        balance.set(event.keycode, (balance.get(event.keycode) ?? 0) - 1)
    }
    for (const count of balance.values()) if (count > 0) return true
    return false
  }

  function doRemove(index: number) {
    commit((events) => events.filter((_, i) => i !== index))
    selectedEvent = null
  }

  // Removing a press/release can unbalance the macro and leave a key held; warn
  // before doing so. Other step types (tap/delay) are always safe to remove.
  function removeEvent(index: number) {
    const event = currentEvents[index]
    if (event && (event.type === "down" || event.type === "up")) {
      const remaining = currentEvents.filter((_, i) => i !== index)
      if (hasStuckKey(remaining)) {
        pendingRemove = index
        stuckWarnOpen = true
        return
      }
    }
    doRemove(index)
  }

  function confirmRemove() {
    if (pendingRemove !== null) doRemove(pendingRemove)
    pendingRemove = null
    stuckWarnOpen = false
  }

  function moveEvent(index: number, delta: number) {
    const target = index + delta
    commit((events) => {
      if (target < 0 || target >= events.length) return events
      const next = [...events]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
    selectedEvent = null
  }

  function setKeycode(index: number, keycode: number) {
    commit((events) => {
      const selected = events[index]
      // When a freshly added pair still has an unset partner adjacent to the
      // selected step, fill both halves at once so the user picks a key only
      // once. Once the partner has its own keycode it is edited independently.
      const partner =
        selected?.type === "down" &&
        events[index + 1]?.type === "up" &&
        (events[index + 1] as { keycode: number }).keycode === Keycode.KC_NO
          ? index + 1
          : selected?.type === "up" &&
              events[index - 1]?.type === "down" &&
              (events[index - 1] as { keycode: number }).keycode ===
                Keycode.KC_NO
            ? index - 1
            : null
      return events.map((event, i) =>
        (i === index || i === partner) && event.type !== "delay"
          ? { ...event, keycode }
          : event,
      )
    })
  }

  function setDelay(index: number, ms: number) {
    const clamped = Math.max(0, Math.min(HMK_MACRO_MAX_DELAY_MS, ms || 0))
    commit((events) =>
      events.map((event, i) =>
        i === index && event.type === "delay"
          ? { ...event, delay: clamped }
          : event,
      ),
    )
  }

  function insertText() {
    const events = textToMacroEvents(textInput)
    if (events.length > 0) commit((current) => [...current, ...events])
    textInput = ""
  }

  function clearMacro() {
    commit(() => [])
    selectedEvent = null
  }

  function onKeycodeSelected(keycode: number) {
    if (
      selectedEvent !== null &&
      currentEvents[selectedEvent]?.type !== "delay"
    )
      setKeycode(selectedEvent, keycode)
  }

  function eventLabel(event: HMK_MacroEvent) {
    switch (event.type) {
      case "tap":
        return m.macros_event_tap()
      case "down":
        return m.macros_event_down()
      case "up":
        return m.macros_event_up()
      default:
        return m.macros_event_delay()
    }
  }
</script>

<Dialog.Root bind:open={stuckWarnOpen}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{m.macros_remove_stuck_title()}</Dialog.Title>
      <Dialog.Description>
        {m.macros_remove_stuck_description()}
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Dialog.Close>
        {#snippet child({ props })}
          <Button size="sm" variant="outline" {...props}>
            {m.macros_cancel()}
          </Button>
        {/snippet}
      </Dialog.Close>
      <Button onclick={confirmRemove} size="sm" variant="destructive">
        {m.macros_remove_anyway()}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<KeyboardEditor.Root {...props}>
  <KeyboardEditor.Pane>
    <KeyboardEditor.Container>
      <FixedScrollArea class="flex flex-col gap-4 p-4">
        <div class="grid text-sm">
          <span class="font-medium">{m.macros_title()}</span>
          <span class="text-muted-foreground">{m.macros_description()}</span>
        </div>

        {#if !available}
          <div
            class="rounded-md border border-dashed p-4 text-sm text-muted-foreground"
          >
            {m.macros_requires_firmware()}
          </div>
        {:else if macros}
          <!-- Macro selector -->
          <div class="flex flex-wrap gap-1">
            {#each macros as macro, i (i)}
              <Button
                onclick={() => {
                  selectedMacro = i
                  selectedEvent = null
                }}
                size="sm"
                variant={i === selectedMacro ? "default" : "outline"}
              >
                {i}
                {#if macro.length > 0}
                  <span class="ml-1 text-xs opacity-70">({macro.length})</span>
                {/if}
              </Button>
            {/each}
          </div>

          <!-- Event list -->
          <div class="flex flex-col gap-1">
            {#each currentEvents as event, i (i)}
              <div
                class="flex items-center gap-2 rounded-md border p-1.5 text-sm"
                class:border-primary={selectedEvent === i}
              >
                <span class="w-14 shrink-0 font-medium"
                  >{eventLabel(event)}</span
                >

                {#if event.type === "delay"}
                  <div class="flex items-center gap-1">
                    <Input
                      class="h-8 w-24"
                      max={HMK_MACRO_MAX_DELAY_MS}
                      min={0}
                      onchange={(e) =>
                        setDelay(i, e.currentTarget.valueAsNumber)}
                      step={10}
                      type="number"
                      value={event.delay}
                    />
                    <span class="text-muted-foreground">{m.macros_ms()}</span>
                  </div>
                {:else}
                  <div class="p-0.5" style={unitToStyle()}>
                    <KeycodeButton
                      keycode={event.keycode}
                      onclick={() => (selectedEvent = i)}
                      showTooltip
                    />
                  </div>
                {/if}

                <div class="ml-auto flex items-center gap-1">
                  <Button
                    disabled={i === 0}
                    onclick={() => moveEvent(i, -1)}
                    size="icon"
                    variant="ghost"
                  >
                    <ArrowUpIcon />
                  </Button>
                  <Button
                    disabled={i === currentEvents.length - 1}
                    onclick={() => moveEvent(i, 1)}
                    size="icon"
                    variant="ghost"
                  >
                    <ArrowDownIcon />
                  </Button>
                  <Button
                    onclick={() => removeEvent(i)}
                    size="icon"
                    variant="ghost"
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>
            {/each}
            {#if currentEvents.length === 0}
              <div
                class="rounded-md border border-dashed p-3 text-center text-sm text-muted-foreground"
              >
                {m.macros_empty()}
              </div>
            {/if}
          </div>

          <!-- Add buttons -->
          <div class="flex flex-wrap gap-1">
            <Button
              onclick={() =>
                addEvent({ type: "tap", keycode: Keycode.KC_NO }, true)}
              size="sm"
              variant="outline"
            >
              <PlusIcon />
              {m.macros_event_tap()}
            </Button>
            <Button onclick={addKeyPair} size="sm" variant="outline">
              <PlusIcon />
              {m.macros_add_key()}
            </Button>
            <Button
              onclick={() => addEvent({ type: "delay", delay: 100 })}
              size="sm"
              variant="outline"
            >
              <PlusIcon />
              {m.macros_event_delay()}
            </Button>
            <Button
              disabled={currentEvents.length === 0}
              onclick={clearMacro}
              size="sm"
              variant="ghost"
            >
              {m.macros_clear()}
            </Button>
          </div>

          <!-- Insert text -->
          <div class="flex items-center gap-1">
            <Input
              bind:value={textInput}
              class="h-8"
              onkeydown={(e) => e.key === "Enter" && insertText()}
              placeholder={m.macros_insert_text_placeholder()}
            />
            <Button
              disabled={textInput.length === 0}
              onclick={insertText}
              size="sm"
            >
              {m.macros_insert()}
            </Button>
          </div>

          <div class="text-xs text-muted-foreground">
            {m.macros_buffer_usage({
              used: usedBytes,
              total: HMK_MACRO_BUFFER_SIZE,
            })}
            {#if usedBytes > HMK_MACRO_BUFFER_SIZE}
              <span class="text-destructive">{m.macros_buffer_full()}</span>
            {/if}
          </div>
        {/if}
      </FixedScrollArea>
    </KeyboardEditor.Container>
  </KeyboardEditor.Pane>
  <KeyboardEditor.Handle />
  <KeyboardEditor.Pane>
    <KeyboardEditor.Container>
      <FixedScrollArea class="flex flex-col gap-2 p-4">
        <div class="text-sm text-muted-foreground">
          {selectedEvent !== null &&
          currentEvents[selectedEvent]?.type !== "delay"
            ? m.macros_pick_key()
            : m.macros_pick_key_hint()}
        </div>
        <KeycodeAccordion {onKeycodeSelected} />
      </FixedScrollArea>
    </KeyboardEditor.Container>
  </KeyboardEditor.Pane>
</KeyboardEditor.Root>
