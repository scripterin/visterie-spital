"use client";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  reason: string;
  callsign: string;
  date: string;
  user?: { username: string | null; callsign: string | null };
}

export default function TransactionCard({ tx }: { tx: Transaction }) {
  const isAdd = tx.type === "add";
  const date = new Date(tx.date);
  
  const formattedDate = date.toLocaleDateString("ro-RO", {
    day: "2-digit", month: "2-digit",
  });
  const formattedTime = date.toLocaleTimeString("ro-RO", {
    hour: "2-digit", minute: "2-digit",
  });

  const colorHex = isAdd ? "#4ade80" : "#f87171";

  return (
    <div className="group relative bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-2xl p-3.5 transition-all duration-200">
      <div className="flex items-center justify-between gap-4">
        
        {/* Partea Stângă: Icon + Detalii */}
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Indicator Tip Tranzacție */}
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
            style={{ 
              backgroundColor: isAdd ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.06)", 
              borderColor: isAdd ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
              color: colorHex 
            }}
          >
            {isAdd ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/></svg>
            )}
          </div>

          <div className="min-w-0">
            <h4 className="text-[13.5px] font-medium text-white/90 truncate leading-snug">
              {tx.reason}
            </h4>
            <div className="flex items-center gap-2.5 mt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-tight">Callsign:</span>
                <span className="text-[11px] font-bold text-[#EA8232] tracking-tighter">
                  {tx.callsign.startsWith('M-') ? tx.callsign : `M-${tx.callsign}`}
                </span>
              </div>
              
              <div className="w-1 h-1 rounded-full bg-white/10" />

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-tight">Conducere:</span>
                <span className="text-[11px] font-medium text-white/40">
                   {tx.user?.callsign ?? tx.user?.username ?? "Sistem"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Partea Dreaptă: Sumă + Dată */}
        <div className="text-right shrink-0">
          <div 
            className="font-mono text-[16px] font-bold tracking-tight"
            style={{ color: colorHex }}
          >
            {isAdd ? "+" : "-"}${tx.amount.toLocaleString("ro-RO")}
          </div>
          <div className="flex items-center justify-end gap-1.5 mt-1">
            <span className="text-[10px] font-medium text-white/20">{formattedDate}</span>
            <span className="text-[10px] font-bold text-white/10">•</span>
            <span className="text-[10px] font-medium text-white/20">{formattedTime}</span>
          </div>
        </div>

      </div>

      {/* Glow discret la hover (opțional) */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at center, ${colorHex}05 0%, transparent 70%)` 
        }} 
      />
    </div>
  );
}