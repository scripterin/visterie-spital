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

const formatDate = (d: Date): string =>
  `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;

export default function DashboardClient({ session }: { session: Session }) {
  const [treasury, setTreasury] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loadingTreasury, setLoadingTreasury] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [deletingHistory, setDeletingHistory] = useState(false);
  const [ultimaDataBilant, setUltimaDataBilant] = useState<string | null>(null);
  const [amountRevealed, setAmountRevealed] = useState(false);

  const isAdmin = session.user.rol === "admin";
  const avatarUrl = session.user.avatar ?? session.user.image ?? undefined;
  const displayName = session.user.username ?? session.user.name ?? "Utilizator";

  useEffect(() => {
    fetch("/api/bilant")
      .then((r) => r.json())
      .then((data) => {
        if (data.lastDate) setUltimaDataBilant(formatDate(new Date(data.lastDate)));
      })
      .catch(() => {});
  }, []);

  const fetchTreasury = useCallback(async () => {
    try {
      const res = await fetch("/api/treasury");
      const data = await res.json();
      setTreasury(data.totalAmount);
    } catch {
      toast.error("Nu s-a putut incarca visteria");
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
      toast.error("Nu s-au putut incarca tranzactiile");
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
      if (!res.ok) {
        toast.error(data.error || "Eroare la stergere");
        return;
      }
      toast.success("Istoricul a fost sters");
      setTransactions([]);
      setShowDeleteConfirm(false);
    } catch {
      toast.error("Eroare de retea");
    } finally {
      setDeletingHistory(false);
    }
  }

  const genereazaBilant = async () => {
    try {
      const res = await fetch("/api/bilant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generatDe: displayName }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const currentDate = new Date(data.currentDate);
      const perioadaSfarsit = formatDate(currentDate);
      setUltimaDataBilant(perioadaSfarsit);

      toast.success("Bilant trimis pe Discord!");
    } catch (err: unknown) {
      console.error("Eroare la generarea bilantului:", err);
      toast.error("Eroare la generarea bilantului");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&family=DM+Mono:wght@400;500&display=swap');

        .db-root {
          font-family: 'DM Sans', sans-serif;
          height: 100vh;
          overflow: hidden;
          position: relative;
        }

        .bilant-card {
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 50;
          background: rgba(18, 18, 22, 0.90);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 12px 15px;
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 215px;
          cursor: pointer;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(12px);
          transition: border-color 0.2s ease, transform 0.15s ease;
          overflow: hidden;
        }
        .bilant-card:hover { border-color: rgba(234,130,50,0.32); transform: translateY(-1px); }
        .bilant-card:hover .bilant-glow { opacity: 1; }
        .bilant-card:active { transform: translateY(0); }

        .bilant-glow {
          position: absolute;
          top: -40px; left: -40px;
          width: 130px; height: 130px;
          background: radial-gradient(circle, rgba(234,130,50,0.13) 0%, transparent 70%);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .bilant-icon {
          width: 34px; height: 34px;
          border-radius: 10px;
          background: linear-gradient(135deg, #EA8232, #bf5a0e);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 3px 10px rgba(234,130,50,0.28);
        }

        .bilant-dl {
          width: 24px; height: 24px;
          border-radius: 7px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .db-nav {
          height: 58px;
          position: relative;
          z-index: 40;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 0 24px;
          gap: 10px;
        }

        .nav-divider { width: 1px; height: 18px; background: rgba(255,255,255,0.07); }

        .nav-signout {
          width: 30px; height: 30px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.3); cursor: pointer;
          transition: all 0.15s ease;
        }
        .nav-signout:hover {
          background: rgba(239,68,68,0.09);
          border-color: rgba(239,68,68,0.22);
          color: #f87171;
        }

        .db-main {
          position: relative; z-index: 10;
          height: calc(100vh - 58px); overflow: hidden;
          max-width: 820px; margin: 0 auto;
          padding: 16px 14px 18px;
          display: flex; flex-direction: column; gap: 12px;
        }

        .treasury-card {
          flex-shrink: 0;
          background: rgba(22, 22, 28, 0.85);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 26px 24px;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          position: relative; overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.06) inset;
        }
        .treasury-card::before {
          content: '';
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 55%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        }

        .treasury-label {
          display: flex; align-items: center; gap: 7px;
          font-size: 9.5px; font-weight: 500; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(255,255,255,0.28);
        }

        .treasury-amount {
          font-family: 'DM Mono', monospace;
          font-size: 40px; font-weight: 500; color: #fff;
          letter-spacing: -0.02em;
          user-select: none;
          transition: filter 0.35s ease; cursor: default;
        }

        .action-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px; flex-shrink: 0;
        }

        .action-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          height: 54px; border-radius: 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; font-weight: 500; cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.18s ease; letter-spacing: 0.01em;
        }
        .action-btn:active { transform: scale(0.98); }

        .btn-add {
          background: rgba(34,197,94,0.09); border-color: rgba(34,197,94,0.18); color: #4ade80;
        }
        .btn-add:hover {
          background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.3);
          transform: translateY(-1px); box-shadow: 0 6px 20px rgba(34,197,94,0.08);
        }

        .btn-remove {
          background: rgba(239,68,68,0.07); border-color: rgba(239,68,68,0.16); color: #f87171;
        }
        .btn-remove:hover {
          background: rgba(239,68,68,0.13); border-color: rgba(239,68,68,0.28);
          transform: translateY(-1px); box-shadow: 0 6px 20px rgba(239,68,68,0.08);
        }

        .tx-panel {
          flex: 1; min-height: 0;
          background: rgba(22, 22, 28, 0.82);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          display: flex; flex-direction: column; overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.05) inset;
        }

        .tx-header {
          padding: 16px 18px 13px;
          display: flex; align-items: center; justify-content: space-between;
          flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .tx-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); }
        .tx-count { font-size: 10.5px; color: rgba(255,255,255,0.22); margin-top: 2px; }
        .tx-actions { display: flex; align-items: center; gap: 6px; }

        .tx-icon-btn {
          width: 28px; height: 28px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          cursor: pointer; color: rgba(255,255,255,0.28); transition: all 0.15s ease;
        }
        .tx-icon-btn:hover {
          background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.65);
          border-color: rgba(255,255,255,0.12);
        }

        .tx-delete-btn {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 500; padding: 5px 10px;
          border-radius: 8px; cursor: pointer;
          color: rgba(239,68,68,0.65); background: rgba(239,68,68,0.05);
          border: 1px solid rgba(239,68,68,0.1); transition: all 0.15s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .tx-delete-btn:hover {
          color: #f87171; background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.22);
        }

        .tx-list {
          flex: 1; overflow-y: auto; padding: 10px 12px;
          display: flex; flex-direction: column; gap: 5px;
        }
        .tx-list::-webkit-scrollbar { width: 2px; }
        .tx-list::-webkit-scrollbar-track { background: transparent; }
        .tx-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 99px; }

        .tx-empty {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 6px; padding: 40px;
        }
        .tx-empty-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: center; margin-bottom: 4px;
        }

        .skeleton-pulse {
          background: linear-gradient(90deg,
            rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.8s ease-in-out infinite;
          border-radius: 12px;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="db-root">
        <div style={{
          position: "fixed", top: 0, right: 0, width: 500, height: 500, pointerEvents: "none",
          background: "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 65%)",
        }} />
        <div style={{
          position: "fixed", bottom: 0, left: 0, width: 350, height: 350, pointerEvents: "none",
          background: "radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 65%)",
        }} />

        {isAdmin && (
          <button className="bilant-card" onClick={genereazaBilant}>
            <div className="bilant-glow" />
            <div className="bilant-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="8" y1="13" x2="16" y2="13"/>
                <line x1="8" y1="17" x2="12" y2="17"/>
              </svg>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "#fff", letterSpacing: "0.01em" }}>
                Genereaza bilant
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)" }}>
                  {ultimaDataBilant ? `Ultima: ${ultimaDataBilant}` : "Niciun bilant generat"}
                </span>
              </div>
            </div>
            <div className="bilant-dl">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
          </button>
        )}

        <nav className="db-nav">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" width={30} height={30}
              style={{ borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.1)" }} />
          ) : (
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "rgba(99,102,241,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 600, color: "#a5b4fc",
            }}>
              {displayName[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: "rgba(255,255,255,0.82)", lineHeight: 1 }}>
              {displayName}
            </div>
            {session.user.callsign && (
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.24)", marginTop: 3, lineHeight: 1 }}>
                {session.user.callsign}
              </div>
            )}
          </div>
          <div className="nav-divider" />
          <button className="nav-signout" onClick={() => signOut({ callbackUrl: "/" })} title="Deconectare">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </nav>

        <main className="db-main">
          <div className="treasury-card">
            <div className="treasury-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="22" x2="21" y2="22"/>
                <line x1="6" y1="18" x2="6" y2="11"/>
                <line x1="10" y1="18" x2="10" y2="11"/>
                <line x1="14" y1="18" x2="14" y2="11"/>
                <line x1="18" y1="18" x2="18" y2="11"/>
                <polygon points="12 2 2 7 22 7"/>
              </svg>
              Total Visterie
            </div>
            {loadingTreasury ? (
              <div className="skeleton-pulse" style={{ height: 48, width: 240 }} />
            ) : (
              <div 
                className="treasury-amount"
                style={{ filter: amountRevealed ? "blur(0px)" : "blur(6px)" }}
                onMouseEnter={() => setAmountRevealed(true)}
                onMouseLeave={() => setAmountRevealed(false)}
              >
                ${(treasury ?? 0).toLocaleString("ro-RO")}
              </div>
            )}
          </div>

          <div className="action-grid">
            <button className="action-btn btn-add" onClick={() => setShowAddModal(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Adauga Bani
            </button>
            <button className="action-btn btn-remove" onClick={() => setShowRemoveModal(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Scoate Bani
            </button>
          </div>

          <div className="tx-panel">
            <div className="tx-header">
              <div>
                <div className="tx-title">Istoric Tranzactii</div>
                <div className="tx-count">{transactions.length} tranzactii</div>
              </div>
              <div className="tx-actions">
                {isAdmin && transactions.length > 0 && (
                  <button className="tx-delete-btn" onClick={() => setShowDeleteConfirm(true)}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                    Sterge tot
                  </button>
                )}
                <button className="tx-icon-btn" onClick={refreshData} title="Reincarca">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                </button>
              </div>
            </div>

            {loadingTransactions ? (
              <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 5 }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton-pulse" style={{ height: 60 }} />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="tx-empty">
                <div className="tx-empty-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="8" y1="13" x2="16" y2="13"/>
                    <line x1="8" y1="17" x2="12" y2="17"/>
                  </svg>
                </div>
                <p style={{ fontSize: 12.5, fontWeight: 500, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                  Nicio tranzactie
                </p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", margin: 0, textAlign: "center" }}>
                  Adauga prima tranzactie folosind butoanele de mai sus.
                </p>
              </div>
            ) : (
              <div className="tx-list">
                {transactions.map((tx) => <TransactionCard key={tx.id} tx={tx} />)}
              </div>
            )}
          </div>
        </main>

        {showAddModal && (
          <TransactionModal type="add" onClose={() => setShowAddModal(false)} onSuccess={refreshData} />
        )}
        {showRemoveModal && (
          <TransactionModal type="remove" onClose={() => setShowRemoveModal(false)} onSuccess={refreshData} />
        )}
        {showDeleteConfirm && (
          <ConfirmModal
            title="Stergi tot istoricul?"
            message="Aceasta actiune este ireversibila. Toate tranzactiile vor fi sterse permanent."
            confirmLabel="Sterge tot"
            confirmColor="#ef4444"
            onConfirm={handleDeleteHistory}
            onCancel={() => setShowDeleteConfirm(false)}
            loading={deletingHistory}
          />
        )}
      </div>
    </>
  );
}