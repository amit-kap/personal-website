/* Sample data for the Shift Vendors page, read off the reference screenshot
   (02-inventory-vendors-page). Presentation-only. The screenshot shows 13
   of "19 rows"; only those 13 are here. */

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
  { name: 'Databricks', grade: 'B', industry: 'Data & AI Platform', identity: ['Snowflake', 'Google', 'Salesforce', 'AWS'], access: { label: 'Administrator', tone: 'red', more: 7 }, ai: 'High', governance: 'Pending' },
  { name: 'Anodot', grade: 'B', industry: 'AI & Analytics', identity: ['AWS'], access: { label: 'Administrator', tone: 'red', more: 4 }, ai: 'High', governance: 'Pending' },
  { name: 'Talend', grade: 'B', industry: 'Data Integration', identity: ['Okta', 'Entra'], access: { label: 'Administrator', tone: 'red', more: 3 }, ai: 'Low' },
  { name: 'Dara Pharmaceutical Equipment', grade: 'B', industry: 'machinery', identity: ['Entra'], access: { label: 'Non-Sensitive Data', tone: 'green' }, ai: 'Low', governance: 'Added', procurement: 'Active' },
  { name: 'Iron Mountain', grade: 'B', industry: 'Information Management & Storage', identity: ['Entra', 'AWS'], access: { label: 'Non-Sensitive Data', tone: 'green' }, ai: 'Low', governance: 'Added', procurement: 'Active' },
]

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
