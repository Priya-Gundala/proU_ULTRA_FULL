// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const SECRET = 'mysecret';
const bcrypt = require('bcrypt');

const DB = path.resolve(__dirname, '..', '..', 'app.db');
function openDb(){ return new sqlite3.Database(DB); }

// REGISTER
router.post('/register', express.json(), async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).send('name,email,password required');

    const db = openDb();
    const hashed = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)`;
    db.run(sql, [name, email, hashed, 'user'], function(err){
      if (err) {
        db.close();
        if (err.message && err.message.includes('UNIQUE')) return res.status(400).send('Email already exists');
        return res.status(500).send('DB error: ' + err.message);
      }
      db.get('SELECT id,name,email,role FROM users WHERE id = ?', [this.lastID], (err2,row)=>{
        db.close();
        if (err2) return res.status(500).send('DB fetch error');
        res.status(201).json({ user: row });
      });
    });
  } catch (e) {
    res.status(500).send('Server error');
  }
});

// LOGIN
router.post('/login', express.json(), (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).send('email,password required');

  const db = openDb();
  db.get('SELECT id,name,email,password,role FROM users WHERE email = ?', [email], async (err,row)=>{
    if (err) { db.close(); return res.status(500).send('DB error'); }
    if (!row) { db.close(); return res.status(401).send('Invalid'); }
    const match = await bcrypt.compare(password, row.password);
    if (!match) { db.close(); return res.status(401).send('Invalid'); }
    // create a signed JWT token so the auth middleware can verify requests
    const token = jwt.sign({ id: row.id, email: row.email, role: row.role }, SECRET, { expiresIn: '7d' });
    db.close();
    res.json({ token });
  });
});

module.exports = router;
