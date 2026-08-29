import type { TextbookSection } from '../../types';
import { tBasic } from './t-basic';
import { tAlgo } from './t-algo';
import { tHw } from './t-hw';
import { tSys } from './t-sys';
import { tSw } from './t-sw';
import { tDb } from './t-db';
import { tNw } from './t-nw';
import { tSec } from './t-sec';
import { tDev } from './t-dev';
import { tUi } from './t-ui';
import { management } from './management';
import { strategy } from './strategy';

/** 教本の全セクション。CATEGORIES の並び順に対応させている */
export const SECTIONS: TextbookSection[] = [
  ...tBasic,
  ...tAlgo,
  ...tHw,
  ...tSys,
  ...tSw,
  ...tDb,
  ...tNw,
  ...tSec,
  ...tDev,
  ...tUi,
  ...management,
  ...strategy,
];

export const sectionById = (id: string): TextbookSection | undefined => SECTIONS.find((s) => s.id === id);

export const sectionsOfCategory = (categoryId: string): TextbookSection[] =>
  SECTIONS.filter((s) => s.categoryId === categoryId);

export const totalMinutes = SECTIONS.reduce((sum, s) => sum + s.minutes, 0);
