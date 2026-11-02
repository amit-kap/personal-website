/* Sample detail for the Databricks vendor card, read off the reference
   screenshot (03-inventory-vendors-card) and the walkthrough video. Rows that
   the screenshot cuts off, and the contact, are made up. Presentation-only. */

import type { Grade, Tone } from './vendors'

export const gradeBands: { grade: Grade; range: string; color: string }[] = [
  { grade: 'F', range: '0–20', color: '#dd514b' },
  { grade: 'D', range: '20–40', color: '#ec964f' },
  { grade: 'C', range: '40–60', color: '#debb3d' },
  { grade: 'B', range: '60–80', color: '#a5d94a' },
  { grade: 'A', range: '80–100', color: '#4aa053' },
]

export const gradeColor = Object.fromEntries(gradeBands.map((b) => [b.grade, b.color])) as Record<Grade, string>

export interface VendorDetail {
  name: string
  grade: Grade
  tabs: { label: string }[]
  score: { value: number; risk: string; note: string; categories: { label: string; grade: Grade }[] }
  history: { note: string; steps: Grade[]; months: string[] }
  ai: { exposure: { label: string; tone: Tone }; rows: { label: string; value: string }[][] }
  about: { industry: string; domain: string; description: string }
  management: { label: string; value: string }[]
  access: { sources: { name: string; logo: string }[]; detected: { label: string; tone: Tone }[]; approved: string[] }
  contact: { role: string; name: string; email: string; phone: string }
}

export const databricks: VendorDetail = {
  name: 'Databricks',
  grade: 'B',
  tabs: [
    { label: 'Overview' },
    { label: 'Access Graph' },
    { label: 'AI Exposure' },
    { label: 'Supply Chain' },
    { label: 'Procurement' },
    { label: 'Assessments' },
  ],
  score: {
    value: 74,
    risk: 'Moderate risk',
    note: 'Generally sound practices — minor gaps in select areas',
    categories: [
      { label: 'External Exposure', grade: 'C' },
      { label: 'Company Posture', grade: 'A' },
      { label: 'Breaches History', grade: 'A' },
      { label: 'Certificates', grade: 'A' },
      { label: 'Supply Chain', grade: 'A' },
    ],
  },
  history: {
    note: 'Stable performance with minor fluctuations. Avg rating last 6 months: A',
    // 24 steps across six months, four to a month.
    steps: 'BBBBBAABAAAAAABAAAAAAABB'.split('') as Grade[],
    months: ['NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'THIS MONTH'],
  },
  ai: {
    exposure: { label: 'High', tone: 'orange' },
    rows: [
      [
        { label: 'Classification', value: 'AI Enhanced' },
        { label: 'Identities', value: '0' },
      ],
      [
        { label: 'AI features', value: '3' },
        { label: 'Trains on customer data', value: 'Opt-out available' },
        { label: 'Last detected', value: 'Apr 28' },
      ],
    ],
  },
  about: {
    industry: 'Data & AI Platform',
    domain: 'databricks.com',
    description:
      'Databricks is a data and AI company based in San Francisco, known for its unified cloud-based platform that integrates data analytics, engineering, and artificial intelligence. Founded in 2013 by the creators of Apache Spark, the company has grown to serve over 10,000 organizations worldwide.',
  },
  management: [
    { label: 'Classification', value: 'Tier 1' },
    { label: 'Governance Status', value: 'Pending' },
    { label: 'Procurement Status', value: 'Inactive' },
  ],
  access: {
    sources: [
      { name: 'Snowflake', logo: 'Snowflake' },
      { name: 'Google Workspace', logo: 'Google' },
      { name: 'Salesforce', logo: 'Salesforce' },
      { name: 'AWS', logo: 'AWS' },
    ],
    detected: [
      { label: 'Administrator', tone: 'red' },
      { label: 'Source Code', tone: 'red' },
      { label: 'Customer PII', tone: 'red' },
      { label: 'Customer Data', tone: 'yellow' },
      { label: 'Employee PII', tone: 'orange' },
      { label: 'Financial Data', tone: 'orange' },
      { label: 'Production', tone: 'orange' },
      { label: 'Sensitive Data', tone: 'yellow' },
    ],
    approved: ['Employee PII'],
  },
  contact: { role: 'Internal owner', name: 'Sarah Mitchell', email: 'sarah.mitchell@acme.com', phone: '+1 (415) 555-0193' },
}

/* Vendors that have a card in this prototype, by name. */
export const vendorDetails: Record<string, VendorDetail> = { Databricks: databricks }
