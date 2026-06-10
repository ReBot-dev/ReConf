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
  import Switch from "$lib/components/switch.svelte"
  import { Badge } from "$lib/components/ui/badge"
  import { Button } from "$lib/components/ui/button"
  import * as Dialog from "$lib/components/ui/dialog"
  import { keyboardContext } from "$lib/keyboard"
  import { HMK_FIRMWARE_MAX_VERSION } from "$lib/libhmk"
  import { m } from "$lib/paraglide/messages.js"
  import {
    cn,
    displayVersion,
    isFeatureAvailable,
    isFirmwareUpdateAvailable,
    type WithoutChildren,
  } from "$lib/utils"
  import type { HTMLAttributes } from "svelte/elements"
  import { optionsQueryContext } from "../queries/options-query.svelte"
  import { profileQueryContext } from "../queries/profile-query.svelte"
  import FirmwareUpdateDialog from "./firmware-update-dialog.svelte"

  const {
    class: className,
    ...props
  }: WithoutChildren<HTMLAttributes<HTMLDivElement>> = $props()

  const keyboard = keyboardContext.get()
  const {
    demo,
    version,
    metadata: { usbHighSpeed },
  } = keyboard

  const profileQuery = profileQueryContext.get()
  const optionsQuery = optionsQueryContext.get()
  const { current: options } = $derived(optionsQuery.options)

  const updateAvailable = isFirmwareUpdateAvailable(version)
</script>

<div
  class={cn("mx-auto flex size-full max-w-3xl flex-col", className)}
  {...props}
>
  <FixedScrollArea class="flex flex-col gap-4 p-4">
    {#if usbHighSpeed && isFeatureAvailable("pollingRateSwitch", version)}
      <Switch
        bind:checked={
          () => options?.highPollingRateEnabled ?? false,
          (v) =>
            options &&
            optionsQuery.set({
              data: { ...options, highPollingRateEnabled: v },
            })
        }
        id="8000hz-polling-rate"
        title={m.settings_polling_rate()}
        description={m.settings_polling_rate_description()}
      />
    {/if}
    <div class="flex flex-col gap-2">
      <div class="grid text-sm text-wrap">
        <span class="font-semibold">{m.settings_firmware_update()}</span>
        <span class="text-muted-foreground">
          {m.settings_firmware_update_description()}
        </span>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <span class="text-muted-foreground">
          {m.firmware_current_version({ version: displayVersion(version) })}
        </span>
        {#if updateAvailable}
          <Badge>
            {m.firmware_update_available({
              version: displayVersion(HMK_FIRMWARE_MAX_VERSION),
            })}
          </Badge>
        {:else}
          <Badge variant="secondary">{m.firmware_up_to_date()}</Badge>
        {/if}
      </div>
      <div>
        <FirmwareUpdateDialog />
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <div class="grid text-sm text-wrap">
        <span class="font-semibold">{m.settings_restart()}</span>
        <span class="text-muted-foreground">
          {m.settings_restart_description()}
        </span>
      </div>
      <div>
        <Button
          disabled={demo}
          onclick={() => keyboard.reboot()}
          size="sm"
          variant="outline"
        >
          {m.settings_restart()}
        </Button>
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <div class="grid text-sm text-wrap">
        <span class="font-semibold">{m.settings_bootloader()}</span>
        <span class="text-muted-foreground">
          {m.settings_bootloader_description()}
        </span>
      </div>
      <div>
        <Button
          disabled={demo}
          onclick={() => keyboard.bootloader()}
          size="sm"
          variant="outline"
        >
          {m.settings_bootloader()}
        </Button>
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <div class="grid text-sm text-wrap">
        <span class="font-semibold">{m.settings_factory_reset()}</span>
        <span class="text-muted-foreground">
          {m.settings_factory_reset_description()}
        </span>
      </div>
      <div>
        <Dialog.Root>
          <Dialog.Trigger>
            {#snippet child({ props })}
              <Button
                disabled={demo}
                size="sm"
                variant="destructive"
                {...props}
              >
                {m.settings_factory_reset()}
              </Button>
            {/snippet}
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title
                >{m.settings_factory_reset_confirm_title()}</Dialog.Title
              >
              <Dialog.Description>
                {m.settings_factory_reset_confirm_description()}
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
              <Dialog.Close>
                {#snippet child({ props })}
                  <Button size="sm" variant="outline" {...props}
                    >{m.settings_cancel()}</Button
                  >
                {/snippet}
              </Dialog.Close>
              <Dialog.Close onclick={() => profileQuery.factoryReset()}>
                {#snippet child({ props })}
                  <Button size="sm" variant="destructive" {...props}>
                    {m.settings_factory_reset()}
                  </Button>
                {/snippet}
              </Dialog.Close>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Root>
      </div>
    </div>
  </FixedScrollArea>
</div>
