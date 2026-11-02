import type { ReactNode } from 'react'
import { vendorDetails } from '../fixtures/vendorDetail'
import { Close } from '../icons'
import { Rail } from './VendorDetail'

/* Right column: facts about the vendor, reusing the vendor card's rail. */
export function VendorInfoPanel({ vendor, width, onClose, children }: { vendor: string; width: number; onClose: () => void; children?: ReactNode }) {
  const detail = vendorDetails[vendor]
  return (
    <aside className="s-ac-panel" aria-label="Vendor information" style={{ width }}>
      <header className="s-ac-panel-head">
        <h3>Vendor information</h3>
        <button type="button" className="s-icon-btn" aria-label="Close vendor information" onClick={onClose}>
          <Close size={14} />
        </button>
      </header>
      <div className="s-ac-panel-body" data-lenis-prevent>
        {detail ? <Rail detail={detail} /> : <p className="s-empty">No vendor information.</p>}
      </div>
      {children}
    </aside>
  )
}
