import { useState, type ReactNode } from 'react'
import { artifactFilters, artifactsFor, type ArtifactAccess } from '../fixtures/artifacts'
import { Close, Download, FileText, Lock } from '../icons'
import { Picker } from './Picker'

/* Right column: the documents the vendor has shared, laid out like a trust
   center's document list. Same sliding behavior as the vendor information
   panel. */
export function ArtifactsPanel({
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
  const [filter, setFilter] = useState<'all' | ArtifactAccess>('all')
  const all = artifactsFor(vendor)
  const docs = all.filter((d) => filter === 'all' || d.access === filter)
  return (
    <aside className="s-ac-panel" aria-label="Artifacts" data-open={open} inert={!open} style={{ width: open ? width : 0 }}>
      <div className="s-ac-panel-clip">
        <div className="s-ac-panel-inner" style={{ width }}>
          <header className="s-ac-panel-head">
            <h3>Artifacts</h3>
            <button type="button" className="s-icon-btn" aria-label="Close artifacts" onClick={onClose}>
              <Close size={14} />
            </button>
          </header>
          <div className="s-ac-docs-bar">
            <Picker label="Filter documents" value={filter} options={artifactFilters.map((f) => ({ ...f }))} onChange={setFilter} />
            <button type="button" className="s-ghost">
              <Download size={13} />
              Bulk download
            </button>
          </div>
          <div className="s-ac-panel-body s-ac-docs" data-lenis-prevent>
            <ul className="s-ac-doc-list">
              {docs.map((d) => (
                <li key={d.name} className="s-ac-doc">
                  <span className="s-ac-doc-icon">
                    <FileText size={14} />
                  </span>
                  <span className="s-ac-doc-text">
                    <small>{d.category}</small>
                    <b>{d.name}</b>
                  </span>
                  {d.access === 'private' && <Lock size={12} className="s-ac-doc-lock" aria-label="Private" />}
                  <button type="button" className="s-icon-btn s-ac-doc-dl" aria-label={`Download ${d.name}`}>
                    <Download size={14} />
                  </button>
                </li>
              ))}
              {docs.length === 0 && <li className="s-empty">Nothing here.</li>}
            </ul>
          </div>
        </div>
      </div>
      {open && children}
    </aside>
  )
}
