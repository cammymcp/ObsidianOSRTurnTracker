/** *
 * Meta-Bind helper that adds an expiring-light marker (**T**, **L**, **T3**, **L2** …)
 * after a specified number of turns.
 *
 * ──────────────── Usage from a meta-bind button ────────────────
 * ```meta-bind-button
 * style: primary
 * label: Light Torch
 * action:
 *   type: js
 *   file: 7-Scripts/add_tracked_light_source.js
 *   args:
 *     kind: torch          # or "lantern"
 * ```
 *
 * “torch”  → duration 6 turns, marker T  
 * “lantern”→ duration 24 turns, marker L
 */

(async () => {
    /* ─────────────── argument handling ─────────────── */
    const kindArg = (context?.args?.kind || "torch").toString().toLowerCase();
    const lightTable = {
        torch: { letter: "T", turns: 6, notice: "🕯️ Torch expires in 1 hour." },
        lantern: { letter: "L", turns: 24, notice: "⛯ Lantern oil expires in 4 hours." }
    };
    if (!lightTable[kindArg]) {
        new Notice(`⚠️ Unknown light source “${kindArg}” (use torch / lantern).`);
        return;
    }
    const { letter, turns, notice } = lightTable[kindArg];

    /* ─────────────── vault & note ─────────────── */
    const file = context.file;
    if (!file) { new Notice("⚠️ No active file."); return; }

    const lines = (await app.vault.read(file)).split("\n");

    /* ─────────────── gather check-boxes ─────────────── */
    const trackerBoxRE = /^\s*>\s*-\s*\[([ xX])]\s*%%\s*%%/;
    const boxes = [];                        // [{ idx, checked }]
    for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(trackerBoxRE);
        if (m) boxes.push({ idx: i, checked: m[1].toLowerCase() === "x" });
    }
    if (!boxes.length) { new Notice("⚠️ No checkboxes found."); return; }

    /* latest checked box (or start) */
    let startPos = -1;
    for (let i = boxes.length - 1; i >= 0; i--) if (boxes[i].checked) { startPos = i; break; }

    const targetPos = startPos + turns;
    if (targetPos >= boxes.length) {
        new Notice(`⚠️ Fewer than ${turns} turns remain – ${kindArg} not added.`);
        return;
    }

    const targetIdx = boxes[targetPos].idx;
    let targetLine = lines[targetIdx];

    /* ─────────────── marker handling ─────────────── */
    const markerRE = new RegExp(`\\*\\*${letter}(\\d*)\\*\\*`);
    const match = targetLine.match(markerRE);

    if (match) {
        /* increment count */
        const current = match[1] ? parseInt(match[1], 10) : 1;
        const next = current + 1;
        targetLine = targetLine.replace(markerRE, `**${letter}${next}**`);
    } else {
        /* insert new marker */
        if (/%%\s*%%/.test(targetLine)) {           // after placeholder
            targetLine = targetLine.replace(/(%%\s*%%)(\s*)$/, (_, p1, p2) => `${p1} **${letter}**${p2}`);
        } else {                                   // after checkbox
            targetLine = targetLine.replace(/^(\s*>?\s*-\s*\[[ xX]\]\s*)/, (_, p1) => `${p1}**${letter}** `);
        }
    }

    lines[targetIdx] = targetLine;
    await app.vault.modify(file, lines.join("\n"));
    new Notice(notice);
})();
