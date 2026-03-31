import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Visterie Spital",
  description: "Sistem de management pentru visterie",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <div className="bg-scene" />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(15,15,20,0.9)",
              color: "#f0f0f0",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              fontFamily: "'Inter', sans-serif",
              backdropFilter: "blur(20px)",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#22c55e", secondary: "#0a0a0a" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#0a0a0a" },
            },
          }}
        />
      </body>
    </html>
  );
}