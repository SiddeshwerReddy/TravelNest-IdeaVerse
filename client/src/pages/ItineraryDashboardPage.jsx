import { Link } from "react-router-dom";
import { ArrowRight, CalendarClock, MapPinned, RefreshCw, Sparkles } from "lucide-react";
import { usePlanner } from "../context/PlannerContext.jsx";
import ItineraryMap from "../components/ItineraryMap.jsx";
import ItineraryTimeline from "../components/ItineraryTimeline.jsx";
import { formatCoordinates, formatMinutes } from "../lib/formatters.js";

function StatCard({ label, value, caption }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_18px_45px_rgba(2,6,23,0.22)]">
      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{caption}</p>
    </div>
  );
}

export default function ItineraryDashboardPage() {
  const { plannerState, resetPlannerState } = usePlanner();
  const itinerary = plannerState.itinerary;
  const ai = plannerState.ai;

  if (!itinerary) {
    return (
      <section className="flex min-h-[65vh] items-center justify-center px-5 py-12 sm:px-8">
        <div className="max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 text-center shadow-[0_25px_60px_rgba(2,6,23,0.35)]">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Itinerary Dashboard</p>
          <h1 className="display-type mt-4 text-4xl font-semibold tracking-tight text-white">
            Your itinerary appears here after setup.
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-300">
            Start with either Business Setup or Leisure Setup, then generate the plan to unlock the
            timeline and map view.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/business-setup"
              className="rounded-full bg-cyan-400 px-6 py-3 font-medium text-slate-950 transition hover:bg-cyan-300"
            >
              Business Setup
            </Link>
            <Link
              to="/leisure-setup"
              className="rounded-full border border-white/15 bg-white/5 px-6 py-3 font-medium text-white transition hover:bg-white/10"
            >
              Leisure Setup
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-col gap-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_45px_rgba(2,6,23,0.24)]">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                {itinerary.travelerMode} itinerary
              </p>
              <h1 className="display-type mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                {itinerary.headline}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                {itinerary.overview}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={itinerary.travelerMode === "business" ? "/business-setup" : "/leisure-setup"}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 font-medium text-white transition hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
                Refine Inputs
              </Link>
              <button
                type="button"
                onClick={resetPlannerState}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-300"
              >
                <Sparkles className="h-4 w-4" />
                Reset Planner
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="Selected Stops"
            value={String(itinerary.stats.selectedPoiCount)}
            caption="Stops that fit the current time budget."
          />
          <StatCard
            label="Raw POI Pool"
            value={String(itinerary.stats.rawPoiCount)}
            caption="Nearby places considered before scoring."
          />
          <StatCard
            label="Visit Time"
            value={formatMinutes(itinerary.stats.totalVisitMinutes)}
            caption="Estimated time spent at places."
          />
          <StatCard
            label="Transit Time"
            value={formatMinutes(itinerary.stats.totalTravelMinutes)}
            caption="Estimated routing overhead across the plan."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Discovery Radius"
            value={
              plannerState.poiRadiusMeters
                ? `${Math.round(plannerState.poiRadiusMeters / 100) / 10} km`
                : "Auto"
            }
            caption="Effective search distance used for the POI pool."
          />
          <StatCard
            label="POI Source"
            value={plannerState.poiSource || "prefetched"}
            caption="Whether places came from live Overpass or fallback generation."
          />
          <StatCard
            label="AI Refinement"
            value={ai?.used ? "Gemini" : ai?.configured ? "Fallback" : "Disabled"}
            caption="Shows whether the wording/refinement step used Gemini."
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_45px_rgba(2,6,23,0.24)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Timeline</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Planned stop sequence</h2>
                </div>
                <div className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
                  Feasibility checked
                </div>
              </div>
              <div className="mt-5">
                <ItineraryTimeline timeline={itinerary.timeline} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_45px_rgba(2,6,23,0.24)]">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Map View</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Interactive route context</h2>
              <div className="mt-5">
                <ItineraryMap center={plannerState.location} mapPoints={itinerary.mapPoints} />
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_45px_rgba(2,6,23,0.24)]">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Context</p>
              <div className="mt-4 space-y-4 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-black/[0.18] p-4">
                  <div className="flex items-start gap-3">
                    <MapPinned className="mt-1 h-4 w-4 text-cyan-300" />
                    <div>
                      <p className="font-semibold text-white">
                        {plannerState.location?.label || "Current area"}
                      </p>
                      <p className="mt-1">{formatCoordinates(plannerState.location)}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/[0.18] p-4">
                  <div className="flex items-start gap-3">
                    <CalendarClock className="mt-1 h-4 w-4 text-fuchsia-300" />
                    <div>
                      <p className="font-semibold text-white">Free windows</p>
                      <div className="mt-2 space-y-1">
                        {itinerary.freeSlots.map((slot) => (
                          <p key={slot.id}>
                            {slot.startLabel} - {slot.endLabel} ({formatMinutes(slot.durationMinutes)})
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/[0.18] p-4">
                  <p className="font-semibold text-white">AI tips</p>
                  <div className="mt-3 space-y-2">
                    {itinerary.tips.map((tip) => (
                      <p key={tip}>{tip}</p>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/[0.18] p-4">
                  <p className="font-semibold text-white">Shortlist behind the scenes</p>
                  <div className="mt-3 space-y-2">
                    {itinerary.shortlistedPois.slice(0, 5).map((poi) => (
                      <div key={poi.id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate">{poi.name}</p>
                          {poi.interestMatches?.length ? (
                            <p className="truncate text-xs text-cyan-200">
                              Matches: {poi.interestMatches.join(", ")}
                            </p>
                          ) : null}
                        </div>
                        <span className="shrink-0 text-slate-400">{poi.categoryLabel}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 text-sm text-slate-300 shadow-[0_18px_45px_rgba(2,6,23,0.24)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-white">Ready for another pass?</p>
              <p className="mt-1">
                Adjust your inputs, change the time budget, or switch traveler modes to regenerate a different route.
              </p>
            </div>
            <Link
              to="/mode"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 font-medium text-white transition hover:bg-white/10"
            >
              Choose Another Mode
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
