#!/usr/bin/env node
// Fundament MCP-Server (stdio, JSON-RPC 2.0, ohne SDK). Liest nur generated/contracts.json; "check" ruft dieselbe Prüfung wie die CLI.
// Eintrag für Claude Code (.mcp.json):  { "mcpServers": { "fundament": { "command": "node", "args": ["mcp/server.mjs"] } } }
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { check, lint } from '../cli/fundament.mjs';

const C = () => JSON.parse(readFileSync(new URL('../generated/contracts.json', import.meta.url), 'utf8'));
const md = (name) => readFileSync(new URL(`../generated/components/${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}.md`, import.meta.url), 'utf8');
const TOOLS = [
  { name: 'list_components', description: 'Alle Komponenten des Designsystems mit Element, Status und Zweck. Zuerst aufrufen.', inputSchema: { type: 'object', properties: {} } },
  { name: 'get_component', description: 'Vertrag einer Komponente: Attribute mit erlaubten Werten, Slots, Regeln mit Begründung, Barrierefreiheit, erlaubte Farb-Tokens, dazu die Doku.', inputSchema: { type: 'object', properties: { name: { type: 'string', description: 'Name wie in list_components, z. B. Button' } }, required: ['name'] } },
  { name: 'list_tokens', description: 'Alle Tokens mit Beschreibung (Einsatz und Grenzen). Optional nach Gruppe filtern: color, space, radius, border-width, size, text.', inputSchema: { type: 'object', properties: { group: { type: 'string' } } } },
  { name: 'get_principles', description: 'Grundsätze und zugesagte Kontrastpaare. Für Entscheidungen, die kein Check trifft.', inputSchema: { type: 'object', properties: {} } },
  { name: 'check', description: 'Prüft HTML oder CSS gegen Verträge, Regeln und Grundsätze. Liefert Befunde mit Behebung. Nach jeder Änderung erneut aufrufen, bis ok true ist.', inputSchema: { type: 'object', properties: { code: { type: 'string', description: 'Vollständiger Dateiinhalt' }, kind: { type: 'string', enum: ['html', 'css'], description: 'Standard: html' } }, required: ['code'] } },
];
function call(name, args = {}) {
  const c = C();
  if (name === 'list_components') return Object.entries(c.components).map(([n, k]) => ({ name: n, element: `<${k.element}>`, kind: k.kind, status: k.status, purpose: k.purpose, ...(k.deprecated ? { use: k.deprecated.use } : {}) }));
  if (name === 'get_component') { const k = c.components[args.name]; if (!k) throw new Error(`Komponente „${args.name}“ gibt es nicht. Vorhanden: ${Object.keys(c.components).join(', ')}`); return { name: args.name, element: `<${k.element}>`, status: k.status, version: k.version, purpose: k.purpose, attributes: k.attrs, passthrough: k.passthrough, slots: k.slotNames, rules: k.rules, a11y: k.a11y, colorTokens: k.colorTokens, deprecated: k.deprecated, doc: md(args.name) }; }
  if (name === 'list_tokens') return Object.entries(c.tokenDescriptions).filter(([t]) => !args.group || t.startsWith(`--${c.cssPrefix}-${args.group}-`)).map(([token, why]) => ({ token, use: `var(${token})`, why }));
  if (name === 'get_principles') return { principles: c.principles, design: readFileSync(new URL('../DESIGN.md', import.meta.url), 'utf8'), contrast: JSON.parse(readFileSync(new URL('../generated/contrast.json', import.meta.url), 'utf8')).pairs };
  if (name === 'check') { const dir = mkdtempSync(join(tmpdir(), 'fundament-')); const file = join(dir, `eingabe.${args.kind === 'css' ? 'css' : 'html'}`); try { writeFileSync(file, String(args.code ?? '')); const findings = check([file], c).map(({ file: _f, ...x }) => x); return { ok: !findings.length, findings }; } finally { rmSync(dir, { recursive: true, force: true }); } }
  throw new Error(`Unbekanntes Tool: ${name}`);
}
function handle(msg) {
  const { id, method, params } = msg;
  const ok = (result) => ({ jsonrpc: '2.0', id, result });
  if (method === 'initialize') return ok({ protocolVersion: params?.protocolVersion || '2025-03-26', capabilities: { tools: {} }, serverInfo: { name: 'fundament', version: C().version }, instructions: 'Erst list_components, dann get_component für alles, was du verwendest. Nach dem Schreiben check aufrufen und Befunde beheben, höchstens drei Runden. Fehlt etwas, die Lücke melden statt nachzubauen.' });
  if (method === 'ping') return ok({});
  if (method === 'tools/list') return ok({ tools: TOOLS });
  if (method === 'tools/call') { try { return ok({ content: [{ type: 'text', text: JSON.stringify(call(params.name, params.arguments), null, 2) }] }); } catch (e) { return ok({ content: [{ type: 'text', text: e.message }], isError: true }); } }
  if (id === undefined) return null; // Benachrichtigungen
  return { jsonrpc: '2.0', id, error: { code: -32601, message: `Methode ${method} gibt es nicht` } };
}
let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (!line) continue; let res; try { res = handle(JSON.parse(line)); } catch (e) { res = { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Ungültiges JSON' } }; } if (res) process.stdout.write(JSON.stringify(res) + '\n'); } });
