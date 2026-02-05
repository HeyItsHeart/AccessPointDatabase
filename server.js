import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { createUser, attachSocket, removeSocket, getUsername } from "./DB.js";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

/* ===== LOGIN ===== */
app.post("/login", (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }

  const user = createUser(username);
  res.json(user);
});

/* ===== WEBSOCKETS ===== */
wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    if (msg.type === "auth") {
      attachSocket(ws, msg.userId);
      ws.send(JSON.stringify({ type: "system", text: "Connected to chat" }));
      return;
    }

    if (msg.type === "chat") {
      const username = getUsername(ws);
      if (!username) return;

      const payload = JSON.stringify({
        type: "chat",
        user: username,
        text: msg.text,
        time: Date.now()
      });

      for (const client of wss.clients) {
        if (client.readyState === 1) {
          client.send(payload);
        }
      }
    }
  });

  ws.on("close", () => {
    removeSocket(ws);
    console.log("Client disconnected");
  });
});

server.listen(3000, () => {
  console.log("Chat server running on :3000");
});
