import { createPortal } from 'react-dom'

type ModalProps = {
  isOpen: boolean
  variant: 'error' | 'success'
  title: string
  message: string
  onClose: () => void
  onConfirm?: () => void
  confirmLabel?: string
}

export function Modal({ isOpen, variant, title, message, onClose, onConfirm, confirmLabel = 'Lanjut' }: ModalProps) {
  if (!isOpen) return null

  return createPortal(
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className={`modal-dialog modal-${variant}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-icon" aria-hidden="true">{variant === 'error' ? '!' : '✓'}</div>
        <h2 id="modal-title">{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button type="button" className="modal-cancel" onClick={onClose}>Batal</button>
          {onConfirm && <button type="button" className="modal-close" onClick={onConfirm}>{confirmLabel}</button>}
          {!onConfirm && <button type="button" className="modal-close" onClick={onClose}>{variant === 'error' ? 'Tutup' : 'Lanjut'}</button>}
        </div>
      </section>
    </div>,
    document.body,
  )
}
