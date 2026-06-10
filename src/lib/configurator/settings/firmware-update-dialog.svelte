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
    AlertTriangleIcon,
    CheckCircleIcon,
    LoaderIcon,
    UploadIcon,
    UsbIcon,
  } from "@lucide/svelte"
  import { Button } from "$lib/components/ui/button"
  import * as Dialog from "$lib/components/ui/dialog"
  import { isWebUSBSupported } from "$lib/dfu/dfu-connect"
  import { DFUFlashManager, type DFUFlashStep } from "$lib/dfu/dfu-state.svelte"
  import { firmwareUpdateState } from "$lib/dfu/firmware-update-state.svelte"
  import { keyboardContext } from "$lib/keyboard"
  import { m } from "$lib/paraglide/messages.js"

  const keyboard = keyboardContext.get()
  const { demo } = keyboard

  let open = $state(false)
  const manager = new DFUFlashManager()
  const { step } = $derived(manager)

  let fileInput: HTMLInputElement | undefined = $state()

  const canClose = $derived(
    step.type === "idle" ||
      step.type === "complete" ||
      step.type === "error" ||
      step.type === "waiting-for-dfu" ||
      step.type === "connected",
  )

  function handleClose() {
    if (!canClose) return
    open = false
    manager.reset()
    // Update flow finished/cancelled: allow the landing page to return to the
    // connect screen for a fresh reconnect (the keyboard has rebooted).
    firmwareUpdateState.inProgress = false
  }

  function startUpdate() {
    // Mark the update as in progress *before* the bootloader command, so the
    // expected WebHID disconnect does not tear down this dialog.
    firmwareUpdateState.inProgress = true
    manager.enterBootloader(keyboard)
  }

  async function handleFileSelect() {
    const file = fileInput?.files?.[0]
    if (!file) return
    const firmware = await file.arrayBuffer()
    await manager.flash(firmware)
  }

  function getStepTitle(step: DFUFlashStep): string {
    switch (step.type) {
      case "idle":
        return m.settings_firmware_update()
      case "entering-bootloader":
        return m.firmware_entering_bootloader()
      case "waiting-for-dfu":
        return m.firmware_connect_dfu()
      case "connected":
        return m.firmware_select_firmware()
      case "flashing":
        return m.firmware_flashing()
      case "complete":
        return m.firmware_update_complete()
      case "error":
        return m.firmware_update_failed()
    }
  }
</script>

<Dialog.Root
  bind:open
  onOpenChange={(v) => {
    if (!v) handleClose()
  }}
>
  <Dialog.Trigger>
    {#snippet child({ props })}
      <Button
        disabled={demo || !isWebUSBSupported()}
        size="sm"
        variant="outline"
        {...props}
      >
        {m.firmware_update_button()}
      </Button>
    {/snippet}
  </Dialog.Trigger>
  <Dialog.Content
    onInteractOutside={(e) => {
      if (!canClose) e.preventDefault()
    }}
    onEscapeKeydown={(e) => {
      if (!canClose) e.preventDefault()
    }}
  >
    <Dialog.Header>
      <Dialog.Title>{getStepTitle(step)}</Dialog.Title>
    </Dialog.Header>

    {#if step.type === "idle"}
      <div class="flex flex-col gap-4">
        <Dialog.Description>
          {m.firmware_update_intro()}
        </Dialog.Description>
        <div
          class="flex items-start gap-3 rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm"
        >
          <AlertTriangleIcon class="mt-0.5 size-4 shrink-0 text-yellow-500" />
          <span>
            {m.firmware_update_warning()}
          </span>
        </div>
      </div>
      <Dialog.Footer>
        <Dialog.Close>
          {#snippet child({ props })}
            <Button size="sm" variant="outline" {...props}
              >{m.settings_cancel()}</Button
            >
          {/snippet}
        </Dialog.Close>
        <Button size="sm" onclick={startUpdate}>
          {m.firmware_start_update()}
        </Button>
      </Dialog.Footer>
    {:else if step.type === "entering-bootloader"}
      <div class="flex flex-col items-center gap-4 py-6">
        <LoaderIcon class="size-8 animate-spin text-muted-foreground" />
        <p class="text-sm text-muted-foreground">
          {m.firmware_restarting()}
        </p>
      </div>
    {:else if step.type === "waiting-for-dfu"}
      <div class="flex flex-col gap-4">
        <Dialog.Description>
          {m.firmware_connect_prompt()}
        </Dialog.Description>
        <div
          class="flex items-start gap-3 rounded-md border border-blue-500/50 bg-blue-500/10 p-3 text-sm"
        >
          <UsbIcon class="mt-0.5 size-4 shrink-0 text-blue-500" />
          <span>
            {m.firmware_windows_note()}
          </span>
        </div>
      </div>
      <Dialog.Footer>
        <Button size="sm" variant="outline" onclick={() => handleClose()}>
          {m.settings_cancel()}
        </Button>
        <Button size="sm" onclick={() => manager.connectDFU()}>
          <UsbIcon class="size-4" />
          {m.firmware_connect_dfu()}
        </Button>
      </Dialog.Footer>
    {:else if step.type === "connected"}
      <div class="flex flex-col gap-4">
        <Dialog.Description>
          {m.firmware_dfu_connected()}
        </Dialog.Description>
        <input
          bind:this={fileInput}
          accept=".bin"
          class="hidden"
          onchange={handleFileSelect}
          type="file"
        />
      </div>
      <Dialog.Footer>
        <Button size="sm" variant="outline" onclick={() => handleClose()}>
          {m.settings_cancel()}
        </Button>
        <Button size="sm" onclick={() => fileInput?.click()}>
          <UploadIcon class="size-4" />
          {m.firmware_select_file()}
        </Button>
      </Dialog.Footer>
    {:else if step.type === "flashing"}
      <div class="flex flex-col gap-4 py-4">
        <Dialog.Description>
          {m.firmware_writing()}
        </Dialog.Description>
        <div class="flex flex-col gap-2">
          <div class="h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              class="h-full rounded-full bg-primary transition-all duration-300"
              style="width: {Math.round(step.progress * 100)}%"
            ></div>
          </div>
          <p class="text-center text-sm text-muted-foreground">
            {Math.round(step.progress * 100)}%
          </p>
        </div>
      </div>
    {:else if step.type === "complete"}
      <div class="flex flex-col items-center gap-4 py-6">
        <CheckCircleIcon class="size-8 text-green-500" />
        <p class="text-sm text-muted-foreground">
          {m.firmware_success()}
        </p>
      </div>
      <Dialog.Footer>
        <Button size="sm" onclick={() => handleClose()}
          >{m.firmware_done()}</Button
        >
      </Dialog.Footer>
    {:else if step.type === "error"}
      <div class="flex flex-col gap-4">
        <div
          class="flex items-start gap-3 rounded-md border border-red-500/50 bg-red-500/10 p-3 text-sm"
        >
          <AlertTriangleIcon class="mt-0.5 size-4 shrink-0 text-red-500" />
          <span>{step.message}</span>
        </div>
        <p class="text-sm text-muted-foreground">
          {m.firmware_recovery_note()}
        </p>
      </div>
      <Dialog.Footer>
        <Button size="sm" variant="outline" onclick={() => handleClose()}>
          {m.firmware_close()}
        </Button>
        <Button size="sm" onclick={() => manager.reset()}
          >{m.firmware_try_again()}</Button
        >
      </Dialog.Footer>
    {/if}
  </Dialog.Content>
</Dialog.Root>
