import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";
import { getVapidPublicKey, addOrUpdateSubscription } from "./serverPush";
import {
  addSSEClient,
  loadOrdersFromDisk,
  createOrder,
  updateOrderStatus,
  getStoredSettings,
  saveStoredSettings,
} from "./serverOrderStore";

// Smart fallback generator in case API is unavailable or rate-limited
function generateSmartDrinkFallback(name: string, category: string) {
  const cleanName = name.trim();
  const lowerName = cleanName.toLowerCase();
  const lowerCat = (category || '').toLowerCase();

  let calories = 120;
  let tagline = `Freshly handcrafted ${cleanName} served chilled to perfection.`;
  let description = `Made with fresh, premium ingredients selected by Immy Drinks baristas. Smooth, crisp, and refreshing from the first sip to the last.`;
  let flavorNotes = "Fresh, Chilled, Refreshing";

  if (lowerName.includes("passion") || lowerCat.includes("juice") || lowerName.includes("juice")) {
    calories = 115;
    tagline = `Pure sun-ripened tropical fruit pressed fresh daily.`;
    description = `Artisanal cold-pressed juice bursting with vibrant natural sweetness and a refreshing tart kick. Served ice-cold over cracked ice.`;
    flavorNotes = "Tropical Citrus, Sweet, Tangy, Iced";
  } else if (lowerName.includes("milk") || lowerName.includes("bongo") || lowerCat.includes("bongo")) {
    calories = 185;
    tagline = `Rich, creamy cultured milk with authentic local heritage.`;
    description = `Slow-fermented traditional cultured milk, naturally rich in probiotics with a thick, velvety texture and comforting tangy finish.`;
    flavorNotes = "Creamy, Velvety, Tangy, Traditional";
  } else if (lowerName.includes("tea") || lowerCat.includes("tea")) {
    calories = lowerName.includes("milk") ? 130 : 35;
    tagline = `Aromatic steeped botanicals with soothing herbal warmth.`;
    description = `Carefully infused whole tea leaves brewed to aromatic perfection, accented with delicate spiced undertones and clean clarity.`;
    flavorNotes = "Aromatic, Spiced, Soothing, Herbal";
  } else if (lowerName.includes("cake") || lowerCat.includes("pastr") || lowerCat.includes("bakery")) {
    calories = 340;
    tagline = `Oven-baked daily with golden layers of artisanal sweetness.`;
    description = `Moist, delicate crumb crafted from rich creamery butter and natural vanilla, presenting a comforting balance of sweetness in every bite.`;
    flavorNotes = "Sweet Vanilla, Buttery Crumb, Baked";
  }

  return {
    tagline,
    description,
    calories,
    flavorNotes
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ----------------------------------------------------
  // REAL-TIME ORDERS & BACKGROUND SYNC API
  // ----------------------------------------------------

  // 1. Get all stored orders
  app.get("/api/orders", (req, res) => {
    try {
      const orders = loadOrdersFromDisk();
      res.json(orders);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Submit new order (persists to disk, broadcasts SSE, triggers Telegram & Push notifications)
  app.post("/api/orders", async (req, res) => {
    try {
      const order = req.body;
      if (!order || !order.id) {
        return res.status(400).json({ error: "Invalid order data" });
      }
      const saved = await createOrder(order);
      res.status(201).json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Update order status & dynamic progress (admin -> customer real-time sync)
  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, progressPercent } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      const updated = await updateOrderStatus(id, status, progressPercent);
      if (!updated) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Server-Sent Events (SSE) stream for zero-latency live synchronization
  app.get("/api/orders/events", (req, res) => {
    addSSEClient(res);
  });

  // 5. Web Push VAPID Public Key for client browser subscription
  app.get("/api/push/vapid-public-key", (req, res) => {
    res.json({ publicKey: getVapidPublicKey() });
  });

  // 6. Save client Push Subscription (Android background alerts)
  app.post("/api/push/subscribe", (req, res) => {
    try {
      const { subscription, role, orderId } = req.body;
      if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ error: "Invalid subscription" });
      }
      addOrUpdateSubscription(subscription, role || "customer", orderId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. Admin Dispatch Settings (Telegram / WhatsApp)
  app.get("/api/settings", (req, res) => {
    res.json(getStoredSettings());
  });

  app.post("/api/settings", (req, res) => {
    try {
      saveStoredSettings(req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Server-side initialization of Gemini API client (if key is set)
  const ai = process.env.GEMINI_API_KEY
    ? new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // AI Generation API route
  app.post("/api/generate-drink-details", async (req, res) => {
    try {
      const { drinkName, drinkCategory } = req.body;
      if (!drinkName || !drinkName.trim()) {
        return res.status(400).json({ error: "Drink name is required" });
      }

      // Supported Gemini models
      const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
      let parsedData: any = null;

      if (ai) {
        for (const modelName of modelsToTry) {
          try {
            console.log(`Attempting details generation with model: ${modelName}`);
            const response = await ai.models.generateContent({
              model: modelName,
              contents: `Generate a tagline, detailed description, calories (kcal), and flavor notes for a drink named: "${drinkName.trim()}" in the category: "${drinkCategory || 'general'}".`,
              config: {
                systemInstruction: "You are an expert drink barista and copywriter for Immy Drinks. Generate appealing, mouth-watering marketing copy.",
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    tagline: {
                      type: Type.STRING,
                      description: "A very short, punchy, single-sentence marketing tagline under 10 words. e.g. 'Pure blended passion fruit with a cooling ginger kick'",
                    },
                    description: {
                      type: Type.STRING,
                      description: "A detailed, descriptive summary of the drink's taste profile, preparation highlight, and texture (around 20-30 words).",
                    },
                    calories: {
                      type: Type.INTEGER,
                      description: "A realistic calories estimate in kcal (typically between 30 and 450 depending on the type of drink, e.g. fruit juice ~120, bongo cultured milk ~180, cake ~350, black tea ~10).",
                    },
                    flavorNotes: {
                      type: Type.STRING,
                      description: "A comma-separated list of 2 to 4 sensory tags (e.g., 'Sweet Citrus, Mango, Crushed Ice' or 'Creamy, Thick, Cultured')",
                    }
                  },
                  required: ["tagline", "description", "calories", "flavorNotes"],
                }
              }
            });

            const responseText = response.text;
            if (responseText) {
              parsedData = JSON.parse(responseText.trim());
              console.log(`Successfully generated details with model: ${modelName}`);
              break;
            }
          } catch (err: any) {
            console.warn(`Model ${modelName} failed or was unavailable:`, err?.message || err);
          }
        }
      }

      // If models succeeded, return parsed data; otherwise fall back to smart barista generation
      if (parsedData) {
        return res.json(parsedData);
      }

      console.log("Using smart barista copy generator fallback for:", drinkName);
      const fallbackData = generateSmartDrinkFallback(drinkName, drinkCategory);
      res.json(fallbackData);
    } catch (error: any) {
      console.error("Error generating drink details:", error);
      // Even in catch block, provide fallback to ensure user is never blocked
      const fallbackData = generateSmartDrinkFallback(req.body?.drinkName || "Special Refreshment", req.body?.drinkCategory || "General");
      res.json(fallbackData);
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
