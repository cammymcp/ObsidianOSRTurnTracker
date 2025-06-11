/**********************************************************************
 * add_day_to_tracker.js  –  extend the existing tracker by 24 hours
 * 2025-06-09  •  Fix: continue same-day hours until 23 → 00.
 *********************************************************************/

(async () => {
    const file = context.file;
    if (!file) { new Notice("⚠️  No active file."); return; }

    /* -- render helpers -- */
    const pad = n => String(n).padStart(2, "0");
    const hourL = h => `>\t - \`${pad(h)}:00\`&nbsp;`;
    const box = `>\t - [ ] %% %%`;
    const title = d => d.toLocaleDateString("en-GB",
        {
            weekday: "long", year: "numeric",
            month: "long", day: "numeric"
        });

    /* -- regexes -- */
    const headerRE = /^\s*>\s*\[!checks\|collapse]\s+(.+)$/;
    const hourLineRE = /^\s*>\s*-\s*`(\d{2}):00`\s*&nbsp;/;
    const trackerLineRE = /^\s*>\s*-\s*(?:\[[ xX]\]\s*%%\s*%%|\.\*\* \d{2}:00 \*\*\.)/;

    /* -- scan to find the LAST hour header -------------------- */
    const lines = (await app.vault.read(file)).split("\n");

    let spliceAt = -1;    // index *after* which we’ll insert
    let curDay = null;  // Date for current call-out header
    let lastHour = null;  // 0-23 of the final **HH:00** header
    let hrsFromHead = 0;     // hours since that header (row grid)

    lines.forEach((ln, idx) => {
        if (headerRE.test(ln)) {
            curDay = new Date(headerRE.exec(ln)[1]);
            hrsFromHead = 0;
            spliceAt = idx;                 // header is tracker too
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
