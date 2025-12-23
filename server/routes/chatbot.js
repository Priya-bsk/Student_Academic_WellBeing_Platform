import express from "express";
import fetch from "node-fetch";

const router = express.Router();

/* 🧠 Local Offline AI Helper (Fallback)
   This ensures the chatbot still responds meaningfully
   even if the Hugging Face API call fails.
*/
function localAIHelper(prompt) {
  const q = prompt.toLowerCase();

  if (q.includes("time") || q.includes("schedule") || q.includes("plan")) {
    return `⏰ Here's a quick routine for better time management:
• Prioritize 3–5 key tasks daily.
• Work in focused 25–30 minute sessions with 5-minute breaks.
• Group similar tasks together (emails, studying, errands).
• Review your day at night and adjust for tomorrow.`;
  }

  if (q.includes("stress") || q.includes("overwhelm") || q.includes("anxiety")) {
    return `💆‍♀️ Try this quick stress reset:
• Pause for a deep breath — in 4s, hold 4s, out 6s.
• Write down what’s overwhelming you.
• Break tasks into smaller chunks.
• Take a short walk, stretch, or listen to music.`;
  }

  if (q.includes("study") || q.includes("focus") || q.includes("exam")) {
    return `📘 Study smarter with this routine:
• Use the Pomodoro method (25 min focus, 5 min break).
• Eliminate distractions — silence notifications, tidy workspace.
• Summarize what you learn every hour.
• Review key points before bed for better retention.`;
  }

  if (q.includes("motivation") || q.includes("procrastinate")) {
    return `⚡ Feeling stuck? Here’s a quick boost:
• Start with one small task — momentum beats motivation.
• Reward yourself after finishing something.
• Visualize the outcome — imagine the relief after it’s done.
• Keep it simple: progress over perfection.`;
  }

  return `🌟 Here’s a quick reset plan:
• Identify what’s most important right now.
• Break it into steps and set one immediate goal.
• Focus on just that step for 20–30 minutes.
• Take a mindful pause, then continue with renewed focus.`;
}

/* 🧾 Formatting for AI Output */
function formatAIOutput(text) {
  if (!text) return "I couldn’t generate a response right now.";

  let clean = text
    .replace(/\*\*/g, "")
    .replace(/\|/g, "")
    .replace(/\#/g, "")
    .replace(/\r/g, "")
    .trim();

  // ✅ Add newline before bullets (• and -)
  clean = clean
    .replace(/\s*•\s*/g, "\n• ")
    .replace(/\s*-\s+/g, "\n• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // 🧩 Handle labeled steps
  clean = clean
    .replace(/(• Step:)/g, "\n$1")
    .replace(/(• What to Do:)/g, "\n$1")
    .replace(/(• Why It Helps:)/g, "\n$1")
    .replace(/(• How to Start:)/g, "\n$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  clean = clean
    .replace(/\s{2,}/g, " ")
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();

  return clean;
}

/* 🚀 Main Chatbot Route */
router.post("/", async (req, res) => {
  console.log("📩 /api/chatbot endpoint hit with:", req.body);
  const { message } = req.body;
  const prompt = message?.trim();

  if (!prompt) {
    console.log("❗ No message received from frontend");
    return res.status(400).json({ reply: "No message received." });
  }

  try {
    console.log("🔗 Sending to Hugging Face Router with prompt:", prompt);

    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b:groq",
        messages: [
          {
            role: "system",
            content: `
You are "StudyMate" — an empathetic, supportive academic and well-being assistant for students.

Your role is to help students with:
• Academic guidance (assignments, study techniques, research help)
• Productivity and time management
• Emotional well-being and motivation
• Personal growth and balance

Respond in a calm, encouraging, and student-friendly tone.
Keep your answers concise (3–6 sentences max), practical, and easy to understand.
When giving steps or strategies, present them in clear, well-formatted bullet points or short paragraphs.
Avoid long essays or overly technical jargon — focus on clarity, encouragement, and actionable advice.`,
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    console.log("✅ HF response status:", response.status);
    const data = await response.json();
    console.log("📦 HF raw data:", data);

    // 🧠 If API fails or malformed, use fallback
    if (!response.ok || !data?.choices?.[0]?.message?.content) {
      console.warn("⚠️ Hugging Face API failed — using offline fallback");
      const fallback = localAIHelper(prompt);
      return res.json({ reply: formatAIOutput(fallback) });
    }

    const reply = formatAIOutput(data.choices[0].message.content.trim());
    res.json({ reply });

  } catch (error) {
    console.error("❌ Chatbot API error:", error);
    // 🧠 Local fallback on network failure
    const fallback = localAIHelper(message || "");
    res.json({ reply: formatAIOutput(fallback) });
  }
});

export default router;
