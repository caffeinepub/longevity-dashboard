import { Loader2 } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginScreen() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div
      className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden"
      data-ocid="login.page"
    >
      {/* DNA Background */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <img
          src="/assets/uploads/IMG_8928-1.jpeg"
          alt=""
          className="w-full h-full object-cover object-center"
          style={{ opacity: 0.5 }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.68) 50%, rgba(0,0,0,0.88) 100%)",
          }}
        />
        {/* Sci-fi grid overlay */}
        <div className="absolute inset-0 sci-grid" style={{ opacity: 0.4 }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full">
        {/* Logo mark */}
        <div className="relative mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: "oklch(0.76 0.15 180 / 0.1)",
              border: "1px solid oklch(0.76 0.15 180 / 0.3)",
              boxShadow:
                "0 0 40px oklch(0.76 0.15 180 / 0.2), inset 0 0 20px oklch(0.76 0.15 180 / 0.05)",
            }}
          >
            <span style={{ fontSize: "2.5rem" }}>🧬</span>
          </div>
          {/* Orbit ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: "1px solid oklch(0.76 0.15 180 / 0.15)",
              transform: "scale(1.35)",
            }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: "1px solid oklch(0.83 0.22 145 / 0.08)",
              transform: "scale(1.65)",
            }}
          />
        </div>

        {/* Title */}
        <p
          className="text-xs tracking-[0.5em] uppercase mono-data mb-3"
          style={{ color: "oklch(0.76 0.15 180 / 0.65)" }}
        >
          Personal · Health · Platform
        </p>
        <h1
          className="text-4xl font-light tracking-tight mb-2"
          style={{ color: "oklch(0.94 0.01 220)" }}
        >
          Longevity
        </h1>
        <h2
          className="text-xl font-light tracking-[0.15em] uppercase mb-8"
          style={{ color: "oklch(0.76 0.15 180)" }}
        >
          Dashboard
        </h2>

        {/* Divider */}
        <div
          className="w-16 h-px mb-8"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.76 0.15 180 / 0.5), transparent)",
          }}
        />

        {/* Subtitle */}
        <p
          className="text-sm text-muted-foreground mb-10 leading-relaxed"
          style={{ color: "oklch(0.52 0.01 220)" }}
        >
          Tracke deine Gesundheit, optimiere dein Leben. Jedes Dashboard ist
          persönlich und sicher.
        </p>

        {/* Login Button */}
        <button
          type="button"
          onClick={login}
          disabled={isLoggingIn}
          className="w-full py-4 rounded-xl font-medium tracking-widest uppercase text-sm transition-all duration-300 flex items-center justify-center gap-3"
          style={{
            background: isLoggingIn
              ? "oklch(0.76 0.15 180 / 0.3)"
              : "oklch(0.76 0.15 180)",
            color: "oklch(0.06 0.015 264)",
            boxShadow: isLoggingIn
              ? "none"
              : "0 0 24px oklch(0.76 0.15 180 / 0.4), 0 4px 16px oklch(0.76 0.15 180 / 0.25)",
          }}
          data-ocid="login.primary_button"
        >
          {isLoggingIn ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Verbinde...
            </>
          ) : (
            "Anmelden"
          )}
        </button>

        {/* Security note */}
        <p
          className="text-xs mt-6 mono-data"
          style={{ color: "oklch(0.35 0.01 220)" }}
        >
          Gesichert durch Internet Identity · Kein Passwort nötig
        </p>
      </div>
    </div>
  );
}
