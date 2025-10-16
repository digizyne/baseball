import express from "express";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://db:27017";
const mongoClient = new MongoClient(MONGO_URI);
await mongoClient.connect();

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
