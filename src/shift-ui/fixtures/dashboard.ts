/* Sample data for the Shift home dashboard, read off the reference screenshot
   (01-shift-dashboard). Presentation-only: no logic lives here. */

export interface StatTileData {
  value: number
  trend: 'up' | 'down'
  label: string
  sub: string
  delta: string
  /* good = better for the user, bad = worse; colours the delta. */
  tone: 'good' | 'bad' | 'neutral'
}

export const inventoryTiles: StatTileData[] = [
  { value: 19, trend: 'up', label: 'Total Vendors', sub: 'Complete third-party inventory', delta: '+2 vs last month', tone: 'neutral' },
  { value: 4, trend: 'up', label: 'Newly Discovered', sub: 'Discovered this month', delta: '+1 vs last month', tone: 'neutral' },
  { value: 6, trend: 'up', label: 'Shadow Vendors', sub: 'Operating without approval', delta: '+2 vs last month', tone: 'bad' },
  { value: 7, trend: 'up', label: 'AI Tools', sub: 'Third-party AI services', delta: '+1 vs last month', tone: 'neutral' },
]

export const findingTiles: StatTileData[] = [
  { value: 8, trend: 'up', label: 'Open Threats', sub: 'Unresolved threat alerts', delta: '+3 vs last week', tone: 'bad' },
  { value: 6, trend: 'up', label: 'Critical Threats', sub: 'Priority third- and fourth-party threats', delta: '+2 vs last week', tone: 'bad' },
  { value: 7, trend: 'down', label: 'Open Access Paths', sub: 'Unresolved access paths', delta: '-2 vs last week', tone: 'good' },
  { value: 6, trend: 'up', label: 'Critical Access Paths', sub: 'Priority third-party access paths', delta: '+1 vs last week', tone: 'bad' },
]

export type Severity = 'critical' | 'high' | 'elevated' | 'moderate' | 'low'

/* Treemap tiles in stage px, relative to the 696×154 treemap. */
export interface TreemapTile {
  name: string
  vendors: number
  pct: number
  severity: 'critical' | 'high' | 'elevated'
  x: number
  y: number
  w: number
  h: number
}

export const treemap: TreemapTile[] = [
  { name: 'Customer PII', vendors: 6, pct: 13, severity: 'critical', x: 0, y: 0, w: 134, h: 101 },
  { name: 'Source Code', vendors: 3, pct: 7, severity: 'critical', x: 0, y: 105, w: 134, h: 49 },
  { name: 'Administrator', vendors: 4, pct: 9, severity: 'critical', x: 138, y: 0, w: 117, h: 78 },
  { name: 'Financial Data', vendors: 4, pct: 9, severity: 'high', x: 138, y: 80, w: 117, h: 74 },
  { name: 'Production', vendors: 6, pct: 13, severity: 'high', x: 259, y: 0, w: 224, h: 59 },
  { name: 'Employee PII', vendors: 9, pct: 20, severity: 'high', x: 259, y: 63, w: 224, h: 91 },
  { name: 'Sensitive Data', vendors: 9, pct: 20, severity: 'high', x: 487, y: 0, w: 133, h: 154 },
  { name: 'Customer Data', vendors: 5, pct: 11, severity: 'elevated', x: 624, y: 0, w: 72, h: 154 },
]

export const ratingTrend: { severity: Severity; label: string; prev: number; now: number }[] = [
  { severity: 'critical', label: 'Critical', prev: 0, now: 3 },
  { severity: 'high', label: 'High', prev: 1, now: 1 },
  { severity: 'elevated', label: 'Elevated', prev: 4, now: 4 },
  { severity: 'moderate', label: 'Moderate', prev: 7, now: 6 },
  { severity: 'low', label: 'Low', prev: 3, now: 5 },
]

export interface Finding {
  vendor: string
  kind: 'fourth' | 'access'
  title: string
  status: 'Open'
}

export const findings: Finding[] = [
  { vendor: 'Vercel', kind: 'fourth', title: 'Context.ai Compromise - Vercel Credential Exposure', status: 'Open' },
  { vendor: 'Snowflake', kind: 'fourth', title: 'Anodot Breach - Snowflake Token Exposure', status: 'Open' },
  { vendor: 'Brightwave Media Inc.', kind: 'access', title: 'High Risk Vendor was Granted Sensitive Access', status: 'Open' },
  { vendor: 'Trimbox', kind: 'access', title: 'Discovered High Risk Vendor With Sensitive Access', status: 'Open' },
  { vendor: 'Metaview', kind: 'access', title: 'Ungoverned AI Tool with Broad Meeting and Calendar Access', status: 'Open' },
]

/* Weekly alert volume, one value per x label. */
export const threatSeries = {
  xLabels: ['3 weeks ago', '2 weeks ago', 'Last week', 'This week'],
  ticks: [0, 6, 12, 18, 24],
  newVendors: [8.3, 10, 15.7, 22.7],
  other: [3, 4.6, 6.5, 8.3],
}

/* Assessments section. Draft content: only Trimbox's numbers (3 of 23 answered,
   reply #2 with 20 answers and 5 attachments) come from the assessment
   screenshot; the rest is placeholder to confirm. */
export const assessmentTiles: StatTileData[] = [
  { value: 6, trend: 'up', label: 'In Progress', sub: 'Assessments currently running', delta: '+2 vs last week', tone: 'neutral' },
  { value: 2, trend: 'up', label: 'Awaiting Vendor', sub: 'Inquiries sent, no reply yet', delta: '+1 vs last week', tone: 'neutral' },
  { value: 1, trend: 'up', label: 'Needs Your Decision', sub: 'Agent recommendation ready', delta: '+1 vs last week', tone: 'bad' },
  { value: 3, trend: 'down', label: 'Completed', sub: 'Decided this month', delta: '-1 vs last month', tone: 'neutral' },
]

export interface AssessmentItem {
  vendor: string
  stage: string
  answered: number
  total: number
  needsYou: boolean
}

export const assessments: AssessmentItem[] = [
  { vendor: 'Trimbox', stage: 'Reply received', answered: 3, total: 23, needsYou: true },
  { vendor: 'Brightwave Media Inc.', stage: 'Awaiting vendor', answered: 12, total: 30, needsYou: false },
  { vendor: 'Metaview', stage: 'Awaiting vendor', answered: 9, total: 18, needsYou: false },
  { vendor: 'Demandbase', stage: 'Agent working', answered: 0, total: 26, needsYou: false },
  { vendor: 'HackMD', stage: 'Agent working', answered: 0, total: 24, needsYou: false },
  { vendor: 'MobiloCard', stage: 'Agent working', answered: 0, total: 28, needsYou: false },
]

/* Calendar events: placeholder dates and vendors, to confirm. */
export interface CalendarEvent {
  day: number
  vendor: string
  label: string
  kind: 'due' | 'scheduled'
}

export const calendar = {
  year: 2026,
  month: 5, // June (0-based)
  events: [
    { day: 3, vendor: 'Brightwave Media Inc.', label: 'Vendor reply due', kind: 'due' },
    { day: 5, vendor: 'Trimbox', label: 'Follow-up inquiry due', kind: 'due' },
    { day: 9, vendor: 'Metaview', label: 'Vendor reply due', kind: 'due' },
    { day: 16, vendor: 'Demandbase', label: 'Assessment starts', kind: 'scheduled' },
    { day: 23, vendor: 'Databricks', label: 'Reassessment starts', kind: 'scheduled' },
  ] satisfies CalendarEvent[],
}
