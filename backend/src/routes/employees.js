const express = require("express");
const router = express.Router();
const db = require("../db");

// ==========================
// GET ALL EMPLOYEES
// ==========================
router.get("/", (req, res) => {
  db.all("SELECT * FROM employees", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ==========================
// ADD EMPLOYEE
// ==========================
router.post("/", (req, res) => {
  const { name, email, phone, role, position, notes } = req.body;

  if (!name || !email)
    return res.status(400).json({ error: "Name and email required" });

  const sql = `
    INSERT INTO employees (name, email, phone, role, position, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [name, email, phone, role, position, notes], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Employee added", id: this.lastID });
  });
});

// ==========================
// DELETE EMPLOYEE BY ID
// ==========================
router.delete("/:id", (req, res) => {
  const id = req.params.id;

  db.run("DELETE FROM employees WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    if (this.changes === 0)
      return res.status(404).json({ error: "Employee not found" });

    res.json({ message: "Employee deleted" });
  });
});

module.exports = router;
