import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://db:27017";
const mongoClient = new MongoClient(MONGODB_URI);
await mongoClient.connect();

app.get("/players/:id/description", async (req, res) => {
  const { id } = req.params;
  const player = await mongoClient
    .db("baseball")
    .collection("players")
    .findOne({ _id: new ObjectId(id) });
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  const prompt = `Write a short, enthusiastic, 2-sentence scouting report for the baseball player: ${JSON.stringify(
    player
  )}. Focus on their versatility or unique combination of skills.`;

  try {
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const description = response.text.trim();

    res.json({ description });
  } catch (err) {
    console.error("Error generating description:", err);
    res.status(500).json({ error: "Failed to generate description" });
  }
});

app.patch("/players/:id", async (req, res) => {
  const { id } = req.params;
  const player = await mongoClient
    .db("baseball")
    .collection("players")
    .findOne({ _id: new ObjectId(id) });
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  const updates = {};
  for (const key in req.body) {
    if (key === "_id") continue;
    if (Object.prototype.hasOwnProperty.call(player, key)) {
      updates[key] = req.body[key];
    }
  }

  if (Object.keys(updates).length > 0) {
    await mongoClient
      .db("baseball")
      .collection("players")
      .updateOne({ _id: player._id }, { $set: updates });

    const updatedPlayer = await mongoClient
      .db("baseball")
      .collection("players")
      .findOne({ _id: player._id });

    res.json(updatedPlayer);
  } else {
    res.json(player);
  }
});

app.get("/players", async (req, res) => {
  const players = await mongoClient
    .db("baseball")
    .collection("players")
    .find({})
    .limit(1)
    .toArray();
  res.json(players);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
