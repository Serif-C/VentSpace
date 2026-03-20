import OpenAI from "openai";
import { env } from "../env.js";

const client = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function generateEmotionTags(text: string) {
  try {
    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `
You analyze emotional text and generate 2-4 short tags.

Rules:
- tags must be lowercase
- use hyphens instead of spaces
- do not include #
- only return JSON array

Example:
["burnout","school-stress","overwhelmed"]
`,
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const raw = resp.choices[0]?.message?.content ?? "[]";

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.slice(0, 4);
  } catch {
    return [];
  }
}