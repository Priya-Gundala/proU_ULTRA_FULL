const db = require("./src/db");

db.all("SELECT id, title, status, assigned_to, due_date FROM tasks", [], (err, rows) => {
  if (err) {
    console.error("DB ERROR:", err);
    process.exit(1);
  }
  console.log("TASKS IN DATABASE:");
  console.table(rows);
  process.exit(0);
});
