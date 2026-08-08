import axios from "axios";

// Same-origin "/api" works out of the box both in dev (Vite proxy, see
// vite.config.js) and in production (the Express server serves the built
// frontend and API from the same port — see server/src/index.js).
// VITE_API_URL can override this for a split-host deployment
// (e.g. frontend on one host, API on another).
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 10000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("ecolife_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("ecolife_token");
      if (!window.location.hash.includes("/login")) {
        window.location.hash = "#/login";
      }
    }
    const message =
      err.response?.data?.error ||
      err.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export default client;
