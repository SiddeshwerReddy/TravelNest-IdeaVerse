import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

export async function fetchSessionProfile(getToken) {
  const token = await getToken();

  const response = await api.get("/api/auth/me", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return response.data;
}

export default api;
