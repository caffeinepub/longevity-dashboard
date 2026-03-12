import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { Bewegung } from "./components/Bewegung";
import { Dashboard } from "./components/Dashboard";
import { Ernaehrung } from "./components/Ernaehrung";
import { Intervallfasten } from "./components/Intervallfasten";
import { LoginScreen } from "./components/LoginScreen";
import { Routinen } from "./components/Routinen";
import { Schlaf } from "./components/Schlaf";
import { Stress } from "./components/Stress";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

type ViewId =
  | "dashboard"
  | "ernaehrung"
  | "schlaf"
  | "bewegung"
  | "stress"
  | "fasten"
  | "routinen";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [activeView, setActiveView] = useState<ViewId>("dashboard");

  const handleNavigate = (view: string) => {
    setActiveView(view as ViewId);
  };

  const handleBack = () => {
    setActiveView("dashboard");
  };

  // Show login screen if not authenticated
  if (isInitializing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.06 0.015 264)" }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{
            borderColor: "oklch(0.76 0.15 180)",
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  if (!identity) {
    return <LoginScreen />;
  }

  return (
    <div
      className="min-h-screen sci-grid"
      style={{ background: "oklch(0.06 0.015 264)" }}
    >
      <main className="max-w-3xl mx-auto" style={{ minHeight: "100vh" }}>
        {activeView === "dashboard" && (
          <Dashboard onNavigate={handleNavigate} />
        )}
        {activeView === "ernaehrung" && <Ernaehrung onBack={handleBack} />}
        {activeView === "schlaf" && <Schlaf onBack={handleBack} />}
        {activeView === "bewegung" && <Bewegung onBack={handleBack} />}
        {activeView === "stress" && <Stress onBack={handleBack} />}
        {activeView === "fasten" && <Intervallfasten onBack={handleBack} />}
        {activeView === "routinen" && <Routinen onBack={handleBack} />}
      </main>

      <footer
        className="text-center py-6 px-4"
        style={{ borderTop: "1px solid oklch(0.76 0.15 180 / 0.06)" }}
      >
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with{" "}
          <span style={{ color: "oklch(0.76 0.15 180)" }}>♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline transition-colors"
            style={{ color: "oklch(0.76 0.15 180)" }}
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}
