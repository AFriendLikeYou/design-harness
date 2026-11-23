// Gemeinsame Auswertung eines Figma-Stands für das Plugin (tooling/serve.mjs) und den Pull Request (tooling/pr-report.mjs):
// was sich ändert, was in Figma zu beheben ist, was im Code nachzuziehen ist.
export const MODE = { light: 'hell', dark: 'dunkel' };
// Was sich gegenüber dem Stand im Repo ändert, in Worten
export function changes(old, snap) {
  const out = []; const by = (list, n) => new Map((list || []).map((x) => [x.slice(0, n).join('|'), x])); const show = (v) => String(v).replace(/^>/, '');
  const A = by(old.variables, 2), B = by(snap.variables, 2);
  for (const [k, v] of B) { const name = v[1]; const o = A.get(k); if (!o) { out.push('Neue Variable: ' + name); continue; }
    const modes = Object.keys(v[3]).filter((m) => JSON.stringify(o[3][m]) !== JSON.stringify(v[3][m]));
    const txt = modes.map((m) => show(o[3][m]) + ' → ' + show(v[3][m])); if (modes.length) out.push(name + ': ' + (modes.length === Object.keys(v[3]).length && new Set(txt).size === 1 ? txt[0] : modes.map((m, k) => (MODE[m] ? MODE[m] + ' ' : '') + txt[k]).join(', '))); else if (JSON.stringify(o) !== JSON.stringify(v)) out.push(name + ': Beschreibung oder Einsatzbereich geändert'); }
  for (const [k, o] of A) if (!B.has(k)) out.push('Entfernte Variable: ' + o[1]);
  const TA = by(old.textStyles, 1), TB = by(snap.textStyles, 1); for (const [k, v] of TB) { if (!TA.has(k)) out.push('Neuer Textstil: ' + k); else if (JSON.stringify(TA.get(k)) !== JSON.stringify(v)) out.push('Textstil geändert: ' + k); } for (const k of TA.keys()) if (!TB.has(k)) out.push('Entfernter Textstil: ' + k);
  const CA = by(old.components, 1), CB = by(snap.components, 1); const SA = by(old.styles, 2), SB = by(snap.styles, 2);
  for (const [name, v] of CB) { if (!CA.has(name)) { out.push('Neue Komponente: ' + name + ' (' + (snap.styles || []).filter((x) => x[0] === name).length + ' Varianten)'); continue; }
    const props = JSON.stringify(CA.get(name)[1]) !== JSON.stringify(v[1]); let looks = 0, added = 0, removed = 0; for (const [k, x] of SB) if (x[0] === name) { if (!SA.has(k)) added++; else if (JSON.stringify(SA.get(k)) !== JSON.stringify(x)) looks++; } for (const [k, x] of SA) if (x[0] === name && !SB.has(k)) removed++;
    const lost = new Set(); for (const [k, x] of SB) if (x[0] === name && SA.has(k)) for (const role of Object.keys(SA.get(k)[2])) if (!(role in x[2])) lost.add(role);
    const parts = [lost.size && 'Achtung, Rolle entfällt: ' + [...lost].join(', ') + ' (Ebene umbenannt oder gelöscht?)', props && 'Properties geändert', added && added + ' neue Varianten', removed && removed + ' Varianten entfernt', looks && 'Aussehen von ' + looks + ' Varianten geändert'].filter(Boolean);
    if (parts.length) out.push(name + ': ' + parts.join(', ')); else if (JSON.stringify(CA.get(name)) !== JSON.stringify(v)) out.push(name + ': Beschreibung geändert'); }
  for (const name of CA.keys()) if (!CB.has(name)) out.push('Entfernte Komponente: ' + name);
  return out;
}
// Meldungen von Build und Abgleich in Punkte übersetzen; jeder Punkt nennt, wenn möglich, die Komponente (für den Sprung in Figma)
const where = (text, names) => { const comp = names.find((n) => new RegExp('(^|[^\\wäöüß])' + n + '([^\\wäöüß]|$)').test(text)); const v = text.match(/\[([^\]]*=[^\]]*)\]/); return comp ? { comp, variant: v ? v[1] : '' } : {}; };
export function fromBuild(lines, names) { return lines.filter((l) => !/^Das System ist in sich|^… und/.test(l)).map((l) => { let t = l.trim().replace(/^Fehler: /, '').replace(/^specs\/figma\.snapshot\.json: /, '').replace(/^\[[a-z/-]+\] /, '');
  const c = t.match(/^(light|dark): (\S+) auf (\S+) = ([\d.]+) \(mindestens ([\d.]+)\)/); if (c) t = 'Kontrast reicht nicht (' + MODE[c[1]] + '): ' + c[2] + ' auf ' + c[3] + ' hat ' + c[4] + ', nötig sind ' + c[5] + '. Eine der beiden Farben anpassen.';
  return { text: t, ...where(t, names) }; }); }
export function fromDiff(lines, names) { const out = []; let skip = false; for (const l of lines) { if (!/^\s/.test(l)) skip = /^\d+ Abweichungen|passen zusammen|^Hinweis|Beschreibung/.test(l); if (skip) continue; if (/^\s/.test(l) && out.length) { const m = l.trim().match(/^(Figma|Soll|Tun):\s*(.*)$/); if (m) out[out.length - 1].detail.push((m[1] === 'Soll' ? 'Code' : m[1]) + ': ' + m[2]); else out[out.length - 1].detail.push(l.trim()); } else out.push({ text: l.trim(), detail: [], ...where(l, names) }); } return out; }
