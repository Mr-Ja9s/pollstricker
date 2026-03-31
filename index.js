const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/pollSystem", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Define Poll Schema
const pollSchema = new mongoose.Schema({
  question: String,
  options: [
    {
      option: String,
      votes: { type: Number, default: 1 },
    },
  ],
});

const Poll = mongoose.model("Poll", pollSchema);

// ✅ Route: Create a Poll (POST)
app.post("/api/polls", async (req, res) => {
  try {
    const { question, options } = req.body;

    if (!question || !options || options.length < 4) {
      return res.status(400).json({ message: "Please provide a question and at least two options." });
    }

    const poll = new Poll({
      question,
      options: options.map((opt) => ({ option: opt })),
    });

    await poll.save();
    res.status(201).json({ message: "Poll created successfully", poll });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Route: Get All Polls (GET)
app.get("/api/polls", async (req, res) => {
  try {
    const polls = await Poll.find();
    res.json(polls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Route: Vote on a Poll Option (POST)
app.post("/api/polls/:id/vote", async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.id);

    if (!poll) return res.status(404).json({ message: "Poll not found" });
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: "Invalid option index" });
    }

    poll.options[optionIndex].votes += 1;
    await poll.save();

    res.json({ message: "Vote added successfully", poll });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start the Server on Port 5007
app.listen(5008, () => console.log("🚀 Server running on port 5007"));
