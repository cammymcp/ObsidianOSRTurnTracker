/**
 * Meta-Bind helper – adds a **custom effect** marker after N turns.
 *
 * Reads these front-matter keys on the active note:
 *   customTurnDuration: <number>   # how many turns until it expires
 *   customEffectLabel : <string>   # the label to show (bold)
 *
 * After adding the marker it *removes* both keys from the front-matter.
 *
 * If either key is missing/invalid → shows a Notice and does nothing.
 */

(async () => {
    /* ─────────── helpers ─────────── */
    const escapeRE = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    /* ─────────── file & metadata ─────────── */
    const file = context.file;
    if (!file) { new Notice("⚠️ No active file."); return; }

    const fm = app.metadataCache.getFileCache(file)?.frontmatter ?? {};
    const turns = parseInt(fm.customTurnDuration, 10);
    const label = (fm.customEffectLabel ?? "").toString().trim();

    if (!turns || turns < 1 || !label) {
        new Notice("⚠️ customTurnDuration or customEffectLabel missing.");
        return;
    }

    /* ─────────── read lines & find boxes ─────────── */
    const lines = (await app.vault.read(file)).split("\n");
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
        new Notice(`⚠️ Fewer than ${turns} turns remain – effect not added.`);
        return;
    }

    /* ─────────── insert / bump marker ─────────── */
    const targetIdx = boxes[targetPos].idx;
    let targetLine = lines[targetIdx];
    const markerRE = new RegExp(`\\*\\*${escapeRE(label)}(\\d*)\\*\\*`);
    const match = targetLine.match(markerRE);

    if (match) {
        /* increment existing count */
        const current = match[1] ? parseInt(match[1], 10) : 1;
        const next = current + 1;
        targetLine = targetLine.replace(markerRE, `**${label}${next}**`);
    } else {
        /* new marker */
        if (/%%\s*%%/.test(targetLine)) {
            targetLine = targetLine.replace(/(%%\s*%%)(\s*)$/, (_, p1, p2) =>
                `${p1} **${label}**${p2}`);
        } else {
            targetLine = targetLine.replace(/^(\s*>?\s*-\s*\[[ xX]\]\s*)/, (_, p1) =>
                `${p1}**${label}** `);
        }
    }
    lines[targetIdx] = targetLine;

    /* ─────────── clear front-matter properties ─────────── */
    const fmStart = lines.findIndex(l => l.trim() === "---");
    let fmEnd = -1;
    for (let i = fmStart + 1; i < lines.length; i++) {
        if (lines[i].trim() === "---") { fmEnd = i; break; }
    }
    if (fmStart === 0 && fmEnd > 0) {
        lines.splice(fmStart + 1, fmEnd - fmStart - 1,
            ...lines.slice(fmStart + 1, fmEnd)
                .filter(l => !/^customTurnDuration\s*:/i.test(l)
                    && !/^customEffectLabel\s*:/i.test(l)));
    }

    /* ─────────── save & notify ─────────── */
    await app.vault.modify(file, lines.join("\n"));
    new Notice(`🗲 Added **${label}** – expires in ${turns} turn${turns === 1 ? "" : "s"}.`);
})();
