import { ArrowRight, BrainCircuit, Clock3, MapPinned, Sparkles } from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const featureCards = [
  {
    title: "Time Efficiency",
    description:
      "Turn free windows between meetings or city walks into feasible plans instead of guesswork.",
    icon: Clock3,
  },
  {
    title: "Smart Exploration",
    description:
      "Blend live location, travel time, and personal interests into recommendations that feel grounded.",
    icon: MapPinned,
  },
  {
    title: "Context-Aware AI",
    description:
      "Gemini interprets schedules and intent, while routing and POI filters keep the itinerary realistic.",
    icon: BrainCircuit,
  },
];

const previewStops = [
  { time: "12:15", title: "Quick lunch near meeting venue", meta: "8 min walk" },
  { time: "13:30", title: "Heritage museum visit", meta: "45 min stay" },
  { time: "15:00", title: "Coffee reset + travel buffer", meta: "6 min ride" },
];

export default function LandingPage() {
  return (
    <section className="relative isolate overflow-hidden px-5 py-10 sm:px-8 sm:py-14">
      <div className="absolute inset-x-8 top-4 h-52 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute right-0 top-20 h-60 w-60 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.3em] text-cyan-100">
            <Sparkles className="h-4 w-4" />
            AI Context-Aware Travel Companion
          </span>

          <h1 className="display-type mt-6 max-w-3xl text-5xl font-semibold leading-none tracking-tight text-white sm:text-6xl">
            Make every hour in a new city actually count.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Travel Nest combines schedule understanding, nearby discovery, and route
            feasibility so business and leisure travelers get polished itineraries that
            fit the moment instead of generic travel lists.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <SignedIn>
              <Link
                to="/mode"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3 font-medium text-slate-950 transition hover:bg-cyan-300"
              >
                Choose Traveler Mode
                <ArrowRight className="h-4 w-4" />
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3 font-medium text-slate-950 transition hover:bg-cyan-300">
                  Sign In to Start
                  <ArrowRight className="h-4 w-4" />
                </button>
              </SignInButton>
            </SignedOut>
            <Link
              to="/business-setup"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 font-medium text-white transition hover:border-white/25 hover:bg-white/10"
            >
              Preview Business Flow
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {featureCards.map((feature) => {
              const FeatureIcon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-[0_20px_40px_rgba(2,6,23,0.28)] backdrop-blur-md"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 text-cyan-200">
                    <FeatureIcon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">{feature.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="relative z-10">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/[0.7] p-6 shadow-[0_30px_70px_rgba(2,6,23,0.45)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                  Sample AI Plan
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Mumbai Midtown Sprint
                </h2>
              </div>
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
                Feasible
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Free window detected</span>
                <span>12:00 PM - 4:30 PM</span>
              </div>

              <div className="mt-5 space-y-4">
                {previewStops.map((stop) => (
                  <div key={stop.time} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                        {stop.time}
                      </div>
                      <div className="mt-2 h-full w-px bg-gradient-to-b from-cyan-300/40 to-transparent" />
                    </div>
                    <div className="flex-1 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                      <p className="font-medium text-white">{stop.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{stop.meta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Inputs</p>
                <p className="mt-3 text-lg font-semibold text-white">Schedule + location + interests</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  The itinerary engine weighs timing, transit friction, and cultural fit before drafting a plan.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Outputs</p>
                <p className="mt-3 text-lg font-semibold text-white">Timeline + map-ready POIs</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Designed for a future dashboard with Leaflet map pins, travel buffers, and on-demand regeneration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
