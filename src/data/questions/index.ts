import type { QuestionA, QuestionB } from '../../types';
import { aTech1 } from './a-tech1';
import { aTech2 } from './a-tech2';
import { aMgmt } from './a-mgmt';
import { extTech1 } from './ext-tech1';
import { extTech2 } from './ext-tech2';
import { extMgmt } from './ext-mgmt';
import { QUESTIONS_B as baseB } from './subjectB';
import { QUESTIONS_B2 } from './subjectB2';
import { QUESTIONS_B3 } from './subjectB3';
import { QUESTIONS_B4 } from './subjectB4';

export const QUESTIONS_A: QuestionA[] = [
  ...aTech1,
  ...aTech2,
  ...aMgmt,
  ...extTech1,
  ...extTech2,
  ...extMgmt,
];

export const QUESTIONS_B: QuestionB[] = [...baseB, ...QUESTIONS_B2, ...QUESTIONS_B3, ...QUESTIONS_B4];

export const questionBById = (id: string): QuestionB | undefined => QUESTIONS_B.find((q) => q.id === id);

export const questionAById = (id: string): QuestionA | undefined => QUESTIONS_A.find((q) => q.id === id);

export const questionsOfCategory = (categoryId: string): QuestionA[] =>
  QUESTIONS_A.filter((q) => q.categoryId === categoryId);

export const questionsOfSection = (sectionId: string): QuestionA[] =>
  QUESTIONS_A.filter((q) => q.sectionId === sectionId);
