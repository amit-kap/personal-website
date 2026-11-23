/* Sample data for the Shift Vendors page. The first 13 rows are read off the
   reference screenshot (02-inventory-vendors-page); the other 7 are made up to
   fill the page. Presentation-only. */

import { assessments, calendar } from './dashboard'

export type Tone = 'red' | 'orange' | 'yellow' | 'green'
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F'

export interface AccessTag {
  label: string
  tone: Tone
  more?: number
}

export interface VendorRow {
  name: string
  grade: Grade
  industry: string
  identity: string[]
  access?: AccessTag
  ai?: 'Low' | 'Medium' | 'High' | 'Critical'
  governance?: string
  procurement?: string
}

export const vendors: VendorRow[] = [
  { name: 'HackMD', grade: 'F', industry: 'Collaboration & Productivity', identity: ['Google'], access: { label: 'Customer Data', tone: 'yellow', more: 2 } },
  { name: 'MobiloCard', grade: 'F', industry: 'Identity & Contact Management', identity: ['Okta'], access: { label: 'Employee PII', tone: 'orange', more: 2 }, governance: 'Pending', procurement: 'Pending' },
  { name: 'Demandbase', grade: 'F', industry: 'B2B Marketing & Sales Intelligence', identity: ['Salesforce'], access: { label: 'Customer Data', tone: 'yellow', more: 2 }, ai: 'Medium', governance: 'Added', procurement: 'Active' },
  { name: 'Trimbox', grade: 'D', industry: 'Email Management', identity: ['Google'], access: { label: 'Customer Data', tone: 'yellow', more: 4 }, ai: 'Low' },
  { name: 'GitHub', grade: 'C', industry: 'Developer Tools', identity: ['Entra'], access: { label: 'Source Code', tone: 'red', more: 1 }, ai: 'High', governance: 'Accepted', procurement: 'Active' },
  { name: 'Hertz', grade: 'C', industry: 'Leisure, Travel & Tourism', identity: [], ai: 'Low' },
  { name: 'IBM', grade: 'C', industry: 'Information Technology & Services', identity: [], ai: 'High', governance: 'Added' },
  { name: 'Gainsight', grade: 'C', industry: 'Customer Success Software', identity: [], ai: 'Medium' },
  { name: 'Slack', grade: 'C', industry: 'Collaboration & Productivity', identity: ['Okta'], access: { label: 'Employee PII', tone: 'orange', more: 3 }, ai: 'Medium', governance: 'Added', procurement: 'Active' },
  { name: 'Notion', grade: 'C', industry: 'Collaboration & Productivity', identity: ['Google'], access: { label: 'Customer Data', tone: 'yellow', more: 2 }, ai: 'High', governance: 'Pending' },
  { name: 'Databricks', grade: 'B', industry: 'Data & AI Platform', identity: ['Snowflake', 'Google', 'Salesforce', 'AWS'], access: { label: 'Administrator', tone: 'red', more: 7 }, ai: 'High', governance: 'Pending' },
  { name: 'Anodot', grade: 'B', industry: 'AI & Analytics', identity: ['AWS'], access: { label: 'Administrator', tone: 'red', more: 4 }, ai: 'High', governance: 'Pending' },
  { name: 'Talend', grade: 'B', industry: 'Data Integration', identity: ['Okta', 'Entra'], access: { label: 'Administrator', tone: 'red', more: 3 }, ai: 'Low' },
  { name: 'Dara Pharmaceutical Equipment', grade: 'B', industry: 'machinery', identity: ['Entra'], access: { label: 'Non-Sensitive Data', tone: 'green' }, ai: 'Low', governance: 'Added', procurement: 'Active' },
  { name: 'Iron Mountain', grade: 'B', industry: 'Information Management & Storage', identity: ['Entra', 'AWS'], access: { label: 'Non-Sensitive Data', tone: 'green' }, ai: 'Low', governance: 'Added', procurement: 'Active' },
  { name: 'Zoom', grade: 'B', industry: 'Video Communications', identity: ['Okta'], access: { label: 'Customer Data', tone: 'yellow', more: 1 }, ai: 'Low', governance: 'Added', procurement: 'Active' },
  { name: 'Figma', grade: 'B', industry: 'Design Software', identity: ['Google'], access: { label: 'Customer Data', tone: 'yellow', more: 1 }, ai: 'Medium', governance: 'Added', procurement: 'Active' },
  { name: 'Atlassian', grade: 'B', industry: 'Developer Tools', identity: ['Entra', 'Okta'], access: { label: 'Source Code', tone: 'red', more: 2 }, ai: 'High', governance: 'Accepted', procurement: 'Active' },
  { name: 'Stripe', grade: 'A', industry: 'Payments & Financial Services', identity: ['Okta'], access: { label: 'Financial Data', tone: 'orange', more: 2 }, ai: 'Low', governance: 'Accepted', procurement: 'Active' },
  { name: 'Datadog', grade: 'A', industry: 'Monitoring & Observability', identity: ['AWS', 'Okta'], access: { label: 'Non-Sensitive Data', tone: 'green' }, ai: 'Low', governance: 'Added', procurement: 'Active' },
]

/* The list is a window onto a longer one: the page count and total are mock,
   only the first page has rows. */
export const PAGE_SIZE = 20
export const TOTAL_ROWS = 94

/* The four summary cards. Totals are 17 in the screenshot. */
export const unmanaged = {
  total: 17,
  parts: [
    { label: 'Critical Data', value: 9, color: 'var(--s-critical)' },
    { label: 'Sensitive Data', value: 8, color: 'var(--s-high)' },
    { label: 'General Data', value: 0, color: 'var(--s-low)' },
  ],
}

export const riskDistribution = [
  { grade: 'A', value: 5, color: 'var(--s-low)' },
  { grade: 'B', value: 6, color: 'var(--s-moderate)' },
  { grade: 'C', value: 4, color: 'var(--s-elevated)' },
  { grade: 'D', value: 1, color: 'var(--s-high)' },
  { grade: 'F', value: 3, color: 'var(--s-critical)' },
]

export const aiExposure = {
  total: 17,
  /* In ring order, clockwise. */
  parts: [
    { label: 'High', value: 5, color: 'var(--s-high)' },
    { label: 'Critical', value: 1, color: 'var(--s-critical)' },
    { label: 'Low', value: 9, color: 'var(--s-low)' },
    { label: 'Medium', value: 2, color: 'var(--s-elevated)' },
  ],
  /* Pills read in severity order. */
  pills: ['Critical', 'High', 'Medium', 'Low'],
}

export const identitySources = [
  { label: 'Entra', value: 8 },
  { label: 'Google', value: 4 },
  { label: 'Salesforce', value: 3 },
  { label: 'AWS', value: 3 },
  { label: 'Okta', value: 3 },
]

/* What the agent would say about a vendor on hover: one line of state and the
   things that need a person. Built from the row and from the dashboard's
   assessment and calendar data, so the two pages agree. */
export interface VendorBrief {
  summary: string
  items: { label: string; when?: string }[]
  /* Something is due or unowned: the row gets a marker. */
  urgent: boolean
}

export function vendorBrief(v: VendorRow): VendorBrief {
  const a = assessments.find((x) => x.vendor === v.name)
  const event = calendar.events.find((e) => e.vendor === v.name)
  const items: VendorBrief['items'] = []
  if (event) items.push({ label: event.label, when: `Jun ${event.day}` })
  if (a?.needsYou) items.push({ label: 'Vendor reply waiting for review', when: 'Now' })
  const ungoverned = !!v.access && !v.governance
  if (ungoverned) items.push({ label: 'No governance status yet' })
  if (v.access?.label === 'Administrator') items.push({ label: `Administrator access, ${v.access.more} more` })
  if (v.ai === 'High' || v.ai === 'Critical') items.push({ label: `${v.ai} AI exposure` })

  let summary = 'Monitoring. Nothing needs you right now.'
  if (a?.stage === 'Reply received') summary = 'Reply #2 is in: 20 new answers and 5 attachments. Ready for your review.'
  else if (a?.stage === 'Awaiting vendor') summary = `Waiting on the vendor: ${a.answered} of ${a.total} questions answered.`
  else if (a?.stage === 'Agent working') summary = `Preparing the assessment: ${a.answered} of ${a.total} questions drafted.`
  else if (ungoverned) summary = 'In use with data access, but nobody has taken it through governance.'
  else if (v.ai === 'High') summary = 'Watching its AI features: exposure is High.'

  return { summary, items, urgent: !!event || !!a?.needsYou || ungoverned }
}
