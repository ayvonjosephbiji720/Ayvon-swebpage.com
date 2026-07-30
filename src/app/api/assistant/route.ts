import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are a helpful career assistant embedded in a personal job tracker app. You help with resume improvement, cover letter writing, interview preparation, HR and technical interview questions, ATS resume review, job search advice, grammar correction, and professional email writing. Keep responses practical, specific, and concise.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Supports either an OpenAI key or a Groq key (both expose an
// OpenAI-compatible /chat/completions endpoint) so you can use whichever
// free/paid provider you already have a key for.
function resolveProvider() {
  if (process.env.GROQ_API_KEY) {
    return {
      apiKey: process.env.GROQ_API_KEY,
      baseUrl: "https://api.groq.com/openai/v1/chat/completions",
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    };
  }
  if (process.env.OPENAI_API_KEY) {
    return {
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: "https://api.openai.com/v1/chat/completions",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    };
  }
  return null;
}

export async function POST(req: Request) {
  const provider = resolveProvider();
  if (!provider) {
    return NextResponse.json(
      {
        error:
          "AI Assistant is not configured. Add GROQ_API_KEY (or OPENAI_API_KEY) to your environment variables to enable it.",
      },
      { status: 501 }
    );
  }

  let messages: ChatMessage[];
  try {
    const body = await req.json();
    messages = body.messages;
    if (!Array.isArray(messages)) throw new Error("invalid");
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const res = await fetch(provider.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.6,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return NextResponse.json({ error: `AI provider error: ${errBody.slice(0, 300)}` }, { status: 502 });
    }

    const data = await res.json();
    const reply: string = data.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Failed to reach AI provider." }, { status: 502 });
  }
}
