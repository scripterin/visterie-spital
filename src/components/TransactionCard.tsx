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
    year: "numeric", month: "2-digit", day: "2-digit",
  });
  const formattedTime = date.toLocaleTimeString("ro-RO", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className={`glass p-4 ${isAdd ? "tx-add" : "tx-remove"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          {/* Badge */}
          <div
            className="flex-shrink-0 mt-0.5 px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider"
            style={
              isAdd
                ? { background: "rgba(34,197,94,0.12)", color: "var(--green)", border: "1px solid rgba(34,197,94,0.2)" }
                : { background: "rgba(239,68,68,0.12)", color: "var(--red)", border: "1px solid rgba(239,68,68,0.2)" }
            }
          >
            {isAdd ? "ADĂUGARE" : "SCOATERE"}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm text-white mb-1.5 truncate">{tx.reason}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs" style={{ color: "var(--muted)" }}>
              <span>
                Callsign:{" "}
                <span className="font-semibold text-white">{tx.callsign}</span>
              </span>
              {tx.user?.username && (
                <span>
                  Efectuat de:{" "}
                  <span style={{ color: "rgba(255,255,255,0.6)" }}>{tx.user.username}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 text-right">
          <p className="font-black text-lg tracking-tight"
            style={{ color: isAdd ? "var(--green)" : "var(--red)" }}>
            {isAdd ? "+" : "-"}${tx.amount.toLocaleString("ro-RO")}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            {formattedDate} {formattedTime}
          </p>
        </div>
      </div>
    </div>
  );
}