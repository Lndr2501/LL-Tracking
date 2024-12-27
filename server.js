const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const fs = require("fs");
const { log } = require("console");

const app = express();
const db = new sqlite3.Database(path.join(dataDir, "database.db"));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
const secretkey = JSON.parse(fs.readFileSync("secret.json")).secretkey;
app.use(
  session({
    secret: secretkey,
    resave: false,
    saveUninitialized: true,
  })
);

// Erstelle die Tabellen, falls sie noch nicht existieren
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tracking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number TEXT UNIQUE,
      status TEXT,
      ort TEXT,
      datum TEXT,
      uhrzeit TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tracking_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracking_number TEXT,
      status TEXT,
      ort TEXT,
      datum TEXT,
      uhrzeit TEXT,
      FOREIGN KEY(tracking_number) REFERENCES tracking(number)
    )
  `);
});

// Route zum Abrufen des Status einer Sendung
app.get("/track", (req, res) => {
  log("GET /track");
  const trackingNumber = req.query.id;
  if (!trackingNumber) {
    return res.status(400).json({ error: "Sendungsnummer fehlt" });
  }

  log(`Suche nach Sendung mit der Nummer: ${trackingNumber}`);

  res.sendFile(path.join(__dirname, "public", "track.html"));
});

// Admin-Login-Route
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  console.log(
    `Login attempt with username: ${username} and password: ${password}`
  );

  // Pfad zur logins.json Datei
  const filePath = path.join(__dirname, "logins.json");

  // Datei lesen und JSON parsen
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Fehler beim Lesen der Datei:", err);
      return res.status(500).json({ error: "Interner Serverfehler" });
    }

    try {
      const users = JSON.parse(data);
      const user = users.find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        req.session.isAdmin = true;
        console.log("Login erfolgreich!");
        res.json({ message: "Login erfolgreich!" });
      } else {
        console.log("Ungültiger Benutzername oder Passwort");
        res
          .status(401)
          .json({ error: "Ungültiger Benutzername oder Passwort" });
      }
    } catch (err) {
      console.error("Fehler beim Parsen der JSON-Daten:", err);
      res.status(500).json({ error: "Interner Serverfehler" });
    }
  });
});

// Middleware zum Schutz der Admin-Seite und API
function isAdmin(req, res, next) {
  if (req.session.isAdmin) {
    next();
  } else {
    res.status(403).send("Zugriff verweigert");
  }
}

// Admin-Seite schützen
app.get("/admin.html", isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Admin-API-Routen schützen
app.post("/admin/create", isAdmin, (req, res) => {
  const { status, ort, datum, uhrzeit } = req.body;
  let number = generateTrackingNumber();

  // Überprüfen, ob die Tracking-Nummer bereits existiert
  db.get("SELECT * FROM tracking WHERE number = ?", [number], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      // Wenn die Nummer bereits existiert, generiere eine neue
      number = generateTrackingNumber();
    }

    db.run(
      "INSERT INTO tracking (number, status, ort, datum, uhrzeit) VALUES (?, ?, ?, ?, ?)",
      [number, status, ort, datum, uhrzeit],
      function (err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        // Füge den ersten Eintrag in die Verlaufstabelle ein
        db.run(
          "INSERT INTO tracking_history (tracking_number, status, ort, datum, uhrzeit) VALUES (?, ?, ?, ?, ?)",
          [number, status, ort, datum, uhrzeit],
          function (err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json({ message: "Sendung erfolgreich erstellt!", number });
          }
        );
      }
    );
  });
});

app.post("/admin/update", isAdmin, (req, res) => {
  const { number, status, ort, datum, uhrzeit } = req.body;

  // Überprüfen, ob die Tracking-Nummer existiert
  db.get("SELECT * FROM tracking WHERE number = ?", [number], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: "Tracking-Nummer nicht gefunden!" });
      return;
    }

    // Aktualisiere die Sendung
    db.run(
      "UPDATE tracking SET status = ?, ort = ?, datum = ?, uhrzeit = ? WHERE number = ?",
      [status, ort, datum, uhrzeit, number],
      function (err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        // Füge den Eintrag in die Verlaufstabelle ein
        db.run(
          "INSERT INTO tracking_history (tracking_number, status, ort, datum, uhrzeit) VALUES (?, ?, ?, ?, ?)",
          [number, status, ort, datum, uhrzeit],
          function (err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json({ message: "Sendung erfolgreich aktualisiert!" });
          }
        );
      }
    );
  });
});

app.get("/track/:trackingNumber", (req, res) => {
  const { trackingNumber } = req.params;
  db.all(
    "SELECT * FROM tracking_history WHERE tracking_number = ? ORDER BY datum, uhrzeit",
    [trackingNumber],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (rows.length > 0) {
        res.json(rows);
      } else {
        res.status(404).json({ error: "Tracking-Nummer nicht gefunden!" });
      }
    }
  );
});

function generateTrackingNumber() {
  const digits = "0123456789";
  let result = "LL";
  for (let i = 0; i < 10; i++) {
    result += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return result;
}

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
