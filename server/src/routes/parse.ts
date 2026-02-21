import { Router } from "express";
import OpenAI from "openai";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ error: "Description is required" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OpenAI API key not configured" });
    }

    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a nutrition estimation assistant. Given a food description, estimate the nutritional content. Respond with ONLY valid JSON in this exact format: {"calories": number, "protein": number, "fiber": number}. The values should be reasonable estimates in these units: calories in kcal, protein in grams, fiber in grams. If the description is ambiguous, make your best estimate for a typical serving size.`,
        },
        {
          role: "user",
          content: description,
        },
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      return res.status(500).json({ error: "No response from AI" });
    }

    const parsed = JSON.parse(content);
    res.json({
      calories: Math.round(parsed.calories),
      protein: Math.round(parsed.protein),
      fiber: Math.round(parsed.fiber),
    });
  } catch (error) {
    console.error("Error parsing food:", error);
    res.status(500).json({ error: "Failed to parse food description" });
  }
});

export default router;
