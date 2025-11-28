// profile.js (top)
const API = (window.APP && window.APP.API) ? window.APP.API : "http://localhost:5000";
// do not redeclare token; get it via function
function getToken() { return (window.APP && window.APP.getToken) ? window.APP.getToken() : localStorage.getItem("token"); }

// build headers helper
function authHeaders() {
  const t = getToken();
  const h = { "Content-Type": "application/json" };
  if (t) h["Authorization"] = "Bearer " + t;
  return h;
}

// Build headers with token
function authHeaders() {
  const h = {};
  if (token) h["Authorization"] = "Bearer " + token;
  return h;
}

// Save profile data
async function saveProfile() {
  profileMsg.textContent = "";

  const fileInput = document.getElementById("avatarFile");
  const file = fileInput.files[0]; // ✅ define file safely

  const formData = new FormData();
  formData.append("email", document.getElementById("profileEmail").value.trim());
  formData.append("name", document.getElementById("profileName").value.trim());
  formData.append("phone", document.getElementById("profilePhone").value.trim());
  formData.append("role", document.getElementById("profileRole").value.trim());
  formData.append("position", document.getElementById("profilePosition").value.trim());
  if (file) formData.append("avatar", file); // ✅ attach file if present

  try {
    const res = await fetch(API + "/profile", {
      method: "PUT",
      headers: authHeaders(), // ✅ no Content-Type for FormData
      body: formData
    });

    const txt = await res.text();
    let body;
    try { body = JSON.parse(txt); } catch (e) { body = txt; }

    if (res.status === 401 || res.status === 403) {
      profileMsg.textContent = "Unauthorized — please sign in.";
      return;
    }

    if (!res.ok) {
      profileMsg.textContent = "Save failed: " + (body && body.error ? body.error : txt);
      return;
    }

    alert("Profile saved!");
  } catch (err) {
    profileMsg.textContent = "Network error — check server.";
    console.error("saveProfile error:", err);
  }
}
