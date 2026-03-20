import { Router } from "express";
import { z } from "zod";
import OpenAI from "openai";
import { env } from "../env.js";

const router = Router();


const client = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
    
  try {
    if (!env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const body = z.object({
      message: z.string().min(1).max(2000),
      // send last messages for context (optional but recommended)
      history: z.array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().min(1).max(2000),
        })
      ).max(12).optional(),
    }).parse(req.body);

    const emotion = detectEmotion(body.message);

    const system = `
                    You are VentSpace's emotional support assistant.

                    The user's current emotional state appears to be: ${emotion}.

                    Respond with empathy and warmth.

                    Rules:
                    - You are not a therapist.
                    - Do not give medical advice.
                    - Encourage healthy coping strategies like breathing, journaling, or talking to trusted people.
                    - Be supportive, calm, and validating.
                    `;

    const messages = [
      { role: "system" as const, content: system },

      // conversation memory
      ...(body.history ?? []).slice(-12),
      
      { role: "user" as const, content: body.message },
    ];

    if (detectCrisis(body.message)) {
        return res.json({
            reply:
            "I'm really sorry you're feeling this way. You deserve support and you don't have to go through this alone. If you can, please consider reaching out to a trusted adult, friend, or a local crisis hotline right now.",
        });
    }

    const stream = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        stream: true,
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const chunk of stream) {
        const token = chunk.choices?.[0]?.delta?.content;

        if (token) {
            res.write(token);
        }
    }

    res.end();
  } catch (e: any) {
    console.error("CHAT ERROR:", e);
    
    if (e.code === "insufficient_quota") {
        return res.json({
        reply:
            "I'm having trouble connecting right now. But I'm still here with you. Want to tell me more about what's been overwhelming today?",
        });
    }

    res.json({
        reply:
        "I'm sorry something went wrong on my side. I'm still here if you'd like to share more.",
    });
  }
});

function detectEmotion(text: string) {
  const t = text.toLowerCase();

  if (t.includes("overwhelmed") || t.includes("too much"))
    return "overwhelmed";

  if (t.includes("alone") || t.includes("lonely"))
    return "lonely";

  if (t.includes("anxious") || t.includes("anxiety"))
    return "anxious";

  if (t.includes("angry") || t.includes("mad"))
    return "angry";

  if (t.includes("sad") || t.includes("depressed"))
    return "sad";

  return "neutral";
}

function detectCrisis(text: string) {
  const t = text.toLowerCase();

  return (
    t.includes("kill myself") ||
    t.includes("suicide") ||
    t.includes("don't want to live") ||
    t.includes("end my life")
  );
}

export default router;