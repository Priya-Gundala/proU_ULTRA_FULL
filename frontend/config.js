// frontend/config.js
// Single global place for API and token accessor.
// Do NOT redeclare `token` or `API` in other scripts.

window.APP = {
  API: "http://localhost:5000",
  getToken() { return localStorage.getItem("token"); }
};
