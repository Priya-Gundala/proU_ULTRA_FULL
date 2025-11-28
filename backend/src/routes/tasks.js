// backend/src/routes/tasks.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// DEBUG version: no auth middleware here so frontend can work while debugging.
// If you want auth later, add `const auth = require('../middleware/auth')`
// and use auth on the routes.

// GET /tasks  -> return all tasks with optional assigned employee name
router.get("/", (req, res) => {
  const sql = `
    SELECT
      t.id,
      t.title,
      t.description,
      t.due_date,
      t.status,
      t.assigned_to,
      e.name AS assigned_name
    FROM tasks t
    LEFT JOIN employees e ON t.assigned_to = e.id
    ORDER BY t.id DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("[TASKS GET] DB error:", err);
      return res.status(500).json({ error: "DB error", detail: err.message });
    }
    res.json(rows);
  });
});

// POST /tasks -> create a task
router.post("/", (req, res) => {
  const { title, description, due_date, status, assigned_to } = req.body || {};

  if (!title || title.toString().trim() === "") {
    return res.status(400).json({ error: "Missing required field: title" });
  }

  // If assigned_to provided, ensure it exists in employees table
  const assnId = assigned_to ? Number(assigned_to) : null;

  const insertTask = (finalAssignedTo) => {
    const sql = `INSERT INTO tasks (title, description, due_date, status, assigned_to)
                 VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [title, description || "", due_date || null, status || "open", finalAssignedTo], function (err) {
      if (err) {
        console.error("[TASKS POST] DB insert error:", err);
        return res.status(500).json({ error: "DB insert error", detail: err.message });
      }
      // Return the newly created task row
      const newId = this.lastID;
      db.get(`SELECT * FROM tasks WHERE id = ?`, [newId], (err2, row) => {
        if (err2) {
          console.error("[TASKS POST] DB get new row error:", err2);
          return res.status(500).json({ id: newId, message: "Created but couldn't fetch", detail: err2.message });
        }
        res.json({ message: "Task created", task: row });
      });
    });
  };

  if (assnId) {
    db.get("SELECT id FROM employees WHERE id = ?", [assnId], (err, emp) => {
      if (err) {
        console.error("[TASKS POST] DB error checking employee:", err);
        return res.status(500).json({ error: "DB error checking employee", detail: err.message });
      }
      if (!emp) {
        // don't allow invalid foreign key - return a clear error
        return res.status(400).json({ error: "assigned_to_not_found", message: "Employee id in assigned_to does not exist" });
      }
      insertTask(assnId);
    });
  } else {
    insertTask(null);
  }
});

// DELETE /tasks/:id -> delete a task
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid id" });

  db.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("[TASKS DELETE] DB error:", err);
      return res.status(500).json({ error: "DB error", detail: err.message });
    }
    if (this.changes === 0) return res.status(404).json({ error: "Not Found" });
    res.json({ message: "Deleted" });
  });
});

module.exports = router;
