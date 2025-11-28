const API = "http://localhost:5000";
const token = localStorage.getItem("token");

// Redirect if not logged in
if (!token && !location.href.includes("index.html")) {
  location.href = "index.html";
}

// Toast Function
function toast(msg, type="success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "show " + type;
  setTimeout(() => { t.className = t.className.replace("show",""); }, 2500);
}

/* ---------------------
   DARK MODE
--------------------- */
const themeBtn = document.getElementById("themeBtn");
if (themeBtn) {
  let mode = localStorage.getItem("mode") || "light";
  document.body.classList.toggle("dark", mode === "dark");

  themeBtn.onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("mode", document.body.classList.contains("dark") ? "dark" : "light");
  };
}

/* ---------------------
   EMPLOYEES
--------------------- */
async function loadEmployees() {
  const res = await fetch(`${API}/employees`, { headers: { authorization: token }});
  const data = await res.json();
  const area = document.getElementById("empList");

  area.innerHTML = data
    .map(e => `
      <div class="list-item">
        <b>${e.name}</b> — ${e.email}
        <button class="del" onclick="delEmployee(${e.id})">Delete</button>
      </div>
    `).join("");
}

async function addEmployee() {
  const body = {
    name: empName.value,
    email: empEmail.value,
    phone: empPhone.value,
    role: empRole.value,
    position: empPosition.value
  };

  await fetch(`${API}/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization: token },
    body: JSON.stringify(body)
  });

  toast("Employee added!");
  loadEmployees();
}

async function delEmployee(id) {
  await fetch(`${API}/employees/${id}`, { method: "DELETE", headers: { authorization: token }});
  toast("Employee removed!", "error");
  loadEmployees();
}

/* ---------------------
   TASKS
--------------------- */
async function loadTasks() {
  const res = await fetch(`${API}/tasks`, { headers: { authorization: token }});
  const data = await res.json();
  const area = document.getElementById("taskList");

  area.innerHTML = data
    .map(t => `
      <div class="list-item">
        <b>${t.title}</b> — <span class="tag ${t.status}">${t.status}</span>
        <button class="del" onclick="delTask(${t.id})">Delete</button>
      </div>
    `).join("");
}

async function addTask() {
  const body = {
    title: taskTitle.value,
    description: taskDesc.value,
    due_date: taskDue.value,
    status: taskStatus.value,
    assigned_to: taskAssigned.value
  };

  await fetch(`${API}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization: token },
    body: JSON.stringify(body)
  });

  toast("Task added!");
  loadTasks();
}

async function delTask(id) {
  await fetch(`${API}/tasks/${id}`, { method: "DELETE", headers: { authorization: token }});
  toast("Task deleted!", "error");
  loadTasks();
}

/* ---------------------
   PROFILE PREVIEW
--------------------- */
function previewPfp() {
  const file = pfpUpload.files[0];
  if (file) {
    pfpPreview.src = URL.createObjectURL(file);
  }
}

function saveProfile() {
  toast("Profile updated!");
}
