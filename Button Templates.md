Each of these button templates should be added to Meta-Bind via the Settings window so they can be added to a note using just their ID value. The `Turn Tracker Template` will not render properly without this step.

Copy a block to your clipboard > Open Meta-Bind Settings > Click `Edit Templates` under `Button Templates` > Click `Add template from clipboard` > Click `Save`.

Repeat for each button below.

> [!warning] 
> Many of the buttons include hardcoded paths to the `MetabindScripts` folder, which is assumed to be at the root of your vault. If you move these scripts elsewhere, the button templates will need to be updated to point to their new location.

---
```
style: primary
label: End Turn
action:
  type: js
  file: MetabindScripts/end_tracker_turn.js
icon: arrow-big-right-dash
id: end_turn
```

```
style: default
label: Light Torch
action:
  type: js
  file: MetabindScripts/add_tracked_light_source.js
  args:
    kind: torch
icon: flame
id: light_torch
```

```
style: default
label: Light Lantern
id: light_lantern
icon: lamp-wall-down
action:
  type: js
  file: MetabindScripts/add_tracked_light_source.js
  args:
    kind: lantern
```

```
id: add_day_to_tracker
style: plain
label: Add day
icon: calendar-plus
action:
  type: js
  file: MetabindScripts/add_day_to_tracker.js
```

```
style: default
label: Add To Tracker
action:
  type: js
  file: MetabindScripts/track_custom_effect.js
icon: hourglass
class: center
id: track_custom_effect
```

```
id: advance_tracker_1hr
icon: fast-forward
style: destructive
label: Advance 1hr
action:
  type: js
  file: MetabindScripts/advance_tracker_hours.js
  args:
    hours: 1
```

```
id: advance_tracker_3hr
icon: fast-forward
style: destructive
label: Advance 3hrs
action:
  type: js
  file: MetabindScripts/advance_tracker_hours.js
  args:
    hours: 3
```

```
id: advance_tracker_8hr
icon: skip-forward
style: destructive
label: Advance 8hrs
action:
  type: js
  file: MetabindScripts/advance_tracker_hours.js
  args:
    hours: 8
```

```
style: plain
label: Clear All Lights
action:
  type: regexpReplaceInNote
  regexp: (?<=^\s*>\s*-\s*\[[ xX]\]\s*%%\s*%%.*?)\s*(\*{1,2})(T|L)\d*\1
  regexpFlags: gm
  replacement: ""
id: clear_all_light_sources
icon: x
```

```
style: plain
label: Clear Expired Lights
action:
  type: regexpReplaceInNote
  regexp: (?<=^\s*>\s*-\s*\[[ xX]\]\s*%%\s*%%.*?)\s+(?<!\*)\*(T|L)\d*\*(?!\*)
  regexpFlags: gm
  replacement: ""
id: clear_expired_light_sources
icon: x
```

```
style: plain
label: Clear All Effects
action:
  type: regexpReplaceInNote
  regexp: (?<=^\s*>\s*-\s*\[[ xX]\]\s*%%\s*%%.*?)\s+(?<!\*)\*{1,2}(?!T\d*\b)(?!L\d*\b)[A-Za-z][A-Za-z0-9]*\d*\*{1,2}(?!\*)
  regexpFlags: gm
  replacement: ""
id: clear_custom_effects
icon: x
```

```
style: plain
label: Clear Expired Effects
action:
  type: regexpReplaceInNote
  regexp: (?<=^\s*>\s*-\s*\[[ xX]\]\s*%%\s*%%.*?)\s*(?<!\*)\*(?!\*)(?!T\d*\b)(?!L\d*\b)[A-Za-z][A-Za-z0-9]*\d*\*(?!\*)
  regexpFlags: gm
  replacement: ""
id: clear_expired_custom_effects
icon: x
```