export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured on server" });
  }

  const {
    lovedTitles = [], likedTitles = [], dislikedTitles = [],
    topGenres = [], avoidGenres = [], topDirs = [],
    avgYear = 2000, existing = [],
  } = req.body || {};

  const eraDesc = avgYear < 1980 ? "classic era (pre-1980)"
    : avgYear < 1995 ? "80s–90s films"
    : avgYear < 2010 ? "late 90s–2000s films"
    : "contemporary films (2010s–2020s)";

  const prompt = `You are a film expert building personalized recommendations.

USER TASTE PROFILE (derived from ${lovedTitles.length + likedTitles.length} rated films):
- Favorite genres (ranked): ${topGenres.join(", ") || "varied"}
- Favorite directors (by affinity): ${topDirs.join(", ") || "varied"}
- Era preference: gravitates toward ${eraDesc} (avg loved year: ${avgYear})
${avoidGenres.length ? `- Tends to dislike: ${avoidGenres.join(", ")}` : ""}

FILMS THEY LOVED: ${lovedTitles.join(", ")}
FILMS THEY LIKED: ${likedTitles.join(", ")}
${dislikedTitles.length ? `FILMS THEY DISLIKED: ${dislikedTitles.join(", ")}` : ""}

TASK: Recommend exactly 15 films that are NOT in this list: ${existing.join(", ")}

Rules:
- Match their specific genre and directorial taste profile above
- Stay close to their era preference but include some variety
- Max 2 films per director
- Include films from diverse countries and languages
- Prioritize films that share DNA with their LOVED titles specifically
- The pitch must explain in one sentence WHY this specific user (with this specific profile) will love it

Return ONLY a valid JSON array, no markdown, no explanation:
[{"title":"...","year":1999,"genre":"Thriller","director":"...","pitch":"One sentence in Spanish tailored to this user's taste."}]`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const detail = err.error?.message || "Anthropic API error";
      console.error("Anthropic error:", response.status, detail);
      return res.status(response.status).json({ error: detail });
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
