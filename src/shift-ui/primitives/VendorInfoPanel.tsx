import type { ReactNode } from 'react'
import { vendorDetails } from '../fixtures/vendorDetail'
import { Close, Info } from '../icons'
import { Rail } from './VendorDetail'

/* Right column: facts about the vendor, reusing the vendor card's rail. Always
   mounted so it can slide: the column animates its width while the content
   keeps its own, so nothing reflows on the way. Inert while closed. */
export function VendorInfoPanel({
  vendor,
  open,
  width,
  onClose,
  children,
}: {
  vendor: string
  open: boolean
  width: number
  onClose: () => void
  children?: ReactNode
}) {
  const detail = vendorDetails[vendor]
  return (
    <aside className="s-ac-panel" aria-label="Vendor information" data-open={open} inert={!open} style={{ width: open ? width : 0 }}>
      <div className="s-ac-panel-clip">
        <div className="s-ac-panel-inner" style={{ width }}>
          <header className="s-ac-panel-head">
            <h3>Vendor information</h3>
            <button type="button" className="s-icon-btn" aria-label="Close vendor information" onClick={onClose}>
              <Close size={14} />
            </button>
          </header>
          <div className="s-ac-panel-body" data-lenis-prevent>
            {detail ? <Rail detail={detail} /> : (
              <div className="s-ac-panel-empty">
                <Info size={18} />
                <b>No vendor information yet</b>
                <span>Shift adds details here as the assessment collects them.</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {open && children}
    </aside>
  )
}
