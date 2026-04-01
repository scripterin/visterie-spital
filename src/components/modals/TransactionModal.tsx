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
  
  // Culori extrase exact din butoanele tale (btn-add si btn-remove)
  const colorHex = isAdd ? "#4ade80" : "#f87171";
  const accentColor = "#EA8232"; // Portocaliul de la Bilant

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
          callsign: `M-${callsign.trim()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Eroare necunoscută");
        return;
      }

      toast.success(isAdd ? "Bani adăugați!" : "Bani retrași!");
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-[12px] bg-black/40 animate-fadeIn"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0C0C0F] border border-white/10 rounded-[22px] w-full max-w-md overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-slideUp">
        
        {/* Header Style (Similar cu Bilant-card) */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center border"
              style={{ 
                backgroundColor: isAdd ? "rgba(34,197,94,0.09)" : "rgba(239,68,68,0.07)", 
                borderColor: isAdd ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.16)",
                color: colorHex 
              }}
            >
              {isAdd ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              )}
            </div>
            <div>
              <h2 className="text-white font-semibold text-[17px] tracking-tight leading-none">{title}</h2>
              <p className="text-white/20 text-[10px] uppercase tracking-[0.15em] font-bold mt-1.5">Visterie Internă</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/5 text-white/30 hover:text-white transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mx-6" />

        <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-5">
          
          {/* Suma - Stil DM Mono */}
          <div className="space-y-2">
            <label className="text-white/25 text-[10px] font-bold uppercase tracking-widest ml-1">Valoare Tranzacție</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 font-mono text-xl transition-colors group-focus-within:text-[#EA8232]">$</span>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3.5 pl-9 pr-4 text-white placeholder:text-white/5 focus:outline-none focus:border-[#EA8232]/30 focus:bg-white/[0.06] transition-all font-mono text-lg"
                autoFocus
              />
            </div>
          </div>

          {/* Callsign - M- Prefix */}
          <div className="space-y-2">
            <label className="text-white/25 text-[10px] font-bold uppercase tracking-widest ml-1">Responsabil (Callsign)</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#EA8232] font-black text-sm tracking-tighter">M-</span>
              <input
                type="text"
                placeholder="000"
                value={callsign}
                onChange={(e) => {
                  const val = e.target.value.replace(/^M-/i, "");
                  if (/^\d{0,3}$/.test(val)) setCallsign(val);
                }}
                className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-white/5 focus:outline-none focus:border-[#EA8232]/30 focus:bg-white/[0.06] transition-all font-medium tracking-widest"
              />
            </div>
          </div>

          {/* Motiv */}
          <div className="space-y-2">
            <label className="text-white/25 text-[10px] font-bold uppercase tracking-widest ml-1">Detalii / Motiv</label>
            <textarea
              placeholder="Ex: Achiziție pachete medicale..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-white/5 focus:outline-none focus:border-[#EA8232]/30 focus:bg-white/[0.06] transition-all text-sm resize-none"
            />
          </div>

          {/* Butoane - Matching Dashboard Style */}
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl bg-white/5 text-white/40 font-semibold hover:bg-white/10 hover:text-white transition-all text-[13px]"
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-[1.5] py-3.5 rounded-xl font-bold text-[13px] transition-all flex items-center justify-center gap-2 ${
                isAdd ? 'btn-add' : 'btn-remove'
              }`}
              style={{
                backgroundColor: loading ? 'rgba(255,255,255,0.05)' : undefined,
                border: loading ? '1px solid rgba(255,255,255,0.1)' : undefined,
                color: loading ? 'rgba(255,255,255,0.2)' : undefined,
                height: 'auto' // Resetează înălțimea fixă dacă există în clasele CSS globale
              }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>{isAdd ? "Confirmă Depunerea" : "Confirmă Retragerea"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}