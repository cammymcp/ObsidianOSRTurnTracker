/**
 * end_tracker_turn.js
 *
 * ▸ Tick the next turn box.
 * ▸ Expire EVERY bold marker that sits after the %% %% placeholders:
 *      • light-source tokens  **T**, **L**, **T3**, **L2** …
 *      • custom-effect tokens **Poison**, **Shield2**, **Web** …
 */

(async () => {
    /* ─────────────── setup ─────────────── */
    const file = context.file;
    if (!file) { new Notice("⚠️  No active file."); return; }

    const lines = (await app.vault.read(file)).split("\n");

    /* ───────── track-box scan (strict) ───────── */
    const trackerBoxRE = /^\s*>\s*-\s*\[([ xX])]\s*%%\s*%%/;   // only real tracker lines
    const boxes = [];                                          // { idx, checked }
    for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(trackerBoxRE);
        if (m) boxes.push({ idx: i, checked: m[1].toLowerCase() === "x" });
    }
    if (!boxes.length) { new Notice("⚠️  No tracker checkboxes found."); return; }

    /* ────────── choose “next” box ────────── */
    let startPos = -1;
    for (let i = boxes.length - 1; i >= 0; i--)
        if (boxes[i].checked) { startPos = i; break; }

    const targetPos = startPos + 1;
    if (targetPos >= boxes.length) {
        new Notice("⚠️  Already at the end of the tracker."); return;
    }

    /* ────────── 1) tick the box ────────── */
    const targetIdx = boxes[targetPos].idx;
    let targetLine = lines[targetIdx]
        .replace(/^(\s*>?\s*-\s*)\[\s*]\s*/, "$1[x] ");      // [ ] → [x]

    /* ────────── 2) expire any bold marker ──────────
       Definition:
         ▸ Must be **bold** (two asterisks)
         ▸ Must follow the “%% %%” placeholders somewhere on the same line */
    const afterPctPct = targetLine.split(/%%\s*%%/)[1] ?? "";
    const boldRE = /\*\*([A-Za-z][A-Za-z0-9]*\d*)\*\*/g;   // **Label** or **Label5**
    const labels = [];

    if (afterPctPct.match(boldRE)) {
        targetLine = targetLine.replace(boldRE, (_, label) => {
            labels.push(label);
            return `*${label}*`;                                // ** → *
        });
    }

    /* ────────── save & notify ────────── */
    lines[targetIdx] = targetLine;
    await app.vault.modify(file, lines.join("\n"));

    if (labels.length) {
        new Notice(`${labels.length} effect${labels.length > 1 ? "s" : ""} expired: ${labels.join(", ")}`);
    }
})();
