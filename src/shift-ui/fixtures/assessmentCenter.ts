/* Sample data for the Assessment Center: the vendors from the dashboard's
   Active Assessments, plus a short list of resolved ones. Placeholder times
   and counts, to confirm. Presentation-only. */

export type AssessmentStatus = 'review' | 'vendor' | 'agent'

export const statusLabel: Record<AssessmentStatus, string> = {
  review: 'Requires review',
  vendor: 'Awaiting vendor',
  agent: 'Agent analyzing',
}

export interface ActiveAssessment {
  vendor: string
  status: AssessmentStatus
  /* How long it has waited, or what the agent is doing. */
  meta: string
  answered: number
  total: number
}

/* Same six as the dashboard's Active Assessments. */
export const activeAssessments: ActiveAssessment[] = [
  { vendor: 'Trimbox', status: 'review', meta: '11h', answered: 21, total: 23 },
  { vendor: 'Brightwave Media Inc.', status: 'vendor', meta: '2d', answered: 12, total: 30 },
  { vendor: 'Metaview', status: 'vendor', meta: '4d', answered: 9, total: 18 },
  { vendor: 'Demandbase', status: 'agent', meta: 'Just now', answered: 0, total: 26 },
  { vendor: 'HackMD', status: 'agent', meta: '1h', answered: 0, total: 24 },
  { vendor: 'MobiloCard', status: 'agent', meta: '2h', answered: 0, total: 28 },
]

export const filters: { id: 'all' | AssessmentStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'review', label: 'Needs you' },
  { id: 'vendor', label: 'Awaiting vendor' },
  { id: 'agent', label: 'Agent working' },
]

/* Finished assessments, newest first. */
export const resolvedAssessments = [
  { vendor: 'Slack', result: 'Approved', when: '3d', days: 3 },
  { vendor: 'Zoom', result: 'Approved', when: '6d', days: 6 },
  { vendor: 'Notion', result: 'Approved with conditions', when: '1w', days: 7 },
  { vendor: 'Figma', result: 'Approved', when: '2w', days: 14 },
  { vendor: 'Hertz', result: 'Declined', when: '3w', days: 21 },
  { vendor: 'IBM', result: 'Approved', when: '3w', days: 21 },
  { vendor: 'GitHub', result: 'Approved with conditions', when: '1mo', days: 30 },
  { vendor: 'Gainsight', result: 'Approved', when: '1mo', days: 30 },
  { vendor: 'Anodot', result: 'Approved with conditions', when: '1mo', days: 30 },
  { vendor: 'Talend', result: 'Approved', when: '2mo', days: 60 },
  { vendor: 'Databricks', result: 'Approved with conditions', when: '2mo', days: 60 },
  { vendor: 'Iron Mountain', result: 'Approved', when: '2mo', days: 60 },
  { vendor: 'Atlassian', result: 'Approved', when: '3mo', days: 90 },
  { vendor: 'Stripe', result: 'Approved', when: '3mo', days: 90 },
  { vendor: 'Datadog', result: 'Approved', when: '3mo', days: 90 },
  { vendor: 'Vercel', result: 'Approved', when: '4mo', days: 120 },
  { vendor: 'Dara Pharmaceutical Equipment', result: 'Declined', when: '4mo', days: 120 },
]

export const RESOLVED_COUNT = resolvedAssessments.length

/* Needs you first, then waiting on the vendor, then the agent. */
export const statusRank: Record<AssessmentStatus, number> = { review: 0, vendor: 1, agent: 2 }

export type HistorySort = 'newest' | 'oldest' | 'name' | 'result'

export const historySorts: { id: HistorySort; label: string }[] = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'name', label: 'Name' },
  { id: 'result', label: 'Result' },
]

export const compareHistory: Record<HistorySort, (a: (typeof resolvedAssessments)[number], b: (typeof resolvedAssessments)[number]) => number> = {
  newest: (a, b) => a.days - b.days,
  oldest: (a, b) => b.days - a.days,
  name: (a, b) => a.vendor.localeCompare(b.vendor),
  result: (a, b) => a.result.localeCompare(b.result) || a.days - b.days,
}
