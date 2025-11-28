// fix_users_table.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "app.db");  // change if your DB name is different
const db = new sqlite3.Database(dbPath);

console.log("Checking users table...");

db.all("PRAGMA table_info(users);", (err, cols) => {
  if (err) {
    console.error("Failed to read table:", err);
    return;
  }

  const colNames = cols.map(c => c.name);
  console.log("Existing columns:", colNames);

  if (!colNames.includes("name")) {
    console.log('Adding missing column: "name"...');
    db.run("ALTER TABLE users ADD COLUMN name TEXT;", (err2) => {
      if (err2) {
        console.error("ALTER TABLE failed:", err2);
      } else {
        console.log("Column added successfully!");
      }
      db.close();
    });
  } else {
    console.log('Column "name" already exists — no change needed.');
    db.close();
  }
});
