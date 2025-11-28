// tasks.js - load/display/delete tasks + helper safeFetch
const API = "http://localhost:5000";

// safeFetch: wrapper that returns parsed JSON or throws with server text
async function safeFetch(url, opts = {}) {
  const res = await fetch(url, opts);
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const err = new Error(typeof data === "string" ? data : (data && data.error) ? data.error : `HTTP ${res.status}`);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

// ensure we don't register loadTasks more than once
if (!window.__proU_tasks_registered) {
  window.__proU_tasks_registered = true;

  // main loader
  async function loadTasks() {
    const el = document.getElementById("taskList");
    const openCountEl = document.getElementById("quickOpenCount");
    const doneCountEl = document.getElementById("quickDoneCount");
    if (!el) return console.warn("taskList element missing");

    el.innerHTML = "Loading...";
    try {
      const tasks = await safeFetch(API + "/tasks");
      // clear and render
      el.innerHTML = "";
      let openCount = 0, doneCount = 0;

      if (!Array.isArray(tasks) || tasks.length === 0) {
        el.innerHTML = "<em>No tasks yet</em>";
      } else {
        const list = document.createElement("div");
        list.style.display = "flex";
        list.style.flexDirection = "column";
        list.style.gap = "12px";

        tasks.forEach(t => {
          const card = document.createElement("div");
          card.className = "task-card";
          card.style.background = "white";
          card.style.padding = "14px";
          card.style.borderRadius = "10px";
          card.style.boxShadow = "0 6px 18px rgba(0,0,0,0.04)";
          card.style.display = "flex";
          card.style.justifyContent = "space-between";
          card.style.alignItems = "center";

          const left = document.createElement("div");
          left.innerHTML = `<strong style="font-size:16px">${escapeHtml(t.title||'')}</strong>
                            <div style="color:#6b3a4d; margin-top:6px">${escapeHtml(t.description||'')}</div>`;

          const right = document.createElement("div");
          right.style.textAlign = "right";
          const due = t.due_date ? `Due: ${escapeHtml(t.due_date)}` : "Due: —";
          right.innerHTML = `<div style="color:#8e435a">${due}</div>`;

          // status pill
          const pill = document.createElement("div");
          pill.textContent = t.status || "open";
          pill.style.display = "inline-block";
          pill.style.padding = "6px 10px";
          pill.style.borderRadius = "20px";
          pill.style.marginTop = "8px";
          pill.style.fontSize = "13px";
          pill.style.fontWeight = "700";
          pill.style.background = pillBackground(t.status);
          pill.style.color = "#6b003c";
          right.appendChild(pill);

          // delete button
          const del = document.createElement("button");
          del.textContent = "Delete";
          del.style.marginTop = "8px";
          del.style.display = "block";
          del.style.border = "1px solid rgba(0,0,0,0.06)";
          del.style.background = "white";
          del.style.borderRadius = "8px";
          del.style.padding = "6px 10px";
          del.style.cursor = "pointer";
          del.addEventListener("click", () => handleDeleteTask(t.id));

          right.appendChild(del);

          card.appendChild(left);
          card.appendChild(right);
          list.appendChild(card);

          if ((t.status||'').toLowerCase().includes('done')) doneCount++;
          else openCount++;
        });

        el.appendChild(list);
        if (openCountEl) openCountEl.textContent = openCount;
        if (doneCountEl) doneCountEl.textContent = doneCount;
      }
    } catch (err) {
      console.error("Error loading tasks:", err);
      el.innerHTML = `<span style="color:#c33">Error loading</span>`;
    }
  }

  // delete handler
  async function handleDeleteTask(id) {
    if (!confirm("Delete this task?")) return;
    try {
      await safeFetch(`${API}/tasks/${id}`, { method: "DELETE" });
      alert("Deleted");
      if (typeof loadTasks === 'function') loadTasks();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed: " + (err.payload?.error || err.message));
    }
  }

  // helper visual helpers
  function pillBackground(status) {
    const s = (status || '').toLowerCase();
    if (s.includes('done')) return "#d7f2ea";
    if (s.includes('progress')) return "#fff0d9";
    return "#ffeef7";
  }

  // basic XSS escape
  function escapeHtml(s) {
    if (!s && s !== 0) return "";
    return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
  }

  // attach to global so other modules can call reload
  window.loadTasks = loadTasks;

  // initial load after small timeout to avoid double-call on multiple script includes
  setTimeout(() => { try { loadTasks(); } catch(e){console.warn(e);} }, 120);

  // expose delete for debugging
  window.__proU_handleDeleteTask = handleDeleteTask;
}
