// Loads src/data/roadmaps.yml (PRD Section 21): the Career Roadmaps page data.
import { load as loadYaml } from 'js-yaml';
import raw from '../data/roadmaps.yml?raw';

export interface Keyed {
  key: string;
  title: string;
}

export interface Role {
  slug: string;
  title: string;
  family: string;
  what: string;
  subjects: string[];
  subjects_note: string;
  degrees: string;
  exams: string[];
  exams_note: string;
  routes: string;
  phase1: string;
  phase2: string;
  phase3: string;
  project: string;
  source: string;
}

export interface Roadmaps {
  credit: string;
  compiled_by: string;
  compiled: string;
  source_url: string;
  families: Keyed[];
  subjects: Keyed[];
  exams: Keyed[];
  roles: Role[];
}

export const roadmaps = loadYaml(raw) as Roadmaps;

// Sanity checks so a typo in the data file fails the build with a plain message.
{
  const fam = new Set(roadmaps.families.map((f) => f.key));
  const sub = new Set(roadmaps.subjects.map((s) => s.key));
  const ex = new Set(roadmaps.exams.map((e) => e.key));
  const seen = new Set<string>();
  for (const r of roadmaps.roles) {
    if (seen.has(r.slug)) throw new Error(`roadmaps.yml: the role slug "${r.slug}" appears twice.`);
    seen.add(r.slug);
    if (!fam.has(r.family)) throw new Error(`roadmaps.yml: role "${r.title}" has family "${r.family}", which is not in the families list.`);
    for (const s of r.subjects) if (!sub.has(s)) throw new Error(`roadmaps.yml: role "${r.title}" has subject "${s}", which is not in the subjects list.`);
    for (const e of r.exams) if (!ex.has(e)) throw new Error(`roadmaps.yml: role "${r.title}" has exam "${e}", which is not in the exams list.`);
  }
}

export const familyByKey = Object.fromEntries(roadmaps.families.map((f) => [f.key, f])) as Record<string, Keyed>;
export const subjectByKey = Object.fromEntries(roadmaps.subjects.map((s) => [s.key, s])) as Record<string, Keyed>;
export const examByKey = Object.fromEntries(roadmaps.exams.map((e) => [e.key, e])) as Record<string, Keyed>;
