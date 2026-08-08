import client from "./client";

export const AuthAPI = {
  register: (data) => client.post("/auth/register", data).then((r) => r.data),
  login: (data) => client.post("/auth/login", data).then((r) => r.data),
  demoLogin: () => client.post("/auth/demo-login").then((r) => r.data),
  me: () => client.get("/auth/me").then((r) => r.data),
};

export const ChallengeAPI = {
  list: () => client.get("/challenges").then((r) => r.data),
  complete: (id) => client.post(`/challenges/${id}/complete`).then((r) => r.data),
};

export const CampusAPI = {
  list: () => client.get("/campus").then((r) => r.data),
  leaderboard: () => client.get("/campus/leaderboard").then((r) => r.data),
  detail: (id) => client.get(`/campus/${id}`).then((r) => r.data),
};

export const CarbonAPI = {
  log: (data) => client.post("/carbon", data).then((r) => r.data),
  history: (range = 30) => client.get(`/carbon/history?range=${range}`).then((r) => r.data),
  factors: () => client.get("/carbon/factors").then((r) => r.data),
};

export const BadgeAPI = {
  list: () => client.get("/badges").then((r) => r.data),
};

export const EcoTipAPI = {
  list: (category) => client.get(`/eco-tips${category ? `?category=${category}` : ""}`).then((r) => r.data),
};

export const RecyclingAPI = {
  search: (q, category) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    return client.get(`/recycling?${params}`).then((r) => r.data);
  },
};

export const UserAPI = {
  stats: () => client.get("/users/me/stats").then((r) => r.data),
  update: (data) => client.patch("/users/me", data).then((r) => r.data),
};
