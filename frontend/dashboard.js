// =============================
//  API Base URL
// =============================
const API = "http://localhost:5000";

// =============================
//  Load user email
// =============================
document.getElementById("userEmail").innerText =
  localStorage.getItem("email") || "User";

// =============================
//  Logout
// =============================
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  window.location.href = "login.html";
});

// =============================
//  Helper: Safe Fetch with Token
// =============================
async function safeFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": "Bearer " + token } : {})
  };

  try {
    const res = await fetch(API + path, {
      ...options,
      headers
    });

    if (!res.ok) {
      console.log("Fetch error:", res.status, path);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.log("Network error:", err);
    return null;
  }
}

// =============================
//  Load Dashboard Numbers
// =============================
async function loadDashboard() {
  // EMPLOYEES
  const employees = await safeFetch("/employees");
  if (employees) {
    document.getElementById("empCount").innerText = employees.length;
  } else {
    document.getElementById("empCount").innerText = "--";
  }

  // TASKS
  const tasks = await safeFetch("/tasks");
  if (tasks) {
    document.getElementById("taskCount").innerText = tasks.length;
  } else {
    document.getElementById("taskCount").innerText = "--";
  }

  // Recent Activity (optional)
  const list = document.getElementById("activityList");
  list.innerHTML = "";

  if (employees?.length > 0) {
    const li = document.createElement("li");
    li.innerText = `Latest employee: ${employees[employees.length - 1].name}`;
    list.appendChild(li);
  }

  if (tasks?.length > 0) {
    const li = document.createElement("li");
    li.innerText = `Latest task: ${tasks[tasks.length - 1].title}`;
    list.appendChild(li);
  }

  if (employees?.length === 0 && tasks?.length === 0) {
    list.innerHTML = "<li>No recent activity yet.</li>";
  }
}

// =============================
//  Run at page load
// =============================
loadDashboard();
