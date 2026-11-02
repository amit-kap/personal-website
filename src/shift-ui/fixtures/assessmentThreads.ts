/* Conversation threads for the Assessment Center. Trimbox is read off the
   walkthrough video (May 27 to 29, 2026); its opening messages come from the
   dashboard story. The others are short threads built from their status.
   Placeholder, to confirm. Presentation-only. */

import type { ActiveAssessment } from './assessmentCenter'

export type EventKind = 'sent' | 'reply' | 'review'

export type ThreadItem =
  | { kind: 'day'; label: string; note?: string }
  | { kind: 'agent'; time: string; text: string }
  | { kind: 'event'; time: string; event: EventKind; title: string; detail: string; link?: string }
  | {
      kind: 'action'
      time: string
      text: string
      recommendation: string
      title: string
      stats: { icon: 'answers' | 'files'; value: number; label: string }[]
      primary: string
      secondary: string
    }

const trimbox: ThreadItem[] = [
  { kind: 'day', label: 'May 27, 2026' },
  {
    kind: 'agent',
    time: '09:12',
    text: 'Trimbox surfaced as a shadow app: a Google Workspace OAuth grant with full mailbox access to a VP of Finance account. I suggest a Comprehensive assessment against the Shift Standard.',
  },
  { kind: 'agent', time: '09:14', text: 'No public evidence of a Trust Center found. High-risk questions need input from the vendor.' },
  { kind: 'event', time: '09:40', event: 'sent', title: 'Inquiry sent by Sarah K.', detail: 'Inquiry #1 · 23 high questions', link: 'View inquiry' },
  { kind: 'day', label: 'May 28, 2026', note: '1 day later' },
  { kind: 'event', time: '10:15', event: 'reply', title: 'Vendor replied', detail: 'Inquiry #1 · responses to 23 high questions', link: 'View reply' },
  { kind: 'event', time: '10:20', event: 'review', title: 'Vendor reply was reviewed by Sarah K.', detail: 'Inquiry #1 · closed 3 questions' },
  { kind: 'event', time: '10:30', event: 'sent', title: 'Inquiry sent by Sarah K.', detail: 'Inquiry #2 · 20 high questions', link: 'View inquiry' },
  { kind: 'day', label: 'May 29, 2026', note: '2 days later' },
  { kind: 'event', time: '09:50', event: 'reply', title: 'Vendor replied', detail: 'Inquiry #2 · responses to 20 high questions', link: 'View reply' },
  {
    kind: 'action',
    time: '09:51',
    text: 'Trimbox answered inquiry #2. Close the 20 high questions with enough evidence.',
    recommendation: 'My recommendation is to review the reply and close supported answers.',
    title: 'Review vendor reply (#2)',
    stats: [
      { icon: 'answers', value: 20, label: 'New answers' },
      { icon: 'files', value: 5, label: 'Attachments' },
    ],
    primary: 'Review reply',
    secondary: 'Make decision',
  },
]

/* A short thread from where the assessment stands. */
function generic(a: ActiveAssessment): ThreadItem[] {
  const open = a.total - a.answered
  const start: ThreadItem = {
    kind: 'agent',
    time: '09:12',
    text: `Assessment started. Framework: Shift Standard. Depth: Comprehensive. ${a.total} questions to cover.`,
  }
  if (a.status === 'vendor') {
    return [
      { kind: 'day', label: 'May 25, 2026' },
      start,
      { kind: 'event', time: '09:40', event: 'sent', title: 'Inquiry sent by Sarah K.', detail: `Inquiry #1 · ${open} questions`, link: 'View inquiry' },
      { kind: 'day', label: 'May 29, 2026', note: 'Waiting on the vendor' },
      { kind: 'agent', time: '08:00', text: `Still waiting on ${a.vendor}. ${a.answered} of ${a.total} questions are answered so far. I will send a reminder if there is no reply soon.` },
    ]
  }
  return [
    { kind: 'day', label: 'May 29, 2026' },
    start,
    { kind: 'agent', time: '09:13', text: 'Collecting public evidence and mapping it to controls. I will draft the first inquiry for your approval.' },
  ]
}

export const threadFor = (a: ActiveAssessment): ThreadItem[] => (a.vendor === 'Trimbox' ? trimbox : generic(a))
