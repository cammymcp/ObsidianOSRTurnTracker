A simple OSR dungeon turn tracker for Obsidian.md, building on the `!checks` callout in ITS theme. 

## Features

- Automatic start date/time when the tracker is built inside a session note;
- Adding and clearing torches and lanterns;
- Adding and clearing effects with custom labels and durations;
- Buttons to advance the tracker by a turn or a number of hours;
- Light and custom effects "expire" (turn from bold to italics) when the tracker reaches them;
- Effects of the same type which expire on the same turn are "stacked". E.g. lighting a second torch on the same turn will update the expiry label from `T` to `T2`.
- Ability to add days to the tracker if needed.

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

The button in `Demo Session Note` can be added to any note with a valid `startTime` frontmatter property. 

## Known Issues

- Too many labels on a single row (or labels that are too long) can break the formatting when the row gets too wide to render.
- Effects and light sources with the same label can be "stacked" to expire on the same turn (e.g. `L` becomes `L2` if two lanterns are lit at the same time.) However, two effect labels of **different types** cannot currently be set to expire at the same time.