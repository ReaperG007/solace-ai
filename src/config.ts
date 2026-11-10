import Constants from "expo-constants";

// Reads API endpoint cleanly from:
// 1) Vite/web env (`import.meta.env.VITE_API_URL`) when running under Vite,
// 2) Expo `app.config.js` `extra.apiUrl` (populated from `frontend/.env`),
// 3) Expo `EXPO_PUBLIC_API_URL` inlined at bundle time.

const viteEnvUrl =
  typeof import.meta !== "undefined"
    ? (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env
        ?.VITE_API_URL
    : undefined;

const extraApiUrl = Constants.expoConfig?.extra?.apiUrl as string | undefined;
const expoPublicUrl = process.env.EXPO_PUBLIC_API_URL;

export const config = {
  apiUrl: (
    viteEnvUrl ||
    extraApiUrl ||
    expoPublicUrl ||
    "http://localhost:4000"
  ).replace(/\/+$/, ""),
  appName:
    (Constants.expoConfig?.extra?.appName as string | undefined) ||
    process.env.EXPO_PUBLIC_APP_NAME ||
    "Solace AI",
  apiTimeoutMs:
    Number(
      Constants.expoConfig?.extra?.apiTimeoutMs ||
        process.env.EXPO_PUBLIC_API_TIMEOUT_MS
    ) || 20000,
} as const;
