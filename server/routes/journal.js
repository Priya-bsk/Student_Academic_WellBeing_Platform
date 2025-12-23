import express from "express";
import fetch from "node-fetch";
import Journal from "../models/Journal.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// ------------------------- Hugging Face Sentiment -------------------------
const hfSentiment = async (text) => {
  const apiUrl = `https://api-inference.huggingface.co/models/${process.env.HUGGINGFACE_MODEL}`;
  const headers = {
    "Authorization": `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
    "Content-Type": "application/json",
  };

  console.log("🧠 [HF] Sending text to Hugging Face model:", text.slice(0, 80) + "...");

  const resp = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ inputs: text }),
  });

  if (!resp.ok) throw new Error(`HF API error: ${resp.status}`);

  const data = await resp.json();
  console.log("✅ [HF] Raw API Response:", JSON.stringify(data, null, 2));

  let outputArr = Array.isArray(data[0]) ? data[0] : data;
  if (!Array.isArray(outputArr)) throw new Error("Unexpected HF response format.");

  // 🌟 CASE 1: Model outputs "X stars"
  if (outputArr[0]?.label?.includes("star")) {
    let weightedSum = 0, total = 0;
    for (const item of outputArr) {
      const stars = parseInt(item.label);
      if (!isNaN(stars)) {
        weightedSum += stars * item.score;
        total += item.score;
      }
    }

    const avgStars = weightedSum / total;
    const confidence = Math.round(Math.max(...outputArr.map(i => i.score)) * 100);
    const scaledScore = avgStars * 2;

    const mapScoreToCategory = (score) => {
      if (score >= 8.5) return "very-positive";
      if (score >= 6.5) return "positive";
      if (score <= 2.5) return "very-negative";
      if (score <= 4) return "negative";
      return "neutral";
    };

    const label = mapScoreToCategory(scaledScore);

    const result = {
      score: Math.round(scaledScore * 100) / 100,
      label,
      confidence,
      emotions: extractEmotions(text),
    };

    if (result.confidence < 35) result.label = "neutral";

    console.log("🎯 [HF] Processed Result (Stars Model):", result);
    return result;
  }

  // 🌟 CASE 2: Model outputs POSITIVE / NEGATIVE
  const { label, score } = outputArr[0];
  const scaledScore = label === "POSITIVE" ? 5 + score * 5 : 5 - score * 5;

  const result = {
    score: Math.round(scaledScore * 100) / 100,
    label: label.toLowerCase(),
    confidence: Math.round(score * 100),
    emotions: extractEmotions(text),
  };

  console.log("🎯 [HF] Processed Result (Binary Model):", result);
  return result;
};


// ----------------------- Lightweight Emotion Extractor -----------------------
const extractEmotions = (text) => {
  const emotionMap = {
    joy: ["happy", "excited", "grateful", "love", "wonderful", "amazing", "smile"],
    sadness: ["sad", "unhappy", "cry", "lonely", "depressed", "down"],
    anger: ["angry", "mad", "frustrated", "annoyed", "furious"],
    fear: ["scared", "afraid", "anxious", "worried", "terrified"],
    surprise: ["surprised", "amazed", "shocked", "astonished"],
    trust: ["trust", "confident", "believe", "secure"],
    anticipation: ["hopeful", "eager", "expect", "waiting", "excited"],
  };

  const words = text.toLowerCase().split(/\s+/);
  const detected = new Set();

  for (const [emotion, keywords] of Object.entries(emotionMap)) {
    if (keywords.some(k => words.includes(k))) detected.add(emotion);
  }

  return Array.from(detected).slice(0, 3);
};


/* -------------------------------------------------------------------------- */
/*                              RULE-BASED FALLBACK                            */
/* -------------------------------------------------------------------------- */
const ruleBasedSentiment = (text) => {
  const positiveWords = [
    "happy","joy","excited","great","wonderful","amazing","excellent","good","love",
    "beautiful","fantastic","awesome","perfect","blessed","grateful","thankful","proud",
    "succeed","success","win","achieve","accomplished","better","best","hope","hopeful",
    "confident","optimistic","peaceful","calm","relaxed","content","satisfied","delighted",
    "energized","motivated","productive","focused","refreshing","positive","joyful"
  ];

  const negativeWords = [
    "sad","depressed","anxious","worr","stress","stressed","angry","frustrated","upset",
    "hurt","pain","terrible","awful","horrible","bad","worst","hate","fear","scared",
    "lonely","alone","isolated","overwhelm","exhaust","tired","struggling","difficult",
    "hard","fail","failure","lost","confused","disappoint","regret","guilt","shame",
    "drain","burn","fatigue","restless","overwork","pressure","deadline","tense","stuck","hopeless"
  ];

  const emotionKeywords = {
    joy: ["happy","joy","excited","delighted","cheerful","pleased"],
    sadness: ["sad","depressed","unhappy","miserable","lonely","melancholy","drain","tired","exhaust"],
    anger: ["angry","furious","mad","irritated","frustrated","annoyed"],
    fear: ["scared","afraid","anxious","worried","nervous","panic"],
    stress: ["stressed","overwhelm","burn","pressure","deadline"],
    trust: ["trust","confident","secure","safe","believe"],
    anticipation: ["excited","eager","hopeful","anticipate"]
  };

  const allowedEmotions = ["joy","sadness","anger","fear","trust","anticipation","stress"];
  const negationWords = ["not","never","don't","doesn't","isn't","wasn't","can't","won't","no","didn't"];

  const words = text.toLowerCase().replace(/[^\w\s']/g, "").split(/\s+/).filter(Boolean);

  let positiveCount = 0, negativeCount = 0;
  const detectedEmotions = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    if (negationWords.includes(word)) {
      const nextWords = [words[i + 1], words[i + 2]].filter(Boolean);
      nextWords.forEach(nw => {
        if (positiveWords.some(p => nw.includes(p))) negativeCount++;
        if (negativeWords.some(n => nw.includes(n))) positiveCount++;
      });
      continue;
    }

    if (positiveWords.some(p => word.includes(p))) positiveCount++;
    if (negativeWords.some(n => word.includes(n))) negativeCount++;

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(k => word.includes(k)) && !detectedEmotions.includes(emotion)) {
        detectedEmotions.push(emotion);
      }
    }
  }

  const sentimentRaw = (positiveCount - negativeCount) / Math.max(words.length / 6, 1);
  const normalizedScore = Math.max(0, Math.min(10, 5 + sentimentRaw * 4));

  let label = "neutral";
  if (normalizedScore >= 8) label = "very-positive";
  else if (normalizedScore >= 6) label = "positive";
  else if (normalizedScore <= 2.5) label = "very-negative";
  else if (normalizedScore <= 4.5) label = "negative";

  const rawConfidence = Math.min(1, Math.abs(sentimentRaw) + (positiveCount + negativeCount) / 10);
  const scaledConfidence = Math.max(0.4, Math.min(0.95, rawConfidence));

  return {
    score: Math.round(normalizedScore * 100) / 100,
    label,
    confidence: Math.round(scaledConfidence * 100),
    emotions: detectedEmotions.filter(e => allowedEmotions.includes(e)).slice(0, 3),
  };
};

/* -------------------------------------------------------------------------- */
/*                            HYBRID SENTIMENT HANDLER                         */
/* -------------------------------------------------------------------------- */
const analyzeSentiment = async (text) => {
  try {
    console.log("🧩 Running sentiment analysis via Hugging Face API...");
    const result = await hfSentiment(text);

    if (result && result.label) {
      console.log("✅ [Hybrid] Using Hugging Face sentiment result:", result);
      return result;
    }

    console.warn("⚠️ [Hybrid] Invalid Hugging Face response, using rule-based fallback.");
    const fallback = ruleBasedSentiment(text);
    console.log("🧠 [Hybrid] Rule-based fallback result:", fallback);
    return fallback;

  } catch (err) {
    console.warn("🚨 [Hybrid] HF API failed → switching to rule-based:", err.message);
    const fallback = ruleBasedSentiment(text);
    console.log("🧠 [Hybrid] Rule-based fallback result:", fallback);
    return fallback;
  }
};



/* -------------------------------------------------------------------------- */
/*                                   ROUTES                                    */
/* -------------------------------------------------------------------------- */

// 🧠 GET all journals (optionally refresh sentiment)
router.get("/", authenticateToken, async (req, res) => {
  const { refresh } = req.query;
  try {
    const journals = await Journal.find({ userId: req.user._id })
      .sort({ isPinned: -1, createdAt: -1 });

    if (refresh === "true") {
      for (const j of journals) {
        const sentiment = await analyzeSentiment(j.content);
        j.sentiment = sentiment;
        await j.save();
      }
    }

    res.json(journals);
  } catch (error) {
    console.error("Error fetching journals:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 📊 GET sentiment stats
router.get("/stats/sentiment", authenticateToken, async (req, res) => {
  try {
    const journals = await Journal.find({ userId: req.user._id })
      .select("sentiment createdAt")
      .sort({ createdAt: 1 })
      .limit(30);

    const sentimentTrend = journals.map(j => ({
      date: j.createdAt,
      score: j.sentiment.score,
      label: j.sentiment.label,
    }));

    const avgNumeric = journals.length > 0
      ? journals.reduce((sum, j) => sum + j.sentiment.score, 0) / journals.length
      : 0;

    let avgLabel = "neutral";
    if (avgNumeric >= 7) avgLabel = "very-positive";
    else if (avgNumeric >= 5) avgLabel = "positive";
    else if (avgNumeric <= 3) avgLabel = "very-negative";
    else if (avgNumeric <= 5) avgLabel = "negative";

    const sentimentDistribution = {
      "very-positive": journals.filter(j => j.sentiment.label === "very-positive").length,
      "positive": journals.filter(j => j.sentiment.label === "positive").length,
      "neutral": journals.filter(j => j.sentiment.label === "neutral").length,
      "negative": journals.filter(j => j.sentiment.label === "negative").length,
      "very-negative": journals.filter(j => j.sentiment.label === "very-negative").length,
    };

    let consecutiveNegatives = 0, alertTriggered = false;
    for (const j of journals) {
      if (j.sentiment.label.includes("negative")) {
        consecutiveNegatives++;
        if (consecutiveNegatives >= 5) {
          alertTriggered = true;
          break;
        }
      } else consecutiveNegatives = 0;
    }

    const recommendations = alertTriggered
      ? [
          "Consider talking to a counselor or therapist.",
          "Try journaling your thoughts and emotions daily.",
          "Engage in relaxing activities: meditation, yoga, or a walk.",
          "Reach out to friends or family for support.",
          "Review your recent stressors and create an action plan."
        ]
      : [];

    res.json({
      sentimentTrend,
      avgSentiment: Math.round(avgNumeric * 100) / 100,
      avgLabel,
      sentimentDistribution,
      totalEntries: journals.length,
      alert: alertTriggered ? "5 consecutive negative sentiments detected." : null,
      recommendations,
    });
  } catch (error) {
    console.error("Error fetching sentiment stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 📝 GET single journal
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const journal = await Journal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!journal) return res.status(404).json({ message: "Journal not found" });

    res.json(journal);
  } catch (error) {
    console.error("Error fetching journal:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ➕ CREATE journal
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, content, tags, mood, isPrivate } = req.body;

    if (!title || !content)
      return res.status(400).json({ message: "Title and content are required" });

    const sentimentAnalysis = await analyzeSentiment(content);

    const journal = new Journal({
      userId: req.user._id,
      title,
      content,
      sentiment: {
        score: sentimentAnalysis.score,
        label: sentimentAnalysis.label,
        confidence: sentimentAnalysis.confidence,
      },
      emotions: sentimentAnalysis.emotions,
      tags: tags || [],
      mood: mood?.trim() || undefined,
      isPrivate: isPrivate ?? true,
    });

    await journal.save();

    res.status(201).json({ message: "Journal created successfully", journal });
  } catch (error) {
    console.error("Error creating journal:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✏️ UPDATE journal
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { title, content, tags, mood, isPrivate, isPinned } = req.body;

    const journal = await Journal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!journal) return res.status(404).json({ message: "Journal not found" });

    if (title) journal.title = title;
    if (content) {
      journal.content = content;
      const sentimentAnalysis = await analyzeSentiment(content);
      journal.sentiment = {
        score: sentimentAnalysis.score,
        label: sentimentAnalysis.label,
        confidence: sentimentAnalysis.confidence,
      };
      journal.emotions = sentimentAnalysis.emotions;
    }
    if (tags !== undefined) journal.tags = tags;
    if (mood) journal.mood = mood;
    if (isPrivate !== undefined) journal.isPrivate = isPrivate;
    if (isPinned !== undefined) journal.isPinned = isPinned;

    await journal.save();

    res.json({ message: "Journal updated successfully", journal });
  } catch (error) {
    console.error("Error updating journal:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ❌ DELETE journal
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const journal = await Journal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!journal)
      return res.status(404).json({ message: "Journal not found" });

    res.json({ message: "Journal deleted successfully" });
  } catch (error) {
    console.error("Error deleting journal:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
