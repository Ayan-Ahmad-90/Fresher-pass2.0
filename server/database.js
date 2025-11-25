const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./server/db.sqlite");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT,
      phone TEXT,
      college TEXT,
      course TEXT,
      status TEXT,
      created_at TEXT,
      verified_at TEXT
  )`);
});

module.exports = db;
