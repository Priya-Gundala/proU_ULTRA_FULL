// backend/src/routes/users.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth"); // must exist and set req.user.id

// Update current user's profile (PUT or PATCH)
async function updateProfile(req, res) {
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { name, email, phone, position } = req.body || {};

  // Basic validation: require name and email if you want
  if (!name || !email) {
    return res.status(400).json({ error: "name and email required" });
  }

  const sql = `UPDATE users
               SET name = ?, email = ?, /* optional */ phone = COALESCE(?, phone),
                   position = COALESCE(?, position)
               WHERE id = ?`;

  db.run(sql, [name, email, phone || null, position || null, userId], function (err) {
    if (err) {
      console.error("[users:update] DB error:", err);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the updated profile
    db.get("SELECT id, name, email, role, photo, phone, position FROM users WHERE id = ?", [userId], (e, row) => {
      if (e) {
        console.error("[users:get-after-update] DB error:", e);
        return res.status(500).json({ error: e.message });
      }
      res.json({ user: row });
    });
  });
}

router.put("/", auth, updateProfile);
router.patch("/", auth, updateProfile);

// Export
module.exports = router;

