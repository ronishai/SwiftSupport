import type { TeamId } from '../types/ticket.types';

export type LangLabels = {
  en: string;
  he: string;
};

export interface CategoryOption {
  id: string;
  label: LangLabels;
  teams: TeamId[];
}

export interface TeamOption {
  id: string;
  label: LangLabels;
}

export const DEFAULT_TEAMS: TeamOption[] = [
  { id: 'PC', label: { en: 'PC team', he: 'צוות PC' } },
  { id: 'Network', label: { en: 'Network team', he: 'צוות רשת' } },
  { id: 'Tech Logistics', label: { en: 'Tech Logistics team', he: 'צוות ציוד מחשוב' } },
];

export const DEFAULT_CATEGORIES: CategoryOption[] = [
  {
    id: 'computer-connection',
    label: { en: 'Computer connection', he: 'חיבור מחשב' },
    teams: ['PC'],
  },
  {
    id: 'network-port-connection',
    label: { en: 'Network port connection', he: 'חיבור פורט רשת' },
    teams: ['Network'],
  },
  {
    id: 'unable-to-connect',
    label: {
      en: 'Unable to connect',
      he: 'לא מצליח להתחבר למחשב (נא לצרף הודעת שגיאה)',
    },
    teams: ['PC'],
  },
  {
    id: 'screen-issue',
    label: { en: 'Screen issue', he: 'בעיה במסך' },
    teams: ['Network'],
  },
  {
    id: 'website-access',
    label: { en: 'Website access', he: 'בעיה בגישה לאתרים' },
    teams: ['PC'],
  },
  {
    id: 'computer-reboot',
    label: { en: 'Computer deployment', he: 'התקנת מחשב (הפצה)' },
    teams: ['PC'],
  },
  {
    id: 'software-installation',
    label: { en: 'Software installation', he: 'התקנת תוכנה' },
    teams: ['PC'],
  },
  { id: 'phone', label: { en: 'Phone', he: 'טלפון' }, teams: ['Network'] },
  { id: 'scanner', label: { en: 'Scanner', he: 'סריקה' }, teams: ['PC'] },
  { id: 'printer', label: { en: 'Printer', he: 'מדפסת' }, teams: ['PC'] },
  {
    id: 'user-creation',
    label: { en: 'User creation', he: 'פתיחת יוזר' },
    teams: ['PC'],
  },
  {
    id: 'workstation-transfer',
    label: { en: 'Workstation transfer', he: 'בקשה להעברת עמדות' },
    teams: ['Network'],
  },
  {
    id: 'hardware-issue',
    label: { en: 'Hardware issue', he: 'בעיית חומרה' },
    teams: ['PC'],
  },
  { id: 'email', label: { en: 'Email issue', he: 'מייל' }, teams: ['PC'] },
  {
    id: 'local-admin-request',
    label: { en: 'Local admin request', he: 'בקשה לאדמין מקומי' },
    teams: ['PC'],
  },
  {
    id: 'product-request',
    label: { en: 'Product request', he: 'בקשת משיכת ציוד' },
    teams: ['Tech Logistics'],
  },
  { id: 'other', label: { en: 'Other', he: 'אחר' }, teams: ['Network'] },
];

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  DEFAULT_CATEGORIES.map((item) => [item.id, item.label.en]),
);

export const CATEGORY_LABELS_HE: Record<string, string> = Object.fromEntries(
  DEFAULT_CATEGORIES.map((item) => [item.id, item.label.he]),
);

export const TEAM_LABELS: Record<string, string> = Object.fromEntries(
  DEFAULT_TEAMS.map((item) => [item.id, item.label.en]),
);

export const TEAM_LABELS_HE: Record<string, string> = Object.fromEntries(
  DEFAULT_TEAMS.map((item) => [item.id, item.label.he]),
);

export const DEFAULT_CATEGORY_RESPONSIBLE_TEAMS: Record<string, string[]> =
  Object.fromEntries(DEFAULT_CATEGORIES.map((item) => [item.id, item.teams]));

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  'in-progress': 'In Progress',
  pending: 'Pending',
  closed: 'Closed',
};

export interface AppSettings {
  categories: CategoryOption[];
  teams: TeamOption[];
  categoryResponsibleTeams: Record<string, string[]>;
}
