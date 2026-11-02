/* Ask Shift: suggested questions and scripted answers, built from the
   dashboard and inventory screenshots. Draft copy: the Trimbox facts come from
   the assessment screenshot, the rest are placeholders to confirm. */

export type GroupId = 'vendors' | 'exposures' | 'threats' | 'assessments'

export interface AnswerItem {
  vendor: string
  note: string
}

export interface Answer {
  text: string
  widgets: string[]
  items?: AnswerItem[]
}

export const askIntro = {
  placeholder: 'Ask about vendors, threats or exposures',
}

/* Composer menus. Draft: only "Shift agent" is from the brief. */
export const composerActions = [
  { label: 'Mention a vendor', insert: '@' },
  { label: 'Start an assessment', insert: 'Start an assessment for ' },
  { label: 'Add evidence', insert: 'Add evidence: ' },
]
export const agents = ['Shift agent', 'Vendor Entity Resolution Agent']

export interface AskGroup {
  id: GroupId
  label: string
  questions: { q: string; sub: string; answer: string }[]
}

/* What the panel offers on a page: its questions, its scripted answers, and how
   a typed question picks one. */
export interface AskScript {
  groups: AskGroup[]
  answers: Record<string, Answer>
  match: (text: string) => string
}

const askGroups: AskGroup[] = [
  {
    id: 'vendors',
    label: 'Vendors',
    questions: [
      { q: "What's the story on Trimbox?", sub: 'Full risk profile for any vendor', answer: 'trimbox' },
      { q: 'Which vendors have sensitive access?', sub: 'Who has keys to the kingdom', answer: 'sensitive' },
      { q: 'What shadow vendors were discovered?', sub: 'Undiscovered third parties', answer: 'shadow' },
    ],
  },
  {
    id: 'exposures',
    label: 'Exposures',
    questions: [{ q: 'Where is source code exposed?', sub: 'Vendors with repository access', answer: 'source' }],
  },
  {
    id: 'threats',
    label: 'Threats',
    questions: [{ q: "What's the Vercel threat?", sub: 'Fourth-party compromise', answer: 'vercel' }],
  },
  {
    id: 'assessments',
    label: 'Assessments',
    questions: [{ q: 'What needs my decision?', sub: 'Replies waiting on you', answer: 'decision' }],
  },
]

/* In answer text, [[Label|widget-id]] links to a dashboard widget: it is
   underlined in the answer and lights up on the dashboard. `widgets` are the ones
   highlighted as soon as the answer lands. Widget ids: a panel's title, "tile-"
   + a tile's label, "finding-" or "assessment-" + a vendor, all lowercased with
   hyphens. */
const answers: Record<string, Answer> = {
  trimbox: {
    text: 'Trimbox is an email productivity app connected through a Google Workspace OAuth grant with full mailbox access to a VP of Finance account. It surfaced as an ungoverned, unprocured shadow app and is open in [[Recent Findings|finding-trimbox]]. Rated D (38/100, high risk). Its [[assessment|assessment-trimbox]] is 3 of 23 questions in, and reply #2 (20 new answers, 5 attachments) is waiting for your review.',
    widgets: ['finding-trimbox', 'assessment-trimbox'],
  },
  sensitive: {
    text: '13 of your 19 vendors hold critical-tier access, as shown in [[Data Access|data-access]]. These carry the most sensitive categories:',
    widgets: ['data-access'],
    items: [
      { vendor: 'Databricks', note: 'Administrator +7' },
      { vendor: 'Anodot', note: 'Administrator +4' },
      { vendor: 'GitHub', note: 'Source Code +1' },
      { vendor: 'Trimbox', note: 'Customer Data +4' },
      { vendor: 'MobiloCard', note: 'Employee PII +2' },
    ],
  },
  shadow: {
    text: '[[Shadow Vendors|tile-shadow-vendors]] counts 6 vendors operating without approval, 4 of them discovered this month. Three already sit in your [[critical findings|recent-findings]]:',
    widgets: ['tile-shadow-vendors', 'recent-findings'],
    items: [
      { vendor: 'Brightwave Media Inc.', note: 'Granted sensitive access' },
      { vendor: 'Trimbox', note: 'Full mailbox access' },
      { vendor: 'Metaview', note: 'Broad meeting and calendar access' },
    ],
  },
  source: {
    text: '3 vendors (7%) can reach source code, the red [[Source Code|data-access]] tile. GitHub is the one with the widest footprint: rated C, with high AI exposure.',
    widgets: ['data-access'],
    items: [{ vendor: 'GitHub', note: 'Source Code +1, AI exposure High' }],
  },
  vercel: {
    text: 'A compromise at Context.ai, a fourth party, exposes credentials that Vercel relies on. The [[finding|finding-vercel]] is open and critical, and it is part of the rise in [[Threat Detection|threat-detection]]. Vercel itself is rated well, so the question is what those credentials can reach. The access graph shows that path.',
    widgets: ['finding-vercel', 'threat-detection'],
    items: [{ vendor: 'Vercel', note: 'Fourth-party threat, open' }],
  },
  decision: {
    text: 'One call is waiting on you ([[Needs Your Decision|tile-needs-your-decision]]). The agent recommends reviewing Trimbox’s reply in [[Active Assessments|assessment-trimbox]] and closing the answers the evidence supports.',
    widgets: ['tile-needs-your-decision', 'assessment-trimbox'],
    items: [{ vendor: 'Trimbox', note: 'Review vendor reply (#2): 20 new answers, 5 attachments' }],
  },
  fallback: {
    text: 'I can walk through vendors, exposures, threats or assessments. Try one of the suggested questions.',
    widgets: [],
  },
}

/* Typed questions: first keyword that matches picks the answer. */
function answerFor(text: string): string {
  const t = text.toLowerCase()
  if (t.includes('trimbox')) return 'trimbox'
  if (t.includes('shadow') || t.includes('discover')) return 'shadow'
  if (t.includes('sensitive') || t.includes('access')) return 'sensitive'
  if (t.includes('source') || t.includes('code') || t.includes('github')) return 'source'
  if (t.includes('vercel') || t.includes('threat')) return 'vercel'
  if (t.includes('decision') || t.includes('assess') || t.includes('review')) return 'decision'
  return 'fallback'
}

export const dashboardAsk: AskScript = { groups: askGroups, answers, match: answerFor }

/* The Vendors page: four questions about what is on screen. Facts come from
   the table and the summary cards. */
const vendorAnswers: Record<string, Answer> = {
  frated: {
    text: 'Three vendors are rated F, the lowest grade, and all three hold data access: [[HackMD|vendor-hackmd]] and [[Demandbase|vendor-demandbase]] reach Customer Data, and [[MobiloCard|vendor-mobilocard]] reaches Employee PII. [[Unmanaged Vendors with Data Access|unmanaged-vendors-with-data-access]] counts the wider picture.',
    widgets: ['vendor-hackmd', 'vendor-mobilocard', 'vendor-demandbase'],
    items: [
      { vendor: 'HackMD', note: 'Customer Data +2, no governance status' },
      { vendor: 'MobiloCard', note: 'Employee PII +2, governance pending' },
      { vendor: 'Demandbase', note: 'Customer Data +2, AI exposure Medium' },
    ],
  },
  admin: {
    text: 'Three vendors hold administrator access: [[Databricks|vendor-databricks]], [[Anodot|vendor-anodot]] and [[Talend|vendor-talend]]. Administrator is the widest access tier, and all three are rated B, so the grade alone hides how much they can reach.',
    widgets: ['vendor-databricks', 'vendor-anodot', 'vendor-talend'],
    items: [
      { vendor: 'Databricks', note: 'Administrator +7' },
      { vendor: 'Anodot', note: 'Administrator +4' },
      { vendor: 'Talend', note: 'Administrator +3' },
    ],
  },
  ai: {
    text: '[[AI Exposure|ai-exposure]] shows 5 vendors at High and 1 at Critical. In this list, GitHub, IBM, Databricks and Anodot are High. Databricks and Anodot also hold administrator access, so they are the ones to look at first.',
    widgets: ['ai-exposure', 'vendor-github', 'vendor-ibm', 'vendor-databricks', 'vendor-anodot'],
    items: [
      { vendor: 'Databricks', note: 'High, Administrator +7' },
      { vendor: 'Anodot', note: 'High, Administrator +4' },
      { vendor: 'GitHub', note: 'High, Source Code +1' },
      { vendor: 'IBM', note: 'High, no detected access' },
    ],
  },
  govern: {
    text: 'Three vendors with data access have no governance status at all: [[HackMD|vendor-hackmd]], [[Trimbox|vendor-trimbox]] and [[Talend|vendor-talend]]. They are in use and can reach sensitive data, but nobody has taken them through the process yet.',
    widgets: ['vendor-hackmd', 'vendor-trimbox', 'vendor-talend'],
    items: [
      { vendor: 'HackMD', note: 'Customer Data +2' },
      { vendor: 'Trimbox', note: 'Customer Data +4' },
      { vendor: 'Talend', note: 'Administrator +3' },
    ],
  },
  fallback: {
    text: 'On this page I can look at ratings, access levels, AI exposure and governance. Try one of the suggested questions.',
    widgets: [],
  },
}

function vendorMatch(text: string): string {
  const t = text.toLowerCase()
  if (/\b(f|d)[- ]?rated\b|\brated\b|\bworst\b|\blowest\b|\bgrade/.test(t)) return 'frated'
  if (t.includes('admin')) return 'admin'
  if (/\bai\b/.test(t) || t.includes('exposure')) return 'ai'
  if (t.includes('govern') || t.includes('procure') || t.includes('unmanaged')) return 'govern'
  return 'fallback'
}

export const vendorsAsk: AskScript = {
  groups: [
    {
      id: 'vendors',
      label: 'On this page',
      questions: [
        { q: 'Which F-rated vendors have data access?', sub: 'Lowest grades with sensitive reach', answer: 'frated' },
        { q: 'Who has administrator access?', sub: 'The widest access tier', answer: 'admin' },
        { q: 'Where is AI exposure highest?', sub: 'High-exposure vendors', answer: 'ai' },
        { q: 'Who is missing governance?', sub: 'In use, never reviewed', answer: 'govern' },
      ],
    },
  ],
  answers: vendorAnswers,
  match: vendorMatch,
}
