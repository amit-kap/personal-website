/* Conversation threads for the Assessment Center. Trimbox is read off the
   walkthrough video (May 27 to 29, 2026); its opening messages come from the
   dashboard story. The others are short threads built from their status.
   Placeholder, to confirm. Presentation-only. */

import type { ActiveAssessment } from './assessmentCenter'

export type EventKind = 'sent' | 'reply' | 'review'

/* The agent writes in formatted blocks; **bold** marks emphasis. */
export type Block = { p: string } | { ul: string[] } | { sources: { title: string; site: string }[] }

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
    { p: 'I suggest a **Comprehensive** assessment against the Shift Standard. Shall I start?' },
  ),
  user('09:20', 'Yes, start with what is public.'),
  agent(
    '09:34',
    { p: 'Public evidence covers **7 of 23** high-risk questions. These are the sources I used:' },
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
    { p: 'I drafted inquiry #1 for your approval.' },
  ),
  user('09:42', 'Looks right. Send it to Dan Mercer.'),
  { kind: 'event', time: '09:45', event: 'sent', title: 'Inquiry sent by Sarah K.', detail: 'Inquiry #1 · 16 high questions', link: 'View inquiry' },
  { kind: 'day', label: 'May 28, 2026', note: '1 day later' },
  { kind: 'event', time: '10:15', event: 'reply', title: 'Vendor replied', detail: 'Inquiry #1 · responses to 16 high questions', link: 'View reply' },
  agent(
    '10:16',
    { p: 'Trimbox answered all 16, but only **11** are backed by evidence. The other 5 are claims without proof:' },
    { ul: ['Encryption at rest: "AES-256", no report attached', 'Penetration testing: "regular", no report', 'Incident response: "within 24 hours", no policy', 'Breach history: "none", no statement', 'Retention: "30 days", not in the DPA'] },
    { p: 'I recommend closing the 11 and sending a follow-up for the rest.' },
  ),
  user('10:22', 'Close the 11 and send the follow-up.'),
  { kind: 'event', time: '10:25', event: 'review', title: 'Vendor reply reviewed by Sarah K.', detail: 'Inquiry #1 · closed 11 questions' },
  { kind: 'event', time: '10:30', event: 'sent', title: 'Inquiry sent by Sarah K.', detail: 'Inquiry #2 · 5 high questions', link: 'View inquiry' },
  { kind: 'day', label: 'May 29, 2026', note: '2 days later' },
  { kind: 'event', time: '09:50', event: 'reply', title: 'Vendor replied', detail: 'Inquiry #2 · responses to 5 high questions', link: 'View reply' },
  agent(
    '09:51',
    { p: 'Trimbox sent evidence this time. **3** of the 5 are now supported:' },
    { ul: ['Encryption at rest: encryption policy attached', 'Incident response: policy and 24-hour SLA attached', 'Retention: 30 days confirmed in a signed DPA'] },
    { p: '**2** stay open: no penetration test in the last 12 months, and no breach statement. I recommend closing the 3.' },
  ),
  user('10:05', 'Close the 3. Where does that leave us?'),
  { kind: 'event', time: '10:08', event: 'review', title: 'Vendor reply reviewed by Sarah K.', detail: 'Inquiry #2 · closed 3 questions' },
  {
    kind: 'agent',
    time: '10:09',
    decision: true,
    blocks: [
      { p: '**Recommendation: approve with conditions.** 21 of 23 high-risk questions are closed, and the risk score stays at **38 (High)** until the conditions are met.' },
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

/* A short thread from where the assessment stands. */
function generic(a: ActiveAssessment): ThreadItem[] {
  const open = a.total - a.answered
  const start = agent('09:12', { p: `Assessment started. **${a.total} questions** to cover.` }, { ul: ['Framework: Shift Standard', 'Depth: Comprehensive'] })
  if (a.status === 'vendor') {
    return [
      { kind: 'day', label: 'May 25, 2026' },
      start,
      { kind: 'event', time: '09:40', event: 'sent', title: 'Inquiry sent by Sarah K.', detail: `Inquiry #1 · ${open} questions`, link: 'View inquiry' },
      { kind: 'day', label: 'May 29, 2026', note: 'Waiting on the vendor' },
      agent('08:00', { p: `Still waiting on **${a.vendor}**. ${a.answered} of ${a.total} questions are answered so far. I will send a reminder if there is no reply soon.` }),
    ]
  }
  return [
    { kind: 'day', label: 'May 29, 2026' },
    start,
    agent('09:13', { p: 'Collecting public evidence and mapping it to controls. I will draft the first inquiry for your approval.' }),
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
