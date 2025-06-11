/**********************************************************************
 * build_turn_tracker.js – Templater helper
 * Builds a 24-hour turn tracker that **breaks into a new call-out at 00:00**.
 * The first call-out starts in the hour containing the ISO time stored in
 * front-matter key  startTime:
 **********************************************************************/

module.exports = async function (tp) {
    /* ───── input ───── */
    const iso = tp.frontmatter["startTime"];
    if (!iso) throw new Notice("Error: startTime property missing");
    const start = new Date(iso);
    if (isNaN(start)) throw new Notice("Error: startTime is not valid ISO");

    /* ───── helpers ───── */
    const pad = n => String(n).padStart(2, "0");
    const box = c => `>\t - [${c ? "x" : " "}] %% %%`;
    const hourL = h => `>\t - .** ${pad(h)}:00 **.`;
    const title = d => d.toLocaleDateString("en-GB",
        { weekday: "long", year: "numeric", month: "long", day: "numeric" });

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
            lines.push(box(checked));
        }

        /* advance one hour */
        cur.setHours(h + 1);
        isFirstHourBlock = false;
    }

    return lines.join("\n");
};
