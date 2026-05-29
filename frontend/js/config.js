(function () {
  "use strict";

  const RENDER_BACKEND_URL = "https://dayzero-2.onrender.com";
  let apiBaseUrl = RENDER_BACKEND_URL;

  // 1. Check if defined in import.meta.env (Vite context)
  try {
    if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) {
      apiBaseUrl = import.meta.env.VITE_API_URL;
    }
  } catch (e) {}

  // 2. Check if defined in process.env (Node context)
  try {
    if (typeof process !== "undefined" && process.env && process.env.VITE_API_URL) {
      apiBaseUrl = process.env.VITE_API_URL;
    }
  } catch (e) {}

  // 3. Check if defined on window object (Global injection context)
  if (window.VITE_API_URL) {
    apiBaseUrl = window.VITE_API_URL;
  }

  const DEFAULT_API_BASE_URL = apiBaseUrl;
  const DEFAULT_AUTH_BASE_URL = apiBaseUrl;

  // Sanitize localStorage of outdated localhost entries
  let storedApiBase = localStorage.getItem("dayzero_api_base");
  if (storedApiBase && (storedApiBase.includes("localhost") || storedApiBase.includes("127.0.0.1"))) {
    localStorage.removeItem("dayzero_api_base");
    storedApiBase = null;
  }

  let storedAuthBase = localStorage.getItem("dayzero_auth_base");
  if (storedAuthBase && (storedAuthBase.includes("localhost") || storedAuthBase.includes("127.0.0.1"))) {
    localStorage.removeItem("dayzero_auth_base");
    storedAuthBase = null;
  }

  // Bind base URLs to global window scope for direct references across all pages
  window.API_BASE_URL = storedApiBase || DEFAULT_API_BASE_URL;
  window.AUTH_BASE_URL = storedAuthBase || DEFAULT_AUTH_BASE_URL;
})();
