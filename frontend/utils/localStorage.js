// localStorage.js
// Utility module to persist project data and ensure states are preserved across page reloads.

const storageUtils = {
  get: function(key) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch (e) {
      console.error("Error reading localStorage key '" + key + "':", e);
      return null;
    }
  },
  set: function(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error("Error writing localStorage key '" + key + "':", e);
      return false;
    }
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { storageUtils };
} else {
  window.storageUtils = storageUtils;
}
