/**
 * API base URL including `/api` (no trailing slash after "api").
 * Set REACT_APP_API_URL at build/start time to override (e.g. production API).
 */
function isLoopbackHost(host) {
  const h = String(host || "").toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]" || h === "::1";
}

/** When opened from a phone via LAN IP, swap localhost in env for the page hostname. */
function resolveDevApiUrl(envUrl) {
  const trimmed = String(envUrl).trim().replace(/\/$/, "");
  if (typeof window === "undefined") return trimmed;

  const pageHost = window.location.hostname;
  if (!pageHost || isLoopbackHost(pageHost)) return trimmed;
  if (!/localhost|127\.0\.0\.1/i.test(trimmed)) return trimmed;

  try {
    const parsed = new URL(trimmed);
    const port = parsed.port || "5000";
    return `${parsed.protocol}//${pageHost}:${port}${parsed.pathname || "/api"}`.replace(
      /\/$/,
      ""
    );
  } catch {
    const portMatch = trimmed.match(/:(\d+)/);
    const port = portMatch ? portMatch[1] : "5000";
    return `http://${pageHost}:${port}/api`;
  }
}

export function getApiBaseUrl() {
  const fromEnv = process.env.REACT_APP_API_URL;
  if (fromEnv && String(fromEnv).trim() !== "") {
    return resolveDevApiUrl(fromEnv);
  }
  return "https://career-portal-backend-live.onrender.com";
}
