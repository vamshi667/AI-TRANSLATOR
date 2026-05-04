export default async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { messages, sourceLang, targetLang } = await req.json();

    const systemContent =
      sourceLang && targetLang
        ? `You are a helpful AI linguistic assistant. The user's source language is ${sourceLang} and their target language is ${targetLang}. 
           When the user sends a message, you must:
           1. Respond to the user's message primarily in ${sourceLang}.
           2. Translate the user's input (or the key parts of it) into ${targetLang}.
           3. Ensure the actual translation is in ${targetLang}, but keep all other conversation, explanations, and greetings in ${sourceLang}.`
        : "You are a helpful AI chatbot. You can speak multiple languages and help the user with anything they need.";

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VITE_GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemContent },
            ...messages.map((m: any) => ({
              role: m.role,
              content: m.content,
            })),
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Chat Engine error");
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ text: data.choices[0].message.content }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err: any) {
    console.error("Chat error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
};
