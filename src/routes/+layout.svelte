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
  import { Toaster } from "$lib/components/ui/sonner"
  import "../app.css"
  import "@fontsource-variable/inter"
  import "@fontsource-variable/noto-sans-jp"
  import "@fontsource-variable/geist-mono"
  import "$lib/i18n.svelte"
  import { inject } from "@vercel/analytics"
  import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit"
  import { m } from "$lib/paraglide/messages.js"
  import { ModeWatcher } from "mode-watcher"

  inject()
  injectSpeedInsights()

  let { children } = $props()
</script>

<svelte:head>
  <title>{m.app_title()}</title>
  <meta name="description" content={m.app_description()} />
  <link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="48x48" />
  <link rel="icon" href="/icon0.svg" type="image/svg+xml" sizes="any" />
  <link rel="icon" href="/icon1.png" type="image/png" sizes="96x96" />
  <link
    rel="apple-touch-icon"
    href="/apple-icon.png"
    type="image/png"
    sizes="180x180"
  />
  <link rel="manifest" href="/manifest.json" />
</svelte:head>

<ModeWatcher />
<Toaster />
<div class="relative flex min-h-svh flex-col bg-background font-sans">
  {@render children?.()}
</div>
