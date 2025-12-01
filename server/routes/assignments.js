// server/routes/assignments.js
import express from 'express';
import Assignment from '../models/Assignment.js';
import { authenticateToken } from '../middleware/auth.js';
import fetch from "node-fetch";


const router = express.Router();

// ✅ Create a new assignment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { subject, title, description, dueDate, priority, status, notes } = req.body;

    const assignment = new Assignment({
      userId: req.user._id,
      subject,
      title,
      description: description || '',
      dueDate,
      priority: priority || 'medium',
      status: status || 'not_started',
      notes: notes || ''
    });

    await assignment.save();
    res.status(201).json({ message: 'Assignment created successfully', assignment });
  } catch (error) {
    console.error('Assignment creation error:', error);
    res.status(500).json({ error: 'Server error creating assignment' });
  }
});

// ✅ Stats BEFORE /:id
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const assignments = await Assignment.find({ userId: req.user._id });
    const now = new Date();

    const stats = {
      total: assignments.length,
      completed: assignments.filter(a => ['completed', 'submitted'].includes(a.status)).length,
      inProgress: assignments.filter(a => a.status === 'in_progress').length,
      notStarted: assignments.filter(a => a.status === 'not_started').length,
      overdue: assignments.filter(a => new Date(a.dueDate) < now && !['completed', 'submitted'].includes(a.status)).length,
      upcoming: assignments.filter(a => new Date(a.dueDate) > now && !['completed', 'submitted'].includes(a.status)).length
    };

    res.json({ stats });
  } catch (error) {
    console.error('Assignment stats error:', error);
    res.status(500).json({ error: 'Server error fetching assignment stats' });
  }
});

// ✅ Fetch all assignments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, sortBy = 'dueDate' } = req.query;
    const query = { userId: req.user._id };
    if (status) query.status = status;

    const assignments = await Assignment.find(query).sort({ [sortBy]: 1 });
    res.json({ assignments });
  } catch (error) {
    console.error('Assignment fetch error:', error);
    res.status(500).json({ error: 'Server error fetching assignments' });
  }
});

// ✅ Fetch upcoming
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const assignments = await Assignment.find({
      userId: req.user._id,
      dueDate: { $gt: now },
      status: { $nin: ['completed', 'submitted'] }
    }).sort({ dueDate: 1 }).limit(10);

    res.json({ assignments });
  } catch (error) {
    console.error('Upcoming assignments fetch error:', error);
    res.status(500).json({ error: 'Server error fetching upcoming assignments' });
  }
});

// ✅ Fetch overdue
router.get('/overdue', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const assignments = await Assignment.find({
      userId: req.user._id,
      dueDate: { $lt: now },
      status: { $nin: ['completed', 'submitted'] }
    }).sort({ dueDate: -1 });

    res.json({ assignments });
  } catch (error) {
    console.error('Overdue assignments fetch error:', error);
    res.status(500).json({ error: 'Server error fetching overdue assignments' });
  }
});

// ✅ Get single
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    res.json({ assignment });
  } catch (error) {
    console.error('Assignment fetch error:', error);
    res.status(500).json({ error: 'Server error fetching assignment' });
  }
});

// ✅ Update assignment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (['completed', 'submitted'].includes(updateData.status)) {
      updateData.completedAt = new Date();
    }

    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    res.json({ message: 'Assignment updated successfully', assignment });
  } catch (error) {
    console.error('Assignment update error:', error);
    res.status(500).json({ error: 'Server error updating assignment' });
  }
});

// ✅ Update status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const updateData = { status: req.body.status };

    if (['completed', 'submitted'].includes(updateData.status)) {
      updateData.completedAt = new Date();
    }

    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true }
    );

    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    res.json({ message: 'Assignment status updated successfully', assignment });
  } catch (error) {
    console.error('Assignment status update error:', error);
    res.status(500).json({ error: 'Server error updating assignment status' });
  }
});

// ✅ Delete assignment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Assignment delete error:', error);
    res.status(500).json({ error: 'Server error deleting assignment' });
  }
});

// 🧠 Local Offline Backup AI Helper (Elaborate + Generic)
function localAIHelper(prompt) {
  const q = prompt.toLowerCase();

  // 🎯 Context-based keyword checks
  if (q.includes("how") || q.includes("start") || q.includes("begin")) {
    return (
      "Here’s a structured way to get started:\n" +
      "1️⃣ Understand your assignment’s requirements — read the prompt carefully.\n" +
      "2️⃣ Break the task into smaller milestones (research, outline, draft, review).\n" +
      "3️⃣ Set clear goals for each session — focus on progress, not perfection.\n" +
      "4️⃣ Begin with brainstorming ideas or key points, then expand gradually.\n\n" +
      "Remember, getting started is the hardest part — once you begin, momentum builds!"
    );
  } else if (q.includes("time") || q.includes("schedule") || q.includes("late")) {
    return (
      "Time management tip:\n" +
      "⏰ Break your study time into small, focused blocks (e.g., 45 mins work + 10 mins break).\n" +
      "🗓️ Create a simple timeline — prioritize tasks by deadline and importance.\n" +
      "✅ Avoid multitasking; instead, finish one section at a time.\n" +
      "💡 If you feel behind, start with quick wins to build confidence."
    );
  } else if (q.includes("research") || q.includes("sources") || q.includes("topic")) {
    return (
      "For effective research:\n" +
      "🔍 Start with credible sources like Google Scholar, academic journals, or textbooks.\n" +
      "📚 Identify key keywords related to your topic and explore recent studies.\n" +
      "📝 Take short notes summarizing what each source contributes.\n" +
      "📖 Always keep track of citations for your references section."
    );
  } else if (q.includes("stress") || q.includes("overwhelm") || q.includes("tired")) {
    return (
      "It’s okay to feel overwhelmed — assignments can be demanding!\n" +
      "🧘‍♀️ Take a short break, hydrate, and stretch your body.\n" +
      "💭 Refocus by picking one small, achievable task to restart your momentum.\n" +
      "🎯 Progress, not perfection — every line you write is a step forward.\n" +
      "🌱 You’ve got this — keep a calm pace and celebrate small wins!"
    );
  } else if (q.includes("write") || q.includes("draft") || q.includes("paragraph")) {
    return (
      "Writing tips for assignments:\n" +
      "✍️ Start with a clear outline — intro, body, conclusion.\n" +
      "🎯 Each paragraph should express one main idea supported by evidence.\n" +
      "🔄 After drafting, review for clarity and logical flow.\n" +
      "📘 Keep your tone formal, concise, and avoid repetition.\n" +
      "💡 Don’t worry about perfection on the first draft — refine later!"
    );
  } else if (q.includes("explain") || q.includes("understand") || q.includes("concept")) {
    return (
      "To better understand complex topics:\n" +
      "🧩 Break the concept into smaller parts and rephrase them in your own words.\n" +
      "🎓 Watch short explanatory videos or read simple summaries first.\n" +
      "📖 Once you grasp the basics, revisit your notes or textbook for details.\n" +
      "💬 Teaching the idea to a friend (or to yourself) can solidify understanding."
    );
  } else {
    // 🧩 Universal fallback (generic, encouraging, all-purpose)
    return (
      "Here’s a balanced plan you can apply to your academic challenge:\n\n" +
      "1️⃣ **Understand the goal:** What exactly is being asked? Break it into parts.\n" +
      "2️⃣ **Plan your approach:** Outline what needs to be researched, written, or solved.\n" +
      "3️⃣ **Gather resources:** Use reliable references or notes to back up your work.\n" +
      "4️⃣ **Work in phases:** Don’t try to do it all at once — focus on steady progress.\n" +
      "5️⃣ **Review and refine:** Re-read your work to ensure clarity, structure, and accuracy.\n\n" +
      "🌟 Remember: It’s okay not to have all the answers immediately. Learning is a process — stay curious, stay organized, and trust your ability to figure things out!"
    );
  }
}



// 🧩 AI helper route using Hugging Face Router
router.post('/:id/ai-help', authenticateToken, async (req, res) => {
  try {
    const { question } = req.body;
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!assignment)
      return res.status(404).json({ error: "Assignment not found" });

    // 🧠 Compose prompt context
    const prompt = `
You are ThriveEd AI — a helpful, supportive academic assistant.

Assignment Details:
- Title: ${assignment.title}
- Subject: ${assignment.subject}
- Description: ${assignment.description || "N/A"}

Student Question: ${question}

Please provide a clear, encouraging, and step-by-step explanation.
If code is required, include comments and example output.
Avoid academic dishonesty; instead, teach and explain concepts.
`;

    let aiResponse = "";

    try {
      console.log("🔗 Sending to Hugging Face Router...");

      const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // ✅ working router-supported model
          model: "openai/gpt-oss-20b:groq",

          messages: [
            {
              role: "system",
              content:  `You are **ThriveEd AI**, a concise and helpful academic tutor.

🧭 Guidelines:
- Keep answers short and focused (3–6 sentences max).
- Use bullet points or numbered steps when possible.
- Only give code if needed — no long explanations.
- Always sound friendly and confident.
`,

            },
            { role: "user", content: prompt },
          ],

          max_tokens: 400,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      console.log("📦 HF router raw:", JSON.stringify(data, null, 2));

      // 🧩 Parse HF router response safely
      if (data?.choices?.[0]?.message) {
        const msg = data.choices[0].message;
        // 🧹 Clean & Markdown-format response
// 🧹 Clean & Markdown-format response
aiResponse = (
  msg.content?.trim() ||
  msg.reasoning?.trim() ||
  "I'm here to help, but I couldn’t generate a clear response."
)
  .replace(/\n{3,}/g, "\n\n")            // collapse excessive blank lines
  .replace(/^#+/gm, (m) => m.trim())     // tidy up headings
  .replace(/```cppcpp/g, "```cpp")       // fix double tags
  .replace(/```([a-z]*)\s*```/g, "```")  // remove empty code fences
  .replace(/\*\*\s+/g, "**")  
  .replace(/\n{2,}/g, "\n\n")         // fix stray bolds
  .trim();
      } else if (data?.error) {
        throw new Error(data.error.message);
      } else {
        throw new Error("No valid response from Hugging Face Router");
      }
    } catch (err) {
      console.warn("⚠️ HF Router failed, using local fallback:", err.message);
      aiResponse = localAIHelper(question); // ✅ your local fallback
    }

    // 🗂️ Save to DB
    const record = { question, response: aiResponse, timestamp: new Date() };
    assignment.aiHelp.push(record);
    await assignment.save();

    res.json({ message: "AI help added successfully", aiHelp: record });
  } catch (error) {
    console.error("❌ AI help error:", error);
    res.status(500).json({ error: "Server error processing AI help" });
  }
});


router.get('/:id/ai-help', authenticateToken, async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    res.json({ aiHelp: assignment.aiHelp });
  } catch (error) {
    console.error('AI help fetch error:', error);
    res.status(500).json({ error: 'Server error fetching AI help' });
  }
});

// AI response generator
function generateAIResponse(question, assignment) {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes('how') || lowerQuestion.includes('start')) {
    return `Here's a suggested approach for "${assignment.title}":\n1. Break down the assignment into smaller tasks\n2. Research the topic\n3. Create an outline\n4. Start with easiest sections\n5. Review and revise\n`;
  }

  if (lowerQuestion.includes('time') || lowerQuestion.includes('manage')) {
    return `Time management tips for "${assignment.title}":\n1. Set goals per session\n2. Use Pomodoro\n3. Eliminate distractions\n4. Schedule peak hours\n5. Buffer before deadline\n`;
  }

  if (lowerQuestion.includes('research') || lowerQuestion.includes('source')) {
    return `Research strategies for "${assignment.title}":\n1. Start with course materials\n2. Use academic databases\n3. Evaluate source credibility\n4. Organize notes and cite properly\n`;
  }

  if (lowerQuestion.includes('stress') || lowerQuestion.includes('anxious') || lowerQuestion.includes('overwhelm')) {
    return `Feeling stressed? Tips:\n1. Break work into chunks\n2. Focus on progress\n3. Take breaks\n4. Meditate\n5. Ask for help\n`;
  }

  return `Advice for "${assignment.title}":\n1. Review requirements\n2. Make a plan\n3. Allocate time\n4. Research and write\n5. Ask instructor if unclear\n`;
}



export default router;
