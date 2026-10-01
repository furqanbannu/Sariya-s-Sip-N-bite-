import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { initDatabase } from './server/db.js';
import { apiRouter } from './server/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize persistent SQLite Database and Seed Data
initDatabase();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Mount complete REST API (Auth, Public Menu/Content, Admin Control Center)
app.use('/api', apiRouter);

// Initialize GoogleGenAI SDK with user agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const CONCIERGE_SYSTEM_INSTRUCTION = `You are the Head Concierge at "Sariya's Sip N Bite", a premier luxury dining destination located inside Lucky Kabana Hotel on Mall Road in Murree, Pakistan (Elevation: 2,291m above sea level).

Your demeanor is refined, warm, knowledgeable, and attentive—embodying traditional Murree mountain hospitality. You assist guests with inquiries regarding:
1. The Hotel & Dining Venue:
   - Location: Mall Road, Murree, Pakistan (Lucky Kabana Hotel). Elevation: 2,291m.
   - Operating Hours: Weekdays 11:00 AM – 01:00 AM; Weekends 11:00 AM – 02:00 AM; Room Service available 24/7 for hotel guests.
   - Seating Areas: Mountain View Terrace (sweeping views of Kashmir Point and pine valleys), Cozy Fireplace Hearth Lounge (stone hearth with crackling cedar fire), Central Grand Hall (chandelier aisle), Private Family Booths.
   - Reservations: Table reservations can be booked online with our interactive canvas seating map; no advance deposit required.
   - Price range: Rs 1–1,000 per person.

2. Gastronomic Menu & Culinary Specialties:
   - Signature Dishes:
     * Italian Chicken Steak (Rs 950) — Tender fillet with wild mushroom tarragon cream, charred potatoes, and vegetables.
     * Malai Boti Pizza (Rs 890) — Hand-tossed crust, slow-marinated chicken malai chunks, melted mozzarella, garlic drizzle.
     * Special Pasta Alfredo (Rs 780) — Fettuccine in double-cream parmesan reduction with grilled chicken.
     * Crispy Pasta Supreme (Rs 790) — Penne with arrabiata rose sauce and crispy parmesan schnitzel bites.
     * Special Lebanese Shawarma (Rs 450) — Slow-spit roasted chicken in flatbread with authentic garlic toum.
     * Cake of the Day (Rs 420) — Artisanal pastry slice (Lotus Biscoff, Belgian dark chocolate, pistachio rose).
   - High Altitude Beverages:
     * Murree Mountain Karak Chai (Rs 180) — Black tea with cardamom, milk, and cinnamon.
     * Kashmiri Pink Noon Chai (Rs 240) — Traditional salted green tea with clotted cream, crushed almonds & pistachios.
     * Alpine Hot Chocolate with Marshmallows (Rs 390) — Melted Swiss chocolate with toasted marshmallows.
     * Fresh Mint & Lime Margarita (Rs 320) — Chilled sparkling mocktail.
   - Starters, Burgers, Sizzling Brownies, and Saffron Kheer.

3. Murree Mountain Weather & Seasonal Culinary Pairings:
   - Weather: Crisp mountain climate with temperatures varying from chilly autumn mist (around 11°C), sub-zero alpine snow and flurries in winter (1°C to -3°C), monsoon showers (15°C), to bright sunny terrace weather (22°C).
   - Culinary Pairings:
     * Chilly Mist: Rich mushroom cream steaks, hot karak chai, cheese stuffed mushrooms.
     * Snow & Frost: Sizzling cast iron brownies, peppery steaks, and Kashmiri pink noon chai.
     * Mountain Rain: Crispy golden finger fish, honey glazed wings, and hot double-cream pasta.
     * Sunny Ridge: Chilled mint margaritas, charcoal smash burgers, and terrace pizza.

Tone & Style Rules:
- Keep responses concise, helpful, and elegant (typically 2 to 4 sentences or a neat bullet list).
- Mention relevant prices in Pakistani Rupees (Rs) and highlight signature recommendations.
- Welcome guests cordially and invite them to visit our terrace or cozy hearth on Mall Road.`;

// API Endpoint for Concierge Chat
app.post('/api/concierge-chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Format conversation history for Gemini
    const contents: any[] = [];

    if (Array.isArray(history)) {
      for (const turn of history.slice(-6)) {
        if (turn.role === 'user' || turn.role === 'model') {
          contents.push({
            role: turn.role,
            parts: [{ text: turn.text }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      // Provide an intelligent concierge fallback
      const lower = message.toLowerCase();
      let reply = "Welcome to Sariya's Sip N Bite at Lucky Kabana Hotel on Mall Road, Murree! How may I assist your high-altitude dining experience today?";

      if (lower.includes('weather') || lower.includes('temperature') || lower.includes('cold') || lower.includes('mist') || lower.includes('rain')) {
        reply = "Currently on Mall Road (2,291m elevation), we are enjoying crisp autumn mountain air and rolling pine mist around 11°C. We highly recommend our warming Italian Chicken Steak or a steaming cup of authentic Kashmiri Pink Noon Chai (Rs 240) by the fireplace hearth.";
      } else if (lower.includes('menu') || lower.includes('food') || lower.includes('dish') || lower.includes('steak') || lower.includes('pizza') || lower.includes('price')) {
        reply = "Our kitchen specializes in luxury alpine dining within Rs 1–1,000 per person. Signature highlights include our Italian Chicken Steak with wild mushroom cream (Rs 950), hand-tossed Malai Boti Pizza (Rs 890), and Special Pasta Alfredo (Rs 780). All prepared fresh to order!";
      } else if (lower.includes('hotel') || lower.includes('room') || lower.includes('stay') || lower.includes('kabana') || lower.includes('hours') || lower.includes('time')) {
        reply = "We are located inside the historic Lucky Kabana Hotel on Mall Road, Murree. Our main dining room and heated terrace welcome guests from 11:00 AM to 01:00 AM weekdays (until 02:00 AM on weekends), with 24/7 room service for hotel guests.";
      } else if (lower.includes('table') || lower.includes('reserve') || lower.includes('seat') || lower.includes('terrace') || lower.includes('fireplace')) {
        reply = "You can reserve your preferred table directly using our interactive canvas seating map in the reservation flow! We offer stunning Valley View Terrace perches, cozy Stone Fireplace tables, and private family alcoves with no advance deposit required.";
      }

      res.json({ reply });
      return;
    }

    // Call Gemini API using modern @google/genai SDK
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: CONCIERGE_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I am at your service at Sariya's Sip N Bite. How may I assist your dining or stay in Murree?";
    res.json({ reply });
  } catch (error: any) {
    console.error('Concierge chat API error:', error);
    // If quota or network issue occurs, return a helpful concierge fallback response
    const fallback = "Our mountain kitchen and hotel concierge welcome you to Mall Road, Murree (2,291m). Our signature Italian Chicken Steak (Rs 950), wood-fired pizzas, and warm Kashmiri Noon Chai are prepared fresh. Please feel free to reserve a table or browse our seasonal specialties!";
    res.json({ reply: fallback });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
