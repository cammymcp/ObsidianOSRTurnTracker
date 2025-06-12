/**********************************************************************
 * build_turn_tracker.js – Templater user script
 * Builds a 24-hour turn tracker that breaks into a new call-out at 00:00.
 * The first call-out starts in the hour containing the ISO time stored in
 * front-matter key startTime; headers include weekday, day, month, and year.
 * If no frontmatter is provided, tracker starts at 8am
 **********************************************************************/

/**
 * @param {object} tp  Templater API
 *
 * Reads optional `fc-calendar` and `startTime` from frontmatter.
 */
module.exports = async function (tp) {
    /* ───── frontmatter & defaults ───── */
    const fm = tp.frontmatter;
    const calendarName = fm["fc-calendar"];
    const hasCal = calendarName && typeof Calendarium !== "undefined";
    let calApi, store, firstWeekDay, weekdays, months;
    if (hasCal) {
        calApi = Calendarium.getAPI(calendarName);
        const calendarObj = calApi.getObject();
        store = calApi.getStore();
        ({ firstWeekDay, weekdays, months } = calendarObj.static);
    }

    const iso = fm.startTime;
    let start;
    if (iso && !isNaN(start = new Date(iso))) {
        // use provided startTime
    } else if (hasCal) {
        // use calendar's current date at 08:00
        const cd = calApi.getCurrentDate();
        start = new Date(cd.year, cd.month, cd.day, 8, 0, 0, 0);
    } else {
        // default to Day 1 at 08:00
        start = new Date(0);
        start.setHours(8, 0, 0, 0);
    }

    /* ───── helpers & title ───── */
    const pad = n => String(n).padStart(2, "0");
    const box = c => `>\t - [${c ? "x" : " "}] %% %%`;
    const hourL = h => `>\t - \`${pad(h)}:00\`&nbsp;`;
    const ordinal = n => { const s = ['th','st','nd','rd'], v = n % 100; return s[(v-20)%10]||s[v]||s[0]; };
    const formatReal = d => {
        const weekday = d.toLocaleDateString(undefined, { weekday: 'long' });
        const month = d.toLocaleDateString(undefined, { month: 'long' });
        const day = d.getDate(), year = d.getFullYear();
        return `${weekday} ${day}${ordinal(day)} ${month} ${year}`;
    };
    let defaultDay = 1;
    const title = d => {
        if (hasCal) {
            const cd = calApi.getDate(d.getDate(), d.getMonth(), d.getFullYear());
            const daysBefore = store.getDaysBeforeDate(cd);
            const idx = (firstWeekDay + daysBefore) % weekdays.length;
            const entry = weekdays[idx];
            const weekdayName = typeof entry === 'string' ? entry : entry.name;
            const monthEntry = months[cd.month];
            const monthName = typeof monthEntry === 'string' ? monthEntry : monthEntry.name;
            return `${weekdayName}, ${cd.day} ${monthName} ${cd.year}`;
        } else if (fm.startTime) {
            return formatReal(d);
        } else {
            return `Day ${defaultDay++}`;
        }
    };

    /* how many 10-min slots in the first hour have already passed? */
    const tickedFirst = Math.floor(start.getMinutes() / 10);   // 0-5

    /* ───── build ───── */
    const lines = [], addHeader = (dateStr) => {
        lines.push(`> [!checks|collapse] ${dateStr}`);
        lines.push(`> -`);
    };

    /* header for the day that contains startTime */
    addHeader(title(start));

    /* counters that reset after midnight */
    let fourHrChunk = 0, isFirstHourBlock = true;

    /* pointer we will move through 24 hours */
    const cur = new Date(start); cur.setMinutes(0, 0, 0);

    for (let hIdx = 0; hIdx < 24; hIdx++) {
        const h = cur.getHours();

        /* ── if we just rolled into 00:00 (but it isn’t the very first hour)  */
        if (h === 0 && !isFirstHourBlock) {
            lines.push("");                        // blank line closes previous call-out
            addHeader(title(cur));                 // new day’s call-out
            fourHrChunk = 0;                       // reset row-delimiter counter
        }

        /* row delimiter every four hours inside *each* call-out */
        if (fourHrChunk && fourHrChunk % 4 === 0) lines.push(`>-`);
        fourHrChunk++;

        lines.push(hourL(h));
        for (let t = 0; t < 6; t++) {
            const checked = (hIdx === 0 && t < tickedFirst);
            let line = box(checked);

            // Add a non-breaking space comment or character to the last checkbox
            if (t === 5) line += "\u00A0";  // Unicode NBSP
            lines.push(line);
        }

        /* advance one hour */
        cur.setHours(h + 1);
        isFirstHourBlock = false;
    }

    return lines.join("\n");
};
