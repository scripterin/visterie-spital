"use client";

import { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import type { Session } from "next-auth";
import toast from "react-hot-toast";
import TransactionModal from "@/components/modals/TransactionModal";
import ConfirmModal from "@/components/modals/ConfirmModal";
import TransactionCard from "@/components/TransactionCard";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  reason: string;
  callsign: string;
  date: string;
  user?: { username: string | null; callsign: string | null };
}

export default function DashboardClient({ session }: { session: Session }) {
  const [treasury, setTreasury] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amountRevealed, setAmountRevealed] = useState(false);
  const [showRevealConfirm, setShowRevealConfirm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loadingTreasury, setLoadingTreasury] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [deletingHistory, setDeletingHistory] = useState(false);
  const [ultimaDataBilant, setUltimaDataBilant] = useState<string | null>(null);

  const isAdmin = session.user.rol === "admin"; // doar adminii pot folosi butonul

  const fetchTreasury = useCallback(async () => {
    try {
      const res = await fetch("/api/treasury");
      const data = await res.json();
      setTreasury(data.totalAmount);
    } catch {
      toast.error("Nu s-a putut încărca visteria");
    } finally {
      setLoadingTreasury(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions");
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Nu s-au putut încărca tranzacțiile");
    } finally {
      setLoadingTransactions(false);
    }
  }, []);

  useEffect(() => {
    fetchTreasury();
    fetchTransactions();
  }, [fetchTreasury, fetchTransactions]);

  function refreshData() {
    setLoadingTreasury(true);
    setLoadingTransactions(true);
    fetchTreasury();
    fetchTransactions();
  }

  async function handleDeleteHistory() {
    setDeletingHistory(true);
    try {
      const res = await fetch("/api/transactions", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Eroare la ștergere"); return; }
      toast.success("Istoricul a fost șters");
      setTransactions([]);
      setShowDeleteConfirm(false);
    } catch {
      toast.error("Eroare de rețea");
    } finally {
      setDeletingHistory(false);
    }
  }

  const formatDate = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;

  const genereazaBilant = async () => {
    try {
      const res = await fetch("/api/bilant", { method: "POST" });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      const lastDate = new Date(data.lastDate);
      const currentDate = new Date(data.currentDate);

      const text = `
=== BILANT ${formatDate(lastDate)} - ${formatDate(currentDate)} ===

Total visterie: ${data.totalVisterie.toLocaleString("ro-RO")}$

Bani bagati: ${data.baniBagati.toLocaleString("ro-RO")}$ 
Bani scosi: ${data.baniScosi.toLocaleString("ro-RO")}$

${
  data.profit > 0
    ? `Profit fata de ultimul bilant: ${data.profit.toLocaleString("ro-RO")}$`
    : `Nu exista profit.\nDiferenta: ${data.profit.toLocaleString("ro-RO")}$`
}
      `;

      const blob = new Blob([text], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `bilant-${formatDate(currentDate)}.txt`;
      link.click();

      setUltimaDataBilant(formatDate(currentDate));
      toast.success("Bilant generat cu succes!");
    } catch (err: unknown) {
      console.error("Eroare la generarea bilanțului:", err);
      toast.error("Eroare la generarea bilanțului");
    }
  };

  const avatarUrl = session.user.avatar ?? session.user.image ?? undefined;
  const displayName = session.user.username ?? session.user.name ?? "Utilizator";

  return (
    <div style={{ height: "100vh", overflow: "hidden", position: "relative" }}>
      {/* Ambient glows */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)" }} />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)" }} />

      {/* ─── Buton Generează Bilant — vizibil doar admin ─── */}
      {isAdmin && (
        <div
          className="fixed z-50 flex flex-col items-start gap-1"
          style={{ top: "80px", left: "24px" }}
        >
          <button
            onClick={genereazaBilant}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-white text-xs font-semibold transition-all duration-150 shadow-lg"
            style={{
              background: "rgba(249,115,22,0.9)",
              border: "1px solid rgba(251,146,60,0.4)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 16px rgba(249,115,22,0.3)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(234,88,12,0.95)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(234,88,12,0.45)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(249,115,22,0.9)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(249,115,22,0.3)";
            }}
          >
            <span>📄</span>
            <span>Generează Bilant</span>
          </button>

          {ultimaDataBilant ? (
            <p className="text-xs pl-1" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.03em" }}>
              Ultima calculare: {ultimaDataBilant}
            </p>
          ) : (
            <p className="text-xs pl-1" style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.03em" }}>
              Niciun bilanț generat
            </p>
          )}
        </div>
      )}

      {/* Navbar */}
      <nav style={{ height: "64px", background: "transparent", position: "relative", zIndex: 40 }}>
        <div style={{
          width: "100%", padding: "0 32px", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px",
        }}>
          {isAdmin && (
            <div style={{
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em",
              color: "#818cf8", background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.25)", borderRadius: "8px", padding: "4px 10px",
            }}>ADMIN</div>
          )}

          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" width={34} height={34}
              style={{ borderRadius: "50%", border: "2px solid rgba(255,255,255,0.1)" }} />
          ) : (
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "rgba(99,102,241,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: 700, color: "#a5b4fc",
            }}>
              {displayName[0]?.toUpperCase()}
            </div>
          )}

          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff", lineHeight: 1 }}>{displayName}</div>
            {session.user.callsign && (
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "3px", lineHeight: 1 }}>
                {session.user.callsign}
              </div>
            )}
          </div>

          <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.08)", margin: "0 4px" }} />

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            title="Deconectare"
            style={{
              width: "34px", height: "34px", borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.4)", cursor: "pointer", transition: "all 0.15s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(239,68,68,0.1)";
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "rgba(255,255,255,0.4)";
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Main */}
      <main style={{
        position: "relative", zIndex: 10, height: "calc(100vh - 64px)",
        overflow: "hidden", maxWidth: "860px", margin: "0 auto", padding: "24px 16px",
        display: "flex", flexDirection: "column", gap: "20px",
      }}>

        {/* Treasury Card */}
        <div className="glass p-6 select-none" style={{ flexShrink: 0 }}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--muted)" }}>
                Total Visterie
              </p>
              <p className="text-xs" style={{ color: "var(--muted)", opacity: 0.6 }}>
                {amountRevealed ? "Click pe sumă pentru a ascunde" : "Click pe sumă pentru a afișa"}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              🏦
            </div>
          </div>

          {loadingTreasury ? (
            <div className="skeleton h-14 w-56 rounded-xl" />
          ) : (
            <div className="cursor-pointer inline-block" onClick={() => {
              if (!amountRevealed) setShowRevealConfirm(true);
              else setAmountRevealed(false);
            }}>
              <span className="font-black text-5xl tracking-tight text-white transition-all duration-300"
                style={{ filter: amountRevealed ? "blur(0px)" : "blur(10px)", userSelect: "none" }}>
                ${(treasury ?? 0).toLocaleString("ro-RO")}
              </span>
            </div>
          )}

          {!amountRevealed && (
            <p className="text-xs mt-3 flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Apasă pentru a vedea suma
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4" style={{ flexShrink: 0 }}>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-green flex items-center justify-center gap-2 text-base"
            style={{ minHeight: "72px" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Adaugă Bani
          </button>
          <button
            onClick={() => setShowRemoveModal(true)}
            className="btn-red flex items-center justify-center gap-2 text-base"
            style={{ minHeight: "72px" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Scoate Bani
          </button>
        </div>

        {/* Transactions */}
        <div className="glass p-6" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <div className="flex items-center justify-between mb-5" style={{ flexShrink: 0 }}>
            <div>
              <h2 className="font-bold text-white text-lg">Istoric Tranzacții</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{transactions.length} tranzacții</p>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && transactions.length > 0 && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-lg transition-all"
                  style={{ color: "var(--red)", border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                  Șterge tot
                </button>
              )}
              <button
                onClick={refreshData}
                title="Reîncarcă"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ color: "var(--muted)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              </button>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", marginBottom: "16px", flexShrink: 0 }} />

          {loadingTransactions ? (
            <div className="flex flex-col gap-3">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center" style={{ flex: 1 }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                📋
              </div>
              <p className="font-medium text-white">Nicio tranzacție</p>
              <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Adaugă prima tranzacție folosind butoanele de mai sus.</p>
            </div>
          ) : (
            <div className="tx-scroll flex flex-col gap-3" style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
              {transactions.map((tx) => <TransactionCard key={tx.id} tx={tx} />)}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showRevealConfirm && (
        <ConfirmModal
          title="Afișează suma?" message="Vrei să afișezi suma totală din visterie?"
          confirmLabel="Da, afișează" confirmColor="#6366f1"
          onConfirm={() => { setAmountRevealed(true); setShowRevealConfirm(false); }}
          onCancel={() => setShowRevealConfirm(false)}
        />
      )}
      {showAddModal && <TransactionModal type="add" onClose={() => setShowAddModal(false)} onSuccess={refreshData} />}
      {showRemoveModal && <TransactionModal type="remove" onClose={() => setShowRemoveModal(false)} onSuccess={refreshData} />}
      {showDeleteConfirm && (
        <ConfirmModal
          title="Ștergi tot istoricul?" message="Această acțiune este ireversibilă. Toate tranzacțiile vor fi șterse permanent."
          confirmLabel="Șterge tot" confirmColor="#ef4444"
          onConfirm={handleDeleteHistory} onCancel={() => setShowDeleteConfirm(false)} loading={deletingHistory}
        />
      )}
    </div>
  );
}