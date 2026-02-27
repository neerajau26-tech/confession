import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Supabase
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase credentials missing. API will fail until configured.");
  }

  const supabase = createClient(supabaseUrl || "", supabaseKey || "");

  app.use(express.json());

  // API Routes
  app.get("/api/confessions", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("secret heart")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        // Fallback if 'id' ordering fails, try without ordering
        console.warn("Ordering by id failed, trying without order:", error.message);
        const { data: unorderedData, error: unorderedError } = await supabase
          .from("secret heart")
          .select("*");
        
        if (unorderedError) throw unorderedError;
        return res.json(unorderedData.map((item: any) => ({
          id: item.id,
          message: item.confession,
          likes: item.like || 0,
          created_at: item.created_at || new Date().toISOString()
        })));
      }
      
      // Map user's schema to app's internal schema
      const mappedData = data.map((item: any) => ({
        id: item.id,
        message: item.confession,
        likes: item.like || 0,
        created_at: item.created_at || new Date().toISOString()
      }));

      res.json(mappedData);
    } catch (error: any) {
      console.error("Supabase error:", error);
      res.status(500).json({ error: "Failed to fetch confessions", details: error.message });
    }
  });

  app.post("/api/confessions", async (req, res) => {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Confession text is required" });
    }

    try {
      const { data, error } = await supabase
        .from("secret heart")
        .insert([
          { 
            confession: message,
            like: 0
          }
        ])
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("No data returned after insert");
      }
      
      const item = data[0];
      res.status(201).json({
        id: item.id,
        message: item.confession,
        likes: item.like || 0,
        created_at: item.created_at || new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Supabase error:", error);
      res.status(500).json({ error: "Failed to save confession", details: error.message });
    }
  });

  app.post("/api/confessions/:id/like", async (req, res) => {
    const { id } = req.params;
    try {
      // First get current likes
      const { data: current, error: getError } = await supabase
        .from("secret heart")
        .select("like")
        .eq("id", id)
        .single();

      if (getError) throw getError;

      const { data, error } = await supabase
        .from("secret heart")
        .update({ like: (current.like || 0) + 1 })
        .eq("id", id)
        .select();

      if (error) throw error;
      res.json(data[0]);
    } catch (error: any) {
      console.error("Supabase error:", error);
      res.status(500).json({ error: "Failed to like confession" });
    }
  });

  // Vite middleware for development
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
