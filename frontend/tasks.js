



(() => {
  const API = "http://localhost:5000/tasks"; // change only if your backend is different

  // find the save button
  const saveBtn = document.getElementById("saveTaskBtn");
  if (!saveBtn) { console.error("saveTaskBtn element not found"); return; }

  // remove any existing handler we added earlier to avoid duplicates
  if (window.__proU_save_handler_attached) {
    saveBtn.removeEventListener("click", window.__proU_save_handler);
  }

  // handler
  async function proU_save_handler(evt) {
    try {
      evt && evt.preventDefault && evt.preventDefault();

      // guard double-click
      if (saveBtn.dataset.busy === "1") { console.warn("Already sending..."); return; }
      saveBtn.dataset.busy = "1";

      // read fields
      const title = (document.getElementById("taskTitle")?.value || "").trim();
      const description = (document.getElementById("taskDesc")?.value || "").trim();
      const due_date = (document.getElementById("taskDue")?.value || "").trim() || null;
      const status = (document.getElementById("taskStatus")?.value || "open").trim();
      const assignedRaw = (document.getElementById("taskAssigned")?.value || "").trim();

      if (!title) { alert("Please enter a title"); saveBtn.dataset.busy = "0"; return; }

      const body = { title, description, due_date, status };

      if (assignedRaw !== "") {
        const n = Number(assignedRaw);
        body.assigned_to = (Number.isFinite(n) && n > 0) ? n : assignedRaw;
      }

      console.group("DEBUG: POST /tasks");
      console.log("Request body:", body);

      const headers = { "Content-Type": "application/json" };
      const token = localStorage.getItem("token");
      if (token) headers["Authorization"] = "Bearer " + token;

      const res = await fetch(API, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const text = await res.text();
      let data;
      try { data = text ? JSON.parse(text) : null; } catch(e){ data = text; }

      console.log("HTTP status:", res.status);
      console.log("Response body:", data);
      console.groupEnd();

      if (!res.ok) {
        // Friendly message and console details
        alert("Save failed: " + (data && (data.error || data.message) ? (data.error || data.message) : ("HTTP " + res.status)));
        saveBtn.dataset.busy = "0";
        return;
      }

      alert("Task saved successfully!");
      // clear inputs (optional)
      try {
        document.getElementById("taskTitle").value = "";
        document.getElementById("taskDesc").value = "";
        document.getElementById("taskAssigned").value = "";
        document.getElementById("taskDue").value = "";
        document.getElementById("taskStatus").value = "open";
      } catch(e){/* ignore */ }

      // refresh tasks list if available
      if (typeof window.loadTasks === "function") {
        setTimeout(() => window.loadTasks(), 250);
      } else if (window._proU && typeof window._proU.loadTasks === "function") {
        setTimeout(() => window._proU.loadTasks(), 250);
      }

    } catch (err) {
      console.error("Save exception:", err);
      alert("Network or script error: " + (err.message || err));
    } finally {
      saveBtn.dataset.busy = "0";
    }
  }

  // attach as a single handler
  window.__proU_save_handler = proU_save_handler;
  saveBtn.addEventListener("click", window.__proU_save_handler);
  window.__proU_save_handler_attached = true;
  console.log("Debug save handler attached — click Save Task and check console for logs.");
})();
