import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'yaml';

export type CareLevel = 'ER' | 'URGENT' | 'PRIMARY' | 'SELFCARE';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Intake = {
  isPregnant?: boolean;
  vitals?: { spo2?: number };
  symptoms?: string[];
};

type Rule = {
  id: string;
  action: CareLevel;
  reason: string;
  when: any;
};

const has = (hay: string[], needle: string) => hay.some(s => s.includes(needle.toLowerCase()));
const any = (hay: string[], needles: string[]) => needles.some(n => has(hay, n.toLowerCase()));

function evalNode(node: any, ctx: { symptomsLow: string[]; textLow: string; intake: Intake }) {
  if (!node) return true;
  if (node.all) return node.all.every((n: any) => evalNode(n, ctx));
  if (node.any) return node.any.some((n: any) => evalNode(n, ctx));
  if (typeof node.symptom_contains === 'string') return has(ctx.symptomsLow, node.symptom_contains.toLowerCase());
  if (Array.isArray(node.symptom_contains_any)) return any(ctx.symptomsLow, node.symptom_contains_any);
  if (Array.isArray(node.text_contains_any)) return node.text_contains_any.some((n: string) => ctx.textLow.includes(n.toLowerCase()));
  if (typeof node['vitals.spo2_lt'] === 'number') return (ctx.intake.vitals?.spo2 ?? 100) < node['vitals.spo2_lt'];
  if (typeof node.isPregnant === 'boolean') return (ctx.intake.isPregnant ?? false) === node.isPregnant;
  return false;
}

export function evaluateRedFlags(input: { message: string; intake?: Intake }) {
  const file = path.join(__dirname, 'spec', 'redflags.yaml');
  const rules = (parse(fs.readFileSync(file, 'utf8'))?.rules || []) as Rule[];
  const symptoms = (input.intake?.symptoms?.length ? input.intake.symptoms : [input.message]).filter(Boolean);
  const ctx = {
    symptomsLow: symptoms.map(s => s.toLowerCase()),
    textLow: (input.message || '').toLowerCase(),
    intake: input.intake || {}
  };
  const priority: CareLevel[] = ['SELFCARE', 'PRIMARY', 'URGENT', 'ER'];
  let worst: CareLevel | undefined;
  const ids: string[] = [];
  const reasons: string[] = [];
  
  for (const r of rules) {
    if (evalNode(r.when, ctx)) {
      ids.push(r.id);
      reasons.push(r.reason);
      if (!worst || priority.indexOf(r.action) > priority.indexOf(worst)) worst = r.action;
    }
  }
  
  return { triggered: ids.length > 0, action: worst, ruleIds: ids, reasons };
}