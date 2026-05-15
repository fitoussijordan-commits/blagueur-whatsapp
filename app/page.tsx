"use client";
import { useState } from "react";

function cleanPhone(raw: string) {
  let p = raw.replace(/[\s\-\.\(\)]/g, "");
  if (p.startsWith("+")) p = p.slice(1);
  else if (p.startsWith("00")) p = p.slice(2);
  else if (p.startsWith("0")) p = "33" + p.slice(1);
  return p;
}

export default function Page() {
  const [phone, setPhone] = useState("");
  const [contactName, setContactName] = useState("");
  const [joke, setJoke] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  async function generateJoke() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/joke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recent: history.slice(-6) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Erreur inconnue");
      setJoke(data.joke);
      setHistory((prev) => [...prev, data.joke]);
    } catch (e: any) {
      setError(e?.message ?? "Erreur lors de la génération");
    }
    setLoading(false);
  }

  function sendToWhatsApp() {
    if (!joke) return;
    const greeting = contactName ? `Salut ${contactName} 👋\n\n` : "";
    const msg = encodeURIComponent(`${greeting}${joke}\n\n— Blague du jour 🎭`);
    const cleaned = phone ? cleanPhone(phone) : "";
    const url = cleaned
      ? `https://wa.me/${cleaned}?text=${msg}`
      : `https://wa.me/?text=${msg}`;
    window.open(url, "_blank");
  }

  async function copyJoke() {
    if (!joke) return;
    try {
      await navigator.clipboard.writeText(joke);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Copie impossible");
    }
  }

  return (
    <main
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at top, #2a1810 0%, #1a0f08 40%, #0a0604 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E\")",
        }}
      />
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30 blur-3xl"
        style={{ background: "#d4a574" }}
      />
      <div
        className="absolute bottom-0 -left-32 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
        style={{ background: "#8b3a1f" }}
      />

      <div className="relative max-w-2xl mx-auto px-6 py-12 md:py-20">
        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border text-xs tracking-widest uppercase font-semibold"
            style={{ borderColor: "#d4a574", color: "#d4a574" }}
          >
            ✦ Style Bigard
          </div>
          <h1
            className="text-5xl md:text-7xl font-black leading-none mb-3"
            style={{ color: "#f4e8d8", letterSpacing: "-0.04em" }}
          >
            La blague<br />
            <span
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontStyle: "italic",
                color: "#d4a574",
                fontWeight: 400,
              }}
            >
              du jour.
            </span>
          </h1>
          <p className="text-sm md:text-base" style={{ color: "#a8957a" }}>
            Une blague gratinée, expédiée direct sur WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Prénom du contact (optionnel)"
            className="px-4 py-3 rounded-lg border bg-transparent text-sm focus:outline-none transition"
            style={{ borderColor: "#3d2817", color: "#f4e8d8" }}
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+33 6 12 34 56 78"
            className="px-4 py-3 rounded-lg border bg-transparent text-sm focus:outline-none transition"
            style={{ borderColor: "#3d2817", color: "#f4e8d8" }}
          />
        </div>

        <div
          className="relative mb-6 p-8 md:p-10 rounded-2xl border-2 min-h-[240px] flex items-center justify-center"
          style={{
            borderColor: "#3d2817",
            background:
              "linear-gradient(135deg, rgba(60,35,20,0.4) 0%, rgba(30,18,10,0.6) 100%)",
            backdropFilter: "blur(10px)",
          }}
        >
          {!joke && !loading && (
            <div className="text-center" style={{ color: "#a8957a" }}>
              <div className="text-6xl mb-3 opacity-50">🎭</div>
              <p
                className="text-sm italic"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                Clique pour faire crépiter une blague…
              </p>
            </div>
          )}
          {loading && (
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-8 h-8 border-2 rounded-full animate-spin"
                style={{ borderColor: "#d4a574", borderTopColor: "transparent" }}
              />
              <p className="text-sm" style={{ color: "#a8957a" }}>
                Bigard chauffe sa voix…
              </p>
            </div>
          )}
          {joke && !loading && (
            <p
              className="text-lg md:text-xl leading-relaxed whitespace-pre-line text-center"
              style={{ color: "#f4e8d8", fontFamily: "'DM Serif Display', serif" }}
            >
              {joke}
            </p>
          )}
        </div>

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-lg text-sm"
            style={{ background: "#3d1a0f", color: "#f4b58d" }}
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={generateJoke}
            disabled={loading}
            className="px-5 py-4 rounded-xl font-semibold text-sm tracking-wide uppercase transition active:scale-95 disabled:opacity-50"
            style={{ background: "#d4a574", color: "#1a0f08" }}
          >
            ✦ {joke ? "Une autre" : "Générer"}
          </button>

          <button
            onClick={copyJoke}
            disabled={!joke}
            className="px-5 py-4 rounded-xl font-semibold text-sm tracking-wide uppercase transition active:scale-95 disabled:opacity-30 border-2"
            style={{ borderColor: "#3d2817", color: "#f4e8d8" }}
          >
            {copied ? "✓ Copié" : "Copier"}
          </button>

          <button
            onClick={sendToWhatsApp}
            disabled={!joke}
            className="px-5 py-4 rounded-xl font-semibold text-sm tracking-wide uppercase transition active:scale-95 disabled:opacity-30"
            style={{ background: "#25D366", color: "#0a2914" }}
          >
            → WhatsApp
          </button>
        </div>

        <p className="mt-10 text-xs text-center" style={{ color: "#6b5840" }}>
          {history.length > 0
            ? `${history.length} blague${history.length > 1 ? "s" : ""} générée${history.length > 1 ? "s" : ""} • `
            : ""}
          propulsé par Gemini — déployé sur Vercel
        </p>
      </div>
    </main>
  );
}
