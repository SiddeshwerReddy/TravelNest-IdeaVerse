import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  CalendarClock,
  Database,
  LoaderCircle,
  MapPinned,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { usePlanner } from "../context/PlannerContext.jsx";
import ItineraryMap from "../components/ItineraryMap.jsx";
import ItineraryTimeline from "../components/ItineraryTimeline.jsx";
import { fetchTripById, fetchTripHistory } from "../lib/api.js";
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

function formatSavedDate(value) {
  if (!value) {
    return "Just now";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ItineraryDashboardPage() {
  const { getToken } = useAuth();
  const { plannerState, mergePlannerState, resetPlannerState } = usePlanner();
  const itinerary = plannerState.itinerary;
  const ai = plannerState.ai;
  const [historyStatus, setHistoryStatus] = useState("idle");
  const [historyError, setHistoryError] = useState("");
  const [loadingTripId, setLoadingTripId] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      try {
        setHistoryStatus("loading");
        const data = await fetchTripHistory(getToken);

        if (!isMounted) {
          return;
        }

        mergePlannerState({
          tripHistory: data.trips || [],
          storageStatus: data.storage || "",
        });
        setHistoryStatus("success");
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setHistoryError(requestError.response?.data?.error || "Unable to load saved trip history.");
        setHistoryStatus("error");
      }
    }

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [getToken, mergePlannerState]);

  async function handleLoadTrip(tripId) {
    try {
      setLoadingTripId(tripId);
      const response = await fetchTripById(tripId, getToken);
      const trip = response.trip;

      mergePlannerState({
        mode: trip.mode,
        location: trip.location,
        interests: trip.preferences || [],
        notes: trip.notes || "",
        schedule: trip.schedule || null,
        scheduleText: trip.scheduleText || "",
        freeSlots: trip.freeSlots || [],
        rawPois: trip.rawPois || [],
        itinerary: trip.itinerary || null,
        tripId: trip.id,
      });
    } catch (requestError) {
      setHistoryError(requestError.response?.data?.error || "Unable to load that trip.");
    } finally {
      setLoadingTripId("");
    }
  }

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
            timeline, reasoning panels, and saved history.
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
            <div className="max-w-4xl">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                {itinerary.travelerMode} itinerary
              </p>
              <h1 className="display-type mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                {itinerary.headline}
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-300">{itinerary.overview}</p>
              {itinerary.travelerProfile?.summary ? (
                <p className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-400/[0.06] px-4 py-3 text-sm text-cyan-100">
                  {itinerary.travelerProfile.summary}
                </p>
              ) : null}
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
            label="Visit Time"
            value={formatMinutes(itinerary.stats.totalVisitMinutes)}
            caption="Estimated time spent at places."
          />
          <StatCard
            label="Transit Time"
            value={formatMinutes(itinerary.stats.totalTravelMinutes)}
            caption="Estimated routing overhead across the plan."
          />
          <StatCard
            label="Window Usage"
            value={`${itinerary.stats.utilizationRate || 0}%`}
            caption="How much of your free time the current plan uses."
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_18px_45px_rgba(2,6,23,0.24)]">
                <div className="flex items-center gap-3">
                  <BrainCircuit className="h-5 w-5 text-cyan-300" />
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Decision Lens</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {itinerary.decisionSummary?.primaryLens || "Balanced fit"}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  {itinerary.decisionSummary?.explanation}
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_18px_45px_rgba(2,6,23,0.24)]">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-emerald-300" />
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Saved Trip + AI</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {ai?.used ? "Stored and refined" : plannerState.tripId ? "Stored in MongoDB" : "Unsaved"}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  {plannerState.tripId
                    ? `Trip ID ${plannerState.tripId} is available in your saved history${ai?.used ? ", and the explanation layer was polished with Gemini." : "."}`
                    : "This session is still visible locally, but MongoDB persistence was unavailable for this pass."}
                </p>
              </div>
            </div>

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
                      <div className="mt-2 space-y-3">
                        {itinerary.freeSlots.map((slot) => (
                          <div key={slot.id}>
                            <p>
                              {slot.startLabel} - {slot.endLabel} ({formatMinutes(slot.durationMinutes)})
                            </p>
                            <p className="text-xs text-slate-400">{slot.contextLabel}</p>
                          </div>
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

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_45px_rgba(2,6,23,0.24)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Saved History</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Reopen past trips</h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
                  {plannerState.storageStatus || "local"}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {historyStatus === "loading" ? (
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Loading saved trips...
                  </div>
                ) : null}
                {historyError ? (
                  <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                    {historyError}
                  </div>
                ) : null}
                {!plannerState.tripHistory?.length && historyStatus === "success" ? (
                  <p className="text-sm leading-7 text-slate-300">
                    Generate a trip while MongoDB is connected and it will appear here for quick reload.
                  </p>
                ) : null}
                {(plannerState.tripHistory || []).map((trip) => (
                  <button
                    key={trip.id}
                    type="button"
                    onClick={() => handleLoadTrip(trip.id)}
                    disabled={loadingTripId === trip.id}
                    className="w-full rounded-[1.5rem] border border-white/10 bg-black/[0.18] p-4 text-left transition hover:border-cyan-300/25 hover:bg-black/[0.24] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">{trip.title}</p>
                        <p className="mt-1 text-sm text-slate-300">
                          {trip.location?.label || "Saved area"} • {trip.mode}
                        </p>
                        <p className="mt-2 text-sm text-slate-400">{trip.itineraryHeadline}</p>
                      </div>
                      <div className="text-right text-xs text-slate-400">
                        <p>{formatSavedDate(trip.updatedAt)}</p>
                        <p className="mt-2">
                          {trip.stats?.selectedPoiCount || 0} stops • {formatMinutes(trip.stats?.totalVisitMinutes || 0)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
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
