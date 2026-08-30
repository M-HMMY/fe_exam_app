import type { QuestionA, QuestionB } from '../../types';
import { aTech1 } from './a-tech1';
import { aTech2 } from './a-tech2';
import { aMgmt } from './a-mgmt';
import { extTech1 } from './ext-tech1';
import { extTech2 } from './ext-tech2';
import { extMgmt } from './ext-mgmt';
import { poolBasicAlgo } from './pool-basic-algo';
import { poolHwSysSw } from './pool-hw-sys-sw';
import { poolDbNw } from './pool-db-nw';
import { poolSecDevUi } from './pool-sec-dev-ui';
import { poolMgmt } from './pool-mgmt';
import { poolStrategy } from './pool-strategy';
import { pastA20232024 } from './past-a-2023-2024';
import { pastASample1 } from './past-a-sample1';
import { pastASample2 } from './past-a-sample2';
import { pastA20252026 } from './past-a-2025-2026';
import { QUESTIONS_B as baseB } from './subjectB';
import { QUESTIONS_B2 } from './subjectB2';
import { QUESTIONS_B3 } from './subjectB3';
import { QUESTIONS_B4 } from './subjectB4';
import { QUESTIONS_B5 } from './subjectB5';
import { pastBSample } from './past-b-sample';
import { pastBKoukai } from './past-b-koukai';

export const QUESTIONS_A: QuestionA[] = [
  ...aTech1,
  ...aTech2,
  ...aMgmt,
  ...extTech1,
  ...extTech2,
  ...extMgmt,
  ...poolBasicAlgo,
  ...poolHwSysSw,
  ...poolDbNw,
  ...poolSecDevUi,
  ...poolMgmt,
  ...poolStrategy,
  ...pastA20232024,
  ...pastASample1,
  ...pastASample2,
  ...pastA20252026,
];

export const QUESTIONS_B: QuestionB[] = [
  ...baseB,
  ...QUESTIONS_B2,
  ...QUESTIONS_B3,
  ...QUESTIONS_B4,
  ...QUESTIONS_B5,
  ...pastBSample,
  ...pastBKoukai,
];

export const questionBById = (id: string): QuestionB | undefined => QUESTIONS_B.find((q) => q.id === id);

export const questionAById = (id: string): QuestionA | undefined => QUESTIONS_A.find((q) => q.id === id);

export const questionsOfCategory = (categoryId: string): QuestionA[] =>
  QUESTIONS_A.filter((q) => q.categoryId === categoryId);

export const questionsOfSection = (sectionId: string): QuestionA[] =>
  QUESTIONS_A.filter((q) => q.sectionId === sectionId);
