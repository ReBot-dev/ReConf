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
  import * as KeyboardEditor from "$lib/components/keyboard-editor"
  import { Badge } from "$lib/components/ui/badge"
  import * as Tooltip from "$lib/components/ui/tooltip"
  import { m } from "$lib/paraglide/messages.js"
</script>

<KeyboardEditor.Menubar>
  <Tooltip.Root>
    <Tooltip.Trigger>
      <Badge variant="destructive">{m.calibration_warning_title()}</Badge>
    </Tooltip.Trigger>
    <Tooltip.Content class="max-w-sm text-wrap">
      {m.calibration_warning_description()}
    </Tooltip.Content>
  </Tooltip.Root>
  <KeyboardEditor.LayoutDialog />
</KeyboardEditor.Menubar>
