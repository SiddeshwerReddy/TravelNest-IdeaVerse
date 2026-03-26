import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { Compass, MoonStar } from "lucide-react";
import AuthSync from "./components/AuthSync.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import ModeSelectionPage from "./pages/ModeSelectionPage.jsx";
import PlaceholderPage from "./pages/PlaceholderPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Modes", to: "/mode" },
  { label: "Business Setup", to: "/business-setup" },
  { label: "Leisure Setup", to: "/leisure-setup" },
  { label: "Itinerary", to: "/itinerary" },
  { label: "Dashboard", to: "/dashboard" },
];

function AppShell() {
  const protectedPlaceholder = (title, description) => (
    <ProtectedRoute>
      <PlaceholderPage title={title} description={description} />
    </ProtectedRoute>
  );

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-4 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl flex-col rounded-[2rem] border border-white/10 bg-slate-950/[0.65] shadow-[0_30px_80px_rgba(15,23,42,0.45)] backdrop-blur-xl">
        <header className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.2)]">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                Travel Nest
              </p>
              <p className="font-semibold text-white">AI Travel Companion</p>
            </div>
          </NavLink>

          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "rounded-full border px-4 py-2 text-sm transition",
                    isActive
                      ? "border-cyan-300/50 bg-cyan-400/[0.15] text-cyan-100"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 self-start lg:self-auto">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 lg:flex">
              <MoonStar className="h-4 w-4 text-fuchsia-300" />
              Dark Knight Devs aesthetic
            </div>

            <SignedOut>
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <button className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/10">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-300">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>

            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      "h-10 w-10 border border-cyan-300/30 shadow-[0_0_20px_rgba(34,211,238,0.18)]",
                  },
                }}
              />
            </SignedIn>
          </div>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/sign-in/*" element={<AuthPage mode="sign-in" />} />
            <Route path="/sign-up/*" element={<AuthPage mode="sign-up" />} />
            <Route path="/mode" element={<ModeSelectionPage />} />
            <Route
              path="/business-setup"
              element={protectedPlaceholder(
                "Business Traveler Setup",
                "Next, we can add PDF schedule upload, meeting extraction, and a free-time dashboard for business travelers.",
              )}
            />
            <Route
              path="/leisure-setup"
              element={protectedPlaceholder(
                "Leisure Traveler Setup",
                "Next, we can connect browser geolocation, interest tagging, and nearby discovery preferences for leisure travelers.",
              )}
            />
            <Route
              path="/itinerary"
              element={
                <ProtectedRoute>
                  <PlaceholderPage
                    title="Interactive Itinerary Dashboard"
                    description="Next, we can build the AI timeline, map overlays, route feasibility chips, and itinerary regeneration actions."
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthSync />
      <AppShell />
    </BrowserRouter>
  );
}
