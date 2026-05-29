(function () {
  "use strict";

  const RENDER_BACKEND_URL = "https://dayzero-2.onrender.com";
  const LOCAL_BACKEND_URL = "http://127.0.0.1:5001";
  const isLocalPage = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    || window.location.protocol === "file:";

  const DEFAULT_API_BASE_URL = isLocalPage ? LOCAL_BACKEND_URL : RENDER_BACKEND_URL;
  const DEFAULT_AUTH_BASE_URL = isLocalPage ? LOCAL_BACKEND_URL : RENDER_BACKEND_URL;

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
