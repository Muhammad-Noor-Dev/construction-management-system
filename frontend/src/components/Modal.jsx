import { X } from 'lucide-react';
export default function Modal({ title, onClose, onSave, saving, children }) {
  return <div className="modal-backdrop">
    <div className="modal">
      <div className="modal-head">
        <h3>{title}</h3>
        <button className="icon-btn" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="form-grid">{children}</div>
      <div className="modal-actions">
        <button className="secondary" onClick={onClose}>Cancel</button>
        <button className="primary" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
      </div>
    </div>
  </div>
}
