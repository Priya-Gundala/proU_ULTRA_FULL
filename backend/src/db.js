const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("app.db");

db.run("PRAGMA foreign_keys = ON");

db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'user',
  photo TEXT
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT,
  position TEXT,
  notes TEXT
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  due_date TEXT,
  status TEXT,
  assigned_to INTEGER,
  FOREIGN KEY(assigned_to) REFERENCES employees(id)
)
`);

module.exports = db;
