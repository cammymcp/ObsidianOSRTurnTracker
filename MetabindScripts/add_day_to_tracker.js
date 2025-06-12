/**********************************************************************
 * add_day_to_tracker.js  –  extend the existing tracker by 24 hours
 * Displays weekday, day-of-month, month, and year when a calendar or date is specified,
 * or "Day N" format when no frontmatter is provided.
 *********************************************************************/

(async () => {
    const file = context.file;
    if (!file) { new Notice("⚠️  No active file."); return; }


    /* ───── frontmatter & calendar setup ───── */
    const cache = app.metadataCache.getFileCache(file);
    const fm = (cache && cache.frontmatter) ? cache.frontmatter : {};
    const calendarName = fm["fc-calendar"];
    const hasCal = calendarName && typeof Calendarium !== "undefined";
    let calApi, store, firstWeekDay, weekdays, months;
    if (hasCal) {
        calApi = Calendarium.getAPI(calendarName);
        const calendarObj = calApi.getObject();
        store = calApi.getStore();
        ({ firstWeekDay, weekdays, months } = calendarObj.static);
    }

    /* -- render helpers -- */
    const pad = n => String(n).padStart(2, "0");
    const hourL = h => `>\t - \`${pad(h)}:00\`&nbsp;`;
    const box = `>\t - [ ] %% %%`;
    const ordinal = n => { const s=["th","st","nd","rd"], v=n%100; return s[(v-20)%10]||s[v]||s[0];};
    const formatReal = d => { const wd=d.toLocaleDateString(undefined,{weekday:'long'}), mo=d.toLocaleDateString(undefined,{month:'long'}), da=d.getDate(), yr=d.getFullYear(); return `${wd} ${da}${ordinal(da)} ${mo} ${yr}`; };

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
            // no calendar: natural real-world date
            return formatReal(d);
        } else {
            // bare fallback: Day N
            return `Day ${defaultDay++}`;
        }
    };

    /* -- regexes -- */
    const headerRE = /^\s*>\s*\[!checks\|collapse]\s+(.+)$/;
    const hourLineRE = /^\s*>\s*-\s*`(\d{2}):00`\s*&nbsp;/;
    const trackerLineRE = /^\s*>\s*-\s*(?:\[[ xX]\]\s*%%\s*%%|\.\*\* \d{2}:00 \*\*\.)/;

    /* -- scan to find the LAST hour header -------------------- */

    const lines = (await app.vault.read(file)).split("\n");

    let spliceAt = -1;    // index *after* which we’ll insert
    let curDay = null;    // Date for current call-out header
    let lastHour = null;  // 0-23 of the final **HH:00** header
    let hrsFromHead = 0;  // hours since that header (row grid)
    let defaultDay = 1;   // counter for Day N when no calendar

    lines.forEach((ln, idx) => {
        if (headerRE.test(ln)) {
            const dateStr = headerRE.exec(ln)[1];
            if (hasCal) {
                // Parse header like "Weekday, D MonthName YYYY"
                const m = dateStr.match(/^[^,]+,\s*(\d+)\s+(.+)\s+(\d+)$/);
                if (m) {
                    const dayNum = parseInt(m[1], 10);
                    const monthName = m[2];
                    const yearNum = parseInt(m[3], 10);
                    const monthIdx = months.findIndex(mo =>
                        (typeof mo === 'string' ? mo : mo.name) === monthName
                    );
                    curDay = new Date(yearNum, monthIdx, dayNum);
                } else {
                    curDay = new Date();
                }
            } else if (fm.startTime) {
                // Parse header like "Monday 3rd January 591" when no calendar
                const m2 = dateStr.match(/^[A-Za-z]+\s+(\d+)(?:st|nd|rd|th)\s+([A-Za-z]+)\s+(\d+)$/);
                if (m2) {
                    const dayNum = parseInt(m2[1], 10);
                    const monthName = m2[2];
                    const yearNum = parseInt(m2[3], 10);
                    // Get month index via Date parsing
                    const monthIdx = new Date(monthName + ' 1, ' + yearNum).getMonth();
                    curDay = new Date(yearNum, monthIdx, dayNum);
                } else {
                    curDay = new Date(dateStr);
                }
            } else {
                // Parse header like "Day N" when no calendar or startTime
                const m = dateStr.match(/^Day\s+(\d+)$/);
                if (m) {
                    const n = parseInt(m[1], 10);
                    curDay = new Date(0);
                    curDay.setDate(n);
                    defaultDay = n + 1;
                } else {
                    curDay = new Date();
                }
            }
            hrsFromHead = 0;
            spliceAt = idx;                         // header is tracker too
            return;
        }

        const hM = ln.match(hourLineRE);
        if (hM && curDay) {                    // it’s an hour header
            lastHour = parseInt(hM[1], 10);
            hrsFromHead += 1;
            spliceAt = idx;                // keep moving forward
            return;
        }

        if (trackerLineRE.test(ln)) spliceAt = idx; // boxes also count
    });

    if (lastHour === null) {
        new Notice("⚠️  No turn-tracker found in this note."); return;
    }

    /* -- determine starting DateTime for the extension -------- */
    const startDT = new Date(curDay);
    startDT.setHours(lastHour + 1);            // “next hour”

    const sameCallout = startDT.toDateString() === curDay.toDateString();
    let fourChunk = sameCallout ? hrsFromHead : 0; // preserve 4-hr rows

    /* -- build the 24-hour block ------------------------------ */
    const extra = [], addHeader = d => {
        extra.push("");
        extra.push(`> [!checks|collapse] ${title(d)}`);
        extra.push("> -");
    };
    if (!sameCallout) addHeader(startDT);

    let cur = new Date(startDT);
    for (let i = 0; i < 24; i++) {
        const h = cur.getHours();

        /* roll to new day at 00:00 (except for very first hour added) */
        if (h === 0 && i !== 0) {
            addHeader(cur); fourChunk = 0;
        }

        if (fourChunk && fourChunk % 4 === 0) extra.push(">-");
        fourChunk++;

        extra.push(hourL(h));
        for (let t = 0; t < 6; t++) {
            let newBox = box;

            // Add a non-breaking space comment or character to the last checkbox
            if (t === 5) newBox += "\u00A0";  // Unicode NBSP
            extra.push(newBox);
        }

        cur.setHours(h + 1);
    }

    /* -- splice immediately after the last tracker line ------- */
    lines.splice(spliceAt + 1, 0, ...extra);
    await app.vault.modify(file, lines.join("\n"));

    new Notice("✅ Tracker extended by 24 hours.");
})();
