"use client";

import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import Image from "next/image";

export default function AccessDeniedPage({ session }: { session: Session }) {
  return (
    <div style={{ height: "100vh", overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Ambient glow */}
      <div className="fixed pointer-events-none" style={{
        top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)",
      }} />

      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", padding: "32px 16px", maxWidth: "420px", width: "100%", textAlign: "center" }}>

        {/* Icon */}
        <div style={{
          width: "64px", height: "64px", borderRadius: "20px",
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px",
        }}>🚫</div>

        {/* Title */}
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#ef4444", letterSpacing: "-0.02em", marginBottom: "8px" }}>
            ACCES INTERZIS
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: 1.6 }}>
            Contul tău Discord nu este autorizat să acceseze visteria.
          </p>
        </div>

        {/* User card */}
        {session.user && (
          <div className="glass w-full p-4" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {session.user.image && (
              <Image src={session.user.image} alt="Avatar" width={42} height={42}
                style={{ borderRadius: "50%", border: "2px solid rgba(255,255,255,0.1)", flexShrink: 0 }} />
            )}
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>{session.user.name}</p>
            </div>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
            color: "#ef4444", fontWeight: 600, fontSize: "14px",
            padding: "10px 24px", borderRadius: "12px",
            cursor: "pointer", transition: "all 0.15s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(239,68,68,0.18)";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(239,68,68,0.1)";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)";
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Deconectare
        </button>
      </div>
    </div>
  );
}