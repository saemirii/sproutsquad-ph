import { AcademyModule } from '../types';

/** A small taxonomy grouping the 8 existing modules by their
 * already-established topic (from their real titles/taglines) — not new
 * educational content, just a lens for showing "which business skills am I
 * actually getting better at" over ground the curriculum already covers. */
export interface AcademySkill {
  id: string;
  name: string;
  icon: string;
  moduleIds: string[];
}

export const ACADEMY_SKILLS: AcademySkill[] = [
  { id: 'ideation', name: 'Ideation & Market Fit', icon: 'level-sprout', moduleIds: ['module-1'] },
  { id: 'setup', name: 'Business Setup', icon: 'level-grower', moduleIds: ['module-2'] },
  { id: 'finance', name: 'Financial Literacy', icon: 'sellerOS-profit', moduleIds: ['module-3', 'module-6', 'module-7'] },
  { id: 'branding', name: 'Branding', icon: 'level-bud', moduleIds: ['module-4'] },
  { id: 'marketing', name: 'Marketing & Sales', icon: 'level-bloom', moduleIds: ['module-5'] },
  { id: 'funding', name: 'Funding', icon: 'level-grove', moduleIds: ['module-8'] },
];

export interface SkillMastery {
  id: string;
  name: string;
  icon: string;
  /** 0-100, rounded. */
  percent: number;
}

/** % = (completed lessons + completed checkpoints across the skill's
 * modules) / (total lessons + checkpoints across those modules). Purely
 * derived from progress data that already exists — no new tracking. */
export function getSkillMastery(
  modules: AcademyModule[],
  completedLessonIds: string[],
  completedChallengeIds: string[]
): SkillMastery[] {
  return ACADEMY_SKILLS.map((skill) => {
    const skillModules = modules.filter((m) => skill.moduleIds.includes(m.id));
    let total = 0;
    let done = 0;
    skillModules.forEach((m) => {
      total += m.lessonIds.length + 1; // +1 for the module's checkpoint
      done += m.lessonIds.filter((id) => completedLessonIds.includes(id)).length;
      if (completedChallengeIds.includes(m.checkpointId)) done += 1;
    });
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { id: skill.id, name: skill.name, icon: skill.icon, percent };
  });
}
