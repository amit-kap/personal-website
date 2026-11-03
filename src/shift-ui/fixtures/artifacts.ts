export type ArtifactAccess = 'public' | 'private'

export type Artifact = { name: string; category: string; access: ArtifactAccess }

export const artifactFilters = [
  { id: 'all', label: 'All' },
  { id: 'public', label: 'Public' },
  { id: 'private', label: 'Private' },
] as const

/* Documents the vendor has shared for an assessment, in the manner of a trust
   center's document list. Trimbox's are what it evidenced across the two inquiries. */
const shared: Record<string, Artifact[]> = {
  Trimbox: [
    { name: 'Encryption Policy', category: 'Policies', access: 'private' },
    { name: 'Incident Response Policy', category: 'Policies', access: 'private' },
    { name: 'Data Processing Agreement', category: 'Legal', access: 'private' },
    { name: 'Subprocessors', category: 'Legal', access: 'public' },
    { name: 'Privacy Policy', category: 'Legal', access: 'public' },
  ],
}

const fallback: Artifact[] = [
  { name: 'SOC 2 Type II Report', category: 'Reports', access: 'private' },
  { name: 'ISO/IEC 27001:2022', category: 'Compliance', access: 'public' },
  { name: 'Data Processing Agreement', category: 'Legal', access: 'public' },
]

export const artifactsFor = (vendor: string): Artifact[] => shared[vendor] ?? fallback
