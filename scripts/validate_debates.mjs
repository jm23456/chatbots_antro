#!/usr/bin/env node
// Structural validator for src/debate_text/debate1_<ling>_<role>.json
// Checks each file is internally coherent, and that each <ling> pair is
// structurally identical so linguistic style is the only thing that varies.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = "src/debate_text";
const LINGS = ["firstperson", "passive"];
const ROLES = ["watch", "steer", "party"];
const KINDS = new Set(["intro", "intro-arguments", "segment", "summary"]);

let errors = 0, warnings = 0;
const err = (f, m) => { errors++; console.log(`  ERROR  ${f}: ${m}`); };
const warn = (f, m) => { warnings++; console.log(`  warn   ${f}: ${m}`); };

const load = (name) => {
  const p = join(DIR, name);
  try { return JSON.parse(readFileSync(p, "utf8")); }
  catch (e) { err(name, `unreadable/invalid JSON — ${e.message}`); return null; }
};

// ---- per-file checks -------------------------------------------------------
function checkFile(name, d, expLing, expRole) {
  const levels = { watch: "watching", steer: "steering", party: "participating" };

  // Filename segment vs the value written inside condition (existing convention differs).
  const styleValue = { firstperson: "first_person", passive: "passive" }[expLing];
  if (d.condition?.linguistic_style !== styleValue)
    err(name, `condition.linguistic_style is "${d.condition?.linguistic_style}", expected "${styleValue}"`);
  if (d.condition?.interaction_level !== levels[expRole])
    err(name, `condition.interaction_level is "${d.condition?.interaction_level}", expected "${levels[expRole]}"`);
  if (d.language !== "de") warn(name, `language is "${d.language}", expected "de"`);
  for (const f of ["title", "subtitle", "introduction", "start_node", "roles", "nodes"])
    if (d[f] === undefined) err(name, `missing top-level field "${f}"`);

  const nodes = d.nodes ?? {};
  const roles = d.roles ?? {};
  if (!nodes[d.start_node]) err(name, `start_node "${d.start_node}" is not in nodes`);

  const uids = new Set();
  for (const [key, node] of Object.entries(nodes)) {
    if (!KINDS.has(node.kind)) err(name, `node "${key}" has unknown kind "${node.kind}"`);
    for (const u of node.utterances ?? []) {
      if (uids.has(u.uid)) err(name, `duplicate uid "${u.uid}"`);
      uids.add(u.uid);
      if (!roles[u.speaker]) err(name, `node "${key}" uid "${u.uid}" speaks as "${u.speaker}", not in roles`);
      if (!u.text || !u.text.trim()) err(name, `node "${key}" uid "${u.uid}" has empty text`);
      if (/TODO/i.test(u.text ?? "")) warn(name, `node "${key}" uid "${u.uid}" still contains TODO`);
    }
    const tr = node.transition;
    if (!tr) { err(name, `node "${key}" has no transition`); continue; }
    if (tr.type === "linear") {
      if (tr.next && !nodes[tr.next]) err(name, `node "${key}" → "${tr.next}" does not exist`);
      if (!tr.next && node.kind !== "summary") err(name, `node "${key}" is linear with no next`);
    } else if (tr.type === "choice") {
      const opts = tr.options ?? [];
      if (!opts.length) err(name, `node "${key}" is a choice with no options`);
      const ids = new Set();
      for (const o of opts) {
        if (ids.has(o.option_id)) err(name, `node "${key}" duplicate option_id "${o.option_id}"`);
        ids.add(o.option_id);
        if (!nodes[o.next]) err(name, `node "${key}" option "${o.option_id}" → "${o.next}" does not exist`);
        if (!o.label || !o.label.trim()) err(name, `node "${key}" option "${o.option_id}" has empty label`);
      }
      // WATCH-style files auto-pick a default; interactive ones show buttons.
      if (expRole === "watch" && !opts.some(o => o.default_option))
        warn(name, `node "${key}" is a choice in a watch file with no default_option`);
      if (expRole === "party" && !opts.every(o => o.speak_as_user))
        warn(name, `node "${key}": not all options have speak_as_user in a participating file`);
      if (expRole === "steer" && opts.some(o => o.speak_as_user))
        warn(name, `node "${key}": options have speak_as_user in a steering file`);
    } else if (tr.type !== "end") {
      err(name, `node "${key}" has unknown transition type "${tr.type}"`);
    }
  }

  // every node reachable from start_node, and summary reachable
  const seen = new Set();
  const walk = (k) => {
    if (!k || seen.has(k) || !nodes[k]) return;
    seen.add(k);
    const tr = nodes[k].transition ?? {};
    if (tr.type === "linear") walk(tr.next);
    if (tr.type === "choice") (tr.options ?? []).forEach(o => walk(o.next));
  };
  walk(d.start_node);
  for (const k of Object.keys(nodes))
    if (!seen.has(k)) err(name, `node "${k}" is unreachable from start_node`);
  if (!Object.values(nodes).some(n => n.kind === "summary"))
    err(name, `no node of kind "summary"`);
}

// ---- twin comparison ------------------------------------------------------
function skeleton(d) {
  const nodes = {};
  for (const [k, n] of Object.entries(d.nodes ?? {})) {
    nodes[k] = {
      kind: n.kind, round: n.round,
      utterances: (n.utterances ?? []).map(u => ({
        uid: u.uid, speaker: u.speaker, speak_as_user: !!u.speak_as_user,
      })),
      transition: n.transition?.type === "choice"
        ? { type: "choice", options: (n.transition.options ?? []).map(o => ({
            option_id: o.option_id, next: o.next,
            speak_as_user: !!o.speak_as_user, default_option: !!o.default_option })) }
        : { type: n.transition?.type, next: n.transition?.next },
    };
  }
  return { start_node: d.start_node, roles: Object.keys(d.roles ?? {}).sort(), nodes };
}

function compareTwins(role, files) {
  const [a, b] = LINGS.map(l => files[`${l}_${role}`]);
  if (!a || !b) return;
  const sa = JSON.stringify(skeleton(a.data), null, 1);
  const sb = JSON.stringify(skeleton(b.data), null, 1);
  if (sa === sb) { console.log(`  ok     ${role}: firstperson and passive are structurally identical`); return; }
  errors++;
  console.log(`  ERROR  ${role}: firstperson and passive DIFFER structurally`);
  const la = sa.split("\n"), lb = sb.split("\n");
  let shown = 0;
  for (let i = 0; i < Math.max(la.length, lb.length) && shown < 12; i++) {
    if (la[i] !== lb[i]) { console.log(`           firstperson: ${la[i] ?? "(none)"}`);
                           console.log(`           passive:     ${lb[i] ?? "(none)"}`); shown++; }
  }
}

// ---- run ------------------------------------------------------------------
console.log(`\nValidating ${DIR}\n`);
const present = new Set(readdirSync(DIR));
const files = {};

for (const ling of LINGS) for (const role of ROLES) {
  const name = `debate1_${ling}_${role}.json`;
  if (!present.has(name)) { err(name, `MISSING — ling=${ling} role=${role.toUpperCase()} will show "Debatte nicht gefunden"`); continue; }
  const data = load(name);
  if (!data) continue;
  files[`${ling}_${role}`] = { name, data };
  console.log(`${name}`);
  checkFile(name, data, ling, role);
}

console.log(`\nTwin structure (style must be the only difference)\n`);
ROLES.forEach(r => compareTwins(r, files));

console.log(`\n${errors} error(s), ${warnings} warning(s)\n`);
process.exit(errors ? 1 : 0);
