import type { Locale } from '@/types/content';

export type TeamGroupKey = 'Leadership' | 'Advisors' | 'Administration' | 'Marketing';

export interface TeamMember {
  name: string;
  role: Record<Locale, string>;
  image: string;
  group: TeamGroupKey;
}

export const teamGroupOrder: TeamGroupKey[] = ['Leadership', 'Advisors', 'Administration', 'Marketing'];

export const agencyTeamMembers: TeamMember[] = [
  {
    name: 'Adam SAIGHI',
    role: { en: 'CEO', fr: 'CEO', ar: 'الرئيس التنفيذي' },
    image: '/team/adam-saighi.png',
    group: 'Leadership',
  },
  {
    name: 'Mohamed DIH',
    role: { en: 'Investment Advisor', fr: 'Conseiller en investissement', ar: 'مستشار استثمار' },
    image: '/team/mohamed-dih.png',
    group: 'Advisors',
  },
  {
    name: 'Mouna BAHEJ',
    role: { en: 'Investment Advisor', fr: 'Conseillere en investissement', ar: 'مستشارة استثمار' },
    image: '/team/mouna-bahej.png',
    group: 'Advisors',
  },
  {
    name: 'Illiasse ABOUDOU',
    role: { en: 'Investment Advisor', fr: 'Conseiller en investissement', ar: 'مستشار استثمار' },
    image: '/team/illiasse-aboudou.png',
    group: 'Advisors',
  },
  {
    name: 'Mathias',
    role: { en: 'Investment Advisor', fr: 'Conseiller en investissement', ar: 'مستشار استثمار' },
    image: '/team/mathias.png',
    group: 'Advisors',
  },
  {
    name: 'Sofiane AMERI',
    role: { en: 'Investment Advisor', fr: 'Conseiller en investissement', ar: 'مستشار استثمار' },
    image: '/team/sofiane-ameri.png',
    group: 'Advisors',
  },
  {
    name: 'Dalal BOUCHRIKA',
    role: { en: 'Investment Advisor', fr: 'Conseillere en investissement', ar: 'مستشارة استثمار' },
    image: '/team/dalal-bouchrika.png',
    group: 'Advisors',
  },
  {
    name: 'Rania NASRALI',
    role: { en: 'Investment Advisor', fr: 'Conseillere en investissement', ar: 'مستشارة استثمار' },
    image: '/team/rania-nasrali.png',
    group: 'Advisors',
  },
  {
    name: 'Ibtissam',
    role: { en: 'Investment Advisor', fr: 'Conseillere en investissement', ar: 'مستشارة استثمار' },
    image: '/team/ibtissam.png',
    group: 'Advisors',
  },
  {
    name: 'Oumaima FETTOUCHI',
    role: { en: 'Investment Advisor', fr: 'Conseillere en investissement', ar: 'مستشارة استثمار' },
    image: '/team/oumaima-fettouchi.png',
    group: 'Advisors',
  },
  {
    name: 'Maroua Sofian',
    role: { en: 'Investment Advisor', fr: 'Conseillere en investissement', ar: 'مستشارة استثمار' },
    image: '/team/maroua-sofian.png',
    group: 'Advisors',
  },
  {
    name: 'Yasmina GHLAM',
    role: { en: 'Human Resources Manager', fr: 'Responsable des ressources humaines', ar: 'مديرة الموارد البشرية' },
    image: '/team/yasmina-ghlam.png',
    group: 'Administration',
  },
  {
    name: 'Hakim ESSAAIDI',
    role: { en: 'Marketing and Communication Director', fr: 'Directeur Marketing et Communication', ar: 'مدير التسويق والتواصل' },
    image: '/team/hakim-essaaidi.png',
    group: 'Marketing',
  },
  {
    name: 'Abderrahim MEZIANI',
    role: { en: 'Audiovisual Specialist', fr: 'Charge de l\'audiovisuel', ar: 'مسؤول المحتوى المرئي' },
    image: '/team/abderrahim-meziani.png',
    group: 'Marketing',
  },
  {
    name: 'Kimberly MAURENCE',
    role: { en: 'Community Manager', fr: 'Community Manager', ar: 'مديرة المجتمع' },
    image: '/team/kimberly-maurence.png',
    group: 'Marketing',
  },
];