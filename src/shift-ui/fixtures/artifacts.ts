export type ArtifactAccess = 'public' | 'private'

export type Artifact = { name: string; category: string; access: ArtifactAccess }

export const artifactFilters = [
  { id: 'all', label: 'All' },
  { id: 'public', label: 'Public' },
  { id: 'private', label: 'Private' },
] as const

/* Documents the vendor has shared for an assessment, in the manner of a trust
   center's document list. Trimbox's are the five attachments on its reply. */
const shared: Record<string, Artifact[]> = {
  Trimbox: [
    { name: 'SOC 2 Type II Report', category: 'Reports', access: 'private' },
    { name: 'Penetration Test Report', category: 'Reports', access: 'private' },
    { name: 'ISO/IEC 27001:2022', category: 'Compliance', access: 'public' },
    { name: 'Information Security Policy', category: 'Policies', access: 'public' },
    { name: 'Subprocessors', category: 'Legal', access: 'public' },
  ],
}

const fallback: Artifact[] = [
  { name: 'SOC 2 Type II Report', category: 'Reports', access: 'private' },
  { name: 'ISO/IEC 27001:2022', category: 'Compliance', access: 'public' },
  { name: 'Data Processing Agreement', category: 'Legal', access: 'public' },
]

export const artifactsFor = (vendor: string): Artifact[] => shared[vendor] ?? fallback
