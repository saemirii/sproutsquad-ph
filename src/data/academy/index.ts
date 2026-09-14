import { AcademyModule, Lesson, Challenge } from '../../types';
import { module1, module1Lessons, module1Checkpoint } from './module1';
import { module2, module2Lessons, module2Checkpoint } from './module2';
import { module3, module3Lessons, module3Checkpoint } from './module3';
import { module4, module4Lessons, module4Checkpoint } from './module4';
import { module5, module5Lessons, module5Checkpoint } from './module5';
import { module6, module6Lessons, module6Checkpoint } from './module6';
import { module7, module7Lessons, module7Checkpoint } from './module7';
import { module8, module8Lessons, module8Checkpoint } from './module8';
import { finalChallenge } from './finalChallenge';
import { practiceSimulations } from '../simulationScenarios';

export const ACADEMY_MODULES: AcademyModule[] = [
  module1,
  module2,
  module3,
  module4,
  module5,
  module6,
  module7,
  module8,
].sort((a, b) => a.number - b.number);

export const ALL_LESSONS: Lesson[] = [
  ...module1Lessons,
  ...module2Lessons,
  ...module3Lessons,
  ...module4Lessons,
  ...module5Lessons,
  ...module6Lessons,
  ...module7Lessons,
  ...module8Lessons,
];

/** Every module checkpoint — NOT including the final Business Challenge,
 * which is tracked separately (see finalChallenge.ts once authored). */
export const MODULE_CHECKPOINTS: Challenge[] = [
  module1Checkpoint,
  module2Checkpoint,
  module3Checkpoint,
  module4Checkpoint,
  module5Checkpoint,
  module6Checkpoint,
  module7Checkpoint,
  module8Checkpoint,
];

/** Optional, always-available practice sandboxes — not gated, not tied to
 * any module's progression. */
export const PRACTICE_CHALLENGES: Challenge[] = practiceSimulations;

/** The capstone — unlocked once every module checkpoint is complete. */
export { finalChallenge };

export const ALL_CHALLENGES: Challenge[] = [...MODULE_CHECKPOINTS, ...PRACTICE_CHALLENGES, finalChallenge];

export const getModuleById = (id: string): AcademyModule | undefined => ACADEMY_MODULES.find((m) => m.id === id);
export const getLessonById = (id: string): Lesson | undefined => ALL_LESSONS.find((l) => l.id === id);
export const getChallengeById = (id: string): Challenge | undefined => ALL_CHALLENGES.find((c) => c.id === id);
export const getLessonsForModule = (moduleId: string): Lesson[] => ALL_LESSONS.filter((l) => l.moduleId === moduleId);
export const getCheckpointForModule = (moduleId: string): Challenge | undefined =>
  MODULE_CHECKPOINTS.find((c) => c.moduleId === moduleId);
