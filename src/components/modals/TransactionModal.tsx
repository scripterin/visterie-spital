"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface TransactionModalProps {
  type: "add" | "remove";
  onClose: () => void;
  onSuccess: () => void;
}

export default function TransactionModal({ type, onClose, onSuccess }: TransactionModalProps) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [callsign, setCallsign] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdd = type === "add";
  const title = isAdd ? "Adaugă Bani" : "Scoate Bani";
  const colorHex = isAdd ? "#00E5A0" : "#FF4D6D";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Suma trebuie să fie mai mare de 0");
      return;
    }
    if (!reason.trim()) {
      toast.error("Motivul este obligatoriu");
      return;
    }
    if (!callsign.trim()) {
      toast.error("Callsign-ul este obligatoriu");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount: numericAmount,
          reason: reason.trim(),
          callsign: callsign.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Eroare necunoscută");
        return;
      }

      toast.success(isAdd ? "Bani adăugați cu succes!" : "Bani retrași cu succes!");
      onSuccess();
      onClose();
    } catch {
      toast.error("Eroare de rețea");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-vault-card border border-vault-border rounded-2xl w-full max-w-md mx-4 animate-slideUp shadow-2xl overflow-hidden">

        {/* Accent bar top */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${colorHex}80, ${colorHex}20)` }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
              style={{ background: `${colorHex}15`, border: `1px solid ${colorHex}30` }}
            >
              {isAdd ? "➕" : "➖"}
            </div>
            <h2 className="font-display font-bold text-lg text-vault-text leading-none">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-vault-muted hover:text-vault-text transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-vault-border shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-vault-border mx-6" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label className="text-vault-muted text-xs font-display uppercase tracking-wider">
              Sumă ($)
            </label>
            <div className="relative flex items-center">
              <span className="absolute text-vault-muted font-display text-sm pointer-events-none select-none" style={{ left: "12px" }}>
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Introdu suma"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="vault-input w-full py-2.5 pr-4 rounded-xl text-sm"
                style={{ paddingLeft: "28px" }}
                autoFocus
              />
            </div>
          </div>

          {/* Callsign */}
          <div className="flex flex-col gap-1.5">
            <label className="text-vault-muted text-xs font-display uppercase tracking-wider">
              Callsign
            </label>
            <div className="relative flex items-center">
              <span
                className="absolute font-display font-bold text-sm pointer-events-none select-none"
                style={{ left: "12px", color: "#F5C842" }}
              >
                M-
              </span>
              <input
                type="text"
                placeholder="Introdu Callsign-ul"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value.replace(/^M-/i, ""))}
                className="vault-input w-full py-2.5 pr-4 rounded-xl text-sm"
                style={{ paddingLeft: "36px" }}
              />
            </div>
            {callsign && (
              <p className="text-vault-muted text-xs ml-1">
                Salvat ca:{" "}
                <span className="font-display font-semibold" style={{ color: "#F5C842" }}>
                  M-{callsign}
                </span>
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-1.5">
            <label className="text-vault-muted text-xs font-display uppercase tracking-wider">
              Motiv
            </label>
            <textarea
              placeholder="Motivul tranzacției"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="vault-input w-full px-4 py-2.5 rounded-xl text-sm resize-none"
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-vault-border" />

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-vault-border text-vault-muted hover:text-vault-text hover:border-vault-muted transition-all duration-200 text-sm font-medium"
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading ? undefined : `${colorHex}18`,
                border: `1px solid ${colorHex}50`,
                color: colorHex,
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Se procesează...
                </>
              ) : (
                title
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}