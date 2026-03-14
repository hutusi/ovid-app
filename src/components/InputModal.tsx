import { useEffect, useRef, useState } from "react";

interface InputModalProps {
  title: string;
  placeholder: string;
  defaultValue?: string;
  confirmLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function InputModal({
  title,
  placeholder,
  defaultValue = "",
  confirmLabel = "Create",
  onConfirm,
  onCancel,
}: InputModalProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && value.trim()) {
      onConfirm(value.trim());
    } else if (e.key === "Escape") {
      onCancel();
    }
  }

  return (
    // Overlay: flex container to center the modal
    <div className="modal-overlay">
      {/* Backdrop as a semantic button — click to dismiss */}
      <button
        type="button"
        className="modal-backdrop"
        aria-label="Close modal"
        onClick={onCancel}
      />
      {/* Modal dialog — sibling of backdrop, centered by parent flex */}
      <div role="dialog" aria-modal="true" className="modal">
        <p className="modal-title">{title}</p>
        <input
          ref={inputRef}
          className="modal-input"
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="modal-actions">
          <button type="button" className="modal-btn modal-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="modal-btn modal-confirm"
            disabled={!value.trim()}
            onClick={() => value.trim() && onConfirm(value.trim())}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
