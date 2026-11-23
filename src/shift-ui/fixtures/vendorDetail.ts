/* Sample detail for the Databricks vendor card, read off the reference
   screenshot (03-inventory-vendors-card) and the walkthrough video. Rows that
   the screenshot cuts off, and the contact, are made up. Presentation-only. */

import { vendors, type Grade, type Tone, type VendorRow } from './vendors'

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

/* Every other vendor's card is generated from its table row. The variations
   are mock: they are seeded from the vendor's name, so each card is stable
   between visits, and they follow the row (grade, access, AI exposure and
   statuses) so the card never contradicts the table. */

function seed(name: string) {
  let h = 2166136261
  for (const ch of name) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

const order: Grade[] = ['A', 'B', 'C', 'D', 'F']
const shift = (g: Grade, by: number): Grade => order[Math.min(4, Math.max(0, order.indexOf(g) + by))]
const bands: Record<Grade, [number, number]> = { A: [82, 97], B: [62, 78], C: [42, 58], D: [22, 38], F: [6, 18] }
const risk: Record<Grade, string> = { A: 'Low risk', B: 'Moderate risk', C: 'Elevated risk', D: 'High risk', F: 'Critical risk' }
const scoreNote: Record<Grade, string> = {
  A: 'Strong security posture — low risk across all evaluated dimensions',
  B: 'Generally sound practices — minor gaps in select areas',
  C: 'Mixed security posture — several areas need attention',
  D: 'Weak security posture — significant gaps in key areas',
  F: 'Poor security posture — critical gaps across most areas',
}
const aiTone: Record<string, Tone> = { Low: 'green', Medium: 'yellow', High: 'orange', Critical: 'red' }
const aiClass: Record<string, string> = { Low: 'AI Light', Medium: 'AI Assisted', High: 'AI Enhanced', Critical: 'AI Native' }
const sourceName: Record<string, string> = { Google: 'Google Workspace', Entra: 'Microsoft Entra' }
const tagPool: { label: string; tone: Tone }[] = [
  { label: 'Source Code', tone: 'red' },
  { label: 'Customer PII', tone: 'red' },
  { label: 'Customer Data', tone: 'yellow' },
  { label: 'Employee PII', tone: 'orange' },
  { label: 'Financial Data', tone: 'orange' },
  { label: 'Production', tone: 'orange' },
  { label: 'Sensitive Data', tone: 'yellow' },
  { label: 'Internal Docs', tone: 'yellow' },
]
const owners = ['Sarah Mitchell', 'Daniel Cohen', 'Maya Levin', 'Tom Alvarez', 'Priya Nair', 'Noam Shalev']
const categories = ['External Exposure', 'Company Posture', 'Breaches History', 'Certificates', 'Supply Chain']

function generate(v: VendorRow): VendorDetail {
  const rnd = seed(v.name)
  const pick = <T,>(xs: T[]) => xs[Math.floor(rnd() * xs.length)]
  const [lo, hi] = bands[v.grade]
  const value = Math.round(lo + rnd() * (hi - lo))

  // Six months of grades that end on today's, drifting by at most one step.
  const months: Grade[] = [v.grade]
  for (let i = 0; i < 5; i++) {
    const r = rnd()
    months.unshift(r < 0.35 ? shift(months[0], -1) : r < 0.6 ? shift(months[0], 1) : months[0])
  }
  const steps = months.flatMap((g) => [g, g, g, g])
  const avg = order[Math.round(months.reduce((n, g) => n + order.indexOf(g), 0) / months.length)]
  const trend = order.indexOf(months[5]) - order.indexOf(months[0])
  const historyNote =
    trend < 0
      ? `Improving over the last 6 months. Avg rating last 6 months: ${avg}`
      : trend > 0
        ? `Declining over the last 6 months. Avg rating last 6 months: ${avg}`
        : `Stable performance with minor fluctuations. Avg rating last 6 months: ${avg}`

  const ai = v.ai
  const detected = v.access
    ? [{ label: v.access.label, tone: v.access.tone }, ...tagPool.filter((t) => t.label !== v.access!.label).sort(() => rnd() - 0.5).slice(0, v.access.more ?? 0)]
    : []
  const domainBase = v.name.toLowerCase().replace(/[^a-z0-9 ]/g, '')
  const domain = `${domainBase.length <= 14 ? domainBase.replace(/ /g, '') : domainBase.split(' ')[0]}.com`
  const owner = pick(owners)
  const [first, last] = owner.toLowerCase().split(' ')

  return {
    name: v.name,
    grade: v.grade,
    tabs: databricks.tabs,
    score: {
      value,
      risk: risk[v.grade],
      note: scoreNote[v.grade],
      categories: categories.map((label) => ({ label, grade: shift(v.grade, Math.floor(rnd() * 3) - 1) })),
    },
    history: { note: historyNote, steps, months: databricks.history.months },
    ai: {
      exposure: ai ? { label: ai, tone: aiTone[ai] } : { label: 'None', tone: 'green' },
      rows: [
        [
          { label: 'Classification', value: ai ? aiClass[ai] : 'No AI' },
          { label: 'Identities', value: ai ? String(Math.floor(rnd() * 5)) : '0' },
        ],
        [
          { label: 'AI features', value: ai ? String(1 + Math.floor(rnd() * 6)) : '0' },
          { label: 'Trains on customer data', value: ai ? pick(['Opt-out available', 'No training', 'Not disclosed']) : 'Not applicable' },
          { label: 'Last detected', value: ai ? pick(['Apr 28', 'Apr 14', 'Mar 30', 'Mar 12']) : '—' },
        ],
      ],
    },
    about: {
      industry: v.industry,
      domain,
      description: `${v.name} provides ${v.industry.toLowerCase()} services to organizations worldwide. ${pick([
        'It is used across several teams and connects to company systems through standard integrations.',
        'It was added to the inventory after Shift detected it through the identity provider.',
        'Its security documentation is available on request and has not yet been reviewed.',
      ])} ${pick(['The company is privately held.', 'The company is publicly traded.', 'The company was founded over a decade ago.'])}`,
    },
    management: [
      { label: 'Classification', value: v.access?.label === 'Administrator' ? 'Tier 1' : v.access ? 'Tier 2' : 'Tier 3' },
      { label: 'Governance Status', value: v.governance ?? 'Not started' },
      { label: 'Procurement Status', value: v.procurement ?? 'Inactive' },
    ],
    access: {
      sources: v.identity.map((n) => ({ name: sourceName[n] ?? n, logo: n })),
      detected,
      approved: detected.length && rnd() < 0.6 ? [detected[detected.length - 1].label] : [],
    },
    contact: {
      role: 'Internal owner',
      name: owner,
      email: `${first}.${last}@acme.com`,
      phone: `+1 (415) 555-0${100 + Math.floor(rnd() * 900)}`,
    },
  }
}

/* The card for each vendor in the table, by name. Databricks and Trimbox are
   hand-built from their reference screenshots; the rest are generated. */
const handBuilt = (v: VendorRow): VendorDetail => {
  if (v.name === databricks.name) return databricks
  const base = generate(v)
  if (v.name !== 'Trimbox') return base
  // Read off the Trimbox assessment screenshot.
  return {
    ...base,
    score: {
      ...base.score,
      value: 38,
      risk: 'High risk',
      categories: [
        { label: 'External Exposure', grade: 'D' },
        { label: 'Company Posture', grade: 'D' },
        { label: 'Breaches History', grade: 'A' },
        { label: 'Certificates', grade: 'F' },
        { label: 'Supply Chain', grade: 'A' },
      ],
    },
    about: {
      industry: 'Email Management',
      domain: 'trimbox.io',
      description:
        'Email productivity SaaS connected through a Google Workspace OAuth grant with full mailbox access to a VP of Finance account. Surfaced as an ungoverned, unprocured shadow app.',
    },
    management: [
      { label: 'Classification', value: 'Tier 3' },
      { label: 'Governance Status', value: 'Not started' },
      { label: 'Procurement Status', value: 'Inactive' },
    ],
    contact: { role: 'Primary contact', name: 'Dan Mercer', email: 'dan@trimbox.io', phone: '+1-617-555-0113' },
  }
}

export const vendorDetails: Record<string, VendorDetail> = Object.fromEntries(vendors.map((v) => [v.name, handBuilt(v)]))
