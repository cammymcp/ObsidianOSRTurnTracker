---
fc-calendar: Calendar of Greyhawk
---
Add the `Build Turn Tracker` button to any note. Depending on the frontmatter properties of that note, the tracker will behave slightly differently. See table for details.

| Frontmatter                    | Behaviour                                                      | Header Format                                  |
| ------------------------------ | -------------------------------------------------------------- | ---------------------------------------------- |
| None                           | Starts at **Day 1**, 8am                                       | `Day N`                                        |
| `startTime (Date & Time)` only | Starts at the given date and time                              | Real date (e.g. `Saturday 21st May 2016`)      |
| `fc-calendar (String)` only    | Starts at Calendarium calendars "today" date, 8am              | Fantasy date (e.g. `Fireday, 22 Growfest 591`) |
| `startTime` and `fc-calendar`  | Starts at the given date and time in the Calendarium calendar. | Fantasy date (e.g `Fireday, 22 Growfest 591`)  |
### Turn Tracker

```meta-bind-button
style: primary
label: Build Turn Tracker
action:
  type: "replaceSelf"
  templater: true
  replacement: "TurnTracker/Turn Tracker Template"
```