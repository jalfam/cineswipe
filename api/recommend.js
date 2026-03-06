export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured on server" });
  }

  const { loved = [], liked = [], disliked = [], existing = [] } = req.body || {};

  const prompt = `You are a film expert. Based on this user's taste, recommend 15 new movies.
LOVED: ${loved.slice(0, 12).join(", ")}
LIKED: ${liked.slice(0, 8).join(", ")}
DISLIKED: ${disliked.slice(0, 5).join(", ")}
Exclude (already in list): ${existing.join(", ")}
Rules: smart/cerebral films, great construction, sci-fi, thrillers, genre-bending dramas. Max 2 films per director. Include diverse countries/eras.
Return ONLY a JSON array, no markdown:
[{"title":"...","year":1999,"genre":"Thriller","director":"...","pitch":"One sentence in Spanish why this user will love it."}]`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || "Anthropic API error" });
    }

    const data = await response.json();
    const text = data.content?.find(b => b.type === "text")?.text || "[]";
    const movies = JSON.parse(text.replace(/```json|```/g, "").trim());

    return res.status(200).json({ movies });
  } catch (e) {
    console.error("Recommend API error:", e);
    return res.status(500).json({ error: "Failed to generate recommendations" });
  }
}
