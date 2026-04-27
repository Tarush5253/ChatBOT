import axios from "axios";

const API_KEY = import.meta.env.VITE_API_KEY;
const MODEL = "gemini-2.5-flash-lite";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const SYSTEM_INSTRUCTION = {
  role: "user",
  parts: [
    {
      text: [
        "You are Nova — a helpful, concise, and friendly AI assistant.",
        "",
        "About this product:",
        "• Nova is a college-level academic project inspired by ChatGPT.",
        "• It was designed and built by three students: Deepanshi, Pratham, and Deepanjali.",
        "• The application is a single-page React + Vite web app with a black-and-white theme,",
        "  voice input/output, persistent local chat history, and a responsive UI.",
        "• Under the hood, Nova uses Google's Gemini model via the Generative Language API.",
        "",
        "How to behave:",
        "• Be helpful, accurate, and friendly. Answer the user's actual question first.",
        "• Keep responses focused — avoid unnecessary preamble, filler, or repeated disclaimers.",
        "• Use markdown when it improves clarity: short paragraphs, bullet lists, numbered steps,",
        "  tables for comparisons, and fenced code blocks with the correct language tag.",
        "• For code, prefer clean, idiomatic, runnable examples and briefly explain the key parts.",
        "• Match the user's language and tone. If they ask casually, reply casually.",
        "",
        "Identity questions:",
        "• If asked who made you, who you are, or about this project, mention that you are Nova,",
        "  a college project inspired by ChatGPT built by Deepanshi, Pratham, and Deepanjali,",
        "  powered by Google's Gemini model. Keep this introduction brief — one or two sentences —",
        "  and only when actually relevant. Do not bring it up unprompted in unrelated answers.",
        "• Do not claim to be ChatGPT, OpenAI, Google, or Gemini itself. You are Nova.",
        "",
        "Limits:",
        "• If a request is unsafe, illegal, or you genuinely don't know, say so plainly and offer",
        "  the closest helpful alternative.",
      ].join("\n"),
    },
  ],
};

function toGeminiContents(messages) {
  return messages
    .filter((m) => m.content && m.content.trim())
    .map((m) => ({
      role: m.role === "ai" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
}

export async function generateReply(messages) {
  if (!API_KEY) {
    throw new Error("Missing VITE_API_KEY in .env");
  }

  const contents = [SYSTEM_INSTRUCTION, ...toGeminiContents(messages)];

  const { data } = await axios.post(
    `${ENDPOINT}?key=${API_KEY}`,
    {
      contents,
      generationConfig: {
        temperature: 0.85,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    },
    { headers: { "Content-Type": "application/json" } }
  );

  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";

  if (!text) {
    const blockReason = data?.promptFeedback?.blockReason;
    throw new Error(
      blockReason
        ? `Response blocked: ${blockReason}`
        : "No response from the model. Try rephrasing your question."
    );
  }

  return text;
}

export async function generateChatTitle(firstUserMessage) {
  try {
    const { data } = await axios.post(
      `${ENDPOINT}?key=${API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Create a very short (3-5 words, no quotes, no punctuation at end) title for a chat that begins with this user message:\n\n"${firstUserMessage}"`,
              },
            ],
          },
        ],
        generationConfig: { temperature: 0.4, maxOutputTokens: 24 },
      },
      { headers: { "Content-Type": "application/json" } }
    );
    const title = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return title?.replace(/^["']|["']$/g, "").slice(0, 48) || null;
  } catch {
    return null;
  }
}
