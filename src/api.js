import axios from "axios";

// Local dev: VITE_API_URL na ho to localhost use hoga.
// Production (Vercel): VITE_API_URL env variable me deployed backend ka URL daalna hai,
// e.g. https://fitnova-backend.onrender.com/api
const baseURL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Har request ke saath login token automatically send hoga
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
