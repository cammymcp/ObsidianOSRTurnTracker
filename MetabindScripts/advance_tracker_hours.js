/**
 * advance_tracker_hours.js
 *
 * Usage (Meta-Bind example):
 *   file: advance_tracker_hours.js | args: hours: 2
 *   → advances the turn tracker by 2 hours (12 boxes).
 */

(async () => {
    /* ─────────────── parse argument ─────────────── */
    const hrsArg = context?.args?.hours ?? 0;
    if (!hrsArg || hrsArg < 1) {
        new Notice("⚠️  Provide a positive integer – hours to advance.");
        return;
    }
    const boxesNeeded = hrsArg * 6;

    /* ─────────────── load note ─────────────── */
    const file = context.file;
    if (!file) { new Notice("⚠️  No active file."); return; }

    const lines = (await app.vault.read(file)).split("\n");

    /* ─────────── identify tracker boxes ─────────── */
    const trackerBoxRE = /^\s*>\s*-\s*\[([ xX])]\s*%%\s*%%/;  // strict: “> - [ ] %% %%”
    const boxes = [];                                         // { idx, checked }
    for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(trackerBoxRE);
        if (m) boxes.push({ idx: i, checked: m[1].toLowerCase() === "x" });
    }
    if (!boxes.length) {
        new Notice("⚠️  No turn-tracker checkboxes found."); return;
    }

    /* ─────────── find current position ─────────── */
    let lastChecked = -1;
    for (let i = boxes.length - 1; i >= 0; i--)
        if (boxes[i].checked) { lastChecked = i; break; }

    const boxesRemain = boxes.length - lastChecked - 1;
    if (boxesRemain < boxesNeeded) {
        new Notice(`⚠️  Only ${boxesRemain} unchecked turn${boxesRemain !== 1 ? "s" : ""} left; need ${boxesNeeded}.`);
        return;
    }

    /* ─────────── helper to tick & expire ─────────── */
    const boldRE = /\*\*([A-Za-z][A-Za-z0-9]*\d*)\*\*/g;        // any **Label** after %% %%
    const labelsExpired = new Set();

    function processLine(idx) {
        /* tick the box */
        lines[idx] = lines[idx].replace(/^(\s*>\s*-\s*)\[\s*]\s*/, "$1[x] ");

        /* expire bold markers that come *after* the %% %% placeholders */
        const parts = lines[idx].split(/%%\s*%%/);
        if (parts.length < 2) return;                           // no placeholders → nothing to expire

        const after = parts[1];
        if (!boldRE.test(after)) return;                        // no markers

        parts[1] = after.replace(boldRE, (_full, label) => {
            labelsExpired.add(label);
            return `*${label}*`;                               // **Label** → *Label*
        });
        lines[idx] = parts.join("%% %%");
    }

    /* ─────────── advance N hours (6N boxes) ─────────── */
    for (let i = 1; i <= boxesNeeded; i++)
        processLine(boxes[lastChecked + i].idx);

    /* ─────────── save changes ─────────── */
    await app.vault.modify(file, lines.join("\n"));

    /* ─────────── final notice ─────────── */
    const msg =
        `⏩ Advanced ${hrsArg} hour${hrsArg !== 1 ? "s" : ""} (${boxesNeeded} turns)`
        + (labelsExpired.size
            ? ` – expired: ${Array.from(labelsExpired).join(", ")}`
            : "");
    new Notice(msg);
})();
