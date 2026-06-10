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
  import { BookOpenIcon, CableIcon } from "@lucide/svelte"
  import brandLogo from "$lib/assets/brand/icon-green.png"
  import Footer from "$lib/components/footer.svelte"
  import { Button } from "$lib/components/ui/button"
  import Configurator from "$lib/configurator/configurator.svelte"
  import type { Keyboard } from "$lib/keyboard"
  import { connect } from "$lib/keyboard/hmk-keyboard.svelte"
  import { firmwareUpdateState } from "$lib/dfu/firmware-update-state.svelte"
  import { HMK_FIRMWARE_MAX_VERSION } from "$lib/libhmk"
  import { m } from "$lib/paraglide/messages.js"
  import { mode, resetMode, setMode } from "mode-watcher"
  import { onMount } from "svelte"
  import { toast } from "svelte-sonner"

  let keyboard: Keyboard | null = $state(null)
  let prevMode: string | undefined = $state(undefined)
  // Set when the WebHID device disconnects because it rebooted into DFU for a
  // firmware update. We keep the configurator mounted so the update dialog can
  // finish, then return to the connect screen once the flow ends.
  let disconnectedForUpdate = $state(false)

  $effect(() => {
    if (!firmwareUpdateState.inProgress && disconnectedForUpdate) {
      disconnectedForUpdate = false
      keyboard = null
    }
  })

  onMount(() => {
    prevMode = mode.current
    setMode("light")
    return () => {
      if (prevMode === "dark" || prevMode === "light") {
        setMode(prevMode)
      } else {
        resetMode()
      }
    }
  })

  const handleConnect = async () => {
    try {
      keyboard = await connect(({ metadata: { name } }) => {
        if (firmwareUpdateState.inProgress) {
          // Expected disconnect: the keyboard rebooted into DFU for a firmware
          // update. Keep the configurator (and the update dialog) mounted so
          // the WebUSB DFU flash can continue.
          disconnectedForUpdate = true
          return
        }
        toast.success(m.toast_disconnected({ name }))
        keyboard = null
      })
      if (keyboard) {
        if (prevMode === "dark" || prevMode === "light") {
          setMode(prevMode)
        } else {
          resetMode()
        }
        let message: string = m.toast_connected({
          name: keyboard.metadata.name,
        })
        if (keyboard.version < HMK_FIRMWARE_MAX_VERSION) {
          message += m.toast_firmware_update_available()
        }
        toast.success(message)
      }
    } catch (err) {
      toast.error(String(err))
    }
  }
</script>

{#if keyboard}
  <Configurator {keyboard} />
{:else}
  <main class="py-24" style="color-scheme: light;">
    <div class="mx-auto max-w-7xl px-6">
      <div class="mx-auto max-w-2xl text-center">
        <img
          src={brandLogo}
          alt="ReBotLab"
          class="mx-auto mb-6 h-40 w-auto rounded-2xl"
        />
        <h1 class="text-5xl font-semibold tracking-tight text-gray-900">
          <span class="text-[var(--rebot-accent)]">Re</span>Conf
        </h1>
        <p class="mt-4 text-lg font-medium text-wrap text-gray-500">
          {m.landing_description()}
        </p>
        <div class="mt-6 flex items-center justify-center gap-4">
          <Button onclick={() => handleConnect()} size="lg">
            <CableIcon />
            {m.landing_connect()}
          </Button>
          <Button href="/demo" size="lg" variant="outline"
            >{m.landing_try_demo()}</Button
          >
        </div>
        <div class="mt-4">
          <Button
            href="https://rebotlab.net/blog/reconf"
            size="sm"
            target="_blank"
            variant="link"
          >
            <BookOpenIcon />
            {m.landing_about()}
          </Button>
        </div>
      </div>
    </div>
  </main>
  <Footer />
{/if}
