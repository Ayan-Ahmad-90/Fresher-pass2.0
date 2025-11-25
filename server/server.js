const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./database");
const QRCode = require("qrcode");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Generate new registration ID
function generateId(count) {
  const num = (count + 1).toString().padStart(4, "0");
  return "REG" + num;
}

// Register API
app.post("/register", async (req, res) => {
  const { name, email, phone, college, course } = req.body;

  db.all("SELECT * FROM registrations", async (err, rows) => {
    const id = generateId(rows.length);

    const created_at = new Date().toISOString();
    const status = "NOT_VERIFIED";

    db.run(
      `INSERT INTO registrations(id,name,email,phone,college,course,status,created_at,verified_at)
       VALUES(?,?,?,?,?,?,?,?,?)`,
      [id, name, email, phone, college, course, status, created_at, null]
    );

    const qr = await QRCode.toDataURL(id);

    res.json({ id, qr });
  });
});

// Verify API
app.post("/verify", (req, res) => {
  const { id } = req.body;

  db.get("SELECT * FROM registrations WHERE id = ?", [id], (err, reg) => {
    if (!reg) return res.json({ status: "INVALID" });

    if (reg.status === "VERIFIED") {
      return res.json({ status: "ALREADY", reg });
    }

    const verified_at = new Date().toISOString();

    db.run(
      "UPDATE registrations SET status='VERIFIED', verified_at=? WHERE id=?",
      [verified_at, id]
    );

    res.json({ status: "SUCCESS", reg });
  });
});

// Admin Data
app.get("/all", (req, res) => {
  db.all("SELECT * FROM registrations", (err, rows) => {
    res.json(rows);
  });
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
