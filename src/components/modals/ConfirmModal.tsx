"use client";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirmă",
  confirmColor = "#6366f1",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="glass-modal p-6 w-full max-w-sm mx-4 shadow-2xl">
        <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-ghost flex-1 py-2.5 text-sm">
            Anulează
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50"
            style={{
              background: `${confirmColor}20`,
              border: `1px solid ${confirmColor}50`,
              color: confirmColor,
            }}
          >
            {loading ? "Se procesează..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}