import express from "express";
import "dotenv/config";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import multer from "multer";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("translator.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    preferences TEXT
  );

  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    source_text TEXT,
    translated_text TEXT,
    source_lang TEXT,
    target_lang TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_favorite INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3004;

  app.use(express.json());

  // Rate Limiting (Increased for testing)
  const requestCounts = new Map<string, { count: number, reset: number }>();
  app.use((req, res, next) => {
    const ip = req.ip || "unknown";
    const now = Date.now();
    const window = 60000;
    const limit = 300; 

    const data = requestCounts.get(ip) || { count: 0, reset: now + window };
    if (now > data.reset) {
      data.count = 1;
      data.reset = now + window;
    } else {
      data.count++;
    }
    requestCounts.set(ip, data);
    if (data.count > limit) return res.status(429).json({ error: "Too many requests" });
    next();
  });

  // Security Headers
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
  });

  const upload = multer({ dest: "uploads/" });

  // API Routes
  app.post("/api/translate", async (req, res) => {
    try {
      const { inputText, sourceLang, targetLang, systemPrompt } = req.body;
      
      if (!inputText || !targetLang || !sourceLang) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      const defaultSystem = `You are AI-TRANSLATOR, a precise multilingual translation engine. 
Translate the given text from ${sourceLang} to ${targetLang}. 
Return ONLY the translated text. No explanations, no 
alternatives, no notes. Preserve tone, idioms, formality 
level, and cultural nuance accurately.`;

      const finalSystemPrompt = systemPrompt || defaultSystem;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.VITE_GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: finalSystemPrompt },
            { role: "user", content: inputText }
          ],
          temperature: 0.1,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Translation Engine error");
      }

      const data = await response.json();
      res.json({ text: data.choices[0].message.content });

    } catch (err: any) {
      console.error("Translation error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, sourceLang, targetLang } = req.body;
      const systemContent = sourceLang && targetLang 
        ? `You are a helpful AI linguistic assistant. The user's source language is ${sourceLang} and their target language is ${targetLang}. 
           When the user sends a message, you must:
           1. Respond to the user's message primarily in ${sourceLang}.
           2. Translate the user's input (or the key parts of it) into ${targetLang}.
           3. Ensure the actual translation is in ${targetLang}, but keep all other conversation, explanations, and greetings in ${sourceLang}.` 
        : "You are a helpful AI chatbot. You can speak multiple languages and help the user with anything they need.";
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.VITE_GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemContent },
            ...messages.map((m: any) => ({ role: m.role, content: m.content }))
          ],
          temperature: 0.7,
          max_tokens: 2048
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Chat Engine error");
      }

      const data = await response.json();
      res.json({ text: data.choices[0].message.content });
    } catch (err: any) {
      console.error("Chat error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/history", (req, res) => {
    const rows = db.prepare("SELECT * FROM history ORDER BY timestamp DESC LIMIT 50").all();
    res.json(rows);
  });

  app.post("/api/history", (req, res) => {
    const { source_text, translated_text, source_lang, target_lang } = req.body;
    db.prepare("INSERT INTO history (source_text, translated_text, source_lang, target_lang) VALUES (?, ?, ?, ?)").run(source_text, translated_text, source_lang, target_lang);
    res.json({ success: true });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
