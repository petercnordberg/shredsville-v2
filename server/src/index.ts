import express from "express";
import cors from "cors";
import path from "path";
import { runMigrations } from "./db/migrate";
import entriesRouter from "./routes/entries";
import presetsRouter from "./routes/presets";
import settingsRouter from "./routes/settings";
import parseRouter from "./routes/parse";

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/entries", entriesRouter);
app.use("/api/presets", presetsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/parse", parseRouter);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "client");
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

async function start() {
  await runMigrations();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on 0.0.0.0:${PORT}`);
  });
}

start();
