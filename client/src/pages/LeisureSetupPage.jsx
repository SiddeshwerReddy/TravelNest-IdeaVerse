import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Compass, LoaderCircle, MapPinned, Sparkles } from "lucide-react";
import { usePlanner } from "../context/PlannerContext.jsx";
import { fetchPois, geocodePlace, optimizeItinerary } from "../lib/api.js";
import { formatCoordinates, formatMinutes, parseInterestString } from "../lib/formatters.js";

function Panel({ title, subtitle, children }) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_45px_rgba(2,6,23,0.24)]">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{title}</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{subtitle}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function distanceBetweenKm(origin, destination) {
  if (!origin || !destination) {
    return Number.POSITIVE_INFINITY;
  }

  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(destination.lat - origin.lat);
  const deltaLng = toRadians(destination.lng - origin.lng);
  const lat1 = toRadians(origin.lat);
  const lat2 = toRadians(destination.lat);
  const arc =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
}

export default function LeisureSetupPage() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { plannerState, mergePlannerState } = usePlanner();
  const [interestInput, setInterestInput] = useState("");
  const [availableMinutes, setAvailableMinutes] = useState(180);
  const [areaLabel, setAreaLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [locationDraft, setLocationDraft] = useState({
    lat: "",
    lng: "",
    label: "",
  });
  const [isLocating, setIsLocating] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    mergePlannerState({
      mode: "leisure",
      location: null,
      interests: [],
      notes: "",
      scheduleText: "",
      schedule: null,
      freeSlots: [],
      rawPois: [],
      itinerary: null,
      ai: null,
      tripId: "",
      documentName: "",
      availableMinutes: 180,
      poiSource: "",
      poiRadiusMeters: 0,
    });
    setInterestInput("");
    setAvailableMinutes(180);
    setAreaLabel("");
    setNotes("");
    setLocationDraft({
      lat: "",
      lng: "",
      label: "",
    });
    setError("");
  }, [mergePlannerState]);

  useEffect(() => {
    if (!plannerState.location?.lat && navigator.geolocation) {
      setIsLocating(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextLocation = {
            lat: Number(position.coords.latitude.toFixed(6)),
            lng: Number(position.coords.longitude.toFixed(6)),
            label: areaLabel || "Current location",
          };

          setLocationDraft(nextLocation);
          mergePlannerState({ location: nextLocation, mode: "leisure" });
          setIsLocating(false);
        },
        () => {
          setError("Location access was blocked. You can still enter coordinates manually.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [areaLabel, mergePlannerState, plannerState.location?.lat]);

  const previewPois = plannerState.rawPois.slice(0, 8);

  async function resolvePlanningLocation() {
    const trimmedAreaLabel = areaLabel.trim();

    if (trimmedAreaLabel) {
      try {
        const response = await geocodePlace(trimmedAreaLabel, getToken);
        const resolvedLocation = {
          lat: response.location.lat,
          lng: response.location.lng,
          label: response.location.label,
        };

        setAreaLabel(response.location.label);
        setLocationDraft(resolvedLocation);
        mergePlannerState({ location: resolvedLocation, mode: "leisure" });
        return resolvedLocation;
      } catch (requestError) {
        const fallbackLat = Number(locationDraft.lat);
        const fallbackLng = Number(locationDraft.lng);

        if (!Number.isNaN(fallbackLat) && !Number.isNaN(fallbackLng)) {
          return {
            lat: fallbackLat,
            lng: fallbackLng,
            label: trimmedAreaLabel,
          };
        }

        throw requestError;
      }
    }

    const lat = Number(locationDraft.lat);
    const lng = Number(locationDraft.lng);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      throw new Error("Enter a valid place name or coordinates first.");
    }

    return {
      lat,
      lng,
      label: trimmedAreaLabel || "Current location",
    };
  }

  function detectLocation() {
    setError("");
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
          label: areaLabel || "Current location",
        };

        setLocationDraft(nextLocation);
        mergePlannerState({ location: nextLocation, mode: "leisure" });
        setIsLocating(false);
      },
      () => {
        setError("Location access was blocked. You can still enter coordinates manually.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function loadPoiPreview() {
    setError("");
    setIsPreviewLoading(true);

    try {
      const resolvedLocation = await resolvePlanningLocation();
      const response = await fetchPois(
        {
          lat: resolvedLocation.lat,
          lng: resolvedLocation.lng,
          freeMinutes: availableMinutes,
          travelerMode: "leisure",
          interests: interestInput,
        },
        getToken
      );

      mergePlannerState({
        mode: "leisure",
        location: resolvedLocation,
        interests: parseInterestString(interestInput),
        notes,
        availableMinutes,
        rawPois: response.pois,
        poiSource: response.source,
        poiRadiusMeters: response.radiusMeters,
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.message ||
          "Unable to fetch nearby places right now."
      );
    } finally {
      setIsPreviewLoading(false);
    }
  }

  async function handleGenerateItinerary() {
    setError("");
    setIsGenerating(true);

    try {
      const resolvedLocation = await resolvePlanningLocation();
      const shouldReusePreviewPois =
        plannerState.location &&
        distanceBetweenKm(plannerState.location, resolvedLocation) <= 5 &&
        plannerState.rawPois.length > 0;
      const response = await optimizeItinerary(
        {
          travelerMode: "leisure",
          location: resolvedLocation,
          interests: parseInterestString(interestInput),
          notes,
          availableMinutes,
          rawPois: shouldReusePreviewPois ? plannerState.rawPois : [],
        },
        getToken
      );

      mergePlannerState({
        mode: "leisure",
        location: resolvedLocation,
        interests: parseInterestString(interestInput),
        notes,
        availableMinutes,
        rawPois: shouldReusePreviewPois ? plannerState.rawPois : [],
        itinerary: response.itinerary,
        ai: response.ai,
        tripId: response.tripId || "",
        poiSource: response.poiSource || plannerState.poiSource,
      });

      navigate("/itinerary");
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.message ||
          "Unable to build the itinerary right now."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section className="px-5 py-10 sm:px-8 sm:py-14">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel title="Leisure Setup" subtitle="Use live location and interests to create a nearby exploration plan.">
          <div className="space-y-5">
            <div className="rounded-[1.5rem] border border-cyan-300/20 bg-cyan-400/[0.06] p-5">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-cyan-200">
                  <Compass className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">Browser geolocation</p>
                  <p className="mt-1 text-sm text-slate-300">
                    We use your current coordinates as the itinerary anchor and keep the route nearby.
                  </p>
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={isLocating}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLocating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <MapPinned className="h-4 w-4" />}
                    Detect My Location
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Latitude</span>
                <input
                  value={locationDraft.lat}
                  onChange={(event) =>
                    setLocationDraft((current) => ({ ...current, lat: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/40"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Longitude</span>
                <input
                  value={locationDraft.lng}
                  onChange={(event) =>
                    setLocationDraft((current) => ({ ...current, lng: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/40"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Place name or area</span>
                <input
                  value={areaLabel}
                  onChange={(event) => setAreaLabel(event.target.value)}
                  placeholder="Bengaluru, Agra Fort, Fort Kochi waterfront"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/40"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">
                  Available time
                </span>
                <select
                  value={availableMinutes}
                  onChange={(event) => setAvailableMinutes(Number(event.target.value))}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/40"
                >
                  <option value={90}>90 minutes</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                  <option value={240}>4 hours</option>
                  <option value={360}>6 hours</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Interests</span>
              <input
                value={interestInput}
                onChange={(event) => setInterestInput(event.target.value)}
                placeholder="heritage, street food, art, viewpoints"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/40"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Extra notes</span>
              <textarea
                rows="4"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Want calm streets, shaded walks, local markets, or a photography-friendly route..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/40"
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={isPreviewLoading}
                onClick={loadPoiPreview}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPreviewLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Preview Nearby POIs
              </button>
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateItinerary}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isGenerating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <MapPinned className="h-4 w-4" />}
                Generate And Open Itinerary
              </button>
            </div>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Location Snapshot" subtitle="Current anchor and outing envelope.">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/[0.18] p-4">
                <p className="text-sm text-slate-400">Anchor</p>
                <p className="mt-2 font-semibold text-white">{areaLabel || "Current location"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/[0.18] p-4">
                <p className="text-sm text-slate-400">Coordinates</p>
                <p className="mt-2 font-semibold text-white">{formatCoordinates(locationDraft)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/[0.18] p-4">
                <p className="text-sm text-slate-400">Time budget</p>
                <p className="mt-2 font-semibold text-white">{formatMinutes(availableMinutes)}</p>
              </div>
            </div>
          </Panel>

          <Panel title="Nearby Pool" subtitle="What Overpass found around your current area.">
            <div className="space-y-3">
              {previewPois.length ? (
                previewPois.map((poi) => (
                  <div
                    key={poi.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/[0.18] p-4"
                  >
                    <div>
                      <p className="font-semibold text-white">{poi.name}</p>
                      <p className="mt-1 text-sm text-slate-400">{poi.categoryLabel}</p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200">
                      {formatMinutes(poi.visitDurationMinutes)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-slate-300">
                  Detect a location and preview nearby POIs to see the cultural pool before generating the full itinerary.
                </p>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </section>
  );
}
