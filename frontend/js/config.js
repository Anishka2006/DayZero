(function () {
  "use strict";

  // Deployed production backend URLs
  const DEFAULT_API_BASE_URL = "https://madap.onrender.com";
  const DEFAULT_AUTH_BASE_URL = "https://madauth.onrender.com";

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
