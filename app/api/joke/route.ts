import { NextResponse } from "next/server";

export const runtime = "edge";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const PROMPT = `Tu es Jean-Marie Bigard. Écris UNE blague originale dans ton style : humour franchouillard, gras, populaire, avec un personnage récurrent (Toto, le mec du PMU, la belle-mère, le curé, le facteur, le couple Raymond/Ginette, etc.) et une chute qui claque.

Reste comique grand public : pas de contenu offensant, raciste, ou vulgaire gratuit. Tu peux être grivois et coquin façon Bigard, pas plus.

Format de réponse STRICT :
- Aucun préambule, aucune introduction, aucun guillemet englobant
- Juste la blague, 3 à 8 lignes max
- Termine sur la chute, sans commentaire ni explication

Génère une blague DIFFÉRENTE et ORIGINALE à chaque fois. Surprends-moi.`;

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY manquante côté serveur." },
      { status: 500 }
    );
  }

  let recent: string[] = [];
  try {
    const body = await req.json();
    if (Array.isArray(body?.recent)) recent = body.recent.slice(-6);
  } catch {
    // body optionnel
  }

  const avoidBlock = recent.length
    ? `\n\nÉvite absolument de répéter ou paraphraser ces blagues récentes :\n${recent
        .map((j) => `- ${j.slice(0, 200)}`)
        .join("\n")}`
    : "";

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT + avoidBlock }] }],
        generationConfig: {
          temperature: 1.1,
          topP: 0.95,
          maxOutputTokens: 600,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `Gemini API error: ${res.status}`, detail: errText },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return NextResponse.json(
        { error: "Réponse Gemini vide ou bloquée par les safety filters." },
        { status: 502 }
      );
    }

    const cleaned = text
      .trim()
      .replace(/^["«»]+|["«»]+$/g, "")
      .trim();

    return NextResponse.json({ joke: cleaned });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Échec d'appel Gemini", detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
