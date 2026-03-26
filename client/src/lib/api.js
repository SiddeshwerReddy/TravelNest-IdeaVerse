import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

async function buildAuthHeaders(getToken) {
  if (!getToken) {
    return {};
  }

  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchSessionProfile(getToken) {
  const response = await api.get("/api/auth/me", {
    headers: await buildAuthHeaders(getToken),
  });

  return response.data;
}

export async function syncAuthenticatedUser(getToken) {
  const response = await api.post(
    "/api/auth/sync",
    {},
    {
      headers: await buildAuthHeaders(getToken),
    }
  );

  return response.data;
}

export async function extractSchedule(formData, getToken) {
  const response = await api.post("/api/extract-schedule", formData, {
    headers: {
      ...(await buildAuthHeaders(getToken)),
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function fetchPois(params, getToken) {
  const response = await api.get("/api/fetch-pois", {
    params,
    headers: await buildAuthHeaders(getToken),
  });

  return response.data;
}

export async function optimizeItinerary(payload, getToken) {
  const response = await api.post("/api/optimize-itinerary", payload, {
    headers: await buildAuthHeaders(getToken),
  });

  return response.data;
}

export default api;
