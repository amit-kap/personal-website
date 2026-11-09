/* Conversation threads for the Assessment Center. Trimbox is read off the
   walkthrough video (May 27 to 29, 2026); its opening messages come from the
   dashboard story. The others are short threads built from their status.
   Placeholder, to confirm. Presentation-only. */

import type { ActiveAssessment } from './assessmentCenter'

export type EventKind = 'sent' | 'reply' | 'review'

/* The agent writes in formatted blocks; **bold** marks emphasis. A verdict is
   the one-line answer, in the primary color with a check. */
export type Block = { p: string } | { verdict: string } | { ul: string[] } | { sources: { title: string; site: string }[] }

export type ThreadAction = { label: string; look: 'primary' | 'ghost' | 'text'; icon?: 'eye' | 'gavel' }

export type ThreadItem =
  | { kind: 'day'; label: string; note?: string }
  | { kind: 'user'; time: string; text: string }
  | { kind: 'agent'; time: string; blocks: Block[]; actions?: ThreadAction[]; decision?: boolean }
  | { kind: 'working' }
  | { kind: 'event'; time: string; event: EventKind; title: string; detail: string; link?: string }

const agent = (time: string, ...blocks: Block[]): ThreadItem => ({ kind: 'agent', time, blocks })
const user = (time: string, text: string): ThreadItem => ({ kind: 'user', time, text })

/* The full story, three days: public evidence, inquiry #1, a follow-up, then
   the agent's recommendation. 23 high-risk questions: 7 from public evidence,
   11 and 3 closed after the two inquiries, 2 left open. */
const trimbox: ThreadItem[] = [
  { kind: 'day', label: 'May 27, 2026' },
  agent(
    '09:12',
    { p: '**Trimbox** surfaced as a shadow app.' },
    { ul: ['Google Workspace OAuth grant with full mailbox access', 'Held by a VP of Finance account'] },
    { p: 'Full mailbox access puts it in the **High** risk tier, so I selected the **Comprehensive** questionnaire: 23 high-risk questions. I started on public evidence.' },
  ),
  { kind: 'working' },
  {
    kind: 'agent',
    time: '09:34',
    blocks: [
      { p: '**Public evidence completed.** It covers **7 of 23** high-risk questions. These are the sources I used:' },
      {
        sources: [
          { title: 'Privacy policy', site: 'trimbox.io/privacy' },
          { title: 'Security overview', site: 'trimbox.io/security' },
          { title: 'Sub-processor list', site: 'trimbox.io/legal/subprocessors' },
          { title: 'Google Workspace Marketplace listing', site: 'workspace.google.com' },
          { title: 'Public incident and CVE check', site: 'nvd.nist.gov' },
        ],
      },
      { p: 'There is no Trust Center and no audit report, so **16 questions** need the vendor:' },
      { ul: ['**Data handling and retention:** 6', '**Access and authentication:** 4', '**Sub-processors:** 3', '**Incident response:** 3'] },
      { p: 'I recommend sending these 16 to Dan Mercer as inquiry #1. I drafted it for your approval.' },
    ],
    actions: [
      { label: 'Send inquiry', look: 'primary', icon: 'gavel' },
      { label: 'Review draft', look: 'ghost', icon: 'eye' },
      { label: 'Dismiss', look: 'text' },
    ],
  },
  user('09:42', 'Looks right. Send it.'),
  { kind: 'event', time: '09:45', event: 'sent', title: 'Inquiry sent to Dan Mercer', detail: 'Inquiry #1 · 16 high questions · sent by Sarah K.', link: 'View inquiry' },
  { kind: 'day', label: 'May 28, 2026', note: '1 day later' },
  { kind: 'event', time: '10:15', event: 'reply', title: 'Dan Mercer replied', detail: 'Inquiry #1 · responses to 16 high questions', link: 'View reply' },
  agent(
    '10:16',
    { p: 'Trimbox answered all 16, but only **11** are backed by evidence. The other 5 are claims without proof:' },
    { ul: ['Encryption at rest: "AES-256", no report attached', 'Penetration testing: "regular", no report', 'Incident response: "within 24 hours", no policy', 'Breach history: "none", no statement', 'Retention: "30 days", not in the DPA'] },
    { p: 'I recommend closing the 11 and sending a follow-up for the rest.' },
  ),
  user('10:22', 'Close the 11 and send the follow-up.'),
  { kind: 'event', time: '10:30', event: 'sent', title: 'Follow-up sent to Dan Mercer', detail: 'Inquiry #2 · 5 high questions · sent by Sarah K.', link: 'View inquiry' },
  { kind: 'day', label: 'May 29, 2026', note: '2 days later' },
  { kind: 'event', time: '09:50', event: 'reply', title: 'Dan Mercer replied', detail: 'Inquiry #2 · responses to 5 high questions', link: 'View reply' },
  agent(
    '09:51',
    { p: 'Trimbox sent evidence this time. **3** of the 5 are now supported:' },
    { ul: ['Encryption at rest: encryption policy attached', 'Incident response: policy and 24-hour SLA attached', 'Retention: 30 days confirmed in a signed DPA'] },
    { p: '**2** stay open: no penetration test in the last 12 months, and no breach statement. I recommend closing the 3.' },
  ),
  user('10:05', 'Close the 3. Where does that leave us?'),
  agent('10:06', { p: 'Done. I closed **3 questions**: encryption at rest, incident response and retention. **21 of 23** high-risk questions are now closed.' }),
  {
    kind: 'agent',
    time: '10:09',
    decision: true,
    blocks: [
      { verdict: 'Approve with conditions' },
      { p: 'The risk score stays at **38 (High)** until the conditions are met. The 2 open questions are the penetration test and the breach statement.' },
      { p: '**Conditions**' },
      { ul: ['Reduce the OAuth grant from full mailbox access to read-only scopes', 'Provide a penetration test report within 90 days', 'Provide a written breach statement within 30 days'] },
      { p: 'The vendor answered every question and the controls it evidenced are sound. What remains is documentation, not design.' },
    ],
    actions: [
      { label: 'Make decision', look: 'primary', icon: 'gavel' },
      { label: 'Review answers', look: 'ghost', icon: 'eye' },
      { label: 'Dismiss', look: 'text' },
    ],
  },
]

type Source = { title: string; site: string }
interface Profile {
  found: string[]
  /* Reached public evidence: questions it covers, and the sources used. */
  covered?: number
  sources?: Source[]
  /* Reached the vendor's first reply: how many answers came with evidence, and
     the claims that did not. */
  backed?: number
  claims?: string[]
  contact?: string
  /* The user stops to inspect what came back before closing anything. */
  inspect?: boolean
}

const profile: Record<string, Profile> = {
  'Brightwave Media Inc.': {
    found: ['Customer data access through a Google Workspace grant', 'Held by a Marketing Director account'],
    covered: 6,
    sources: [
      { title: 'Privacy policy', site: 'brightwave.media/privacy' },
      { title: 'Security overview', site: 'brightwave.media/security' },
      { title: 'Sub-processor list', site: 'brightwave.media/legal' },
    ],
    backed: 6,
    claims: ['Encryption at rest: "AES-256", no report attached', 'Access reviews: "quarterly", no log', 'Incident response: "within 48 hours", no policy', 'Data retention: "90 days", not in the DPA'],
    contact: 'Priya Nair',
    inspect: true,
  },
  Metaview: {
    found: ['Access to employee and candidate data through a Google Workspace grant', 'Held by a Head of Talent account'],
    covered: 4,
    sources: [
      { title: 'Privacy policy', site: 'metaview.ai/privacy' },
      { title: 'Trust Center', site: 'trust.metaview.ai' },
    ],
    backed: 5,
    claims: ['Data retention: "30 days", not in the DPA', 'Sub-processors: list provided, no change notice terms', 'Breach history: "none", no statement'],
    contact: 'Tom Alvarez',
  },
  Demandbase: { found: ['Customer data access through Salesforce', 'Connected by a Sales Operations account'] },
  HackMD: { found: ['Customer data access through Google sign-in', 'Used by several teams'] },
  MobiloCard: { found: ['Employee PII access through Okta', 'Procurement and governance reviews still pending'] },
}

/* Every assessment follows Trimbox's story: the agent picks a questionnaire from
   the vendor's profile, gathers public evidence on its own, recommends how to
   proceed, and the inquiry and follow-up rounds come after. Each thread stops
   where that vendor stands. */
function generic(a: ActiveAssessment): ThreadItem[] {
  const p = profile[a.vendor] ?? { found: [] }
  const start = agent(
    '09:12',
    { p: `**${a.vendor}** surfaced as a new vendor.` },
    { ul: p.found },
    { p: `That puts it in the **High** risk tier, so I selected the **Comprehensive** questionnaire: **${a.total} questions**. I started on public evidence.` },
  )
  if (a.status === 'vendor' && p.covered && p.sources && p.backed && p.claims && p.contact) {
    const first = a.total - p.covered
    const follow = a.total - a.answered
    const gap = first - p.backed
    return [
      { kind: 'day', label: 'May 25, 2026' },
      start,
      { kind: 'working' },
      {
        kind: 'agent',
        time: '09:34',
        blocks: [
          { p: `**Public evidence completed.** It covers **${p.covered} of ${a.total}** questions. These are the sources I used:` },
          { sources: p.sources },
          { p: `The other **${first} questions** need the vendor. I recommend sending them to ${p.contact} as inquiry #1.` },
        ],
      },
      user('09:38', `Looks right. Send it to ${p.contact}.`),
      { kind: 'event', time: '09:40', event: 'sent', title: `Inquiry sent to ${p.contact}`, detail: `Inquiry #1 · ${first} questions · sent by Sarah K.`, link: 'View inquiry' },
      { kind: 'day', label: 'May 26, 2026', note: '1 day later' },
      { kind: 'event', time: '10:15', event: 'reply', title: `${p.contact} replied`, detail: `Inquiry #1 · responses to ${first} questions`, link: 'View reply' },
      agent(
        '10:16',
        { p: `${a.vendor} answered all ${first}, but only **${p.backed}** are backed by evidence. The other ${gap} are claims without proof, for example:` },
        { ul: p.claims },
        { p: `I recommend closing the ${p.backed} and sending a follow-up for the rest.` },
      ),
      ...(p.inspect
        ? [
            user('10:18', 'I want to inspect the questions received first.'),
            agent('10:19', { p: `Here are all **${first}** questions with ${p.contact}'s answers and the evidence attached to each. The **${p.backed}** I can close are marked. Tell me when you want me to close them.` }),
          ]
        : []),
      user('10:22', `Close the ${p.backed} and send the follow-up.`),
      { kind: 'event', time: '10:30', event: 'sent', title: `Follow-up sent to ${p.contact}`, detail: `Inquiry #2 · ${follow} questions · sent by Sarah K.`, link: 'View inquiry' },
      { kind: 'day', label: 'May 29, 2026', note: 'Waiting on the vendor' },
      agent('08:00', { p: `Inquiry #2 is still open with **${a.vendor}**. **${a.answered} of ${a.total}** questions are closed so far. I will send a reminder if there is no reply soon.` }),
    ]
  }
  return [
    { kind: 'day', label: 'May 29, 2026' },
    start,
    { kind: 'working' },
  ]
}

/* A finished assessment reads as a short, closed record. */
export const closedThread = (vendor: string, result: string): ThreadItem[] => [
  { kind: 'day', label: 'Closed' },
  agent(
    '09:00',
    { p: `**${result}.** The assessment for **${vendor}** is closed and the decision is on record.` },
    { p: 'The vendor information and artifacts stay available on the right. Messages are off until the assessment is reopened.' },
  ),
]

export const threadFor = (a: ActiveAssessment): ThreadItem[] => (a.vendor === 'Trimbox' ? trimbox : generic(a))
