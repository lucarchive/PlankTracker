import express from "express";
import fs from "fs";
import os from "os";
import path from "path";

const app = express();
const PORT = 3000;
const __dirname = process.cwd();
const memoPath = path.join(__dirname, "memo.json");

app.use(express.json());
app.use(express.static("public"));

// --- Funzione per ottenere l'IP locale ---
function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "IP non disponibile";
}

// --- API per ottenere i dati ---
app.get("/api/times", (req, res) => {
  fs.readFile(memoPath, "utf8", (err, data) => {
    if (err) return res.json([]);
    res.json(JSON.parse(data || "[]"));
  });
});

// --- Aggiunge una misurazione ---
app.post("/api/times", (req, res) => {
  const { duration } = req.body;
  const entry = {
    date: new Date().toLocaleString(),
    duration: duration.toFixed(2) + " s",
  };

  fs.readFile(memoPath, "utf8", (err, data) => {
    const times = err ? [] : JSON.parse(data || "[]");
    times.unshift(entry);
    fs.writeFile(memoPath, JSON.stringify(times, null, 2), (err2) => {
      if (err2) return res.status(500).send("Errore di scrittura");
      res.json(entry);
    });
  });
});

// --- Cancella lo storico ---
app.delete("/api/times", (req, res) => {
  fs.writeFile(memoPath, JSON.stringify([], null, 2), (err) => {
    if (err) return res.status(500).send("Errore di scrittura");
    res.json({ message: "Storico svuotato" });
  });
});

// --- Restituisce l'indirizzo IP ---
app.get("/api/ip", (req, res) => {
  res.json({ ip: getLocalIP() });
});

app.listen(PORT, () =>
  console.log(`✅ Server in ascolto su http://localhost:${PORT}`)
);

