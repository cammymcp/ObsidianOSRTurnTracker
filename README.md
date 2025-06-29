A simple OSR dungeon turn tracker for Obsidian.md, building on the `!checks` callout in ITS theme. 

![demo-gif](https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2NjMjdvd2s2MGdtaXNtb2Z5d2hsOWh1MXJiOHJvZ2gxbm5odWVobCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/eCZDr7sTh5hf52FB6K/giphy.gif)

## Features

- Automatic start date/time when the tracker is built inside a session note;
- Adding and clearing torches and lanterns;
- Adding and clearing effects with custom labels and durations;
- Buttons to advance the tracker by a turn or a number of hours;
- Light and custom effects "expire" (turn from bold to italics) when the tracker reaches them;
- Effects of the same type which expire on the same turn are "stacked". E.g. lighting a second torch on the same turn will update the expiry label from `T` to `T2`.
- Ability to add days to the tracker if needed.
- Displays custom weekday and month names when used with Calendarium plugin.

## Disclaimer

This tool has been tested to a reasonable degree, but it isn't bulletproof. Running custom JavaScript in your vault can be unintentionally destructive. Don't do it unless you understand the risks. **Always backup your vault first.**

## Dependencies

The turn tracker leverages popular community plugins and themes for its functionality. These must be installed and configured for the turn tracker to work.

- **ITS Theme** - *required for the `!checks` callout*
- **Templater** - *required to build the tracker inside any note using User Scripts*
	- Make sure the `Template folder location` is set to a folder in your vault.
	- Make sure `User Scripts/Script files folder location` is set to a different folder in your vault.
- **Meta-Bind** - *required for buttons and input fields*
	- JavaScript must be enabled in Settings
	- **JS Engine** - *required for running JavaScript from Meta-Bind buttons*
- (Optional) **Calendarium** – *optional for adding custom calendar formatting via the Calendarium API*. The turn tracker will display your fantasy weekday, day number, and month names instead of real-world dates.

## Setup

1. Backup your vault. I mean it.
2. Add all folders and notes in the repository to your vault.
3. Make sure all dependencies are installed and configured as directed above. 
4. Restart Obsidian.
5. Add the `TurnTracker/Turn Tracker Template.md` note to your **Templater** `Template folder location` folder *(or set your Templater folder to `TurnTracker`)*.
6. Add the `TemplaterScripts/build_turn_tracker.js` file to your **Templater `User Scripts`** folder *(or set your user scripts folder to `TemplaterScripts`)*.
7. Make sure the `MetabindScripts` folder is in the **root directory** of your vault. 
	1. If you move the scripts to a different folder, the `Button Templates` will need to be modified to point to the new folder location. *(Note that these scripts should not be stored in the Templater User Scripts folder due to compatibility issues).*
8. Follow the instructions in `Button Templates.md` to setup the buttons used by the turn tracker.
9. Open `Demo Session Note` and try it out!

## General Usage

Add the button from `Demo Session Note` to any note. The tracker's behaviour depends on the frontmatter in that note:

| Frontmatter                    | Behaviour                                                      | Header Format                                  |
| ------------------------------ | -------------------------------------------------------------- | ---------------------------------------------- |
| None                           | Starts at **Day 1**, 8am                                       | `Day N`                                        |
| `startTime (Date & Time)` only | Starts at the given date and time                              | Real date (e.g. `Saturday 21st May 2016`)      |
| `fc-calendar (String)` only    | Starts at Calendarium calendars "today" date, 8am              | Fantasy date (e.g. `Fireday, 22 Growfest 591`) |
| `startTime` and `fc-calendar`  | Starts at the given date and time in the Calendarium calendar. | Fantasy date (e.g `Fireday, 22 Growfest 591`)  |
## Known Issues

- Too many labels on a single row (or labels that are too long) can break the formatting when the row gets too wide to render.