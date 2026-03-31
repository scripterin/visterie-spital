"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)" }} />

      <div className="relative z-10 flex flex-col items-center gap-6 px-4 w-full max-w-sm">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
          💰
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tight text-white mb-1">
            VISTERIE
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "12px", letterSpacing: "0.15em" }} className="uppercase">
            Eclipse Medical Tower
          </p>
        </div>

        {/* Card */}
        <div className="glass w-full p-8 flex flex-col gap-5">
          <div className="text-center">
            <h2 className="text-white font-semibold text-lg mb-1">Autentificare</h2>
            <p style={{ color: "var(--muted)", fontSize: "13px", lineHeight: "1.5" }}>
              Conectează-te cu contul tău Discord pentru a accesa visteria.
            </p>
          </div>

          <button
            onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-3 font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #5865F2, #4752C4)",
              color: "#fff",
              boxShadow: "0 4px 24px rgba(88,101,242,0.35)",
              fontSize: "15px",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.022.015.043.03.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            Conectează-te cu Discord
          </button>

          <p className="text-center text-xs" style={{ color: "var(--muted)" }}>
            Accesul este restricționat. Doar membrii autorizați pot intra.
          </p>
        </div>
      </div>
    </div>
  );
}