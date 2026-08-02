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
    appChangelog,
    changelogChanges,
    firmwareChangelog,
  } from "$lib/changelog"
  import * as Popover from "$lib/components/ui/popover"
  import * as Sidebar from "$lib/components/ui/sidebar"
  import { keyboardContext } from "$lib/keyboard"
  import { HMK_FIRMWARE_MAX_VERSION } from "$lib/libhmk"
  import { m } from "$lib/paraglide/messages.js"
  import {
    appVersion,
    displayVersion,
    isFirmwareUpdateAvailable,
  } from "$lib/utils"

  const { version } = keyboardContext.get()
  const updateAvailable = isFirmwareUpdateAvailable(version)
</script>

<Sidebar.Menu>
  <Sidebar.MenuItem>
    <Popover.Root>
      <Popover.Trigger
        class="flex w-full flex-col items-start gap-0.5 rounded-md px-2 py-1 text-left text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <span class="truncate">
          {m.version_app({ version: `v${appVersion}` })}
        </span>
        <span class="flex items-center gap-1 truncate">
          {m.version_firmware({ version: displayVersion(version) })}
          {#if updateAvailable}
            <span
              class="size-1.5 rounded-full bg-primary"
              aria-label={m.firmware_update_available({
                version: displayVersion(HMK_FIRMWARE_MAX_VERSION),
              })}
            ></span>
          {/if}
        </span>
      </Popover.Trigger>
      <Popover.Content align="start" class="max-h-96 w-72 overflow-y-auto">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-3">
            <span class="text-sm font-semibold">
              {m.app_changelog_title()}
            </span>
            {#each appChangelog as entry (entry.version)}
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium">v{entry.version}</span>
                  <span class="text-xs text-muted-foreground">{entry.date}</span
                  >
                  {#if entry.version === appVersion}
                    <span
                      class="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary"
                    >
                      {m.firmware_changelog_current()}
                    </span>
                  {/if}
                </div>
                <ul class="ml-4 list-disc text-xs text-muted-foreground">
                  {#each changelogChanges(entry) as change, i (i)}
                    <li>{change}</li>
                  {/each}
                </ul>
              </div>
            {/each}
          </div>

          <div class="border-t"></div>

          <div class="flex flex-col gap-3">
            <span class="text-sm font-semibold">
              {m.firmware_changelog_title()}
            </span>
            {#each firmwareChangelog as entry (entry.version)}
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium">
                    {displayVersion(entry.version)}
                  </span>
                  <span class="text-xs text-muted-foreground">{entry.date}</span
                  >
                  {#if entry.version === version}
                    <span
                      class="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary"
                    >
                      {m.firmware_changelog_current()}
                    </span>
                  {/if}
                </div>
                <ul class="ml-4 list-disc text-xs text-muted-foreground">
                  {#each changelogChanges(entry) as change, i (i)}
                    <li>{change}</li>
                  {/each}
                </ul>
              </div>
            {/each}
          </div>
        </div>
      </Popover.Content>
    </Popover.Root>
  </Sidebar.MenuItem>
</Sidebar.Menu>
