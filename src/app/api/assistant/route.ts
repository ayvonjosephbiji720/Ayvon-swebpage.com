import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are a helpful career assistant embedded in a personal job tracker app. You help with resume improvement, cover letter writing, interview preparation, HR and technical interview questions, ATS resume review, job search advice, grammar correction, and professional email writing. Keep responses practical, specific, and concise.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI Assistant is not configured. Add OPENAI_API_KEY to your environment variables to enable it." },
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
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
     body: JSON.stringify({
  model: "llama-3.3-70b-versatile",
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
