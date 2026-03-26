import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { fetchSessionProfile } from "../lib/api.js";

export default function DashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setStatus("loading");
        const data = await fetchSessionProfile(getToken);

        if (!isMounted) {
          return;
        }

        setProfile(data);
        setStatus("success");
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            "Unable to reach the protected API.",
        );
        setStatus("error");
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [getToken]);

  return (
    <section className="px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 shadow-[0_25px_60px_rgba(2,6,23,0.35)] backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
            Secure Workspace
          </p>
          <h1 className="display-type mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {user?.firstName ? `Welcome, ${user.firstName}.` : "Welcome to Travel Nest."}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            This page proves the frontend session and backend token validation are connected.
            Once you add your Clerk keys, the existing travel APIs will only respond to
            authenticated users.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/[0.72] p-6 shadow-[0_25px_60px_rgba(2,6,23,0.35)] backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
              Clerk User
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-200">
              <p>
                <span className="text-slate-400">Email:</span>{" "}
                {user?.primaryEmailAddress?.emailAddress || "Not available"}
              </p>
              <p>
                <span className="text-slate-400">User ID:</span> {user?.id || "Loading"}
              </p>
              <p>
                <span className="text-slate-400">Full name:</span>{" "}
                {user?.fullName || "Not provided"}
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/[0.72] p-6 shadow-[0_25px_60px_rgba(2,6,23,0.35)] backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
              Protected API
            </p>
            {status === "loading" && (
              <p className="mt-4 text-sm text-cyan-200">Loading secure profile data...</p>
            )}
            {status === "error" && (
              <p className="mt-4 text-sm text-rose-300">{error}</p>
            )}
            {status === "success" && profile && (
              <div className="mt-4 space-y-3 text-sm text-slate-200">
                <p>
                  <span className="text-slate-400">Session status:</span>{" "}
                  {profile.authStatus}
                </p>
                <p>
                  <span className="text-slate-400">Backend user ID:</span>{" "}
                  {profile.user.id}
                </p>
                <p>
                  <span className="text-slate-400">Backend email:</span>{" "}
                  {profile.user.primaryEmailAddress || "Unavailable"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
