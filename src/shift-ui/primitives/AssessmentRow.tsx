import { ChevronRight } from '../icons'
import type { AssessmentItem } from '../fixtures/dashboard'
import { VendorLogo } from './VendorLogo'

export function AssessmentRow({ vendor, stage, answered, total, needsYou }: AssessmentItem) {
  const pct = Math.round((answered / total) * 100)
  return (
    <div className="s-row">
      <span className="s-row-bar" data-tone={needsYou ? 'agent' : 'idle'} />
      <span className="s-vendor">
        <VendorLogo name={vendor} />
        {vendor}
      </span>
      <span className="s-tag" data-kind={needsYou ? 'fourth' : 'idle'}>
        {stage}
      </span>
      <span className="s-progress">
        <span className="s-progress-track">
          <span className="s-progress-fill" style={{ width: `${pct}%` }} />
        </span>
        <span className="s-progress-label">
          {answered} of {total} ({pct}%)
        </span>
      </span>
      <span />
      <ChevronRight size={11} className="s-chevron" />
    </div>
  )
}
