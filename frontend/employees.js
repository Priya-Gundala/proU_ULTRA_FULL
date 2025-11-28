// employees.js - paste/replace entire file used by employees.html
// -> This version forces backend base to localhost:5000 and logs everything clearly.

const API = "http://localhost:5000"; // backend base - MUST be running on port 5000

// helper to return auth header if token stored
function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { "Authorization": "Bearer " + token } : {};
}

function showAlert(msg) {
  // simple alert wrapper (you can change to toast if you want)
  alert(msg);
}

// Escape text for HTML safety
function escapeHtml(s) {
  if (s === undefined || s === null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Load employees from backend and render list
async function loadEmployees() {
  const container = document.getElementById("empList");
  if (!container) {
    console.warn("No #empList found in DOM");
    return;
  }

  container.innerHTML = "Loading...";
  try {
    console.log("[EMPLOYEES] GET ->", `${API}/employees`);
    const res = await fetch(`${API}/employees`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...authHeaders() }
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("[EMPLOYEES] GET failed:", res.status, txt);
      container.innerHTML = `<div style="color:red">Error loading</div>`;
      return;
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = `<div class="card">No employees yet</div>`;
      return;
    }

    container.innerHTML = "";
    data.forEach(emp => {
      const node = document.createElement("div");
      node.className = "list-item";
      node.innerHTML = `
        <div>
          <strong>${escapeHtml(emp.name || "—")}</strong><br/>
          <small>${escapeHtml(emp.email || "")}${emp.phone ? " • " + escapeHtml(emp.phone) : ""}</small>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="btn-ghost edit-btn" data-id="${emp.id}">Edit</button>
          <button class="del delete-btn" data-id="${emp.id}">Delete</button>
        </div>
      `;
      container.appendChild(node);
    });

    // attach handlers
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.onclick = () => deleteEmployee(btn.dataset.id);
    });
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.onclick = () => {
        showAlert("Edit not implemented here — this is delete/add helper.");
      };
    });

  } catch (err) {
    console.error("[EMPLOYEES] Network error loading:", err);
    container.innerHTML = `<div style="color:red">Network error</div>`;
  }
}

// Add employee form wiring — adjust selectors to your form fields
function setupForm() {
  const form = document.getElementById("empForm"); // ensure your form has id="empForm"
  if (!form) {
    console.warn("No #empForm found");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.querySelector("[name='name']").value.trim();
    const email = form.querySelector("[name='email']").value.trim();
    const phone = form.querySelector("[name='phone']").value.trim();
    const role = form.querySelector("[name='role']").value.trim();
    const position = form.querySelector("[name='position']").value.trim();
    const notes = form.querySelector("[name='notes']").value.trim();

    if (!name || !email) {
      showAlert("Name and email are required.");
      return;
    }

    try {
      console.log("[EMPLOYEES] POST ->", `${API}/employees`, { name, email, phone, role, position, notes });
      const res = await fetch(`${API}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ name, email, phone, role, position, notes })
      });

      const text = await res.text(); // read raw first for good error messages
      if (!res.ok) {
        console.error("[EMPLOYEES] Add failed:", res.status, text);
        // try parse json from response
        try {
          const j = JSON.parse(text);
          showAlert("Add failed: " + (j.error || j.message || JSON.stringify(j)));
        } catch { showAlert("Add failed: " + text); }
        return;
      }

      // success - parse JSON
      const data = JSON.parse(text);
      console.log("[EMPLOYEES] added:", data);
      showAlert("Employee added");
      form.reset();
      loadEmployees();
    } catch (err) {
      console.error("[EMPLOYEES] Network add err:", err);
      showAlert("Network error — check backend running on port 5000");
    }
  });
}

// Delete an employee by id
async function deleteEmployee(id) {
  if (!id) { showAlert("Missing id"); return; }
  if (!confirm("Delete employee id: " + id + " ?")) return;

  try {
    console.log("[EMPLOYEES] DELETE ->", `${API}/employees/${id}`);
    const res = await fetch(`${API}/employees/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...authHeaders() }
    });

    // read text response so we can present HTML or JSON errors nicely
    const text = await res.text();
    if (!res.ok) {
      console.error("[EMPLOYEES] Delete failed:", res.status, text);
      // show user-friendly
      try {
        const j = JSON.parse(text);
        showAlert("Delete failed: " + (j.error || j.message || text));
      } catch {
        showAlert("Delete failed: " + text);
      }
      return;
    }

    // success
    try {
      const j = JSON.parse(text);
      console.log("[EMPLOYEES] deleted:", j);
    } catch { console.log("[EMPLOYEES] delete response:", text); }
    showAlert("Deleted");
    loadEmployees();
  } catch (err) {
    console.error("[EMPLOYEES] Network delete error:", err);
    showAlert("Network error — check server on port 5000");
  }
}

// initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  setupForm();
  loadEmployees();
});
