const rawEnvUrl = (process.env.REACT_APP_API_URL || "").trim();

const fallbackOrigin =
	typeof window !== "undefined" && window.location?.origin
		? window.location.origin
		: "http://localhost:5000";

export const API_ORIGIN = (rawEnvUrl || fallbackOrigin).replace(/\/+$/, "");

export const API_BASE = API_ORIGIN.endsWith("/api") ? API_ORIGIN : `${API_ORIGIN}/api`;
