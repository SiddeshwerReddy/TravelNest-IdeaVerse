import { Clock3, MapPin, Route } from "lucide-react";
import { formatMinutes } from "../lib/formatters.js";

export default function ItineraryTimeline({ timeline = [] }) {
  if (!timeline.length) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/[0.04] p-6 text-sm text-slate-300">
        No itinerary stops are ready yet. Generate one from Business Setup or Leisure Setup.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {timeline.map((item, index) => (
        <article
          key={item.id}
          className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_18px_45px_rgba(2,6,23,0.24)]"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
              {index + 1}
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                    {item.category}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-white">{item.title}</h3>
                </div>
                <div className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
                  {item.startTime} - {item.endTime}
                </div>
              </div>

              <p className="text-sm leading-6 text-slate-300">{item.reason}</p>

              <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/[0.18] px-3 py-2">
                  <Clock3 className="h-4 w-4 text-cyan-300" />
                  Stay {formatMinutes(item.durationMinutes)}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/[0.18] px-3 py-2">
                  <Route className="h-4 w-4 text-fuchsia-300" />
                  Travel {formatMinutes(item.travelMinutes)}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/[0.18] px-3 py-2">
                  <MapPin className="h-4 w-4 text-emerald-300" />
                  {item.highlight}
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
