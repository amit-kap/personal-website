import { ChevronRight, OpenDot } from '../icons'
import type { Finding } from '../fixtures/dashboard'
import { VendorLogo } from './VendorLogo'

const kindLabel = { fourth: 'Fourth-Party Threat', access: 'Access Path' } as const

export function FindingRow({ vendor, kind, title, status }: Finding) {
  return (
    <div className="s-row">
      <span className="s-row-bar" />
      <span className="s-vendor">
        <VendorLogo name={vendor} />
        {vendor}
      </span>
      <span className="s-tag" data-kind={kind}>
        {kindLabel[kind]}
      </span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
      <span className="s-status">
        <OpenDot size={13} />
        {status}
      </span>
      <ChevronRight size={11} className="s-chevron" />
    </div>
  )
}
