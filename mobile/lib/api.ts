import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "cheers_mobile_token";
const rawApiUrl = process.env.EXPO_PUBLIC_API_URL ?? "";
const API_URL = rawApiUrl.replace(/\/$/, "");

export type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  weightKg: number;
  gender: string | null;
  drinkingGoal: string;
  notificationStyle: string;
  privacyDefault: string;
  onboardingCompleted: boolean;
  ageConfirmedAt: string | null;
};

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_URL) {
    throw new Error("Set EXPO_PUBLIC_API_URL in mobile/.env first.");
  }
  const token = await getToken();
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(apiConnectionMessage());
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? "Cheers had a tiny meltdown.");
  return data as T;
}

export function getApiUrl() {
  return API_URL;
}

function apiConnectionMessage() {
  if (!API_URL) return "Set EXPO_PUBLIC_API_URL in mobile/.env first.";
  if (API_URL.includes("localhost") || API_URL.includes("127.0.0.1")) {
    return "Use your computer LAN IP in EXPO_PUBLIC_API_URL, not localhost, when testing on a phone.";
  }
  return "Could not reach the Cheers backend. Check Wi-Fi, firewall, and EXPO_PUBLIC_API_URL.";
}

export const endpoints = {
  signup: (body: { name: string; email: string; password: string }) =>
    api<{ token: string; user: User }>("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    api<{ token: string; user: User }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => api<{ user: User }>("/me"),
  updateMe: (body: Record<string, unknown>) =>
    api<{ user: User }>("/me", { method: "PATCH", body: JSON.stringify(body) }),
  dashboard: () => api<DashboardPayload>("/dashboard"),
  logDrink: (body: Record<string, unknown>) =>
    api<{ drink: unknown }>("/drinks", { method: "POST", body: JSON.stringify(body) }),
  feed: () => api<{ activities: Activity[] }>("/feed"),
  react: (activityId: string, type: string) =>
    api<{ active: boolean }>(`/feed/${activityId}/react`, { method: "POST", body: JSON.stringify({ type }) }),
  comment: (activityId: string, text: string) =>
    api<{ ok: boolean }>(`/feed/${activityId}/comment`, { method: "POST", body: JSON.stringify({ text }) }),
  friends: () => api<{ friends: Friend[] }>("/friends"),
  addFriend: (username: string) =>
    api<{ ok: boolean }>("/friends", { method: "POST", body: JSON.stringify({ username }) }),
  respondFriend: (friendshipId: string, action: "accept" | "reject") =>
    api<{ ok: boolean }>("/friends", { method: "PATCH", body: JSON.stringify({ friendshipId, action }) }),
  stats: () => api<StatsPayload>("/stats"),
};

export type DashboardPayload = {
  stats: {
    drinksThisWeek: number;
    caloriesThisWeek: number;
    spentThisWeek: number;
    soberStreak: number;
  };
  safety: { bac: number; status: string; tip: string; urgent: boolean; disclaimer: string };
  recap: {
    drinks: number;
    spent: number;
    calories: number;
    favoriteDrink: string | null;
    favoriteLocation: string | null;
    summary: string;
  };
  openSession: null | { title: string; totalDrinks: number; totalCalories: number; totalSpent: number; location: string | null };
  lastDrink: null | DrinkLog;
};

export type DrinkLog = {
  id: string;
  drinkName: string;
  drinkType: string;
  volumeMl: number;
  abv: number;
  price: number;
  location: string | null;
  drinkPhotoUrl: string | null;
  placePhotoUrl: string | null;
  caloriesEstimate?: number;
  loggedAt: string;
  visibility: string;
};

export type Activity = {
  id: string;
  message: string;
  createdAt: string;
  user: User;
  drinkLog: DrinkLog | null;
  reactions: { id: string; userId: string; type: string }[];
  comments: { id: string; text: string; user: User }[];
};

export type Friend = {
  id: string;
  status: string;
  direction: "incoming" | "outgoing";
  friend: User;
};

export type StatsPayload = {
  weeklyDrinks: number;
  weeklyCalories: number;
  weeklySpending: number;
  alcoholFreeDays: { freeDays: number; totalDays: number };
  mostDrinkType: string | null;
  mostVisitedLocation: string | null;
  achievements: { id: string; title: string; code: string }[];
  weeklyChart: { day: string; count: number }[];
};
